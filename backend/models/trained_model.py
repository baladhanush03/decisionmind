from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database.base_class import Base

class TrainedModel(Base):
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("dataset.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    target_column = Column(String, nullable=False)
    task_type = Column(String, nullable=False) # 'classification' or 'regression'
    algorithm_used = Column(String, nullable=False)
    model_file_path = Column(String, nullable=True)
    
    # Store performance metrics (accuracy, f1, r2, mse) as JSON
    metrics = Column(JSON, nullable=False)
    
    # Store the plotly JSON spec for feature importances
    feature_importance_chart = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    dataset = relationship("Dataset", backref="models")
    owner = relationship("User", backref="models")
