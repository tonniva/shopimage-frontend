// lib/google-street-view.js
import { Client } from '@googlemaps/google-maps-services-js';

// Google Street View API configuration
export const STREET_VIEW_CONFIG = {
  API_KEY: process.env.GOOGLE_STREET_VIEW_API_KEY || process.env.GOOGLE_PLACES_API_KEY,
  DEFAULT_SIZE: { width: 640, height: 480 },
  MAX_SIZE: { width: 640, height: 640 },
  MIN_SIZE: { width: 100, height: 100 },
  DEFAULT_FOV: 90,
  MIN_FOV: 10,
  MAX_FOV: 120,
  DEFAULT_PITCH: 0,
  MIN_PITCH: -90,
  MAX_PITCH: 90,
  DEFAULT_HEADING: 0,
  MIN_HEADING: 0,
  MAX_HEADING: 360,
  SUPPORTED_FORMATS: ['jpg', 'png'],
  DEFAULT_FORMAT: 'jpg',
  QUALITY_LEVELS: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3
  }
};

// Initialize Google Maps client
const googleMapsClient = new Client({});

/**
 * Get Street View panorama metadata
 * @param {Object} params - Parameters for Street View request
 * @returns {Promise<Object>} Street View metadata
 */
export async function getStreetViewMetadata(params) {
  try {
    const {
      location,
      heading,
      pitch = STREET_VIEW_CONFIG.DEFAULT_PITCH,
      fov = STREET_VIEW_CONFIG.DEFAULT_FOV,
      radius = 50
    } = params;

    if (!STREET_VIEW_CONFIG.API_KEY) {
      throw new Error('Google Street View API key not configured');
    }

    if (!location || !location.lat || !location.lng) {
      throw new Error('Location coordinates are required');
    }

    // Validate parameters
    const validatedParams = validateStreetViewParams({
      location,
      heading,
      pitch,
      fov,
      radius
    });

    // Get Street View metadata
    const response = await googleMapsClient.streetViewMetadata({
      params: {
        location: `${validatedParams.location.lat},${validatedParams.location.lng}`,
        heading: validatedParams.heading,
        pitch: validatedParams.pitch,
        fov: validatedParams.fov,
        radius: validatedParams.radius,
        key: STREET_VIEW_CONFIG.API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Street View API error: ${response.data.status}`);
    }

    const metadata = response.data;

    return {
      success: true,
      metadata: {
        status: metadata.status,
        location: {
          lat: metadata.location.lat,
          lng: metadata.location.lng
        },
        pano_id: metadata.pano_id,
        date: metadata.date,
        copyright: metadata.copyright,
        links: metadata.links || [],
        projection_type: metadata.projection_type,
        motion_type: metadata.motion_type,
        image_width: metadata.image_width,
        image_height: metadata.image_height,
        tile_width: metadata.tile_width,
        tile_height: metadata.tile_height
      }
    };

  } catch (error) {
    console.error('Error getting Street View metadata:', error);
    return {
      success: false,
      error: error.message,
      metadata: null
    };
  }
}

/**
 * Generate Street View image URL
 * @param {Object} params - Parameters for Street View image
 * @returns {string} Street View image URL
 */
export function generateStreetViewImageUrl(params) {
  try {
    const {
      location,
      size = STREET_VIEW_CONFIG.DEFAULT_SIZE,
      heading = STREET_VIEW_CONFIG.DEFAULT_HEADING,
      pitch = STREET_VIEW_CONFIG.DEFAULT_PITCH,
      fov = STREET_VIEW_CONFIG.DEFAULT_FOV,
      format = STREET_VIEW_CONFIG.DEFAULT_FORMAT,
      quality = STREET_VIEW_CONFIG.QUALITY_LEVELS.MEDIUM
    } = params;

    if (!STREET_VIEW_CONFIG.API_KEY) {
      throw new Error('Google Street View API key not configured');
    }

    if (!location || !location.lat || !location.lng) {
      throw new Error('Location coordinates are required');
    }

    // Validate parameters
    const validatedParams = validateStreetViewParams({
      location,
      size,
      heading,
      pitch,
      fov,
      format,
      quality
    });

    // Build URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/streetview';
    const urlParams = new URLSearchParams({
      location: `${validatedParams.location.lat},${validatedParams.location.lng}`,
      size: `${validatedParams.size.width}x${validatedParams.size.height}`,
      heading: validatedParams.heading.toString(),
      pitch: validatedParams.pitch.toString(),
      fov: validatedParams.fov.toString(),
      format: validatedParams.format,
      key: STREET_VIEW_CONFIG.API_KEY
    });

    return `${baseUrl}?${urlParams.toString()}`;

  } catch (error) {
    console.error('Error generating Street View URL:', error);
    return null;
  }
}

/**
 * Get multiple Street View images from different angles
 * @param {Object} params - Parameters for Street View images
 * @returns {Promise<Object>} Multiple Street View images
 */
export async function getMultipleStreetViewImages(params) {
  try {
    const {
      location,
      size = STREET_VIEW_CONFIG.DEFAULT_SIZE,
      pitch = STREET_VIEW_CONFIG.DEFAULT_PITCH,
      fov = STREET_VIEW_CONFIG.DEFAULT_FOV,
      format = STREET_VIEW_CONFIG.DEFAULT_FORMAT,
      quality = STREET_VIEW_CONFIG.QUALITY_LEVELS.MEDIUM,
      angles = [0, 90, 180, 270] // North, East, South, West
    } = params;

    if (!location || !location.lat || !location.lng) {
      throw new Error('Location coordinates are required');
    }

    // First, check if Street View is available
    const metadataResult = await getStreetViewMetadata({ location });
    if (!metadataResult.success) {
      return {
        success: false,
        error: metadataResult.error,
        images: []
      };
    }

    // Generate images for each angle
    const images = angles.map(angle => {
      const url = generateStreetViewImageUrl({
        location,
        size,
        heading: angle,
        pitch,
        fov,
        format,
        quality
      });

      return {
        angle,
        heading: angle,
        direction: getDirectionName(angle),
        url,
        metadata: {
          location,
          size,
          heading: angle,
          pitch,
          fov,
          format,
          quality
        }
      };
    });

    return {
      success: true,
      images,
      metadata: metadataResult.metadata,
      totalImages: images.length
    };

  } catch (error) {
    console.error('Error getting multiple Street View images:', error);
    return {
      success: false,
      error: error.message,
      images: []
    };
  }
}

/**
 * Get Street View panorama with custom parameters
 * @param {Object} params - Parameters for Street View panorama
 * @returns {Promise<Object>} Street View panorama data
 */
export async function getStreetViewPanorama(params) {
  try {
    const {
      location,
      size = STREET_VIEW_CONFIG.DEFAULT_SIZE,
      heading = STREET_VIEW_CONFIG.DEFAULT_HEADING,
      pitch = STREET_VIEW_CONFIG.DEFAULT_PITCH,
      fov = STREET_VIEW_CONFIG.DEFAULT_FOV,
      format = STREET_VIEW_CONFIG.DEFAULT_FORMAT,
      quality = STREET_VIEW_CONFIG.QUALITY_LEVELS.MEDIUM,
      includeMetadata = true
    } = params;

    if (!location || !location.lat || !location.lng) {
      throw new Error('Location coordinates are required');
    }

    // Get metadata if requested
    let metadata = null;
    if (includeMetadata) {
      const metadataResult = await getStreetViewMetadata({ location });
      if (metadataResult.success) {
        metadata = metadataResult.metadata;
      }
    }

    // Generate image URL
    const imageUrl = generateStreetViewImageUrl({
      location,
      size,
      heading,
      pitch,
      fov,
      format,
      quality
    });

    if (!imageUrl) {
      throw new Error('Failed to generate Street View image URL');
    }

    return {
      success: true,
      panorama: {
        imageUrl,
        metadata: {
          location,
          size,
          heading,
          pitch,
          fov,
          format,
          quality
        },
        streetViewMetadata: metadata
      }
    };

  } catch (error) {
    console.error('Error getting Street View panorama:', error);
    return {
      success: false,
      error: error.message,
      panorama: null
    };
  }
}

/**
 * Validate Street View parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validated parameters
 */
function validateStreetViewParams(params) {
  const validated = { ...params };

  // Validate location
  if (validated.location) {
    validated.location = {
      lat: Math.max(-90, Math.min(90, validated.location.lat)),
      lng: Math.max(-180, Math.min(180, validated.location.lng))
    };
  }

  // Validate size
  if (validated.size) {
    validated.size = {
      width: Math.max(
        STREET_VIEW_CONFIG.MIN_SIZE.width,
        Math.min(STREET_VIEW_CONFIG.MAX_SIZE.width, validated.size.width)
      ),
      height: Math.max(
        STREET_VIEW_CONFIG.MIN_SIZE.height,
        Math.min(STREET_VIEW_CONFIG.MAX_SIZE.height, validated.size.height)
      )
    };
  }

  // Validate heading
  if (validated.heading !== undefined) {
    validated.heading = Math.max(
      STREET_VIEW_CONFIG.MIN_HEADING,
      Math.min(STREET_VIEW_CONFIG.MAX_HEADING, validated.heading)
    );
  }

  // Validate pitch
  if (validated.pitch !== undefined) {
    validated.pitch = Math.max(
      STREET_VIEW_CONFIG.MIN_PITCH,
      Math.min(STREET_VIEW_CONFIG.MAX_PITCH, validated.pitch)
    );
  }

  // Validate FOV
  if (validated.fov !== undefined) {
    validated.fov = Math.max(
      STREET_VIEW_CONFIG.MIN_FOV,
      Math.min(STREET_VIEW_CONFIG.MAX_FOV, validated.fov)
    );
  }

  // Validate format
  if (validated.format && !STREET_VIEW_CONFIG.SUPPORTED_FORMATS.includes(validated.format)) {
    validated.format = STREET_VIEW_CONFIG.DEFAULT_FORMAT;
  }

  return validated;
}

/**
 * Get direction name from heading angle
 * @param {number} heading - Heading angle in degrees
 * @returns {string} Direction name
 */
function getDirectionName(heading) {
  const directions = [
    { min: 0, max: 22.5, name: 'เหนือ' },
    { min: 22.5, max: 67.5, name: 'ตะวันออกเฉียงเหนือ' },
    { min: 67.5, max: 112.5, name: 'ตะวันออก' },
    { min: 112.5, max: 157.5, name: 'ตะวันออกเฉียงใต้' },
    { min: 157.5, max: 202.5, name: 'ใต้' },
    { min: 202.5, max: 247.5, name: 'ตะวันตกเฉียงใต้' },
    { min: 247.5, max: 292.5, name: 'ตะวันตก' },
    { min: 292.5, max: 337.5, name: 'ตะวันตกเฉียงเหนือ' },
    { min: 337.5, max: 360, name: 'เหนือ' }
  ];

  for (const direction of directions) {
    if (heading >= direction.min && heading < direction.max) {
      return direction.name;
    }
  }

  return 'ไม่ระบุ';
}

/**
 * Check if Street View is available at location
 * @param {Object} location - Location coordinates
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Object>} Availability check result
 */
export async function checkStreetViewAvailability(location, radius = 50) {
  try {
    const result = await getStreetViewMetadata({ location, radius });
    
    return {
      success: true,
      available: result.success && result.metadata?.status === 'OK',
      metadata: result.metadata,
      error: result.success ? null : result.error
    };

  } catch (error) {
    console.error('Error checking Street View availability:', error);
    return {
      success: false,
      available: false,
      error: error.message,
      metadata: null
    };
  }
}

/**
 * Get Street View images for property report
 * @param {Object} params - Parameters for property Street View
 * @returns {Promise<Object>} Property Street View images
 */
export async function getPropertyStreetViewImages(params) {
  try {
    const {
      location,
      propertyType = 'house',
      size = { width: 640, height: 480 },
      quality = STREET_VIEW_CONFIG.QUALITY_LEVELS.HIGH
    } = params;

    if (!location || !location.lat || !location.lng) {
      throw new Error('Location coordinates are required');
    }

    // Check availability first
    const availability = await checkStreetViewAvailability(location);
    if (!availability.available) {
      return {
        success: false,
        error: 'Street View not available at this location',
        images: []
      };
    }

    // Define angles based on property type
    const angles = getPropertyAngles(propertyType);

    // Get images from multiple angles
    const result = await getMultipleStreetViewImages({
      location,
      size,
      quality,
      angles
    });

    if (!result.success) {
      return result;
    }

    // Add property-specific metadata
    const propertyImages = result.images.map(image => ({
      ...image,
      propertyType,
      purpose: getImagePurpose(image.angle, propertyType),
      description: getImageDescription(image.angle, propertyType)
    }));

    return {
      success: true,
      images: propertyImages,
      metadata: {
        ...result.metadata,
        propertyType,
        totalImages: propertyImages.length,
        availableAngles: angles
      }
    };

  } catch (error) {
    console.error('Error getting property Street View images:', error);
    return {
      success: false,
      error: error.message,
      images: []
    };
  }
}

/**
 * Get angles for different property types
 * @param {string} propertyType - Type of property
 * @returns {Array} Array of angles
 */
function getPropertyAngles(propertyType) {
  const angleMap = {
    'house': [0, 90, 180, 270], // All directions
    'apartment': [0, 90, 180, 270], // All directions
    'condo': [0, 90, 180, 270], // All directions
    'commercial': [0, 90, 180, 270], // All directions
    'land': [0, 90, 180, 270], // All directions
    'corner': [0, 90, 180, 270], // All directions
    'end': [0, 90, 180], // Three directions
    'middle': [0, 180] // Front and back
  };

  return angleMap[propertyType] || angleMap['house'];
}

/**
 * Get image purpose based on angle and property type
 * @param {number} angle - Image angle
 * @param {string} propertyType - Property type
 * @returns {string} Image purpose
 */
function getImagePurpose(angle, propertyType) {
  const purposeMap = {
    0: 'front_view',
    90: 'right_side_view',
    180: 'back_view',
    270: 'left_side_view'
  };

  return purposeMap[angle] || 'general_view';
}

/**
 * Get image description based on angle and property type
 * @param {number} angle - Image angle
 * @param {string} propertyType - Property type
 * @returns {string} Image description
 */
function getImageDescription(angle, propertyType) {
  const descriptions = {
    0: `มุมมองด้านหน้าของ${propertyType}`,
    90: `มุมมองด้านขวาของ${propertyType}`,
    180: `มุมมองด้านหลังของ${propertyType}`,
    270: `มุมมองด้านซ้ายของ${propertyType}`
  };

  return descriptions[angle] || `มุมมองทั่วไปของ${propertyType}`;
}
