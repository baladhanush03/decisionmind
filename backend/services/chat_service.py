from sqlalchemy.orm import Session
from models.dataset import Dataset
from models.trained_model import TrainedModel
import asyncio

class ChatService:
    @staticmethod
    async def ask_question(dataset_id: int, user_id: int, question: str, db: Session) -> str:
        # Fetch dataset context
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == user_id).first()
        if not dataset:
            return "Error: I couldn't find this dataset in your workspace."
            
        # Simulate network delay for AI processing
        await asyncio.sleep(1.5)
        
        question = question.lower()
        
        if "row" in question or "size" in question or "big" in question:
            return f"This dataset contains {dataset.row_count} rows and {dataset.column_count} columns. It takes up about {round(dataset.file_size_bytes / 1024, 2)} KB on disk."
            
        if "quality" in question or "missing" in question or "clean" in question:
            return f"The data quality score is {dataset.quality_score}%. This score is based on the proportion of missing values across all columns."
            
        if "model" in question or "train" in question or "predict" in question:
            models = db.query(TrainedModel).filter(TrainedModel.dataset_id == dataset.id).all()
            if models:
                return f"You have {len(models)} model(s) trained on this dataset. The latest one is a {models[0].algorithm_used} predicting '{models[0].target_column}'."
            return "You haven't trained any models on this dataset yet. Head over to the AutoML tab to train one!"
            
        if "what" in question and "can" in question:
            return "Based on the columns in this dataset, you could run Exploratory Data Analysis to find correlations, or use the AutoML tool to train a predictive model on any numeric or categorical column."
            
        # Default fallback response
        return f"That's an interesting question about '{dataset.filename}'. Since I am running in mock mode without an OpenAI API key, I can mostly answer questions about the dataset's metadata (size, quality, trained models). What else would you like to know?"
