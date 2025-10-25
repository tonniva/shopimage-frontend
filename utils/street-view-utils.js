// utils/street-view-utils.js
/**
 * Utility functions for Google Street View data processing
 */

/**
 * Format heading angle to direction name
 * @param {number} heading - Heading angle in degrees
 * @returns {string} Direction name in Thai
 */
export function formatHeadingToDirection(heading) {
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
 * Get compass direction from angle
 * @param {number} angle - Angle in degrees
 * @returns {string} Compass direction
 */
export function getCompassDirection(angle) {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  
  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return 'N';
  if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return 'NE';
  if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return 'E';
  if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return 'SE';
  if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return 'S';
  if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return 'SW';
  if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return 'W';
  if (normalizedAngle >= 292.5 && normalizedAngle < 337.5) return 'NW';
  
  return 'N';
}

/**
 * Validate Street View parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validated parameters
 */
export function validateStreetViewParams(params) {
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
      width: Math.max(100, Math.min(640, validated.size.width)),
      height: Math.max(100, Math.min(640, validated.size.height))
    };
  }

  // Validate heading
  if (validated.heading !== undefined) {
    validated.heading = Math.max(0, Math.min(360, validated.heading));
  }

  // Validate pitch
  if (validated.pitch !== undefined) {
    validated.pitch = Math.max(-90, Math.min(90, validated.pitch));
  }

  // Validate FOV
  if (validated.fov !== undefined) {
    validated.fov = Math.max(10, Math.min(120, validated.fov));
  }

  return validated;
}

/**
 * Generate Street View URL with parameters
 * @param {Object} params - URL parameters
 * @returns {string} Street View URL
 */
export function generateStreetViewUrl(params) {
  const {
    location,
    size = { width: 640, height: 480 },
    heading = 0,
    pitch = 0,
    fov = 90,
    format = 'jpg',
    apiKey
  } = params;

  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!location || !location.lat || !location.lng) {
    throw new Error('Location coordinates are required');
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/streetview';
  const urlParams = new URLSearchParams({
    location: `${location.lat},${location.lng}`,
    size: `${size.width}x${size.height}`,
    heading: heading.toString(),
    pitch: pitch.toString(),
    fov: fov.toString(),
    format: format,
    key: apiKey
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Process Street View image data
 * @param {Object} imageData - Raw image data
 * @returns {Object} Processed image data
 */
export function processStreetViewImage(imageData) {
  return {
    ...imageData,
    direction: formatHeadingToDirection(imageData.heading || imageData.angle),
    compassDirection: getCompassDirection(imageData.heading || imageData.angle),
    formattedHeading: `${imageData.heading || imageData.angle}°`,
    formattedPitch: `${imageData.pitch || 0}°`,
    formattedFov: `${imageData.fov || 90}°`,
    sizeFormatted: `${imageData.metadata?.size?.width || 640}×${imageData.metadata?.size?.height || 480}`,
    qualityLevel: getQualityLevel(imageData.metadata?.quality || 2),
    timestamp: new Date().toISOString()
  };
}

/**
 * Get quality level description
 * @param {number} quality - Quality level (1-3)
 * @returns {string} Quality description
 */
export function getQualityLevel(quality) {
  const levels = {
    1: 'ต่ำ',
    2: 'กลาง',
    3: 'สูง'
  };
  return levels[quality] || 'ไม่ระบุ';
}

/**
 * Group Street View images by direction
 * @param {Array} images - Array of Street View images
 * @returns {Object} Grouped images
 */
export function groupImagesByDirection(images) {
  return images.reduce((groups, image) => {
    const direction = image.direction || formatHeadingToDirection(image.heading || image.angle);
    if (!groups[direction]) {
      groups[direction] = [];
    }
    groups[direction].push(image);
    return groups;
  }, {});
}

/**
 * Sort Street View images by heading
 * @param {Array} images - Array of Street View images
 * @returns {Array} Sorted images
 */
export function sortImagesByHeading(images) {
  return [...images].sort((a, b) => {
    const headingA = a.heading || a.angle || 0;
    const headingB = b.heading || b.angle || 0;
    return headingA - headingB;
  });
}

/**
 * Get optimal angles for property type
 * @param {string} propertyType - Type of property
 * @returns {Array} Array of optimal angles
 */
export function getOptimalAnglesForProperty(propertyType) {
  const angleMap = {
    'house': [0, 90, 180, 270],
    'apartment': [0, 90, 180, 270],
    'condo': [0, 90, 180, 270],
    'commercial': [0, 90, 180, 270],
    'land': [0, 90, 180, 270],
    'corner': [0, 90, 180, 270],
    'end': [0, 90, 180],
    'middle': [0, 180],
    'front_only': [0],
    'back_only': [180],
    'side_only': [90, 270]
  };

  return angleMap[propertyType] || angleMap['house'];
}

/**
 * Calculate Street View coverage score
 * @param {Array} images - Array of Street View images
 * @returns {Object} Coverage information
 */
export function calculateCoverageScore(images) {
  if (!images || images.length === 0) {
    return {
      score: 0,
      coverage: 'ไม่มี',
      missingAngles: [0, 90, 180, 270],
      availableAngles: []
    };
  }

  const availableAngles = images.map(img => img.heading || img.angle || 0);
  const allAngles = [0, 90, 180, 270];
  const missingAngles = allAngles.filter(angle => !availableAngles.includes(angle));
  
  const score = Math.round((availableAngles.length / allAngles.length) * 100);
  
  let coverage = 'ไม่สมบูรณ์';
  if (score === 100) coverage = 'สมบูรณ์';
  else if (score >= 75) coverage = 'ดีมาก';
  else if (score >= 50) coverage = 'ดี';
  else if (score >= 25) coverage = 'พอใช้';

  return {
    score,
    coverage,
    missingAngles,
    availableAngles,
    totalImages: images.length
  };
}

/**
 * Generate Street View metadata summary
 * @param {Object} metadata - Street View metadata
 * @returns {Object} Summary information
 */
export function generateMetadataSummary(metadata) {
  if (!metadata) {
    return {
      status: 'ไม่พร้อมใช้งาน',
      statusColor: 'red',
      summary: 'ไม่พบข้อมูล Street View'
    };
  }

  const status = metadata.status === 'OK' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน';
  const statusColor = metadata.status === 'OK' ? 'green' : 'red';
  
  const summary = metadata.status === 'OK' 
    ? `Street View พร้อมใช้งานที่ตำแหน่งนี้ (${metadata.location?.lat?.toFixed(6)}, ${metadata.location?.lng?.toFixed(6)})`
    : 'Street View ไม่พร้อมใช้งานในตำแหน่งนี้';

  return {
    status,
    statusColor,
    summary,
    panoId: metadata.pano_id,
    date: metadata.date,
    copyright: metadata.copyright,
    imageSize: metadata.image_width && metadata.image_height 
      ? `${metadata.image_width}×${metadata.image_height}` 
      : 'ไม่ระบุ'
  };
}

/**
 * Format Street View image for display
 * @param {Object} image - Street View image data
 * @returns {Object} Formatted image data
 */
export function formatImageForDisplay(image) {
  return {
    ...image,
    displayTitle: `${image.direction || formatHeadingToDirection(image.heading || image.angle)} (${image.heading || image.angle}°)`,
    displaySubtitle: `ขนาด: ${image.metadata?.size?.width || 640}×${image.metadata?.size?.height || 480}, คุณภาพ: ${getQualityLevel(image.metadata?.quality || 2)}`,
    downloadFilename: `street-view-${image.direction || image.heading || image.angle}-${Date.now()}.${image.metadata?.format || 'jpg'}`,
    thumbnailUrl: image.url, // Could be optimized for thumbnails
    fullscreenUrl: image.url
  };
}

/**
 * Validate Street View image URL
 * @param {string} url - Street View image URL
 * @returns {boolean} Whether URL is valid
 */
export function validateStreetViewUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'maps.googleapis.com' && 
           urlObj.pathname.includes('/streetview');
  } catch {
    return false;
  }
}

/**
 * Extract parameters from Street View URL
 * @param {string} url - Street View image URL
 * @returns {Object} Extracted parameters
 */
export function extractUrlParameters(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const location = params.get('location');
    const size = params.get('size');
    const heading = params.get('heading');
    const pitch = params.get('pitch');
    const fov = params.get('fov');
    const format = params.get('format');
    
    return {
      location: location ? {
        lat: parseFloat(location.split(',')[0]),
        lng: parseFloat(location.split(',')[1])
      } : null,
      size: size ? {
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1])
      } : null,
      heading: heading ? parseInt(heading) : null,
      pitch: pitch ? parseInt(pitch) : null,
      fov: fov ? parseInt(fov) : null,
      format: format || null
    };
  } catch {
    return {};
  }
}

/**
 * Generate Street View image metadata
 * @param {Object} image - Street View image
 * @param {Object} location - Location coordinates
 * @returns {Object} Image metadata
 */
export function generateImageMetadata(image, location) {
  return {
    id: `street-view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'street_view',
    source: 'google_street_view',
    location,
    heading: image.heading || image.angle || 0,
    pitch: image.pitch || 0,
    fov: image.fov || 90,
    direction: image.direction || formatHeadingToDirection(image.heading || image.angle || 0),
    url: image.url,
    size: image.metadata?.size || { width: 640, height: 480 },
    format: image.metadata?.format || 'jpg',
    quality: image.metadata?.quality || 2,
    createdAt: new Date().toISOString(),
    description: image.description || `Street View มุม ${image.direction || formatHeadingToDirection(image.heading || image.angle || 0)}`
  };
}
