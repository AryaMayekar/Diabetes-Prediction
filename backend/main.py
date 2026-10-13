from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os

# Resolve paths relative to this script — works regardless of CWD (FIX 5)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'model.joblib')
SCALER_PATH = os.path.join(BASE_DIR, 'model', 'scaler.joblib')

app = FastAPI(title="Diabetes Prediction API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and scaler
model = None
scaler = None

@app.on_event("startup")
async def load_model():
    global model, scaler
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        raise RuntimeError(
            f"Model files not found at {MODEL_PATH}. "
            "Please run train.py first to generate the model."
        )
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("Model and Scaler loaded successfully.")

class DiabetesInput(BaseModel):
    Pregnancies: float = Field(..., ge=0, le=20, description="Number of pregnancies")
    Glucose: float = Field(..., ge=0, le=300, description="Plasma glucose concentration (mg/dL)")
    BloodPressure: float = Field(..., ge=0, le=200, description="Diastolic blood pressure (mm Hg)")
    SkinThickness: float = Field(..., ge=0, le=100, description="Triceps skin fold thickness (mm)")
    Insulin: float = Field(..., ge=0, le=900, description="2-Hour serum insulin (mu U/ml)")
    BMI: float = Field(..., ge=0, le=70, description="Body mass index (kg/m²)")
    DiabetesPedigreeFunction: float = Field(..., ge=0, le=3, description="Diabetes pedigree function")
    Age: float = Field(..., ge=1, le=120, description="Age in years")

@app.get("/")
async def root():
    return {"message": "Diabetes Prediction API is running. POST to /predict to get a prediction."}

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
async def predict(data: DiabetesInput):
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please try again later.")

    # Feature order must match training column order
    features = [
        data.Pregnancies, data.Glucose, data.BloodPressure, data.SkinThickness,
        data.Insulin, data.BMI, data.DiabetesPedigreeFunction, data.Age
    ]

    # Scale and predict
    input_array = np.array(features).reshape(1, -1)
    scaled_data = scaler.transform(input_array)
    prediction = int(model.predict(scaled_data)[0])
    probability = float(model.predict_proba(scaled_data)[0][1])

    return {
        "prediction": "Diabetic" if prediction == 1 else "Non-Diabetic",
        "probability": round(probability * 100, 2),
        "risk_level": (
            "High" if probability >= 0.65
            else "Moderate" if probability >= 0.40
            else "Low"
        )
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
