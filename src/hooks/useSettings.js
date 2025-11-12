import { useState, useEffect } from 'react';
import { apiEndpoints } from '../utils/api';

// Default settings as fallback
const DEFAULT_SETTINGS = {
  address: 'Jl Transeram Waihatu, Kairatu Barat, Kab SBB',
  phone: '085243008899',
  maps_url: 'https://maps.app.goo.gl/nwkqSVyAXtdTC37HA',
  operating_hours: 'Setiap Hari: 07.00 - 21.00 WIB',
  about_us: 'Gudang Pakan RN Aneka Jaya adalah supplier pakan ternak dan ikan berkualitas terpercaya yang menyediakan berbagai macam pakan unggas, ikan, suplemen, dan perlengkapan peternakan dengan harga kompetitif.'
};

// Cache to prevent multiple requests
let settingsCache = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Check if cache is still valid
        if (settingsCache && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
          setSettings(settingsCache);
          setLoading(false);
          return;
        }

        const response = await apiEndpoints.getSettings();
        const fetchedSettings = {
          ...DEFAULT_SETTINGS,
          ...response.data
        };
        
        // Update cache
        settingsCache = fetchedSettings;
        cacheTime = Date.now();
        
        setSettings(fetchedSettings);
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err.message);
        // Use default settings on error
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};

