import React from 'react';
import PredictionForm from './components/PredictionForm';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Diabetes Prediction AI</h1>
          <p className="text-slate-600">Enter health metrics to predict the likelihood of diabetes</p>
        </header>
        <PredictionForm />
        <footer className="text-center mt-12 text-slate-400 text-sm">
          Minimalist AI/ML Project &bull; Built with React, FastAPI & Scikit-Learn
        </footer>
      </div>
    </div>
  );
}

export default App;
