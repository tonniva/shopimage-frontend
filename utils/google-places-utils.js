// utils/google-places-utils.js
/**
 * Utility functions for Google Places data processing
 */

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} Formatted distance
 */
export function formatDistance(distance) {
  if (distance < 1000) {
    return `${Math.round(distance)} ม.`;
  }
  return `${(distance / 1000).toFixed(1)} กม.`;
}

/**
 * Format rating for display
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating
 */
export function formatRating(rating) {
  if (!rating || rating === 0) return 'ไม่ระบุ';
  return rating.toFixed(1);
}

/**
 * Format price level for display
 * @param {number} priceLevel - Price level (0-4)
 * @returns {string} Formatted price level
 */
export function formatPriceLevel(priceLevel) {
  if (priceLevel === null || priceLevel === undefined) return 'ไม่ระบุ';
  return '฿'.repeat(priceLevel + 1);
}

/**
 * Get category icon for place type
 * @param {string} type - Place type
 * @returns {string} Emoji icon
 */
export function getCategoryIcon(type) {
  const iconMap = {
    'restaurant': '🍽️',
    'food': '🍽️',
    'tourist_attraction': '🏛️',
    'shopping_mall': '🛍️',
    'store': '🛍️',
    'transit_station': '🚇',
    'subway_station': '🚇',
    'bus_station': '🚌',
    'hospital': '🏥',
    'school': '🏫',
    'university': '🎓',
    'lodging': '🏨',
    'hotel': '🏨',
    'gas_station': '⛽',
    'bank': '🏦',
    'atm': '🏧',
    'pharmacy': '💊',
    'gym': '💪',
    'park': '🌳',
    'museum': '🏛️',
    'church': '⛪',
    'mosque': '🕌',
    'temple': '🏯',
    'zoo': '🦁',
    'aquarium': '🐠',
    'amusement_park': '🎢',
    'movie_theater': '🎬',
    'library': '📚',
    'post_office': '📮',
    'police': '👮',
    'fire_station': '🚒',
    'embassy': '🏛️',
    'courthouse': '⚖️',
    'city_hall': '🏛️',
    'airport': '✈️',
    'train_station': '🚂',
    'port': '🚢',
    'car_rental': '🚗',
    'car_dealer': '🚗',
    'car_repair': '🔧',
    'car_wash': '🚿',
    'parking': '🅿️',
    'rv_park': '🚐',
    'campground': '⛺',
    'rv_dealer': '🚐',
    'funeral_home': '⚰️',
    'cemetery': '⚰️',
    'veterinary_care': '🐕',
    'pet_store': '🐕',
    'laundry': '👕',
    'dry_cleaning': '👔',
    'hair_care': '💇',
    'beauty_salon': '💄',
    'spa': '🧖',
    'massage': '💆',
    'dentist': '🦷',
    'doctor': '👨‍⚕️',
    'physiotherapist': '🏥',
    'chiropractor': '🦴',
    'optometrist': '👁️',
    'real_estate_agency': '🏠',
    'insurance_agency': '🛡️',
    'accounting': '📊',
    'lawyer': '⚖️',
    'travel_agency': '✈️',
    'tourist_attraction': '🏛️',
    'establishment': '📍',
    'point_of_interest': '📍',
    'other': '📍'
  };

  return iconMap[type] || '📍';
}

/**
 * Get category name in Thai
 * @param {string} type - Place type
 * @returns {string} Thai category name
 */
export function getCategoryName(type) {
  const nameMap = {
    'restaurant': 'ร้านอาหาร',
    'food': 'ร้านอาหาร',
    'tourist_attraction': 'สถานที่ท่องเที่ยว',
    'shopping_mall': 'ศูนย์การค้า',
    'store': 'ร้านค้า',
    'transit_station': 'สถานีขนส่ง',
    'subway_station': 'สถานีรถไฟใต้ดิน',
    'bus_station': 'สถานีรถโดยสาร',
    'hospital': 'โรงพยาบาล',
    'school': 'โรงเรียน',
    'university': 'มหาวิทยาลัย',
    'lodging': 'ที่พัก',
    'hotel': 'โรงแรม',
    'gas_station': 'ปั๊มน้ำมัน',
    'bank': 'ธนาคาร',
    'atm': 'ตู้ ATM',
    'pharmacy': 'ร้านขายยา',
    'gym': 'ฟิตเนส',
    'park': 'สวนสาธารณะ',
    'museum': 'พิพิธภัณฑ์',
    'church': 'โบสถ์',
    'mosque': 'มัสยิด',
    'temple': 'วัด',
    'zoo': 'สวนสัตว์',
    'aquarium': 'พิพิธภัณฑ์สัตว์น้ำ',
    'amusement_park': 'สวนสนุก',
    'movie_theater': 'โรงภาพยนตร์',
    'library': 'ห้องสมุด',
    'post_office': 'ไปรษณีย์',
    'police': 'สถานีตำรวจ',
    'fire_station': 'สถานีดับเพลิง',
    'embassy': 'สถานทูต',
    'courthouse': 'ศาล',
    'city_hall': 'ศาลากลาง',
    'airport': 'สนามบิน',
    'train_station': 'สถานีรถไฟ',
    'port': 'ท่าเรือ',
    'car_rental': 'เช่ารถ',
    'car_dealer': 'ตัวแทนจำหน่ายรถ',
    'car_repair': 'อู่ซ่อมรถ',
    'car_wash': 'ล้างรถ',
    'parking': 'ที่จอดรถ',
    'rv_park': 'ที่จอดรถบ้าน',
    'campground': 'ค่ายพักแรม',
    'rv_dealer': 'ตัวแทนจำหน่ายรถบ้าน',
    'funeral_home': 'ศาลา',
    'cemetery': 'สุสาน',
    'veterinary_care': 'คลินิกสัตว์',
    'pet_store': 'ร้านขายสัตว์เลี้ยง',
    'laundry': 'ร้านซักรีด',
    'dry_cleaning': 'ร้านซักแห้ง',
    'hair_care': 'ร้านทำผม',
    'beauty_salon': 'ร้านเสริมสวย',
    'spa': 'สปา',
    'massage': 'นวด',
    'dentist': 'ทันตแพทย์',
    'doctor': 'แพทย์',
    'physiotherapist': 'นักกายภาพบำบัด',
    'chiropractor': 'หมอนวดกระดูก',
    'optometrist': 'จักษุแพทย์',
    'real_estate_agency': 'นายหน้า',
    'insurance_agency': 'บริษัทประกัน',
    'accounting': 'บัญชี',
    'lawyer': 'ทนายความ',
    'travel_agency': 'บริษัททัวร์',
    'establishment': 'สถานประกอบการ',
    'point_of_interest': 'สถานที่สำคัญ',
    'other': 'อื่นๆ'
  };

  return nameMap[type] || 'สถานที่อื่นๆ';
}

/**
 * Process opening hours for display
 * @param {Object} openingHours - Opening hours data
 * @returns {Object} Processed opening hours
 */
export function processOpeningHours(openingHours) {
  if (!openingHours) {
    return {
      openNow: null,
      status: 'ไม่ระบุ',
      statusColor: 'gray',
      hours: []
    };
  }

  const isOpen = openingHours.open_now;
  const status = isOpen ? 'เปิดอยู่' : 'ปิดอยู่';
  const statusColor = isOpen ? 'green' : 'red';

  return {
    openNow: isOpen,
    status,
    statusColor,
    hours: openingHours.weekday_text || [],
    is24Hours: openingHours.weekday_text?.some(text => 
      text.includes('24 ชั่วโมง') || text.includes('24 hours')
    ) || false
  };
}

/**
 * Process reviews for display
 * @param {Array} reviews - Reviews array
 * @param {number} limit - Maximum number of reviews to return
 * @returns {Array} Processed reviews
 */
export function processReviews(reviews, limit = 3) {
  if (!reviews || reviews.length === 0) {
    return [];
  }

  return reviews.slice(0, limit).map(review => ({
    author: review.author_name,
    rating: review.rating,
    text: review.text,
    time: review.relative_time_description,
    profilePhoto: review.profile_photo_url
  }));
}

/**
 * Calculate distance between two points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Sort places by distance
 * @param {Array} places - Array of places
 * @returns {Array} Sorted places
 */
export function sortPlacesByDistance(places) {
  return [...places].sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * Filter places by rating
 * @param {Array} places - Array of places
 * @param {number} minRating - Minimum rating
 * @returns {Array} Filtered places
 */
export function filterPlacesByRating(places, minRating = 0) {
  return places.filter(place => (place.rating || 0) >= minRating);
}

/**
 * Filter places by distance
 * @param {Array} places - Array of places
 * @param {number} maxDistance - Maximum distance in meters
 * @returns {Array} Filtered places
 */
export function filterPlacesByDistance(places, maxDistance) {
  return places.filter(place => (place.distance || 0) <= maxDistance);
}

/**
 * Group places by category
 * @param {Array} places - Array of places
 * @returns {Object} Grouped places
 */
export function groupPlacesByCategory(places) {
  return places.reduce((groups, place) => {
    const category = place.primary_type || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(place);
    return groups;
  }, {});
}

/**
 * Get place statistics
 * @param {Array} places - Array of places
 * @returns {Object} Statistics
 */
export function getPlaceStatistics(places) {
  if (!places || places.length === 0) {
    return {
      total: 0,
      averageRating: 0,
      averageDistance: 0,
      categories: {},
      priceLevels: {}
    };
  }

  const total = places.length;
  const averageRating = places.reduce((sum, place) => sum + (place.rating || 0), 0) / total;
  const averageDistance = places.reduce((sum, place) => sum + (place.distance || 0), 0) / total;

  const categories = groupPlacesByCategory(places);
  const categoryCounts = Object.keys(categories).reduce((counts, category) => {
    counts[category] = categories[category].length;
    return counts;
  }, {});

  const priceLevels = places.reduce((counts, place) => {
    const level = place.price_level || 'unknown';
    counts[level] = (counts[level] || 0) + 1;
    return counts;
  }, {});

  return {
    total,
    averageRating: Math.round(averageRating * 10) / 10,
    averageDistance: Math.round(averageDistance),
    categories: categoryCounts,
    priceLevels
  };
}

/**
 * Validate place data
 * @param {Object} place - Place object
 * @returns {Object} Validation result
 */
export function validatePlaceData(place) {
  const errors = [];

  if (!place.place_id) {
    errors.push('Missing place_id');
  }

  if (!place.name) {
    errors.push('Missing name');
  }

  if (!place.location || !place.location.lat || !place.location.lng) {
    errors.push('Missing location coordinates');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format place for display
 * @param {Object} place - Place object
 * @returns {Object} Formatted place
 */
export function formatPlaceForDisplay(place) {
  return {
    ...place,
    formattedDistance: formatDistance(place.distance || 0),
    formattedRating: formatRating(place.rating),
    formattedPriceLevel: formatPriceLevel(place.price_level),
    categoryIcon: getCategoryIcon(place.primary_type),
    categoryName: getCategoryName(place.primary_type),
    openingHours: processOpeningHours(place.opening_hours),
    reviews: processReviews(place.reviews)
  };
}
