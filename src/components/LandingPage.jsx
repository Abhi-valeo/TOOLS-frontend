import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handlePackagesClick = () => {
    navigate('/packages');
  };

  const handleHakeemClick = () => {
    navigate('/hakeem');
  };

  return (
    <div className="max-w-4xl mx-auto text-center animate-fade-in content-wrapper">
      {/* Header */}
      <div className="mb-12 animate-slide-up">
        <h1 className="text-3xl md:text-5xl font-playfair font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 tracking-wider animate-pulse hover:animate-none transition-all duration-500 hover:scale-105 cursor-default">
          Valeo Tools
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full animate-pulse mb-6"></div>
        <p className="text-xl md:text-2xl font-opensans font-medium text-gray-800 max-w-2xl mx-auto text-shadow">
          Advanced healthcare analytics and personalized recommendations
        </p>
      </div>

      {/* Main Content Card */}
      <div className="glass-effect rounded-3xl p-8 md:p-12 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Hakeem Button */}
          <div className="group">
            <button 
              onClick={handleHakeemClick}
              className="w-full h-64 glass-effect rounded-2xl p-6 flex flex-col items-center justify-center button-hover group-hover:bg-white/25"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-roboto font-bold text-gray-800 mb-2 text-shadow">Hakeem</h3>
              <p className="text-gray-700 text-sm leading-relaxed font-opensans">
                AI-Powered analysis and health insights
              </p>
              <div className="mt-4 text-blue-600 text-xs font-semibold font-opensans">
                Click to access →
              </div>
            </button>
          </div>

          {/* Packages Suggestion Button */}
          <div className="group">
            <button 
              onClick={handlePackagesClick}
              className="w-full h-64 glass-effect rounded-2xl p-6 flex flex-col items-center justify-center button-hover group-hover:bg-white/25"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-roboto font-bold text-gray-800 mb-2 text-shadow">Packages</h3>
              <p className="text-gray-700 text-sm leading-relaxed font-opensans">
                Personalized health package recommendations
              </p>
              <div className="mt-4 text-purple-600 text-xs font-semibold font-opensans">
                Click to access →
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-gray-800 text-sm animate-slide-up font-opensans font-medium text-shadow" style={{ animationDelay: '0.4s' }}>
        <p>Powered by Valeo Wellbeing technologies</p>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse-slow"></div>
      <div className="fixed top-20 right-20 w-3 h-3 bg-white/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="fixed bottom-20 left-20 w-1 h-1 bg-white/40 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="fixed bottom-10 right-10 w-2 h-2 bg-white/25 rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default LandingPage; 