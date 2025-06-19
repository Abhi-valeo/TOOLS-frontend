import React, { createContext, useContext, useState } from 'react';
import { currentConfig } from '../config';

const BiomarkerContext = createContext();

export const useBiomarker = () => useContext(BiomarkerContext);

export const BiomarkerProvider = ({ children }) => {
  const [biomarkerGroups, setBiomarkerGroups] = useState({});
  const [selected, setSelected] = useState([]);
  const [packages, setPackages] = useState([]);
  const [allBiomarkers, setAllBiomarkers] = useState({}); // Store all biomarker data
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('$'); // Default to $

  const verifyBiomarkers = async (input) => {
    try {
      const response = await fetch(`${currentConfig.apiBaseUrl}/api/catalog/recommendation/verifyBiomarkers?biomarkers=${encodeURIComponent(input)}`);
      if (!response.ok) {
        throw new Error('Failed to verify biomarkers');
      }
      const data = await response.json();
      setBiomarkerGroups(data);
      
      // Store all biomarker data in a flat object for easy lookup
      const biomarkerMap = {};
      Object.values(data).forEach(group => {
        if (group && group.options) {
          group.options.forEach(option => {
            biomarkerMap[option.uuid] = option;
          });
        }
        if (Array.isArray(group)) {
          group.forEach(option => {
            biomarkerMap[option.uuid] = option;
          });
        }
      });
      setAllBiomarkers(biomarkerMap);
      
      return data;
    } catch (error) {
      console.error('Error verifying biomarkers:', error);
      throw error;
    }
  };

  const fetchPackages = async (selectedBiomarkers) => {
    try {
      const response = await fetch(`${currentConfig.apiBaseUrl}/api/catalog/recommendation/getBestPackageWithoutOverlappingV2?cityId=${selectedCity}`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biomarkerUuids: selectedBiomarkers
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data = await response.json();
      setPackages(data);
      return data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  };

  return (
    <BiomarkerContext.Provider value={{
      biomarkerGroups,
      setBiomarkerGroups,
      selected,
      setSelected,
      packages,
      setPackages,
      allBiomarkers,
      selectedCity,
      setSelectedCity,
      selectedCurrency,
      setSelectedCurrency,
      verifyBiomarkers,
      fetchPackages,
    }}>
      {children}
    </BiomarkerContext.Provider>
  );
}; 