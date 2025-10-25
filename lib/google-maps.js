// lib/google-maps.js
import { Client } from '@googlemaps/google-maps-services-js';

// Google Maps API configuration
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY,
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,
  DEFAULT_MAP_TYPE: 'roadmap',
  SUPPORTED_MAP_TYPES: ['roadmap', 'satellite', 'hybrid', 'terrain'],
  DEFAULT_SIZE: { width: 640, height: 480 },
  MAX_SIZE: { width: 640, height: 640 },
  MIN_SIZE: { width: 100, height: 100 },
  DEFAULT_SCALE: 1,
  SUPPORTED_SCALES: [1, 2],
  DEFAULT_FORMAT: 'png',
  SUPPORTED_FORMATS: ['png', 'jpg', 'gif'],
  DEFAULT_LANGUAGE: 'th',
  SUPPORTED_LANGUAGES: ['th', 'en']
};

// Map marker styles
export const MARKER_STYLES = {
  DEFAULT: {
    color: 'red',
    size: 'normal',
    label: null
  },
  PROPERTY: {
    color: 'blue',
    size: 'normal',
    label: 'P'
  },
  LOCATION: {
    color: 'green',
    size: 'normal',
    label: 'L'
  },
  CUSTOM: {
    color: 'purple',
    size: 'normal',
    label: null
  }
};

// Initialize Google Maps client
const googleMapsClient = new Client({});

/**
 * Generate static map image URL
 * @param {Object} params - Parameters for static map
 * @returns {string} Static map image URL
 */
export function generateStaticMapUrl(params) {
  try {
    const {
      center,
      zoom = GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
      size = GOOGLE_MAPS_CONFIG.DEFAULT_SIZE,
      mapType = GOOGLE_MAPS_CONFIG.DEFAULT_MAP_TYPE,
      markers = [],
      paths = [],
      scale = GOOGLE_MAPS_CONFIG.DEFAULT_SCALE,
      format = GOOGLE_MAPS_CONFIG.DEFAULT_FORMAT,
      language = GOOGLE_MAPS_CONFIG.DEFAULT_LANGUAGE,
      region = 'TH'
    } = params;

    if (!GOOGLE_MAPS_CONFIG.API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    if (!center || !center.lat || !center.lng) {
      throw new Error('Center coordinates are required');
    }

    // Validate parameters
    const validatedParams = validateMapParams({
      center,
      zoom,
      size,
      mapType,
      markers,
      paths,
      scale,
      format,
      language,
      region
    });

    // Build URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const urlParams = new URLSearchParams({
      center: `${validatedParams.center.lat},${validatedParams.center.lng}`,
      zoom: validatedParams.zoom.toString(),
      size: `${validatedParams.size.width}x${validatedParams.size.height}`,
      maptype: validatedParams.mapType,
      scale: validatedParams.scale.toString(),
      format: validatedParams.format,
      language: validatedParams.language,
      region: validatedParams.region,
      key: GOOGLE_MAPS_CONFIG.API_KEY
    });

    // Add markers
    validatedParams.markers.forEach(marker => {
      const markerParam = buildMarkerParameter(marker);
      urlParams.append('markers', markerParam);
    });

    // Add paths
    validatedParams.paths.forEach(path => {
      const pathParam = buildPathParameter(path);
      urlParams.append('path', pathParam);
    });

    return `${baseUrl}?${urlParams.toString()}`;

  } catch (error) {
    console.error('Error generating static map URL:', error);
    return null;
  }
}

/**
 * Generate property map with markers
 * @param {Object} params - Parameters for property map
 * @returns {string} Property map URL
 */
export function generatePropertyMapUrl(params) {
  try {
    const {
      propertyLocation,
      nearbyPlaces = [],
      mapType = 'roadmap',
      size = { width: 640, height: 480 },
      zoom = 15
    } = params;

    if (!propertyLocation || !propertyLocation.lat || !propertyLocation.lng) {
      throw new Error('Property location coordinates are required');
    }

    // Create markers
    const markers = [
      // Property marker
      {
        location: propertyLocation,
        style: MARKER_STYLES.PROPERTY,
        label: 'P'
      },
      // Nearby places markers
      ...nearbyPlaces.slice(0, 10).map((place, index) => ({
        location: place.location || { lat: place.lat, lng: place.lng },
        style: MARKER_STYLES.LOCATION,
        label: String.fromCharCode(65 + index) // A, B, C, etc.
      }))
    ];

    return generateStaticMapUrl({
      center: propertyLocation,
      zoom,
      size,
      mapType,
      markers,
      language: 'th'
    });

  } catch (error) {
    console.error('Error generating property map URL:', error);
    return null;
  }
}

/**
 * Generate transportation map
 * @param {Object} params - Parameters for transportation map
 * @returns {string} Transportation map URL
 */
export function generateTransportationMapUrl(params) {
  try {
    const {
      propertyLocation,
      transportationStops = [],
      mapType = 'roadmap',
      size = { width: 640, height: 480 },
      zoom = 14
    } = params;

    if (!propertyLocation || !propertyLocation.lat || !propertyLocation.lng) {
      throw new Error('Property location coordinates are required');
    }

    // Create markers for transportation
    const markers = [
      // Property marker
      {
        location: propertyLocation,
        style: MARKER_STYLES.PROPERTY,
        label: 'P'
      },
      // Transportation markers
      ...transportationStops.map((stop, index) => ({
        location: stop.location || { lat: stop.lat, lng: stop.lng },
        style: {
          color: getTransportationColor(stop.type),
          size: 'normal',
          label: getTransportationLabel(stop.type)
        }
      }))
    ];

    return generateStaticMapUrl({
      center: propertyLocation,
      zoom,
      size,
      mapType,
      markers,
      language: 'th'
    });

  } catch (error) {
    console.error('Error generating transportation map URL:', error);
    return null;
  }
}

/**
 * Generate area overview map
 * @param {Object} params - Parameters for area map
 * @returns {string} Area map URL
 */
export function generateAreaOverviewMapUrl(params) {
  try {
    const {
      center,
      radius = 1000, // meters
      mapType = 'roadmap',
      size = { width: 640, height: 480 },
      zoom = 13
    } = params;

    if (!center || !center.lat || !center.lng) {
      throw new Error('Center coordinates are required');
    }

    // Create circle path to show area
    const circlePath = generateCirclePath(center, radius);

    return generateStaticMapUrl({
      center,
      zoom,
      size,
      mapType,
      paths: [circlePath],
      language: 'th'
    });

  } catch (error) {
    console.error('Error generating area overview map URL:', error);
    return null;
  }
}

/**
 * Get directions between two points
 * @param {Object} params - Parameters for directions
 * @returns {Promise<Object>} Directions result
 */
export async function getDirections(params) {
  try {
    const {
      origin,
      destination,
      mode = 'driving',
      language = GOOGLE_MAPS_CONFIG.DEFAULT_LANGUAGE,
      region = 'TH'
    } = params;

    if (!GOOGLE_MAPS_CONFIG.API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    const response = await googleMapsClient.directions({
      params: {
        origin: typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
        destination: typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`,
        mode: mode,
        language: language,
        region: region,
        key: GOOGLE_MAPS_CONFIG.API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      success: true,
      directions: {
        distance: leg.distance,
        duration: leg.duration,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance,
          duration: step.duration,
          startLocation: step.start_location,
          endLocation: step.end_location,
          travelMode: step.travel_mode
        })),
        overviewPolyline: route.overview_polyline,
        bounds: route.bounds
      }
    };

  } catch (error) {
    console.error('Error getting directions:', error);
    return {
      success: false,
      error: error.message,
      directions: null
    };
  }
}

/**
 * Geocode address to coordinates
 * @param {string} address - Address to geocode
 * @param {string} language - Language preference
 * @returns {Promise<Object>} Geocoding result
 */
export async function geocodeAddress(address, language = 'th') {
  try {
    if (!GOOGLE_MAPS_CONFIG.API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    if (!address) {
      throw new Error('Address is required');
    }

    const response = await googleMapsClient.geocode({
      params: {
        address: address,
        language: language,
        region: 'TH',
        key: GOOGLE_MAPS_CONFIG.API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }

    const result = response.data.results[0];

    return {
      success: true,
      geocoding: {
        formattedAddress: result.formatted_address,
        location: result.geometry.location,
        placeId: result.place_id,
        types: result.types,
        addressComponents: result.address_components
      }
    };

  } catch (error) {
    console.error('Error geocoding address:', error);
    return {
      success: false,
      error: error.message,
      geocoding: null
    };
  }
}

/**
 * Reverse geocode coordinates to address
 * @param {Object} location - Location coordinates
 * @param {string} language - Language preference
 * @returns {Promise<Object>} Reverse geocoding result
 */
export async function reverseGeocode(location, language = 'th') {
  try {
    if (!GOOGLE_MAPS_CONFIG.API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    if (!location || !location.lat || !location.lng) {
      throw new Error('Location coordinates are required');
    }

    const response = await googleMapsClient.reverseGeocode({
      params: {
        latlng: `${location.lat},${location.lng}`,
        language: language,
        region: 'TH',
        key: GOOGLE_MAPS_CONFIG.API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Reverse geocoding API error: ${response.data.status}`);
    }

    const result = response.data.results[0];

    return {
      success: true,
      geocoding: {
        formattedAddress: result.formatted_address,
        location: result.geometry.location,
        placeId: result.place_id,
        types: result.types,
        addressComponents: result.address_components
      }
    };

  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return {
      success: false,
      error: error.message,
      geocoding: null
    };
  }
}

/**
 * Calculate distance between two points
 * @param {Object} origin - Origin coordinates
 * @param {Object} destination - Destination coordinates
 * @param {string} mode - Travel mode
 * @returns {Promise<Object>} Distance result
 */
export async function calculateDistance(origin, destination, mode = 'driving') {
  try {
    if (!GOOGLE_MAPS_CONFIG.API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    if (!origin || !destination) {
      throw new Error('Origin and destination coordinates are required');
    }

    const response = await googleMapsClient.distanceMatrix({
      params: {
        origins: [`${origin.lat},${origin.lng}`],
        destinations: [`${destination.lat},${destination.lng}`],
        mode: mode,
        language: 'th',
        region: 'TH',
        key: GOOGLE_MAPS_CONFIG.API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Distance Matrix API error: ${response.data.status}`);
    }

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new Error(`Distance calculation error: ${element.status}`);
    }

    return {
      success: true,
      distance: {
        distance: element.distance,
        duration: element.duration,
        mode: mode
      }
    };

  } catch (error) {
    console.error('Error calculating distance:', error);
    return {
      success: false,
      error: error.message,
      distance: null
    };
  }
}

/**
 * Validate map parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validated parameters
 */
function validateMapParams(params) {
  const validated = { ...params };

  // Validate center
  if (validated.center) {
    validated.center = {
      lat: Math.max(-90, Math.min(90, validated.center.lat)),
      lng: Math.max(-180, Math.min(180, validated.center.lng))
    };
  }

  // Validate zoom
  if (validated.zoom !== undefined) {
    validated.zoom = Math.max(
      GOOGLE_MAPS_CONFIG.MIN_ZOOM,
      Math.min(GOOGLE_MAPS_CONFIG.MAX_ZOOM, validated.zoom)
    );
  }

  // Validate size
  if (validated.size) {
    validated.size = {
      width: Math.max(
        GOOGLE_MAPS_CONFIG.MIN_SIZE.width,
        Math.min(GOOGLE_MAPS_CONFIG.MAX_SIZE.width, validated.size.width)
      ),
      height: Math.max(
        GOOGLE_MAPS_CONFIG.MIN_SIZE.height,
        Math.min(GOOGLE_MAPS_CONFIG.MAX_SIZE.height, validated.size.height)
      )
    };
  }

  // Validate map type
  if (validated.mapType && !GOOGLE_MAPS_CONFIG.SUPPORTED_MAP_TYPES.includes(validated.mapType)) {
    validated.mapType = GOOGLE_MAPS_CONFIG.DEFAULT_MAP_TYPE;
  }

  // Validate scale
  if (validated.scale && !GOOGLE_MAPS_CONFIG.SUPPORTED_SCALES.includes(validated.scale)) {
    validated.scale = GOOGLE_MAPS_CONFIG.DEFAULT_SCALE;
  }

  // Validate format
  if (validated.format && !GOOGLE_MAPS_CONFIG.SUPPORTED_FORMATS.includes(validated.format)) {
    validated.format = GOOGLE_MAPS_CONFIG.DEFAULT_FORMAT;
  }

  return validated;
}

/**
 * Build marker parameter string
 * @param {Object} marker - Marker object
 * @returns {string} Marker parameter
 */
function buildMarkerParameter(marker) {
  const { location, style, label } = marker;
  let param = `${location.lat},${location.lng}`;

  if (style) {
    if (style.color) {
      param += `|color:${style.color}`;
    }
    if (style.size) {
      param += `|size:${style.size}`;
    }
    if (label) {
      param += `|label:${label}`;
    }
  }

  return param;
}

/**
 * Build path parameter string
 * @param {Object} path - Path object
 * @returns {string} Path parameter
 */
function buildPathParameter(path) {
  const { points, style } = path;
  let param = '';

  if (style) {
    if (style.color) {
      param += `color:${style.color}|`;
    }
    if (style.weight) {
      param += `weight:${style.weight}|`;
    }
    if (style.fillcolor) {
      param += `fillcolor:${style.fillcolor}|`;
    }
  }

  param += points.map(point => `${point.lat},${point.lng}`).join('|');
  return param;
}

/**
 * Generate circle path for area visualization
 * @param {Object} center - Center coordinates
 * @param {number} radius - Radius in meters
 * @param {number} points - Number of points in circle
 * @returns {Object} Circle path object
 */
function generateCirclePath(center, radius, points = 32) {
  const points_array = [];
  const earthRadius = 6371000; // Earth's radius in meters

  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const lat = center.lat + (radius / earthRadius) * (180 / Math.PI) * Math.cos(angle * Math.PI / 180);
    const lng = center.lng + (radius / earthRadius) * (180 / Math.PI) * Math.sin(angle * Math.PI / 180) / Math.cos(center.lat * Math.PI / 180);
    
    points_array.push({ lat, lng });
  }

  return {
    points: points_array,
    style: {
      color: '0x0000ff',
      weight: 2,
      fillcolor: '0x0000ff',
      fillopacity: 0.2
    }
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
