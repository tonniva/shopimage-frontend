// hooks/useGoogleStreetView.js
import { useState, useCallback } from 'react';

export function useGoogleStreetView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get Street View metadata
   * @param {Object} params - Parameters for Street View metadata
   * @returns {Promise<Object>} Metadata result
   */
  const getMetadata = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-street-view/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get Street View metadata');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to get metadata';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate Street View image URL
   * @param {Object} params - Parameters for Street View image
   * @returns {Promise<Object>} Image URL result
   */
  const generateImageUrl = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-street-view/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Street View image URL');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to generate image URL';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get multiple Street View images
   * @param {Object} params - Parameters for multiple images
   * @returns {Promise<Object>} Multiple images result
   */
  const getMultipleImages = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-street-view/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get multiple Street View images');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to get multiple images';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get property Street View images
   * @param {Object} params - Parameters for property images
   * @returns {Promise<Object>} Property images result
   */
  const getPropertyImages = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-street-view/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get property Street View images');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to get property images';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check Street View availability
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius
   * @returns {Promise<Object>} Availability result
   */
  const checkAvailability = useCallback(async (location, radius = 50) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-street-view/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location, radius })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check Street View availability');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to check availability';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get Street View images for all directions
   * @param {Object} location - Location coordinates
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} All directions images
   */
  const getAllDirectionsImages = useCallback(async (location, options = {}) => {
    const {
      size = { width: 640, height: 480 },
      quality = 2,
      format = 'jpg',
      pitch = 0,
      fov = 90
    } = options;

    return await getMultipleImages({
      location,
      size,
      quality,
      format,
      pitch,
      fov,
      angles: [0, 90, 180, 270] // North, East, South, West
    });
  }, [getMultipleImages]);

  /**
   * Get Street View images for property report
   * @param {Object} location - Location coordinates
   * @param {string} propertyType - Type of property
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Property images
   */
  const getPropertyReportImages = useCallback(async (location, propertyType = 'house', options = {}) => {
    const {
      size = { width: 640, height: 480 },
      quality = 3
    } = options;

    return await getPropertyImages({
      location,
      propertyType,
      size,
      quality
    });
  }, [getPropertyImages]);

  /**
   * Generate Street View panorama URL
   * @param {Object} location - Location coordinates
   * @param {Object} options - Panorama options
   * @returns {Promise<Object>} Panorama URL
   */
  const generatePanoramaUrl = useCallback(async (location, options = {}) => {
    const {
      size = { width: 640, height: 480 },
      heading = 0,
      pitch = 0,
      fov = 90,
      format = 'jpg',
      quality = 2
    } = options;

    return await generateImageUrl({
      location,
      size,
      heading,
      pitch,
      fov,
      format,
      quality
    });
  }, [generateImageUrl]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getMetadata,
    generateImageUrl,
    getMultipleImages,
    getPropertyImages,
    checkAvailability,
    getAllDirectionsImages,
    getPropertyReportImages,
    generatePanoramaUrl,
    resetError
  };
}
