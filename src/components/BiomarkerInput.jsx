import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useBiomarker } from '../context/BiomarkerContext';
import { currentConfig } from '../config';

const BiomarkerInput = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();
  const { verifyBiomarkers, selectedCity, setSelectedCity, setSelectedCurrency } = useBiomarker();

  useEffect(() => {
    // Fetch cities on mount
    const fetchCities = async () => {
      try {
        const res = await fetch(`${currentConfig.apiBaseUrl}/api/catalog/recommendation/suggestion/cities`);
        const data = await res.json();
        setCities(data);
        if (data.length > 0 && !selectedCity) {
          const firstCity = data[0];
          setSelectedCity(firstCity.id.toString());
          setSelectedCurrency(firstCity.currency);
        }
      } catch (e) {
        setCities([]);
      }
    };
    fetchCities();
  }, [setSelectedCity, selectedCity, setSelectedCurrency]);

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    const selectedCityData = cities.find(city => city.id.toString() === cityId);
    if (selectedCityData) {
      setSelectedCurrency(selectedCityData.currency);
    }
  };

  const handleVerify = async () => {
    if (!input.trim()) {
      setError('Please enter at least one biomarker');
      return;
    }
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyBiomarkers(input);
      navigate('/packages/select');
    } catch (err) {
      setError('Failed to verify biomarkers. Please try again.');
      console.error('Error verifying biomarkers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-opensans">
      <div className="max-w-2xl w-full animate-fade-in content-wrapper">
        <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-playfair font-normal text-amber-50 mb-4 tracking-wider text-border">
              Biomarker Analysis
            </h1>
            <p className="text-lg font-opensans font-medium text-gray-800 text-shadow">
              Enter your biomarkers for personalized health recommendations
            </p>
          </div>
          
          {/* City Dropdown */}
          <div className="mb-6">
            <label 
              htmlFor="city-select"
              className="block mb-3 font-roboto font-semibold text-gray-800 text-shadow"
            >
              Select your city
            </label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-gray-800 font-opensans focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            >
              {cities.length === 0 && <option value="">Loading cities...</option>}
              {cities.map(city => (
                <option key={city.id} value={city.id.toString()}>
                  {city.name} ({city.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Biomarker Input */}
          <div className="mb-6">
            <label 
              htmlFor="biomarker-input"
              className="block mb-3 font-roboto font-semibold text-gray-800 text-shadow"
            >
              Enter your biomarkers
            </label>
            <textarea
              id="biomarker-input"
              placeholder="Enter biomarkers separated by commas (e.g., Glucose, Cholesterol, Hemoglobin A1c)"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full min-h-32 p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-gray-800 font-opensans placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 resize-vertical"
            />
            {error && (
              <div className="mt-3 text-red-500 font-opensans text-sm bg-red-100/50 backdrop-blur-sm rounded-lg p-3 border border-red-200/50">
                {error}
              </div>
            )}
          </div>

          {/* Verify Button */}
          <div className="mb-6">
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-roboto font-bold rounded-2xl button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Verify Biomarkers
                </>
              )}
            </button>
          </div>

          {/* Tips Section */}
          <div className="glass-effect rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-roboto font-bold text-gray-800 mb-3 text-shadow">💡 Tips:</h3>
            <ul className="space-y-2 text-gray-700 font-opensans">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                Enter biomarkers separated by commas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                Use standard medical terminology
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                You can enter multiple biomarkers at once
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiomarkerInput; 