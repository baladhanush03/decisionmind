from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.database import get_db
from auth.deps import get_current_user
from models.user import User
from models.dataset import Dataset
from models.trained_model import TrainedModel
from services.automl_service import AutoMLService
import pandas as pd

router = APIRouter()

class TrainRequest(BaseModel):
    dataset_id: int
    target_column: str

class TrainedModelResponse(BaseModel):
    id: int
    dataset_id: int
    target_column: str
    task_type: str
    algorithm_used: str
    metrics: dict
    feature_importance_chart: dict

    class Config:
        from_attributes = True

@router.get("/datasets/{dataset_id}/columns", response_model=List[str])
def get_dataset_columns(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    try:
        file_path = str(dataset.file_path)
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path, nrows=1) # type: ignore
        else:
            df = pd.read_excel(file_path, nrows=1) # type: ignore
        return list(df.columns)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train", response_model=TrainedModelResponse)
def train_model(
    request: TrainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    dataset = db.query(Dataset).filter(Dataset.id == request.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    try:
        model = AutoMLService.train_model(dataset, request.target_column, current_user.id, db)
        return model
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

import joblib

@router.get("/", response_model=List[TrainedModelResponse])
def get_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    models = db.query(TrainedModel).filter(TrainedModel.user_id == current_user.id).order_by(TrainedModel.created_at.desc()).all()
    return models

@router.post("/{model_id}/predict")
def predict(
    model_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    trained_model = db.query(TrainedModel).filter(TrainedModel.id == model_id, TrainedModel.user_id == current_user.id).first()
    if not trained_model or not trained_model.model_file_path:
        raise HTTPException(status_code=404, detail="Model not found or not serialized")
        
    try:
        artifact = joblib.load(trained_model.model_file_path)
        model = artifact["model"]
        imputer = artifact["imputer"]
        le_dict = artifact["le_dict"]
        le_y = artifact["le_y"]
        is_classification = artifact["is_classification"]
        features = artifact["features"]
        
        # Construct DataFrame from payload (ensure exact order of features)
        input_data = {}
        for f in features:
            if f not in payload:
                raise HTTPException(status_code=400, detail=f"Missing feature: {f}")
            input_data[f] = [payload[f]]
            
        df = pd.DataFrame(input_data)
        
        # Preprocess input (same steps as training)
        for col, le in le_dict.items():
            df[col] = le.transform(df[col].astype(str))
            
        if imputer:
            df = pd.DataFrame(imputer.transform(df), columns=features)
            
        # Predict
        pred = model.predict(df)
        
        # Decode prediction if classification
        if is_classification and le_y:
            pred_value = le_y.inverse_transform(pred)[0]
        else:
            pred_value = float(pred[0])
            
        return {"prediction": pred_value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
