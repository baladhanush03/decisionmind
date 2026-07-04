import os
import shutil
import pandas as pd
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models.dataset import Dataset

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))

class DatasetService:
    @staticmethod
    def save_upload_file(upload_file: UploadFile, user_id: int, db: Session) -> Dataset:
        # Ensure upload dir exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save file to disk
        safe_filename = upload_file.filename or "unnamed.csv"
        file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{safe_filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        # Analyze with pandas
        try:
            filename = upload_file.filename or ""
            if filename.endswith(".csv"):
                df = pd.read_csv(file_path) # type: ignore
            elif filename.endswith((".xls", ".xlsx")):
                df = pd.read_excel(file_path) # type: ignore
            else:
                raise ValueError("Unsupported file format")
                
            row_count, column_count = df.shape
            file_size = os.path.getsize(file_path)
            
            # Simple quality score (example: 100 - % of missing values)
            total_cells = row_count * column_count
            missing_cells = df.isnull().sum().sum()
            quality_score = max(0.0, 100.0 - (missing_cells / total_cells * 100)) if total_cells > 0 else 0.0
            
            dataset = Dataset(
                filename=upload_file.filename,
                file_path=file_path,
                user_id=user_id,
                row_count=row_count,
                column_count=column_count,
                file_size_bytes=file_size,
                quality_score=round(quality_score, 2)
            )
            
            db.add(dataset)
            db.commit()
            db.refresh(dataset)
            
            return dataset
            
        except Exception as e:
            # Cleanup if failed
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
