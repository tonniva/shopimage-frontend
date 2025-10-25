// components/GooglePlacesResults.js
import { useState } from 'react';
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Navigation
} from 'lucide-react';

export default function GooglePlacesResults({ places, loading, error, onPlaceSelect }) {
  const [expandedPlace, setExpandedPlace] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">ไม่พบสถานที่ใกล้เคียง</h3>
        <p className="text-gray-500">ลองเปลี่ยนตำแหน่งหรือเพิ่มรัศมีการค้นหา</p>
      </div>
    );
  }

  // Group places by category
  const groupedPlaces = places.reduce((acc, place) => {
    const category = place.primary_type || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(place);
    return acc;
  }, {});

  const categories = Object.keys(groupedPlaces);
  const filteredPlaces = selectedCategory === 'all' ? places : groupedPlaces[selectedCategory] || [];

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)} ม.`;
    }
    return `${(distance / 1000).toFixed(1)} กม.`;
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'ไม่ระบุ';
  };

  const formatPriceLevel = (priceLevel) => {
    if (priceLevel === null || priceLevel === undefined) return 'ไม่ระบุ';
    return '฿'.repeat(priceLevel + 1);
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'tourist_attraction': return '🏛️';
      case 'shopping_mall': return '🛍️';
      case 'transit_station': return '🚇';
      case 'hospital': return '🏥';
      case 'school': return '🏫';
      case 'lodging': return '🏨';
      default: return '📍';
    }
  };

  const getCategoryName = (type) => {
    switch (type) {
      case 'restaurant': return 'ร้านอาหาร';
      case 'tourist_attraction': return 'สถานที่ท่องเที่ยว';
      case 'shopping_mall': return 'ศูนย์การค้า';
      case 'transit_station': return 'สถานีขนส่ง';
      case 'hospital': return 'โรงพยาบาล';
      case 'school': return 'โรงเรียน';
      case 'lodging': return 'ที่พัก';
      default: return 'สถานที่อื่นๆ';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            สถานที่ใกล้เคียง ({places.length})
          </h3>
          {categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทั้งหมด</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {getCategoryName(category)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Places List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredPlaces.map((place, index) => (
          <div key={place.place_id || index} className="border-b border-gray-100 last:border-b-0">
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Place Image */}
                <div className="flex-shrink-0">
                  {place.primary_photo ? (
                    <img
                      src={place.primary_photo.url}
                      alt={place.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{getCategoryIcon(place.primary_type)}</span>
                  </div>
                </div>

                {/* Place Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {place.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {place.formatted_address || place.vicinity}
                      </p>
                      
                      {/* Rating and Distance */}
                      <div className="flex items-center gap-3 mt-2">
                        {place.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{formatRating(place.rating)}</span>
                            {place.user_ratings_total > 0 && (
                              <span className="text-xs text-gray-500">({place.user_ratings_total})</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{formatDistance(place.distance)}</span>
                        </div>
                        {place.price_level !== null && (
                          <span className="text-xs text-gray-600">{formatPriceLevel(place.price_level)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-2">
                      {onPlaceSelect && (
                        <button
                          onClick={() => onPlaceSelect(place)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          เลือก
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedPlace(expandedPlace === place.place_id ? null : place.place_id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedPlace === place.place_id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedPlace === place.place_id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="space-y-2">
                        {/* Contact Info */}
                        {(place.phone || place.website) && (
                          <div className="flex items-center gap-4 text-xs">
                            {place.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{place.phone}</span>
                              </div>
                            )}
                            {place.website && (
                              <a
                                href={place.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Globe className="w-3 h-3" />
                                <span>เว็บไซต์</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Opening Hours */}
                        {place.opening_hours && (
                          <div className="flex items-start gap-1">
                            <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
                            <div className="text-xs text-gray-600">
                              {place.opening_hours.open_now ? (
                                <span className="text-green-600 font-medium">เปิดอยู่</span>
                              ) : (
                                <span className="text-red-600 font-medium">ปิดอยู่</span>
                              )}
                              {place.opening_hours.weekday_text && place.opening_hours.weekday_text.length > 0 && (
                                <div className="mt-1">
                                  {place.opening_hours.weekday_text.slice(0, 2).map((hours, i) => (
                                    <div key={i}>{hours}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Reviews Preview */}
                        {place.reviews && place.reviews.length > 0 && (
                          <div className="text-xs">
                            <div className="text-gray-600 mb-1">รีวิวล่าสุด:</div>
                            <div className="text-gray-700 line-clamp-2">
                              &ldquo;{place.reviews[0].text?.substring(0, 100)}...&rdquo;
                              <span className="text-gray-500"> - {place.reviews[0].author_name}</span>
                            </div>
                          </div>
                        )}

                        {/* Google Maps Link */}
                        {place.google_url && (
                          <div className="pt-2">
                            <a
                              href={place.google_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>ดูใน Google Maps</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t text-center">
        <p className="text-xs text-gray-500">
          ข้อมูลจาก Google Places API
        </p>
      </div>
    </div>
  );
}
