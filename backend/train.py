import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib
import os

# Resolve paths relative to this script's location — works regardless of CWD
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'diabetes.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'model')

def train():
    # Load dataset (no header row in CSV)
    columns = [
        'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
        'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age', 'Outcome'
    ]
    df = pd.read_csv(DATA_PATH, names=columns)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns.")

    X = df.drop('Outcome', axis=1)
    y = df['Outcome']

    # FIX 1: Split BEFORE any imputation to prevent data leakage.
    # FIX 4: Use stratify=y to preserve the class ratio (65/35) in both splits.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # FIX 1 (cont.): Replace biological zeros with train-set medians only.
    # This ensures no test-set information leaks into the training pipeline.
    cols_to_fix = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    X_train = X_train.copy()
    X_test = X_test.copy()
    for col in cols_to_fix:
        # Use NaN-aware median to ignore existing zeros when computing median
        median_val = X_train[col].replace(0, np.nan).median()
        X_train[col] = X_train[col].replace(0, median_val)
        X_test[col] = X_test[col].replace(0, median_val)

    print("Missing values handled (zeros replaced with train-set medians).")

    # Scaling — fit on train only, transform test
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # FIX 2: Regularize the model to reduce overfitting.
    # FIX 3: class_weight='balanced' compensates for the 65/35 class imbalance,
    #         improving recall for the minority (diabetic) class.
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)

    # Evaluation
    train_predictions = model.predict(X_train_scaled)
    test_predictions = model.predict(X_test_scaled)
    test_proba = model.predict_proba(X_test_scaled)[:, 1]

    train_acc = accuracy_score(y_train, train_predictions)
    test_acc = accuracy_score(y_test, test_predictions)
    auc = roc_auc_score(y_test, test_proba)

    print(f"\n--- Model Evaluation ---")
    print(f"Train Accuracy : {train_acc:.4f}")
    print(f"Test Accuracy  : {test_acc:.4f}  (gap: {train_acc - test_acc:.4f})")
    print(f"AUC-ROC        : {auc:.4f}")
    print(f"\nClassification Report:\n{classification_report(y_test, test_predictions)}")

    # 5-fold stratified cross-validation on training set for robustness check
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=skf, scoring='roc_auc')
    print(f"CV AUC-ROC (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Save model and scaler
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, 'model.joblib'))
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.joblib'))
    print(f"\nModel and Scaler saved to {MODEL_DIR}")

if __name__ == "__main__":
    train()
