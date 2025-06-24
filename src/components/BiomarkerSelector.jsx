import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBiomarker } from '../context/BiomarkerContext';
import { currentConfig } from '../config';

const BiomarkerSelector = () => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSelected, setShowSelected] = useState(false);
  const [infoBiomarker, setInfoBiomarker] = useState(null);
  const navigate = useNavigate();
  const { biomarkerGroups, selectedCity, fetchPackages } = useBiomarker();

  const toggle = (uuid) => {
    setSelected(prev => 
      prev.includes(uuid) 
        ? prev.filter(id => id !== uuid)
        : [...prev, uuid]
    );
  };

  const handleProceed = async () => {
    if (selected.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      await fetchPackages(selected);
      navigate('/packages/recommend');
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter biomarker groups based on search
  const filteredGroups = biomarkerGroups ? Object.entries(biomarkerGroups)
    .filter(([groupName, biomarkers]) => 
      groupName.toLowerCase().includes(search.toLowerCase()) ||
      biomarkers.some(biomarker => 
        biomarker.name.toLowerCase().includes(search.toLowerCase())
      )
    )
    .map(([groupName, biomarkers]) => ({
      groupName,
      biomarkers: biomarkers.filter(biomarker => 
        biomarker.name.toLowerCase().includes(search.toLowerCase())
      )
    })) : [];

  const selectedNames = selected.map(uuid => {
    // Find the biomarker across all groups
    for (const [groupName, biomarkers] of Object.entries(biomarkerGroups || {})) {
      const found = biomarkers.find(bm => bm.uuid === uuid);
      if (found) return found.name;
    }
    return uuid;
  });

  // Fallback UI if no groups
  if (!biomarkerGroups || Object.keys(biomarkerGroups).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-opensans">
        <div className="max-w-2xl w-full animate-fade-in content-wrapper">
          <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up text-center">
            <h1 className="text-4xl md:text-5xl font-playfair font-normal text-amber-50 mb-4 tracking-wider text-border">
              Select Biomarkers
            </h1>
            <div className="text-red-500 font-opensans text-lg mb-6">
              No biomarkers found. Please verify your input or try again.
            </div>
            <button
              onClick={() => navigate('/packages')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-roboto font-bold rounded-2xl button-hover transition-all duration-300"
            >
              Go Back to Input
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 font-opensans">
      <div className="max-w-6xl mx-auto animate-fade-in content-wrapper">
        <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-playfair font-normal text-amber-50 mb-4 tracking-wider text-border">
              Select Biomarkers
            </h1>
            <p className="text-lg font-opensans font-medium text-gray-800 text-shadow">
              Choose the biomarkers you want to analyze
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search biomarkers by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-gray-800 font-opensans focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl">
                🔍
              </span>
            </div>
          </div>

          {/* Biomarker Groups */}
          <div className="mb-6 max-h-96 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-600 font-opensans">
                No biomarkers found.
              </div>
            ) : (
              <div className="space-y-6">
                {filteredGroups.map(group => (
                  <div key={group.groupName} className="space-y-4">
                    <h3 className="text-xl font-roboto font-bold text-gray-800 text-shadow border-b-2 border-white/30 pb-2">
                      {group.groupName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.biomarkers.map(biomarker => {
                        const isSelected = selected.includes(biomarker.uuid);
                        const isBlood = biomarker.type === 'BLOOD';
                        const isNonBlood = biomarker.type === 'NON_BLOOD';
                        return (
                          <div
                            key={biomarker.uuid}
                            className={`glass-effect rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                              isSelected 
                                ? 'border-2 border-green-500 bg-green-100/30' 
                                : 'border border-white/30'
                            } ${
                              isBlood ? 'bg-red-100/20' : isNonBlood ? 'bg-blue-100/20' : 'bg-white/20'
                            }`}
                            onClick={() => toggle(biomarker.uuid)}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '';
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className={`font-roboto font-semibold text-sm mb-1 truncate ${
                                  isBlood ? 'text-red-700' : isNonBlood ? 'text-blue-700' : 'text-gray-800'
                                }`}>
                                  {biomarker.name}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                  isBlood 
                                    ? 'bg-red-200/50 text-red-700' 
                                    : 'bg-blue-200/50 text-blue-700'
                                }`}>
                                  {biomarker.type}
                                </div>
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setInfoBiomarker(biomarker);
                                }}
                                className="ml-2 p-1 rounded-full hover:bg-white/30 transition-all duration-200 text-gray-600 hover:text-gray-800"
                                title="Show details"
                              >
                                ℹ️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="glass-effect rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="font-roboto font-bold text-gray-800 text-shadow">
                  Selected: {selected.length} biomarker{selected.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setShowSelected(true)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl font-opensans font-medium text-gray-800 hover:bg-white/30 transition-all duration-300"
                >
                  View Selected
                </button>
              </div>
              <button
                onClick={handleProceed}
                disabled={loading || selected.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-roboto font-bold rounded-2xl button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                    Get Recommendations
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 font-opensans text-sm bg-red-100/50 backdrop-blur-sm rounded-lg p-4 border border-red-200/50 text-center">
              {error}
            </div>
          )}

          {/* Selected Biomarkers Modal */}
          {showSelected && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl p-8 max-w-md w-full max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-roboto font-bold text-gray-800 mb-6 text-shadow">Selected Biomarkers</h2>
                <div className="space-y-3 mb-6">
                  {selectedNames.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 font-opensans">
                      No biomarkers selected
                    </div>
                  ) : (
                    selectedNames.map((name, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-green-100/50 backdrop-blur-sm rounded-xl border border-green-200/50"
                      >
                        <span className="font-opensans font-medium text-green-800">{name}</span>
                        <button
                          onClick={() => {
                            // Find the biomarker across all groups
                            for (const [groupName, biomarkers] of Object.entries(biomarkerGroups || {})) {
                              const biomarker = biomarkers.find(bm => bm.name === name);
                              if (biomarker) {
                                toggle(biomarker.uuid);
                                break;
                              }
                            }
                          }}
                          className="p-1 rounded-full hover:bg-green-200/50 transition-all duration-200 text-green-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setShowSelected(false)}
                  className="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl font-opensans font-medium text-gray-800 hover:bg-white/30 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Info Modal */}
          {infoBiomarker && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl p-8 max-w-md w-full max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-roboto font-bold text-gray-800 mb-6 text-shadow">Biomarker Details</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                    <div className="font-roboto font-semibold text-gray-800 mb-2">Name</div>
                    <div className="font-opensans">{infoBiomarker.name}</div>
                  </div>
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                    <div className="font-roboto font-semibold text-gray-800 mb-2">Type</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      infoBiomarker.type === 'BLOOD' 
                        ? 'bg-red-200/50 text-red-700' 
                        : 'bg-blue-200/50 text-blue-700'
                    }`}>
                      {infoBiomarker.type}
                    </div>
                  </div>
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                    <div className="font-roboto font-semibold text-gray-800 mb-2">UUID</div>
                    <div className="font-mono text-sm break-all text-gray-700">{infoBiomarker.uuid}</div>
                  </div>
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                    <div className="font-roboto font-semibold text-gray-800 mb-2">SQL ID</div>
                    <div className="font-mono text-sm text-gray-700">{infoBiomarker.sqlId}</div>
                  </div>
                  {infoBiomarker.description && (
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                      <div className="font-roboto font-semibold text-gray-800 mb-2">Description</div>
                      <div className="font-opensans text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                        {infoBiomarker.description}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setInfoBiomarker(null)}
                  className="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl font-opensans font-medium text-gray-800 hover:bg-white/30 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiomarkerSelector; 