from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from database.database import engine
from database.base import Base

# Auto-create tables for development
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DecisionMind AI API",
    description="Universal Business Intelligence & AutoML Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.auth import router as auth_router
from api.datasets import router as datasets_router
from api.models import router as models_router
from api.chat import router as chat_router

@app.get("/")
async def root():
    return {"message": "Welcome to DecisionMind AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(datasets_router, prefix=f"{settings.API_V1_STR}/datasets", tags=["datasets"])
app.include_router(models_router, prefix=f"{settings.API_V1_STR}/models", tags=["models"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])


