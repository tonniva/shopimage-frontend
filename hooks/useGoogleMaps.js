// hooks/useGoogleMaps.js
import { useState, useCallback } from 'react';

export function useGoogleMaps() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate static map URL
   * @param {Object} params - Parameters for static map
   * @returns {Promise<Object>} Map URL result
   */
  const generateStaticMap = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-maps/static-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate static map');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to generate static map';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate property map URL
   * @param {Object} params - Parameters for property map
   * @returns {Promise<Object>} Property map result
   */
  const generatePropertyMap = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-maps/property-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate property map');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to generate property map';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate transportation map URL
   * @param {Object} params - Parameters for transportation map
   * @returns {Promise<Object>} Transportation map result
   */
  const generateTransportationMap = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-maps/transportation-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate transportation map');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to generate transportation map';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get directions between two points
   * @param {Object} params - Parameters for directions
   * @returns {Promise<Object>} Directions result
   */
  const getDirections = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-maps/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get directions');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to get directions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Geocode address to coordinates
   * @param {string} address - Address to geocode
   * @param {string} language - Language preference
   * @returns {Promise<Object>} Geocoding result
   */
  const geocodeAddress = useCallback(async (address, language = 'th') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-maps/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          language,
          operation: 'geocode'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to geocode address');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to geocode address';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reverse geocode coordinates to address
   * @param {Object} location - Location coordinates
   * @param {string} language - Language preference
   * @returns {Promise<Object>} Reverse geocoding result
   */
  const reverseGeocode = useCallback(async (location, language = 'th') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-maps/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location,
          language,
          operation: 'reverse'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reverse geocode');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to reverse geocode';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate distance between two points
   * @param {Object} origin - Origin coordinates
   * @param {Object} destination - Destination coordinates
   * @param {string} mode - Travel mode
   * @returns {Promise<Object>} Distance result
   */
  const calculateDistance = useCallback(async (origin, destination, mode = 'driving') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-maps/distance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin,
          destination,
          mode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate distance');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to calculate distance';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate area overview map
   * @param {Object} params - Parameters for area map
   * @returns {Promise<Object>} Area map result
   */
  const generateAreaMap = useCallback(async (params) => {
    const { center, radius, mapType, size, zoom } = params;
    
    return await generateStaticMap({
      center,
      zoom,
      size,
      mapType,
      paths: [{
        points: generateCirclePoints(center, radius),
        style: {
          color: '0x0000ff',
          weight: 2,
          fillcolor: '0x0000ff',
          fillopacity: 0.2
        }
      }],
      language: 'th'
    });
  }, [generateStaticMap]);

  /**
   * Generate circle points for area visualization
   * @param {Object} center - Center coordinates
   * @param {number} radius - Radius in meters
   * @param {number} points - Number of points
   * @returns {Array} Circle points
   */
  const generateCirclePoints = useCallback((center, radius, points = 32) => {
    const points_array = [];
    const earthRadius = 6371000; // Earth's radius in meters

    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points;
      const lat = center.lat + (radius / earthRadius) * (180 / Math.PI) * Math.cos(angle * Math.PI / 180);
      const lng = center.lng + (radius / earthRadius) * (180 / Math.PI) * Math.sin(angle * Math.PI / 180) / Math.cos(center.lat * Math.PI / 180);
      
      points_array.push({ lat, lng });
    }

    return points_array;
  }, []);

  /**
   * Generate comprehensive property map
   * @param {Object} params - Property map parameters
   * @returns {Promise<Object>} Comprehensive map result
   */
  const generateComprehensivePropertyMap = useCallback(async (params) => {
    const {
      propertyLocation,
      nearbyPlaces = [],
      transportationStops = [],
      mapType = 'roadmap',
      size = { width: 640, height: 480 },
      zoom = 15
    } = params;

    // Create comprehensive markers
    const markers = [
      // Property marker
      {
        location: propertyLocation,
        style: { color: 'blue', size: 'normal' },
        label: 'P'
      },
      // Nearby places markers
      ...nearbyPlaces.slice(0, 10).map((place, index) => ({
        location: place.location || { lat: place.lat, lng: place.lng },
        style: { color: 'green', size: 'small' },
        label: String.fromCharCode(65 + index) // A, B, C, etc.
      })),
      // Transportation markers
      ...transportationStops.map((stop, index) => ({
        location: stop.location || { lat: stop.lat, lng: stop.lng },
        style: { color: getTransportationColor(stop.type), size: 'small' },
        label: getTransportationLabel(stop.type)
      }))
    ];

    return await generateStaticMap({
      center: propertyLocation,
      zoom,
      size,
      mapType,
      markers,
      language: 'th'
    });
  }, [generateStaticMap]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    generateStaticMap,
    generatePropertyMap,
    generateTransportationMap,
    generateAreaMap,
    generateComprehensivePropertyMap,
    getDirections,
    geocodeAddress,
    reverseGeocode,
    calculateDistance,
    resetError
  };
}

/**
 * Get transportation color by type
 * @param {string} type - Transportation type
 * @returns {string} Color code
 */
function getTransportationColor(type) {
  const colorMap = {
    'bts': 'blue',
    'mrt': 'purple',
    'bus': 'green',
    'taxi': 'yellow',
    'train': 'red',
    'ferry': 'cyan',
    'airport': 'orange'
  };
  return colorMap[type] || 'gray';
}

/**
 * Get transportation label by type
 * @param {string} type - Transportation type
 * @returns {string} Label
 */
function getTransportationLabel(type) {
  const labelMap = {
    'bts': 'B',
    'mrt': 'M',
    'bus': 'S',
    'taxi': 'T',
    'train': 'R',
    'ferry': 'F',
    'airport': 'A'
  };
  return labelMap[type] || 'X';
}
