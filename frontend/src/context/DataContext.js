import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [centres, setCentres] = useState([]);
  const [sportsByCentre, setSportsByCentre] = useState({});
  const [loading, setLoading] = useState({
    centres: false,
    sports: false
  });
  const [error, setError] = useState({
    centres: null,
    sports: null
  });
  const [lastFetched, setLastFetched] = useState({
    centres: null,
    sports: {}
  });

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Check if data is stale
  const isDataStale = (lastFetched) => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > CACHE_DURATION;
  };

  // Fetch centres with caching
  const fetchCentres = useCallback(async (forceRefresh = false) => {
    // Return cached data if not stale and not forcing refresh
    if (!forceRefresh && centres.length > 0 && !isDataStale(lastFetched.centres)) {
      return centres;
    }

    setLoading(prev => ({ ...prev, centres: true }));
    setError(prev => ({ ...prev, centres: null }));

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${config.API_URL}/api/centres/getCentres`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const centresData = response.data.centres || [];
      setCentres(centresData);
      setLastFetched(prev => ({ ...prev, centres: Date.now() }));
      return centresData;
    } catch (err) {
      const errorMessage = "Error fetching centres";
      setError(prev => ({ ...prev, centres: errorMessage }));
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, centres: false }));
    }
  }, [centres.length, lastFetched.centres]);

  // Fetch sports for a specific centre with caching
  const fetchSportsForCentre = useCallback(async (centreId, forceRefresh = false) => {
    // Return cached data if not stale and not forcing refresh
    if (!forceRefresh && sportsByCentre[centreId] && !isDataStale(lastFetched.sports[centreId])) {
      return sportsByCentre[centreId];
    }

    setLoading(prev => ({ ...prev, sports: true }));
    setError(prev => ({ ...prev, sports: null }));

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${config.API_URL}/api/centres/${centreId}/sports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const sportsData = response.data.sports || [];
      setSportsByCentre(prev => ({ ...prev, [centreId]: sportsData }));
      setLastFetched(prev => ({ 
        ...prev, 
        sports: { ...prev.sports, [centreId]: Date.now() } 
      }));
      return sportsData;
    } catch (err) {
      const errorMessage = "Error fetching sports";
      setError(prev => ({ ...prev, sports: errorMessage }));
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, sports: false }));
    }
  }, [sportsByCentre, lastFetched.sports]);

  // Initialize data when user logs in
  const initializeData = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        await fetchCentres();
      } catch (err) {
        console.error("Failed to initialize data:", err);
      }
    }
  }, [fetchCentres]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      await fetchCentres(true);
      // Clear sports cache to force refresh when needed
      setSportsByCentre({});
      setLastFetched(prev => ({ ...prev, sports: {} }));
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  }, [fetchCentres]);

  // Initialize data on mount and when token changes
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Listen for login events
  useEffect(() => {
    const handleUserLogin = () => {
      initializeData();
    };

    const handleUserLogout = () => {
      // Clear all cached data
      setCentres([]);
      setSportsByCentre({});
      setLastFetched({
        centres: null,
        sports: {}
      });
      setError({
        centres: null,
        sports: null
      });
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleUserLogout);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, [initializeData]);

  const value = {
    centres,
    sportsByCentre,
    loading,
    error,
    fetchCentres,
    fetchSportsForCentre,
    refreshData,
    initializeData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 