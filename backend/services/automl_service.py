import os
import pandas as pd
import numpy as np
import json
import plotly.express as px
import joblib
import uuid
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, r2_score, mean_squared_error
from sqlalchemy.orm import Session
from models.dataset import Dataset
from models.trained_model import TrainedModel

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../models_storage"))

class AutoMLService:
    @staticmethod
    def train_model(dataset: Dataset, target_column: str, user_id: int, db: Session) -> TrainedModel:
        os.makedirs(MODELS_DIR, exist_ok=True)
        
        # 1. Load Data
        if dataset.file_path.endswith('.csv'):
            df = pd.read_csv(dataset.file_path)
        else:
            df = pd.read_excel(dataset.file_path)
            
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset")
            
        # 2. Drop rows where target is missing
        df = df.dropna(subset=[target_column])
        
        y = df[target_column]
        X = df.drop(columns=[target_column])
        
        # 3. Auto-detect task type
        is_classification = False
        if y.dtype == 'object' or y.dtype.name == 'category' or y.nunique() < 20:
            is_classification = True
            
        # 4. Preprocessing X
        categorical_cols = X.select_dtypes(include=['object', 'category']).columns
        numeric_cols = X.select_dtypes(include=['number']).columns
        
        le_dict = {}
        for col in categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            le_dict[col] = le
            
        # Impute missing values
        imputer = None
        if not X.empty:
            imputer = SimpleImputer(strategy='mean')
            X_cols = X.columns
            X = pd.DataFrame(imputer.fit_transform(X), columns=X_cols)
            
        # Preprocessing Y if classification
        le_y = None
        if is_classification and y.dtype == 'object':
            le_y = LabelEncoder()
            y = le_y.fit_transform(y.astype(str))
            
        # 5. Train / Test Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # 6. Train Model & Evaluate
        metrics = {}
        algorithm_used = ""
        feature_importances = []
        
        if is_classification:
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            metrics['accuracy'] = round(accuracy_score(y_test, preds), 4)
            metrics['f1_score'] = round(f1_score(y_test, preds, average='macro'), 4)
            algorithm_used = "Random Forest Classifier"
            feature_importances = model.feature_importances_
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            metrics['r2_score'] = round(r2_score(y_test, preds), 4)
            metrics['mse'] = round(mean_squared_error(y_test, preds), 4)
            algorithm_used = "Random Forest Regressor"
            feature_importances = model.feature_importances_
            
        # Save model artifact
        model_id = str(uuid.uuid4())
        model_file_path = os.path.join(MODELS_DIR, f"{model_id}.joblib")
        
        artifact = {
            "model": model,
            "imputer": imputer,
            "le_dict": le_dict,
            "le_y": le_y,
            "is_classification": is_classification,
            "features": list(X_cols) if not X.empty else list(X.columns)
        }
        joblib.dump(artifact, model_file_path)
            
        # 7. Generate Feature Importance Chart (Plotly JSON)
        feat_imp_df = pd.DataFrame({
            'Feature': X.columns,
            'Importance': feature_importances
        }).sort_values(by='Importance', ascending=True).tail(10)
        
        fig = px.bar(
            feat_imp_df, 
            x='Importance', 
            y='Feature', 
            orientation='h',
            title=f"Top 10 Feature Importances ({algorithm_used})",
            template="plotly_dark"
        )
        fig.update_traces(marker_color='#6366f1')
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        
        chart_json = json.loads(fig.to_json())
        
        # 8. Save to DB
        trained_model = TrainedModel(
            dataset_id=dataset.id,
            user_id=user_id,
            target_column=target_column,
            task_type="classification" if is_classification else "regression",
            algorithm_used=algorithm_used,
            metrics=metrics,
            feature_importance_chart=chart_json,
            model_file_path=model_file_path
        )
        
        db.add(trained_model)
        db.commit()
        db.refresh(trained_model)
        
        return trained_model
