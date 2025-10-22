"use client";
import React, { useState } from "react";

const SimpleAddressForm = ({ 
  address, 
  onAddressChange, 
  onValidationError, 
  country = "TH" 
}) => {
  const [errors, setErrors] = useState({});
  // Country-specific field configurations
  const getFieldConfig = (countryCode) => {
    switch (countryCode) {
      case 'TH':
        return {
          cityLabel: 'เขต/อำเภอ',
          cityPlaceholder: 'เขต/อำเภอ',
          provinceLabel: 'จังหวัด',
          provincePlaceholder: 'จังหวัด',
          postalLabel: 'รหัสไปรษณีย์',
          postalPlaceholder: '10XXX',
          postalPattern: '[0-9]{5}'
        };
      case 'US':
        return {
          cityLabel: 'City',
          cityPlaceholder: 'City',
          provinceLabel: 'State',
          provincePlaceholder: 'State',
          postalLabel: 'ZIP Code',
          postalPlaceholder: '12345',
          postalPattern: '[0-9]{5}(-[0-9]{4})?'
        };
      case 'GB':
        return {
          cityLabel: 'City',
          cityPlaceholder: 'City',
          provinceLabel: 'County',
          provincePlaceholder: 'County',
          postalLabel: 'Postcode',
          postalPlaceholder: 'SW1A 1AA',
          postalPattern: '[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}'
        };
      default:
        return {
          cityLabel: 'City',
          cityPlaceholder: 'City',
          provinceLabel: 'Province/State',
          provincePlaceholder: 'Province/State',
          postalLabel: 'Postal Code',
          postalPlaceholder: 'Postal Code',
          postalPattern: '.*'
        };
    }
  };

  const fieldConfig = getFieldConfig(country);

  // Basic validation
  const validateField = (field, value) => {
    switch (field) {
      case 'recipient_name':
        if (!value.trim()) return 'กรุณากรอกชื่อผู้รับ';
        if (value.trim().length < 2) return 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
        return null;
      
      case 'phone':
        if (!value.trim()) return 'กรุณากรอกเบอร์โทร';
        const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
        if (!phoneRegex.test(value)) return 'รูปแบบเบอร์โทรไม่ถูกต้อง';
        return null;
      
      case 'address_line_1':
        if (!value.trim()) return 'กรุณากรอกที่อยู่';
        if (value.trim().length < 5) return 'ที่อยู่ต้องมีอย่างน้อย 5 ตัวอักษร';
        return null;
      
      case 'city':
        if (!value.trim()) return `กรุณากรอก${fieldConfig.cityLabel}`;
        return null;
      
      case 'province':
        if (!value.trim()) return `กรุณากรอก${fieldConfig.provinceLabel}`;
        return null;
      
      case 'postal_code':
        if (!value.trim()) return `กรุณากรอก${fieldConfig.postalLabel}`;
        const postalRegex = new RegExp(fieldConfig.postalPattern);
        if (!postalRegex.test(value)) return `${fieldConfig.postalLabel}ไม่ถูกต้อง`;
        return null;
      
      default:
        return null;
    }
  };

  // Handle input change with validation
  const handleInputChange = (field, value) => {
    onAddressChange({ [field]: value });
    
    // Validate field and update errors
    const error = validateField(field, value);
    const newErrors = { ...errors, [field]: error };
    setErrors(newErrors);
    
    // Send all errors to parent
    onValidationError(newErrors);
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
        address_line_1: '', // Clear main address line to force re-entry
        address_line_2: '',
      };
      
      // Update address
      onAddressChange(clearedAddress);
      
      console.log(`🌍 Country changed to ${newCountry}. Address fields cleared for re-entry.`);
    }
  };

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
          onChange={(e) => handleInputChange('recipient_name', e.target.value)}
          placeholder="ชื่อ-นามสกุล"
          className={`w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 ${
            errors.recipient_name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.recipient_name && (
          <p className="text-red-500 text-sm mt-1">{errors.recipient_name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทร *</label>
        <input
          type="tel"
          value={address.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="08X-XXX-XXXX"
          className={`w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium mb-1">ที่อยู่ *</label>
        <textarea
          value={address.address_line_1}
          onChange={(e) => handleInputChange('address_line_1', e.target.value)}
          placeholder="บ้านเลขที่, ซอย, ถนน"
          rows="3"
          className={`w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 ${
            errors.address_line_1 ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.address_line_1 && (
          <p className="text-red-500 text-sm mt-1">{errors.address_line_1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium mb-1">รายละเอียดเพิ่มเติม</label>
        <input
          type="text"
          value={address.address_line_2}
          onChange={(e) => handleInputChange('address_line_2', e.target.value)}
          placeholder="หมู่บ้าน, คอนโด, ชั้น, ห้อง (ถ้ามี)"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
        />
      </div>

      {/* City/District */}
      <div>
        <label className="block text-sm font-medium mb-1">{fieldConfig.cityLabel} *</label>
        <input
          type="text"
          value={address.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder={fieldConfig.cityPlaceholder}
          className={`w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 ${
            errors.city ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.city && (
          <p className="text-red-500 text-sm mt-1">{errors.city}</p>
        )}
      </div>

      {/* Province/State */}
      <div>
        <label className="block text-sm font-medium mb-1">{fieldConfig.provinceLabel} *</label>
        <input
          type="text"
          value={address.province}
          onChange={(e) => handleInputChange('province', e.target.value)}
          placeholder={fieldConfig.provincePlaceholder}
          className={`w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 ${
            errors.province ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.province && (
          <p className="text-red-500 text-sm mt-1">{errors.province}</p>
        )}
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium mb-1">{fieldConfig.postalLabel} *</label>
        <input
          type="text"
          value={address.postal_code}
          onChange={(e) => handleInputChange('postal_code', e.target.value)}
          placeholder={fieldConfig.postalPlaceholder}
          pattern={fieldConfig.postalPattern}
          className={`w-full px-3 py-2 border-2 rounded-lg focus:border-purple-500 ${
            errors.postal_code ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.postal_code && (
          <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>
        )}
      </div>

      {/* Address Preview */}
      {address.address_line_1 && address.city && address.province && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">ตัวอย่างที่อยู่:</h4>
          <div className="text-sm text-gray-700">
            <p className="font-medium">{address.recipient_name}</p>
            <p>{address.address_line_1}</p>
            {address.address_line_2 && <p>{address.address_line_2}</p>}
            <p>{address.city} {address.province} {address.postal_code}</p>
            <p>{address.country}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAddressForm;
