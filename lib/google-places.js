// lib/google-places.js
import { Client } from '@googlemaps/google-maps-services-js';

// Google Places API configuration
export const GOOGLE_PLACES_CONFIG = {
  API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  DEFAULT_RADIUS: 2000, // 2km
  MAX_RADIUS: 50000, // 50km
  DEFAULT_LANGUAGE: 'th',
  SUPPORTED_LANGUAGES: ['th', 'en'],
  PHOTO_MAX_WIDTH: 400,
  PHOTO_MAX_HEIGHT: 300,
  REVIEWS_LIMIT: 5,
  PLACES_LIMIT: 20
};

// Place types for different categories
export const PLACE_TYPES = {
  ATTRACTIONS: 'tourist_attraction',
  RESTAURANTS: 'restaurant',
  SHOPPING: 'shopping_mall',
  TRANSPORT: 'transit_station',
  HEALTHCARE: 'hospital',
  EDUCATION: 'school',
  ENTERTAINMENT: 'amusement_park',
  ACCOMMODATION: 'lodging',
  SERVICES: 'establishment',
  POINTS_OF_INTEREST: 'point_of_interest'
};

// Initialize Google Maps client
const googleMapsClient = new Client({});

/**
 * Search for nearby places using Google Places API
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchNearbyPlaces(params) {
  try {
    const {
      location,
      radius = GOOGLE_PLACES_CONFIG.DEFAULT_RADIUS,
      type = PLACE_TYPES.POINTS_OF_INTEREST,
      language = GOOGLE_PLACES_CONFIG.DEFAULT_LANGUAGE,
      limit = GOOGLE_PLACES_CONFIG.PLACES_LIMIT
    } = params;

    if (!GOOGLE_PLACES_CONFIG.API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    if (!location || !location.lat || !location.lng) {
      throw new Error('Location coordinates are required');
    }

    // Validate radius
    const validRadius = Math.min(Math.max(radius, 1), GOOGLE_PLACES_CONFIG.MAX_RADIUS);

    // Search nearby places
    const nearbyResponse = await googleMapsClient.placesNearby({
      params: {
        location: `${location.lat},${location.lng}`,
        radius: validRadius,
        type: type,
        language: language,
        key: GOOGLE_PLACES_CONFIG.API_KEY
      }
    });

    if (nearbyResponse.data.status !== 'OK' && nearbyResponse.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${nearbyResponse.data.status}`);
    }

    // Process results
    const places = await Promise.all(
      (nearbyResponse.data.results || []).slice(0, limit).map(async (place) => {
        return await enrichPlaceData(place, location, language);
      })
    );

    // Sort by distance
    places.sort((a, b) => a.distance - b.distance);

    return {
      success: true,
      places: places,
      totalResults: places.length,
      searchParams: {
        location,
        radius: validRadius,
        type,
        language
      }
    };

  } catch (error) {
    console.error('Error searching nearby places:', error);
    return {
      success: false,
      error: error.message,
      places: []
    };
  }
}

/**
 * Enrich place data with additional information
 * @param {Object} place - Basic place data from nearby search
 * @param {Object} originLocation - Origin location for distance calculation
 * @param {string} language - Language preference
 * @returns {Promise<Object>} Enriched place data
 */
async function enrichPlaceData(place, originLocation, language = 'th') {
  try {
    // Calculate distance
    const distance = calculateDistance(
      originLocation.lat,
      originLocation.lng,
      place.geometry.location.lat,
      place.geometry.location.lng
    );

    // Get detailed information
    const detailsResponse = await googleMapsClient.placeDetails({
      params: {
        place_id: place.place_id,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'website',
          'url',
          'rating',
          'user_ratings_total',
          'price_level',
          'opening_hours',
          'photos',
          'reviews',
          'types',
          'geometry',
          'business_status'
        ],
        language: language,
        key: GOOGLE_PLACES_CONFIG.API_KEY
      }
    });

    const details = detailsResponse.data.result;

    // Get photo URLs
    const photos = await getPlacePhotos(place.photos || details?.photos || []);

    // Process reviews
    const reviews = processReviews(details?.reviews || []);

    return {
      // Basic info
      place_id: place.place_id,
      name: details?.name || place.name,
      formatted_address: details?.formatted_address || null,
      
      // Location
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      distance: distance * 1000, // Convert to meters
      
      // Contact info
      phone: details?.formatted_phone_number || null,
      website: details?.website || null,
      google_url: details?.url || null,
      
      // Ratings and reviews
      rating: details?.rating || place.rating || 0,
      user_ratings_total: details?.user_ratings_total || 0,
      reviews: reviews,
      
      // Business info
      price_level: details?.price_level || null,
      opening_hours: processOpeningHours(details?.opening_hours),
      business_status: details?.business_status || 'OPERATIONAL',
      
      // Media
      photos: photos,
      primary_photo: photos[0] || null,
      
      // Categories
      types: details?.types || place.types || [],
      primary_type: getPrimaryType(details?.types || place.types || []),
      
      // Additional metadata
      vicinity: place.vicinity || null,
      permanently_closed: place.permanently_closed || false
    };

  } catch (error) {
    console.error('Error enriching place data:', error);
    
    // Return basic data if enrichment fails
    return {
      place_id: place.place_id,
      name: place.name,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      distance: calculateDistance(
        originLocation.lat,
        originLocation.lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      ) * 1000,
      rating: place.rating || 0,
      types: place.types || [],
      primary_type: getPrimaryType(place.types || []),
      vicinity: place.vicinity || null,
      error: 'Failed to get detailed information'
    };
  }
}

/**
 * Get photo URLs for a place
 * @param {Array} photoReferences - Array of photo references
 * @returns {Promise<Array>} Array of photo URLs
 */
async function getPlacePhotos(photoReferences) {
  if (!photoReferences || photoReferences.length === 0) {
    return [];
  }

  return photoReferences.slice(0, 5).map(photo => ({
    photo_reference: photo.photo_reference,
    url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${GOOGLE_PLACES_CONFIG.PHOTO_MAX_WIDTH}&maxheight=${GOOGLE_PLACES_CONFIG.PHOTO_MAX_HEIGHT}&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_CONFIG.API_KEY}`,
    width: photo.width || GOOGLE_PLACES_CONFIG.PHOTO_MAX_WIDTH,
    height: photo.height || GOOGLE_PLACES_CONFIG.PHOTO_MAX_HEIGHT
  }));
}

/**
 * Process reviews data
 * @param {Array} reviews - Raw reviews data
 * @returns {Array} Processed reviews
 */
function processReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return [];
  }

  return reviews.slice(0, GOOGLE_PLACES_CONFIG.REVIEWS_LIMIT).map(review => ({
    author_name: review.author_name,
    author_url: review.author_url,
    language: review.language,
    profile_photo_url: review.profile_photo_url,
    rating: review.rating,
    relative_time_description: review.relative_time_description,
    text: review.text,
    time: review.time
  }));
}

/**
 * Process opening hours data
 * @param {Object} openingHours - Raw opening hours data
 * @returns {Object} Processed opening hours
 */
function processOpeningHours(openingHours) {
  if (!openingHours) {
    return null;
  }

  return {
    open_now: openingHours.open_now,
    periods: openingHours.periods || [],
    weekday_text: openingHours.weekday_text || [],
    is_24_hours: openingHours.weekday_text?.some(text => text.includes('24 ชั่วโมง')) || false
  };
}

/**
 * Get primary type from types array
 * @param {Array} types - Array of place types
 * @returns {string} Primary type
 */
function getPrimaryType(types) {
  if (!types || types.length === 0) {
    return 'establishment';
  }

  // Priority order for primary types
  const priorityTypes = [
    'tourist_attraction',
    'restaurant',
    'shopping_mall',
    'hospital',
    'school',
    'transit_station',
    'lodging',
    'amusement_park',
    'establishment',
    'point_of_interest'
  ];

  for (const priorityType of priorityTypes) {
    if (types.includes(priorityType)) {
      return priorityType;
    }
  }

  return types[0];
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Search places by text query
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchPlacesByText(params) {
  try {
    const {
      query,
      location,
      radius = GOOGLE_PLACES_CONFIG.DEFAULT_RADIUS,
      language = GOOGLE_PLACES_CONFIG.DEFAULT_LANGUAGE,
      limit = GOOGLE_PLACES_CONFIG.PLACES_LIMIT
    } = params;

    if (!GOOGLE_PLACES_CONFIG.API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    if (!query) {
      throw new Error('Search query is required');
    }

    // Text search
    const textSearchResponse = await googleMapsClient.textSearch({
      params: {
        query: query,
        location: location ? `${location.lat},${location.lng}` : undefined,
        radius: location ? radius : undefined,
        language: language,
        key: GOOGLE_PLACES_CONFIG.API_KEY
      }
    });

    if (textSearchResponse.data.status !== 'OK' && textSearchResponse.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${textSearchResponse.data.status}`);
    }

    // Process results
    const places = await Promise.all(
      (textSearchResponse.data.results || []).slice(0, limit).map(async (place) => {
        return await enrichPlaceData(place, location, language);
      })
    );

    return {
      success: true,
      places: places,
      totalResults: places.length,
      searchParams: {
        query,
        location,
        radius,
        language
      }
    };

  } catch (error) {
    console.error('Error searching places by text:', error);
    return {
      success: false,
      error: error.message,
      places: []
    };
  }
}

/**
 * Get place details by place ID
 * @param {string} placeId - Google Place ID
 * @param {string} language - Language preference
 * @returns {Promise<Object>} Place details
 */
export async function getPlaceDetails(placeId, language = 'th') {
  try {
    if (!GOOGLE_PLACES_CONFIG.API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    if (!placeId) {
      throw new Error('Place ID is required');
    }

    const response = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'website',
          'url',
          'rating',
          'user_ratings_total',
          'price_level',
          'opening_hours',
          'photos',
          'reviews',
          'types',
          'geometry',
          'business_status',
          'utc_offset',
          'adr_address'
        ],
        language: language,
        key: GOOGLE_PLACES_CONFIG.API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const place = response.data.result;

    // Get photos
    const photos = await getPlacePhotos(place.photos || []);

    // Process reviews
    const reviews = processReviews(place.reviews || []);

    return {
      success: true,
      place: {
        place_id: placeId,
        name: place.name,
        formatted_address: place.formatted_address,
        adr_address: place.adr_address,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        phone: place.formatted_phone_number,
        website: place.website,
        google_url: place.url,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        reviews: reviews,
        price_level: place.price_level,
        opening_hours: processOpeningHours(place.opening_hours),
        business_status: place.business_status,
        photos: photos,
        primary_photo: photos[0] || null,
        types: place.types || [],
        primary_type: getPrimaryType(place.types || []),
        utc_offset: place.utc_offset
      }
    };

  } catch (error) {
    console.error('Error getting place details:', error);
    return {
      success: false,
      error: error.message,
      place: null
    };
  }
}
