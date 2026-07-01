from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.database import get_db
from auth.deps import get_current_user
from models.user import User
from services.chat_service import ChatService

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/{dataset_id}", response_model=ChatResponse)
async def chat_with_dataset(
    dataset_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Service is async to simulate network delay
    reply = await ChatService.ask_question(dataset_id, current_user.id, request.message, db)
    return {"response": reply}
