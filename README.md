# DecisionMind AI

A Universal Business Intelligence and AutoML Platform.

## Features
* **Secure Authentication**: JWT-based login and registration.
* **Data Uploads**: Upload CSV and Excel datasets.
* **Exploratory Data Analysis (EDA)**: Automated missing values checking, data type inference, and Plotly correlation charts.
* **AutoML Engine**: Automatically train Machine Learning models (Random Forest) for Classification or Regression with automatic preprocessing.
* **Explainability (XAI)**: View interactive Feature Importance charts.
* **Model Inference**: Run real-time predictions on new data via dynamic forms.
* **AI Data Chat**: Chat with an AI assistant about your dataset metadata.
* **Executive Reports**: Generate and print clean PDF summaries of your data and models.

---

## How to Run the Project

This project consists of two parts: a **Python FastAPI Backend** and a **React Vite Frontend**. You need to start both servers in separate terminal windows.

### 1. Start the Backend (API)

Open a new terminal, navigate to your project folder, and run:

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```
*The backend API will be available at `http://localhost:8000`.*

### 2. Start the Frontend (UI)

Open a second, separate terminal, navigate to your project folder, and run:

```powershell
cd frontend
npm run dev
```
*(If `npm` is not in your PATH, you can also start it directly with Node if configured: `& "C:\Program Files\nodejs\node.exe" node_modules\vite\bin\vite.js`)*

*The frontend application will be available at `http://localhost:5173`.*

---

## Tech Stack
* **Backend**: Python 3, FastAPI, SQLAlchemy, Scikit-Learn, Joblib, Uvicorn
* **Frontend**: React, Vite, Tailwind CSS v4, Zustand, Plotly.js, Lucide Icons
