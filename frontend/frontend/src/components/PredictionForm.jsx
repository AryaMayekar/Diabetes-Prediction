import React, { useState } from 'react';

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    Pregnancies: '',
    Glucose: '',
    BloodPressure: '',
    SkinThickness: '',
    Insulin: '',
    BMI: '',
    DiabetesPedigreeFunction: '',
    Age: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Pregnancies: parseFloat(formData.Pregnancies),
          Glucose: parseFloat(formData.Glucose),
          BloodPressure: parseFloat(formData.BloodPressure),
          SkinThickness: parseFloat(formData.SkinThickness),
          Insulin: parseFloat(formData.Insulin),
          BMI: parseFloat(formData.BMI),
          DiabetesPedigreeFunction: parseFloat(formData.DiabetesPedigreeFunction),
          Age: parseFloat(formData.Age),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert('Error connecting to the backend. Please make sure the Python server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Diabetes Prediction Form</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(formData).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
            <input
              type="number"
              step="any"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 mt-4 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Predicting...' : 'Predict Result'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-4 border-t border-slate-200 text-center">
          <p className="text-lg font-medium text-slate-700">Prediction: </p>
          <p className={`text-3xl font-bold ${result.prediction === 'Diabetic' ? 'text-red-600' : 'text-green-600'}`}>
            {result.prediction}
          </p>
          <p className="text-slate-500 mt-2">Probability: {result.probability}</p>
          <button
            onClick={() => {setResult(null); setFormData({Pregnancies: '', Glucose: '', BloodPressure: '', SkinThickness: '', Insulin: '', BMI: '', DiabetesPedigreeFunction: '', Age: ''})}}
            className="mt-4 text-sm text-blue-600 underline cursor-pointer"
          >
            Reset Form
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
