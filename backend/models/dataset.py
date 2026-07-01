from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.base_class import Base

class Dataset(Base):
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    file_path = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    # Metadata
    row_count = Column(Integer)
    column_count = Column(Integer)
    file_size_bytes = Column(Integer)
    
    # Data Quality
    quality_score = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", backref="datasets")
