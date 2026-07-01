import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json

class EDAService:
    @staticmethod
    def generate_missing_values_chart(df: pd.DataFrame) -> str:
        missing = df.isnull().sum()
        missing = missing[missing > 0].sort_values(ascending=False)
        
        if missing.empty:
            fig = go.Figure()
            fig.update_layout(title="No Missing Values", template="plotly_dark", paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
            return fig.to_json()
            
        fig = px.bar(
            x=missing.index, 
            y=missing.values,
            labels={'x': 'Columns', 'y': 'Missing Count'},
            title="Missing Values per Column",
            template="plotly_dark"
        )
        fig.update_traces(marker_color='#8b5cf6')
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        return fig.to_json()

    @staticmethod
    def generate_correlation_heatmap(df: pd.DataFrame) -> str:
        # Only correlate numeric columns
        numeric_df = df.select_dtypes(include=['number'])
        if numeric_df.empty or numeric_df.shape[1] < 2:
            fig = go.Figure()
            fig.update_layout(title="Not enough numeric columns for correlation", template="plotly_dark", paper_bgcolor='rgba(0,0,0,0)')
            return fig.to_json()
            
        corr = numeric_df.corr()
        fig = px.imshow(
            corr,
            text_auto=True,
            aspect="auto",
            title="Feature Correlation Heatmap",
            color_continuous_scale="Viridis",
            template="plotly_dark"
        )
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        return fig.to_json()
        
    @staticmethod
    def generate_overview_stats(df: pd.DataFrame) -> dict:
        desc = df.describe().to_dict()
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        return {
            "summary": desc,
            "types": dtypes
        }
