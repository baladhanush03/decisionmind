import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Configure CORS — allow all origins (dev + any Vercel deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

from api.auth import router as auth_router
from api.datasets import router as datasets_router
from api.models import router as models_router
from api.chat import router as chat_router

@app.get("/api")
async def root():
    return {"message": "Welcome to DecisionMind AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(datasets_router, prefix=f"{settings.API_V1_STR}/datasets", tags=["datasets"])
app.include_router(models_router, prefix=f"{settings.API_V1_STR}/models", tags=["models"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])

# Serve Frontend Static Files in Production / Single-Server mode
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


