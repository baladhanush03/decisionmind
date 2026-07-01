from typing import Any, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.database import get_db
from auth.deps import get_current_user
from models.user import User
from models.dataset import Dataset
from services.dataset_service import DatasetService

router = APIRouter()

class DatasetResponse(BaseModel):
    id: int
    filename: str
    row_count: int
    column_count: int
    file_size_bytes: int
    quality_score: float

    class Config:
        from_attributes = True

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    if not file.filename.endswith((".csv", ".xls", ".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
        
    try:
        dataset = DatasetService.save_upload_file(file, current_user.id, db)
        return dataset
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

from services.eda import EDAService
import pandas as pd
import json

@router.get("/", response_model=List[DatasetResponse])
def get_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    datasets = db.query(Dataset).filter(Dataset.user_id == current_user.id).all()
    return datasets

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.get("/{dataset_id}/eda")
def get_dataset_eda(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    try:
        if dataset.filename.endswith(".csv"):
            df = pd.read_csv(dataset.file_path)
        else:
            df = pd.read_excel(dataset.file_path)
            
        missing_values_json = EDAService.generate_missing_values_chart(df)
        correlation_json = EDAService.generate_correlation_heatmap(df)
        stats = EDAService.generate_overview_stats(df)
        
        return {
            "missing_values_chart": json.loads(missing_values_json),
            "correlation_heatmap": json.loads(correlation_json),
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

