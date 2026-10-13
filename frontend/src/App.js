import React, { useState, useCallback } from 'react';
import './App.css';

const FIELDS = [
  {
    key: 'Pregnancies',
    label: 'Pregnancies',
    icon: '🤰',
    placeholder: 'e.g. 2',
    hint: 'Number of times pregnant (0–17)',
    min: 0, max: 20, step: 1,
  },
  {
    key: 'Glucose',
    label: 'Glucose',
    icon: '🩸',
    placeholder: 'e.g. 120',
    hint: 'Plasma glucose (mg/dL, 0–300)',
    min: 0, max: 300, step: 1,
  },
  {
    key: 'BloodPressure',
    label: 'Blood Pressure',
    icon: '💓',
    placeholder: 'e.g. 72',
    hint: 'Diastolic BP (mm Hg, 0–200)',
    min: 0, max: 200, step: 1,
  },
  {
    key: 'SkinThickness',
    label: 'Skin Thickness',
    icon: '📏',
    placeholder: 'e.g. 28',
    hint: 'Triceps fold thickness (mm, 0–100)',
    min: 0, max: 100, step: 1,
  },
  {
    key: 'Insulin',
    label: 'Insulin',
    icon: '💉',
    placeholder: 'e.g. 80',
    hint: '2-hr serum insulin (mu U/ml, 0–900)',
    min: 0, max: 900, step: 1,
  },
  {
    key: 'BMI',
    label: 'BMI',
    icon: '⚖️',
    placeholder: 'e.g. 32.5',
    hint: 'Body mass index (kg/m², 0–70)',
    min: 0, max: 70, step: 0.1,
  },
  {
    key: 'DiabetesPedigreeFunction',
    label: 'Pedigree Function',
    icon: '🧬',
    placeholder: 'e.g. 0.627',
    hint: 'Diabetes likelihood via ancestry (0–3)',
    min: 0, max: 3, step: 0.001,
  },
  {
    key: 'Age',
    label: 'Age',
    icon: '🎂',
    placeholder: 'e.g. 33',
    hint: 'Age in years (1–120)',
    min: 1, max: 120, step: 1,
  },
];

const INITIAL_FORM = Object.fromEntries(FIELDS.map(f => [f.key, '']));

function validateForm(values) {
  const errors = {};
  FIELDS.forEach(({ key, label, min, max }) => {
    const val = values[key];
    if (val === '' || val === null || val === undefined) {
      errors[key] = `${label} is required`;
    } else {
      const num = parseFloat(val);
      if (isNaN(num)) {
        errors[key] = 'Must be a number';
      } else if (num < min || num > max) {
        errors[key] = `Must be between ${min} and ${max}`;
      }
    }
  });
  return errors;
}

function RiskBadge({ level }) {
  const colorMap = { High: 'high', Moderate: 'moderate', Low: 'low' };
  return <span className={`metric-value ${colorMap[level] || ''}`}>{level}</span>;
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
    if (result) setResult(null);
  }, [errors, result]);

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setResult(null);
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload = Object.fromEntries(
        FIELDS.map(({ key }) => [key, parseFloat(form[key])])
      );
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setApiError('Cannot reach the API server. Make sure the FastAPI backend is running on http://localhost:8000.');
      } else {
        setApiError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDiabetic = result?.prediction === 'Diabetic';

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="header-icon">🩺</div>
            <div className="header-text">
              <h1>DiabetesAI</h1>
              <p>Powered by Random Forest · FastAPI · React</p>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="hero-badge">
              <span>🧠</span> Machine Learning Health Assessment
            </div>
            <h2>
              Predict Your <span className="gradient-text">Diabetes Risk</span><br />
              in Seconds
            </h2>
            <p>
              Enter your clinical measurements below. Our trained Random Forest model
              will analyse your data and provide an instant, data-driven risk assessment.
            </p>

            <div className="stats-row">
              <div className="stat-chip">📊 <strong>768</strong> training samples</div>
              <div className="stat-chip">🎯 <strong>76%</strong> test accuracy</div>
              <div className="stat-chip">📈 <strong>0.82</strong> AUC-ROC</div>
              <div className="stat-chip">🌲 <strong>200</strong> decision trees</div>
            </div>
          </div>
        </section>

        <div className="container">
          {/* Error Alert */}
          {apiError && (
            <div className="error-alert" role="alert">
              <span>⚠️</span>
              {apiError}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`result-card ${isDiabetic ? 'diabetic' : 'non-diabetic'}`} role="region" aria-label="Prediction result">
              <div className="result-header">
                <div className={`result-icon ${isDiabetic ? 'diabetic' : 'non-diabetic'}`}>
                  {isDiabetic ? '⚠️' : '✅'}
                </div>
                <div>
                  <div className={`result-title ${isDiabetic ? 'diabetic' : 'non-diabetic'}`}>
                    Prediction Result
                  </div>
                  <div className="result-diagnosis">{result.prediction}</div>
                </div>
              </div>

              <div className="result-metrics">
                <div className="metric-box">
                  <div className="metric-label">Probability</div>
                  <div className={`metric-value ${isDiabetic ? 'high' : 'low'}`}>
                    {result.probability}%
                  </div>
                  <div className="prob-bar-container">
                    <div
                      className={`prob-bar-fill ${isDiabetic ? 'diabetic' : 'non-diabetic'}`}
                      style={{ width: `${result.probability}%` }}
                    />
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Risk Level</div>
                  <RiskBadge level={result.risk_level} />
                </div>
                <div className="metric-box">
                  <div className="metric-label">Model Confidence</div>
                  <div className="metric-value">
                    {result.probability >= 50
                      ? (100 - result.probability + 50).toFixed(1)
                      : (100 - result.probability).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="main-card">
            <div className="card-header">
              <h3>Clinical Measurements</h3>
              <p>Fill in all 8 fields below — all are required for an accurate prediction.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                {FIELDS.map(({ key, label, icon, placeholder, hint, min, max, step }) => (
                  <div className="field-group" key={key}>
                    <label className="field-label" htmlFor={`field-${key}`}>
                      <span className="field-icon">{icon}</span>
                      {label}
                    </label>
                    <input
                      id={`field-${key}`}
                      className={`field-input${errors[key] ? ' error' : ''}`}
                      type="number"
                      placeholder={placeholder}
                      value={form[key]}
                      min={min}
                      max={max}
                      step={step}
                      onChange={e => handleChange(key, e.target.value)}
                      aria-describedby={errors[key] ? `error-${key}` : `hint-${key}`}
                      aria-invalid={!!errors[key]}
                    />
                    {errors[key]
                      ? <span id={`error-${key}`} className="field-error">⚠ {errors[key]}</span>
                      : <span id={`hint-${key}`} className="field-hint">{hint}</span>
                    }
                  </div>
                ))}
              </div>

              <div className="submit-area">
                <button
                  id="btn-predict"
                  type="submit"
                  className="btn-predict"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading
                    ? <><div className="spinner" /> Analysing…</>
                    : <><span>🔍</span> Predict Diabetes Risk</>
                  }
                </button>
                <button
                  id="btn-reset"
                  type="button"
                  className="btn-reset"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>




        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>DiabetesAI · Built with FastAPI + scikit-learn + React · For educational use only</p>
        </div>
      </footer>
    </div>
  );
}
