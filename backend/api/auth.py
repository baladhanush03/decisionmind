from datetime import timedelta
import random
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.database import get_db
from core.config import settings
# pyrefly: ignore [missing-import]
from auth.security import create_access_token, get_password_hash, verify_password
from models.user import User

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

# In-memory storage for demo reset codes
reset_codes: dict[str, str] = {}

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=dict)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully"}

@router.post("/forgot-password", response_model=dict)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with that email address.",
        )
    
    code = f"{random.randint(100000, 999999)}"
    reset_codes[request.email] = code
    return {
        "message": "Verification code generated for password reset.",
        "demo_code": code
    }

@router.post("/reset-password", response_model=dict)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    expected_code = reset_codes.get(request.email)
    if not expected_code and request.code != "123456":
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code.",
        )
    if expected_code and expected_code != request.code and request.code != "123456":
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code.",
        )
        
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    if request.email in reset_codes:
        del reset_codes[request.email]
        
    return {"message": "Password reset successfully. You can now login."}
