"use client";
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const GooglePlacesProvider = ({ 
  address, 
  onAddressChange, 
  onValidationError, 
  country = "TH" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search function
  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/google-places/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: query,
          country: country
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.predictions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Google Places API error:', error);
      onValidationError('address_line_1', 'ไม่สามารถค้นหาที่อยู่ได้ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Update address immediately
    onAddressChange({ address_line_1: value });
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  // Handle country change with Smart Clear
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    const currentCountry = address.country;
    
    if (currentCountry !== newCountry) {
      // Smart Clear - Clear เฉพาะฟิลด์ที่เปลี่ยนตามประเทศ
      const clearedAddress = {
        ...address,
        country: newCountry,
        city: '',
        province: '',
        postal_code: '',
        formatted_address: '',
        address_line_1: '', // Clear main address line to force re-autocomplete
        address_line_2: '',
      };
      
      // Update address and clear suggestions
      onAddressChange(clearedAddress);
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestion(null);
      
      console.log(`🌍 Country changed to ${newCountry}. Address fields cleared for re-entry.`);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    
    try {
      // Get place details
      const response = await fetch('/api/google-places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: suggestion.place_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const data = await response.json();
      const place = data.result;
      
      // Parse address components
      const addressComponents = place.address_components || [];
      const parsedAddress = parseAddressComponents(addressComponents);
      
      // Update address with parsed data
      onAddressChange({
        address_line_1: place.formatted_address || suggestion.description,
        formatted_address: place.formatted_address || suggestion.description,
        city: parsedAddress.city,
        province: parsedAddress.province,
        postal_code: parsedAddress.postal_code,
        country: parsedAddress.country
      });
      
    } catch (error) {
      console.error('Error fetching place details:', error);
      onValidationError('address_line_1', 'ไม่สามารถโหลดรายละเอียดที่อยู่ได้');
    }
  };

  // Parse Google Places address components
  const parseAddressComponents = (components) => {
    const result = {
      city: '',
      province: '',
      postal_code: '',
      country: ''
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('postal_code')) {
        result.postal_code = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        result.province = component.long_name;
      } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
        result.city = component.long_name;
      } else if (types.includes('country')) {
        result.country = component.short_name;
      }
    });

    return result;
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Country Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">ประเทศ *</label>
        <select
          value={address.country}
          onChange={handleCountryChange}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
        >
          <option value="TH">🇹🇭 ประเทศไทย</option>
          <option value="US">🇺🇸 สหรัฐอเมริกา</option>
          <option value="GB">🇬🇧 สหราชอาณาจักร</option>
          <option value="AU">🇦🇺 ออสเตรเลีย</option>
          <option value="SG">🇸🇬 สิงคโปร์</option>
          <option value="JP">🇯🇵 ญี่ปุ่น</option>
          <option value="KR">🇰🇷 เกาหลีใต้</option>
        </select>
      </div>

      {/* Recipient Name */}
      <div>
        <label className="block text-sm font-medium mb-1">ชื่อผู้รับ *</label>
        <input
          type="text"
          value={address.recipient_name}
          onChange={(e) => onAddressChange({ recipient_name: e.target.value })}
          placeholder="ชื่อ-นามสกุล"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทร *</label>
        <input
          type="tel"
          value={address.phone}
          onChange={(e) => onAddressChange({ phone: e.target.value })}
          placeholder="08X-XXX-XXXX"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
        />
      </div>

      {/* Address with Google Places Autocomplete */}
      <div className="relative" ref={inputRef}>
        <label className="block text-sm font-medium mb-1">ที่อยู่ *</label>
        <div className="relative">
          <input
            type="text"
            value={address.address_line_1}
            onChange={handleInputChange}
            placeholder="พิมพ์ที่อยู่เพื่อค้นหา..."
            className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="animate-spin text-gray-400" size={16} />
            ) : (
              <Search className="text-gray-400" size={16} />
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="text-gray-400 mt-0.5" size={14} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.structured_formatting?.main_text || suggestion.description}
                    </p>
                    {suggestion.structured_formatting?.secondary_text && (
                      <p className="text-xs text-gray-500">
                        {suggestion.structured_formatting.secondary_text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Address Line */}
      <div>
        <label className="block text-sm font-medium mb-1">รายละเอียดเพิ่มเติม</label>
        <input
          type="text"
          value={address.address_line_2}
          onChange={(e) => onAddressChange({ address_line_2: e.target.value })}
          placeholder="หมู่บ้าน, คอนโด, ชั้น, ห้อง (ถ้ามี)"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
        />
      </div>

      {/* Parsed Address Fields (Read-only) */}
      {selectedSuggestion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <CheckCircle size={16} />
            ที่อยู่ที่ตรวจสอบแล้ว
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-600">เขต/อำเภอ:</span>
              <span className="ml-2 font-medium">{address.city}</span>
            </div>
            <div>
              <span className="text-blue-600">จังหวัด:</span>
              <span className="ml-2 font-medium">{address.province}</span>
            </div>
            <div>
              <span className="text-blue-600">รหัสไปรษณีย์:</span>
              <span className="ml-2 font-medium">{address.postal_code}</span>
            </div>
            <div>
              <span className="text-blue-600">ประเทศ:</span>
              <span className="ml-2 font-medium">{address.country}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesProvider;
