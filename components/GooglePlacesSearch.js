// components/GooglePlacesSearch.js
import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import GooglePlacesResults from './GooglePlacesResults';

export default function GooglePlacesSearch({ 
  location, 
  onPlaceSelect, 
  initialRadius = 2000,
  showFilters = true 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(initialRadius);
  const [placeType, setPlaceType] = useState('point_of_interest');
  const [searchResults, setSearchResults] = useState([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const {
    loading,
    error,
    searchNearby,
    searchByText,
    getAllNearbyPlaces,
    resetError
  } = useGooglePlaces();

  // Place type options
  const placeTypes = [
    { value: 'point_of_interest', label: 'สถานที่ทั่วไป', icon: '📍' },
    { value: 'restaurant', label: 'ร้านอาหาร', icon: '🍽️' },
    { value: 'tourist_attraction', label: 'สถานที่ท่องเที่ยว', icon: '🏛️' },
    { value: 'shopping_mall', label: 'ศูนย์การค้า', icon: '🛍️' },
    { value: 'transit_station', label: 'สถานีขนส่ง', icon: '🚇' },
    { value: 'hospital', label: 'โรงพยาบาล', icon: '🏥' },
    { value: 'school', label: 'โรงเรียน', icon: '🏫' },
    { value: 'lodging', label: 'ที่พัก', icon: '🏨' },
    { value: 'gas_station', label: 'ปั๊มน้ำมัน', icon: '⛽' },
    { value: 'bank', label: 'ธนาคาร', icon: '🏦' }
  ];

  // Radius options
  const radiusOptions = [
    { value: 500, label: '500 ม.' },
    { value: 1000, label: '1 กม.' },
    { value: 2000, label: '2 กม.' },
    { value: 5000, label: '5 กม.' },
    { value: 10000, label: '10 กม.' }
  ];

  // Search nearby places when location changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      handleNearbySearch();
    }
  }, [location, radius, placeType]);

  const handleNearbySearch = async () => {
    if (!location || !location.lat || !location.lng) return;

    resetError();
    const result = await searchNearby({
      location,
      radius,
      type: placeType,
      language: 'th'
    });

    if (result.success) {
      setSearchResults(result.data.results || []);
    }
  };

  const handleTextSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    resetError();
    const result = await searchByText({
      query: searchQuery,
      location,
      radius,
      language: 'th'
    });

    if (result.success) {
      setSearchResults(result.data.places || []);
    }
  };

  const handleComprehensiveSearch = async () => {
    if (!location || !location.lat || !location.lng) return;

    resetError();
    const result = await getAllNearbyPlaces(location, radius);

    if (result.success) {
      setSearchResults(result.data.totalPlaces || []);
    }
  };

  const handlePlaceSelect = (place) => {
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    handleNearbySearch();
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <form onSubmit={handleTextSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาสถานที่..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ค้นหา
              </button>
            </form>
          </div>
          
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">ตัวกรอง</span>
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNearbySearch}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <MapPin className="w-3 h-3 inline mr-1" />
            สถานที่ใกล้เคียง
          </button>
          <button
            onClick={handleComprehensiveSearch}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            ค้นหาทั้งหมด
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">ตัวกรองการค้นหา</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Place Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทสถานที่
              </label>
              <select
                value={placeType}
                onChange={(e) => setPlaceType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {placeTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รัศมีการค้นหา
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {radiusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={handleNearbySearch}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหาด้วยตัวกรอง'}
            </button>
          </div>
        </div>
      )}

      {/* Location Info */}
      {location && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              ค้นหาใกล้: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      <GooglePlacesResults
        places={searchResults}
        loading={loading}
        error={error}
        onPlaceSelect={handlePlaceSelect}
      />

      {/* No Location Warning */}
      {!location && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">กรุณาระบุตำแหน่ง</h3>
              <p className="text-sm text-yellow-700 mt-1">
                ต้องระบุตำแหน่งก่อนจึงจะค้นหาสถานที่ใกล้เคียงได้
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
