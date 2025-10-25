// hooks/useGooglePlaces.js
import { useState, useCallback } from 'react';

export function useGooglePlaces() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Search for nearby places
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  const searchNearby = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-places/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search nearby places');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Search failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search places by text query
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  const searchByText = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-places/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search places');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Search failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get detailed information about a place
   * @param {string} placeId - Google Place ID
   * @param {string} language - Language preference
   * @returns {Promise<Object>} Place details
   */
  const getPlaceDetails = useCallback(async (placeId, language = 'th') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/google-places/details?place_id=${placeId}&language=${language}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get place details');
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to get place details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search for places by category
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  const searchByCategory = useCallback(async (params) => {
    const { location, category, radius = 2000, language = 'th' } = params;

    return await searchNearby({
      location,
      radius,
      type: category,
      language
    });
  }, [searchNearby]);

  /**
   * Get nearby attractions
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Object>} Attractions
   */
  const getNearbyAttractions = useCallback(async (location, radius = 2000) => {
    return await searchByCategory({
      location,
      category: 'tourist_attraction',
      radius,
      language: 'th'
    });
  }, [searchByCategory]);

  /**
   * Get nearby restaurants
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Object>} Restaurants
   */
  const getNearbyRestaurants = useCallback(async (location, radius = 2000) => {
    return await searchByCategory({
      location,
      category: 'restaurant',
      radius,
      language: 'th'
    });
  }, [searchByCategory]);

  /**
   * Get nearby shopping centers
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Object>} Shopping centers
   */
  const getNearbyShopping = useCallback(async (location, radius = 2000) => {
    return await searchByCategory({
      location,
      category: 'shopping_mall',
      radius,
      language: 'th'
    });
  }, [searchByCategory]);

  /**
   * Get nearby transportation
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Object>} Transportation options
   */
  const getNearbyTransportation = useCallback(async (location, radius = 2000) => {
    return await searchByCategory({
      location,
      category: 'transit_station',
      radius,
      language: 'th'
    });
  }, [searchByCategory]);

  /**
   * Get nearby healthcare facilities
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Object>} Healthcare facilities
   */
  const getNearbyHealthcare = useCallback(async (location, radius = 2000) => {
    return await searchByCategory({
      location,
      category: 'hospital',
      radius,
      language: 'th'
    });
  }, [searchByCategory]);

  /**
   * Get nearby schools
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Object>} Schools
   */
  const getNearbySchools = useCallback(async (location, radius = 2000) => {
    return await searchByCategory({
      location,
      category: 'school',
      radius,
      language: 'th'
    });
  }, [searchByCategory]);

  /**
   * Get comprehensive nearby places
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Object>} All nearby places by category
   */
  const getAllNearbyPlaces = useCallback(async (location, radius = 2000) => {
    setLoading(true);
    setError(null);

    try {
      const [
        attractions,
        restaurants,
        shopping,
        transportation,
        healthcare,
        schools,
        general
      ] = await Promise.all([
        getNearbyAttractions(location, radius),
        getNearbyRestaurants(location, radius),
        getNearbyShopping(location, radius),
        getNearbyTransportation(location, radius),
        getNearbyHealthcare(location, radius),
        getNearbySchools(location, radius),
        searchNearby({
          location,
          radius,
          type: 'point_of_interest',
          language: 'th'
        })
      ]);

      return {
        success: true,
        data: {
          attractions: attractions.success ? attractions.data.results : [],
          restaurants: restaurants.success ? restaurants.data.results : [],
          shopping: shopping.success ? shopping.data.results : [],
          transportation: transportation.success ? transportation.data.results : [],
          healthcare: healthcare.success ? healthcare.data.results : [],
          schools: schools.success ? schools.data.results : [],
          general: general.success ? general.data.results : [],
          totalPlaces: [
            ...(attractions.success ? attractions.data.results : []),
            ...(restaurants.success ? restaurants.data.results : []),
            ...(shopping.success ? shopping.data.results : []),
            ...(transportation.success ? transportation.data.results : []),
            ...(healthcare.success ? healthcare.data.results : []),
            ...(schools.success ? schools.data.results : []),
            ...(general.success ? general.data.results : [])
          ]
        }
      };

    } catch (err) {
      const errorMessage = err.message || 'Failed to get nearby places';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [
    getNearbyAttractions,
    getNearbyRestaurants,
    getNearbyShopping,
    getNearbyTransportation,
    getNearbyHealthcare,
    getNearbySchools,
    searchNearby
  ]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    searchNearby,
    searchByText,
    getPlaceDetails,
    searchByCategory,
    getNearbyAttractions,
    getNearbyRestaurants,
    getNearbyShopping,
    getNearbyTransportation,
    getNearbyHealthcare,
    getNearbySchools,
    getAllNearbyPlaces,
    resetError
  };
}
