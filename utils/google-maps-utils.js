// utils/google-maps-utils.js
/**
 * Utility functions for Google Maps data processing
 */

/**
 * Format coordinates for display
 * @param {Object} location - Location coordinates
 * @param {number} precision - Decimal precision
 * @returns {string} Formatted coordinates
 */
export function formatCoordinates(location, precision = 6) {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return 'ไม่ระบุพิกัด';
  }
  
  return `${location.lat.toFixed(precision)}, ${location.lng.toFixed(precision)}`;
}

/**
 * Format distance for display
 * @param {Object} distance - Distance object with text and value
 * @returns {string} Formatted distance
 */
export function formatDistance(distance) {
  if (!distance) return 'ไม่ระบุระยะทาง';
  
  if (distance.text) {
    return distance.text;
  }
  
  if (distance.value) {
    const meters = distance.value;
    if (meters < 1000) {
      return `${meters} เมตร`;
    } else {
      return `${(meters / 1000).toFixed(1)} กิโลเมตร`;
    }
  }
  
  return 'ไม่ระบุระยะทาง';
}

/**
 * Format duration for display
 * @param {Object} duration - Duration object with text and value
 * @returns {string} Formatted duration
 */
export function formatDuration(duration) {
  if (!duration) return 'ไม่ระบุเวลา';
  
  if (duration.text) {
    return duration.text;
  }
  
  if (duration.value) {
    const seconds = duration.value;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} ชั่วโมง ${minutes % 60} นาที`;
    } else if (minutes > 0) {
      return `${minutes} นาที`;
    } else {
      return `${seconds} วินาที`;
    }
  }
  
  return 'ไม่ระบุเวลา';
}

/**
 * Get map type name in Thai
 * @param {string} mapType - Map type
 * @returns {string} Thai map type name
 */
export function getMapTypeName(mapType) {
  const typeMap = {
    'roadmap': 'แผนที่ถนน',
    'satellite': 'ภาพดาวเทียม',
    'hybrid': 'แผนที่ผสม',
    'terrain': 'แผนที่ภูมิประเทศ'
  };
  return typeMap[mapType] || 'แผนที่ถนน';
}

/**
 * Get travel mode name in Thai
 * @param {string} mode - Travel mode
 * @returns {string} Thai travel mode name
 */
export function getTravelModeName(mode) {
  const modeMap = {
    'driving': 'ขับรถ',
    'walking': 'เดิน',
    'bicycling': 'ขี่จักรยาน',
    'transit': 'ขนส่งสาธารณะ'
  };
  return modeMap[mode] || mode;
}

/**
 * Validate map parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validated parameters
 */
export function validateMapParameters(params) {
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
    validated.zoom = Math.max(1, Math.min(20, validated.zoom));
  }

  // Validate size
  if (validated.size) {
    validated.size = {
      width: Math.max(100, Math.min(640, validated.size.width)),
      height: Math.max(100, Math.min(640, validated.size.height))
    };
  }

  // Validate map type
  const validMapTypes = ['roadmap', 'satellite', 'hybrid', 'terrain'];
  if (validated.mapType && !validMapTypes.includes(validated.mapType)) {
    validated.mapType = 'roadmap';
  }

  // Validate format
  const validFormats = ['png', 'jpg', 'gif'];
  if (validated.format && !validFormats.includes(validated.format)) {
    validated.format = 'png';
  }

  // Validate scale
  if (validated.scale && ![1, 2].includes(validated.scale)) {
    validated.scale = 1;
  }

  return validated;
}

/**
 * Generate map marker data
 * @param {Object} location - Location coordinates
 * @param {Object} style - Marker style
 * @param {string} label - Marker label
 * @returns {Object} Marker data
 */
export function generateMarkerData(location, style = {}, label = null) {
  return {
    location: {
      lat: location.lat,
      lng: location.lng
    },
    style: {
      color: style.color || 'red',
      size: style.size || 'normal',
      ...style
    },
    label: label
  };
}

/**
 * Generate map path data
 * @param {Array} points - Array of coordinate points
 * @param {Object} style - Path style
 * @returns {Object} Path data
 */
export function generatePathData(points, style = {}) {
  return {
    points: points.map(point => ({
      lat: point.lat,
      lng: point.lng
    })),
    style: {
      color: style.color || '0x0000ff',
      weight: style.weight || 2,
      fillcolor: style.fillcolor || '0x0000ff',
      fillopacity: style.fillopacity || 0.2,
      ...style
    }
  };
}

/**
 * Generate circle path for area visualization
 * @param {Object} center - Center coordinates
 * @param {number} radius - Radius in meters
 * @param {number} points - Number of points in circle
 * @returns {Array} Circle points
 */
export function generateCirclePoints(center, radius, points = 32) {
  const points_array = [];
  const earthRadius = 6371000; // Earth's radius in meters

  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const lat = center.lat + (radius / earthRadius) * (180 / Math.PI) * Math.cos(angle * Math.PI / 180);
    const lng = center.lng + (radius / earthRadius) * (180 / Math.PI) * Math.sin(angle * Math.PI / 180) / Math.cos(center.lat * Math.PI / 180);
    
    points_array.push({ lat, lng });
  }

  return points_array;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} point1 - First point coordinates
 * @param {Object} point2 - Second point coordinates
 * @returns {number} Distance in meters
 */
export function calculateDistanceBetweenPoints(point1, point2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Sort places by distance from center
 * @param {Array} places - Array of places
 * @param {Object} center - Center coordinates
 * @returns {Array} Sorted places
 */
export function sortPlacesByDistance(places, center) {
  return places.map(place => {
    const placeLocation = place.location || { lat: place.lat, lng: place.lng };
    const distance = calculateDistanceBetweenPoints(center, placeLocation);
    return {
      ...place,
      distance: distance,
      distanceText: formatDistance({ value: distance })
    };
  }).sort((a, b) => a.distance - b.distance);
}

/**
 * Get transportation color by type
 * @param {string} type - Transportation type
 * @returns {string} Color code
 */
export function getTransportationColor(type) {
  const colorMap = {
    'bts': 'blue',
    'mrt': 'purple',
    'bus': 'green',
    'taxi': 'yellow',
    'train': 'red',
    'ferry': 'cyan',
    'airport': 'orange',
    'subway': 'purple',
    'tram': 'green',
    'light_rail': 'blue'
  };
  return colorMap[type] || 'gray';
}

/**
 * Get transportation label by type
 * @param {string} type - Transportation type
 * @returns {string} Label
 */
export function getTransportationLabel(type) {
  const labelMap = {
    'bts': 'B',
    'mrt': 'M',
    'bus': 'S',
    'taxi': 'T',
    'train': 'R',
    'ferry': 'F',
    'airport': 'A',
    'subway': 'M',
    'tram': 'T',
    'light_rail': 'L'
  };
  return labelMap[type] || 'X';
}

/**
 * Get transportation name in Thai
 * @param {string} type - Transportation type
 * @returns {string} Thai transportation name
 */
export function getTransportationName(type) {
  const nameMap = {
    'bts': 'BTS',
    'mrt': 'MRT',
    'bus': 'รถเมล์',
    'taxi': 'แท็กซี่',
    'train': 'รถไฟ',
    'ferry': 'เรือข้ามฟาก',
    'airport': 'สนามบิน',
    'subway': 'รถไฟใต้ดิน',
    'tram': 'รถราง',
    'light_rail': 'รถไฟเบา'
  };
  return nameMap[type] || type;
}

/**
 * Process directions data for display
 * @param {Object} directions - Directions data
 * @returns {Object} Processed directions
 */
export function processDirectionsData(directions) {
  if (!directions) return null;

  return {
    ...directions,
    distanceText: formatDistance(directions.distance),
    durationText: formatDuration(directions.duration),
    steps: directions.steps?.map(step => ({
      ...step,
      distanceText: formatDistance(step.distance),
      durationText: formatDuration(step.duration),
      instructionText: stripHtmlTags(step.instruction)
    })) || []
  };
}

/**
 * Strip HTML tags from text
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHtmlTags(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Generate map metadata
 * @param {Object} map - Map object
 * @returns {Object} Map metadata
 */
export function generateMapMetadata(map) {
  return {
    id: `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: map.type || 'static',
    title: map.title || 'แผนที่',
    description: map.description || '',
    mapType: map.mapType || 'roadmap',
    size: map.size || { width: 640, height: 480 },
    zoom: map.zoom || 15,
    format: map.format || 'png',
    scale: map.scale || 1,
    language: map.language || 'th',
    createdAt: new Date().toISOString(),
    url: map.mapUrl
  };
}

/**
 * Validate map URL
 * @param {string} url - Map URL
 * @returns {boolean} Whether URL is valid
 */
export function validateMapUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'maps.googleapis.com' && 
           urlObj.pathname.includes('/staticmap');
  } catch {
    return false;
  }
}

/**
 * Extract parameters from map URL
 * @param {string} url - Map URL
 * @returns {Object} Extracted parameters
 */
export function extractMapUrlParameters(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const center = params.get('center');
    const size = params.get('size');
    const zoom = params.get('zoom');
    const maptype = params.get('maptype');
    const format = params.get('format');
    const scale = params.get('scale');
    const language = params.get('language');
    
    return {
      center: center ? {
        lat: parseFloat(center.split(',')[0]),
        lng: parseFloat(center.split(',')[1])
      } : null,
      size: size ? {
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1])
      } : null,
      zoom: zoom ? parseInt(zoom) : null,
      mapType: maptype || null,
      format: format || null,
      scale: scale ? parseInt(scale) : null,
      language: language || null
    };
  } catch {
    return {};
  }
}

/**
 * Generate map download filename
 * @param {Object} map - Map object
 * @returns {string} Download filename
 */
export function generateMapDownloadFilename(map) {
  const timestamp = new Date().toISOString().split('T')[0];
  const type = map.type || 'static';
  const format = map.format || 'png';
  return `map-${type}-${timestamp}.${format}`;
}

/**
 * Process map data for display
 * @param {Object} map - Map data
 * @returns {Object} Processed map data
 */
export function processMapData(map) {
  return {
    ...map,
    displayTitle: map.title || `แผนที่${getMapTypeName(map.mapType)}`,
    displaySubtitle: `ขนาด: ${map.size?.width || 640}×${map.size?.height || 480}, ซูม: ${map.zoom || 15}`,
    downloadFilename: generateMapDownloadFilename(map),
    mapTypeName: getMapTypeName(map.mapType),
    formattedSize: `${map.size?.width || 640}×${map.size?.height || 480}`,
    formattedZoom: `${map.zoom || 15}`,
    formattedFormat: (map.format || 'png').toUpperCase()
  };
}

/**
 * Group maps by type
 * @param {Array} maps - Array of maps
 * @returns {Object} Grouped maps
 */
export function groupMapsByType(maps) {
  return maps.reduce((groups, map) => {
    const type = map.type || 'static';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(map);
    return groups;
  }, {});
}

/**
 * Sort maps by creation date
 * @param {Array} maps - Array of maps
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted maps
 */
export function sortMapsByDate(maps, order = 'desc') {
  return [...maps].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Filter maps by type
 * @param {Array} maps - Array of maps
 * @param {string} type - Map type to filter by
 * @returns {Array} Filtered maps
 */
export function filterMapsByType(maps, type) {
  return maps.filter(map => (map.type || 'static') === type);
}

/**
 * Get map statistics
 * @param {Array} maps - Array of maps
 * @returns {Object} Map statistics
 */
export function getMapStatistics(maps) {
  const stats = {
    total: maps.length,
    byType: {},
    byMapType: {},
    bySize: {},
    totalSize: 0
  };

  maps.forEach(map => {
    const type = map.type || 'static';
    const mapType = map.mapType || 'roadmap';
    const size = map.size || { width: 640, height: 480 };
    const mapSize = size.width * size.height;

    stats.byType[type] = (stats.byType[type] || 0) + 1;
    stats.byMapType[mapType] = (stats.byMapType[mapType] || 0) + 1;
    stats.bySize[`${size.width}×${size.height}`] = (stats.bySize[`${size.width}×${size.height}`] || 0) + 1;
    stats.totalSize += mapSize;
  });

  return stats;
}
