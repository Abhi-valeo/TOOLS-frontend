import React, { useState } from 'react';
import { useBiomarker } from '../context/BiomarkerContext';
import config from '../config/environment';

const PackageRecommendation = () => {
  const { selected, packages, allBiomarkers, selectedCurrency } = useBiomarker();
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [bmDetailModal, setBmDetailModal] = useState(null);
  const [bmDetailCache, setBmDetailCache] = useState({});
  const [bmDetailLoading, setBmDetailLoading] = useState(false);

  // Format price with currency
  const formatPrice = (price) => {
    return `${price} ${selectedCurrency}`;
  };

  // Fetch biomarker details and cache them
  const handleBmUuidClick = async (uuid) => {
    if (bmDetailCache[uuid]) {
      setBmDetailModal(bmDetailCache[uuid]);
      return;
    }
    setBmDetailLoading(true);
    try {
      const res = await fetch(`${config.CATALOG_API_URL}/api/catalog/recommendation/getBiomarker?bmUuid=${uuid}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setBmDetailCache(prev => ({ ...prev, [uuid]: data[0] }));
        setBmDetailModal(data[0]);
      }
    } catch (e) {
      setBmDetailModal({ uuid, error: 'Failed to fetch details' });
    } finally {
      setBmDetailLoading(false);
    }
  };

  const renderPackageCard = (pkg) => (
    <div
      key={pkg.uuid}
      className={`glass-effect rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
        expandedPackage === pkg.uuid 
          ? 'border-2 border-yellow-500 bg-yellow-100/30 scale-105' 
          : 'border border-white/30 hover:border-yellow-300/50'
      }`}
      onClick={() => setExpandedPackage(expandedPackage === pkg.uuid ? null : pkg.uuid)}
      onMouseEnter={e => {
        if (expandedPackage !== pkg.uuid) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={e => {
        if (expandedPackage !== pkg.uuid) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '';
        }
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-roboto font-bold text-gray-800 mb-2 flex items-center gap-3">
            {pkg.name || (pkg.type === 'Blood_Package' ? 'Blood Package' : 'Mini Package')}
            <button
              onClick={e => {
                e.stopPropagation();
                setShowDetails(pkg);
              }}
              className="p-1 rounded-full hover:bg-white/30 transition-all duration-200 text-yellow-600 hover:text-yellow-700"
              title="Show details"
            >
              ℹ️
            </button>
          </h2>
          <span className="inline-block px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-sm font-medium">
            {pkg.biomarkerNames.length} biomarker{pkg.biomarkerNames.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-2xl font-roboto font-bold text-gray-800 ml-4">
          {formatPrice(pkg.price)}
        </div>
      </div>

      {expandedPackage === pkg.uuid && (
        <div className="mt-4 pt-4 border-t border-white/30">
          <h3 className="text-lg font-roboto font-semibold text-gray-800 mb-3">
            Included Biomarkers:
          </h3>
          <div className="grid gap-2">
            {pkg.biomarkerNames.map((name, index) => (
              <div
                key={index}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-opensans"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderUncoveredBiomarkers = (biomarkers) => {
    if (!biomarkers || biomarkers.length === 0) return null;
    
    return (
      <div className="glass-effect rounded-2xl p-6 border border-white/20 mt-6">
        <h3 className="text-lg font-roboto font-semibold text-gray-800 mb-4 text-shadow">
          Biomarkers Without Mini Packages:
        </h3>
        <div className="flex flex-wrap gap-2">
          {biomarkers.map((uuid, index) => (
            <button
              key={index}
              className="px-4 py-2 bg-yellow-100/50 text-yellow-800 border border-yellow-200/50 rounded-full text-sm font-medium hover:bg-yellow-200/50 transition-all duration-300"
              onClick={() => handleBmUuidClick(uuid)}
            >
              {uuid}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 font-opensans">
      <div className="max-w-6xl mx-auto animate-fade-in content-wrapper">
        <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-playfair font-normal text-amber-50 mb-4 tracking-wider text-border">
              Package Recommendations
            </h1>
            <p className="text-lg font-opensans font-medium text-gray-800 text-shadow">
              Personalized health packages based on your biomarker selection
            </p>
          </div>

          <div className="space-y-8">
            {/* Individual Packages Section */}
            <div className="glass-effect rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/30">
                <h2 className="text-2xl font-roboto font-bold text-gray-800 text-shadow">
                  Individual Packages
                </h2>
                <div className="text-xl font-roboto font-bold text-gray-800">
                  Total: {formatPrice(packages?.individualPackages?.totalPrice || 0)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages?.individualPackages?.packageEntities?.map(renderPackageCard)}
              </div>

              {renderUncoveredBiomarkers(packages?.individualPackages?.biomarkerUuidsWithNoMiniPackage)}
            </div>

            {/* Combo Package Section */}
            <div className="glass-effect rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/30">
                <h2 className="text-2xl font-roboto font-bold text-gray-800 text-shadow">
                  Combo Package
                </h2>
                <div className="text-xl font-roboto font-bold text-gray-800">
                  Total: {formatPrice(packages?.comboPackage?.totalPrice || 0)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages?.comboPackage?.packageEntities?.map(renderPackageCard)}
              </div>

              {renderUncoveredBiomarkers(packages?.comboPackage?.biomarkerUuidsWithNoMiniPackage)}
            </div>
          </div>

          {/* Summary Section */}
          <div className="glass-effect rounded-2xl p-6 border border-white/20 mt-8">
            <h3 className="text-xl font-roboto font-bold text-gray-800 mb-4 text-shadow">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-opensans">Selected Biomarkers:</span>
                <span className="font-roboto font-semibold text-gray-800">{selected.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-opensans">Individual Packages Total:</span>
                <span className="font-roboto font-semibold text-gray-800">{formatPrice(packages?.individualPackages?.totalPrice || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-opensans">Combo Package Total:</span>
                <span className="font-roboto font-semibold text-gray-800">{formatPrice(packages?.comboPackage?.totalPrice || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/30 font-roboto font-bold text-lg">
                <span className="text-gray-800">Savings with Combo:</span>
                <span className="text-green-600">
                  {formatPrice((packages?.individualPackages?.totalPrice - packages?.comboPackage?.totalPrice) || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-roboto font-bold text-gray-800 text-shadow">Package Details</h2>
              <button
                onClick={() => setShowDetails(null)}
                className="p-2 rounded-full hover:bg-white/30 transition-all duration-200 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <h3 className="font-roboto font-semibold text-gray-800 mb-2">Package Name</h3>
                <p className="font-opensans text-gray-700">{showDetails.name || (showDetails.type === 'Blood_Package' ? 'Blood Package' : 'Mini Package')}</p>
              </div>

              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <h3 className="font-roboto font-semibold text-gray-800 mb-2">Price</h3>
                <p className="text-xl font-roboto font-bold text-gray-800">{formatPrice(showDetails.price)}</p>
              </div>

              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <h3 className="font-roboto font-semibold text-gray-800 mb-3">Included Biomarkers</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {showDetails.biomarkerNames.map((name, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-opensans"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Biomarker Details Modal */}
      {bmDetailModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl p-8 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-roboto font-bold text-gray-800 mb-6 text-shadow">Biomarker Details</h2>
            {bmDetailLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-opensans">Loading...</p>
              </div>
            ) : bmDetailModal.error ? (
              <div className="text-red-500 font-opensans text-center py-8">{bmDetailModal.error}</div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="font-roboto font-semibold text-gray-800 mb-2">Name</div>
                  <div className="font-opensans text-gray-700">{bmDetailModal.name}</div>
                </div>
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="font-roboto font-semibold text-gray-800 mb-2">UUID</div>
                  <div className="font-mono text-sm break-all text-gray-700">{bmDetailModal.uuid}</div>
                </div>
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="font-roboto font-semibold text-gray-800 mb-2">Type</div>
                  <div className="font-opensans text-gray-700">{bmDetailModal.type}</div>
                </div>
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="font-roboto font-semibold text-gray-800 mb-2">SQL ID</div>
                  <div className="font-mono text-sm text-gray-700">{bmDetailModal.sqlId}</div>
                </div>
                {bmDetailModal.description && (
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                    <div className="font-roboto font-semibold text-gray-800 mb-2">Description</div>
                    <div className="font-opensans text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                      {bmDetailModal.description}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setBmDetailModal(null)}
              className="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl font-opensans font-medium text-gray-800 hover:bg-white/30 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageRecommendation; 