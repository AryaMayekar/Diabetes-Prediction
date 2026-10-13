# 🩺 DiabetesAI — Diabetes Risk Prediction

An end-to-end machine learning web app that predicts diabetes risk from clinical measurements using a **Random Forest** model, a **FastAPI** backend, and a **React** frontend.

---

## 🗂️ Project Structure

```
Diabetes Prediction/
├── backend/
│   ├── data/
│   │   └── diabetes.csv          # Pima Indians Diabetes dataset (768 rows)
│   ├── model/
│   │   ├── model.joblib          # Trained Random Forest model
│   │   └── scaler.joblib         # Fitted StandardScaler
│   ├── train.py                  # Model training script
│   ├── main.py                   # FastAPI server
│   └── requirements.txt          # Python dependencies
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js                # Main React component (prediction form + results)
    │   ├── App.css               # Dark-mode design system
    │   └── index.js
    └── package.json
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.8 or higher |
| Node.js | 16 or higher |
| npm | 8 or higher |

---

## 🚀 How to Run

### Step 1 — Clone / open the project

```bash
cd "f:/Diabetes Prediction"
```

### Step 2 — Set up the Python backend

```bash
# Install Python dependencies
pip install -r backend/requirements.txt
```

### Step 3 — Train the model *(skip if `model/` files already exist)*

Run this from the **project root** (`Diabetes Prediction/`):

```bash
python backend/train.py
```

You should see output like:
```
Dataset loaded: 768 rows, 9 columns.
Missing values handled (zeros replaced with train-set medians).

--- Model Evaluation ---
Train Accuracy : 0.8779
Test Accuracy  : 0.7403  (gap: 0.1376)
AUC-ROC        : 0.8180

CV AUC-ROC (5-fold): 0.8352 ± 0.0210
Model and Scaler saved to .../backend/model
```

### Step 4 — Start the FastAPI backend

Run this from the **project root**:

```bash
uvicorn backend.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

### Step 5 — Start the React frontend

Open a **second terminal**:

```bash
cd frontend
npm install        # first time only
npm start
```

The app opens automatically at **http://localhost:3000** 🎉

---

## 📡 API Reference

### `GET /health`
Returns server and model status.

```json
{ "status": "ok", "model_loaded": true }
```

### `POST /predict`
Submit clinical measurements and get a prediction.

**Request body:**
```json
{
  "Pregnancies": 2,
  "Glucose": 138,
  "BloodPressure": 72,
  "SkinThickness": 28,
  "Insulin": 80,
  "BMI": 31.5,
  "DiabetesPedigreeFunction": 0.627,
  "Age": 33
}
```

**Response:**
```json
{
  "prediction": "Diabetic",
  "probability": 72.45,
  "risk_level": "High"
}
```

| Field | Description |
|-------|-------------|
| `prediction` | `"Diabetic"` or `"Non-Diabetic"` |
| `probability` | Probability of being diabetic (0–100%) |
| `risk_level` | `"High"` (≥65%) · `"Moderate"` (40–65%) · `"Low"` (<40%) |

---

## 🧠 Model Details

| Property | Value |
|----------|-------|
| Algorithm | Random Forest Classifier |
| Trees | 200 |
| Max Depth | 10 |
| Min Samples Leaf | 5 |
| Class Weight | `balanced` (handles 65/35 imbalance) |
| Scaler | StandardScaler |
| Train Accuracy | 87.8% |
| Test Accuracy | 74.0% |
| AUC-ROC | 0.82 |
| CV AUC-ROC (5-fold) | 0.835 ± 0.021 |

### Dataset
The [Pima Indians Diabetes Dataset](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) — 768 female patients of Pima Indian heritage, aged ≥ 21.

### Preprocessing
- Biologically impossible `0` values in `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, and `BMI` are replaced with **train-set medians** (no data leakage).
- Train/test split uses `stratify=y` to preserve the 65/35 class ratio.

---

## 🔧 Troubleshooting

**`FileNotFoundError: model.joblib not found`**  
→ Run `python backend/train.py` from the project root first.

**`Cannot reach the API server`** (shown in the UI)  
→ Make sure the FastAPI backend is running (`uvicorn backend.main:app --reload`).

**`pip install` fails**  
→ Try `pip install -r backend/requirements.txt --upgrade`

**Port already in use**  
→ Change the API port: `uvicorn backend.main:app --port 8001`  
→ Then update the fetch URL in `frontend/src/App.js` to match.

---

## 📦 Dependencies

**Backend (`backend/requirements.txt`)**
```
fastapi
uvicorn
scikit-learn
pandas
numpy
joblib
```

**Frontend (`frontend/package.json`)**
- React 19
- react-scripts 5

---

> ⚠️ **For educational use only.** This tool is not a substitute for professional medical advice.
