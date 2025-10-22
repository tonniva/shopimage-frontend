"use client";
import React, { useState, useEffect } from "react";
import { MapPin, User, Phone, Globe, Loader2 } from "lucide-react";

// Import different address providers
import GooglePlacesProvider from "./GooglePlacesProvider";
import SimpleAddressForm from "./SimpleAddressForm";
import AddressValidation from "./AddressValidation";

const ShippingAddress = ({ 
  onAddressChange, 
  onValidationError,
  initialAddress = null,
  provider = "google", // "google", "simple", "manual"
  country = "TH",
  required = true 
}) => {
  const [address, setAddress] = useState({
    country: country,
    recipient_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    province: "",
    postal_code: "",
    formatted_address: "",
    ...initialAddress
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Update parent component when address changes
  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(address, errors);
    }
  }, [address, errors, onAddressChange]);

  // Handle address change from child components
  const handleAddressChange = (newAddress) => {
    setAddress(prev => ({ ...prev, ...newAddress }));
    
    // Clear related errors when address changes
    const newErrors = { ...errors };
    Object.keys(newAddress).forEach(key => {
      if (newErrors[key]) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  // Handle validation errors
  const handleValidationError = (errors) => {
    setErrors(errors);
  };

  // Clear all errors
  const clearErrors = () => {
    setErrors({});
  };

  // Validate entire form
  const validateForm = async () => {
    setIsValidating(true);
    try {
      const validationResult = await AddressValidation.validate(address);
      setErrors(validationResult.errors);
      return validationResult.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Render different providers
  const renderAddressProvider = () => {
    switch (provider) {
      case "google":
        return (
          <GooglePlacesProvider
            address={address}
            onAddressChange={handleAddressChange}
            onValidationError={handleValidationError}
            country={country}
          />
        );
      
      case "simple":
        return (
          <SimpleAddressForm
            address={address}
            onAddressChange={handleAddressChange}
            onValidationError={handleValidationError}
            country={country}
          />
        );
      
      case "manual":
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <MapPin size={48} className="mx-auto mb-2 text-gray-300" />
              <p>กรุณากรอกที่อยู่จัดส่งด้วยตนเอง</p>
            </div>
            <SimpleAddressForm
              address={address}
              onAddressChange={handleAddressChange}
              onValidationError={handleValidationError}
              country={country}
            />
          </div>
        );
      
      default:
        return (
          <SimpleAddressForm
            address={address}
            onAddressChange={handleAddressChange}
            onValidationError={handleValidationError}
            country={country}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MapPin className="text-purple-600" size={20} />
        <h3 className="text-xl font-bold">ที่อยู่จัดส่ง</h3>
        {required && <span className="text-red-500">*</span>}
      </div>

      {/* Provider Selection (for testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800 mb-2">🔧 Development Mode - Provider:</p>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className={`px-3 py-1 rounded text-xs ${
                provider === 'google' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Google Places
            </button>
            <button
              onClick={() => window.location.reload()}
              className={`px-3 py-1 rounded text-xs ${
                provider === 'simple' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Simple Form
            </button>
            <button
              onClick={() => window.location.reload()}
              className={`px-3 py-1 rounded text-xs ${
                provider === 'manual' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Manual
            </button>
          </div>
        </div>
      )}

      {/* Address Form */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        {renderAddressProvider()}
      </div>

      {/* Validation Status */}
      {isValidating && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">กำลังตรวจสอบที่อยู่...</span>
        </div>
      )}

      {/* Error Summary */}
     

      {/* Address Preview - แสดงเมื่อกรอกที่อยู่หลัก */}
      {address.address_line_1 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            ✅ ที่อยู่ของคุณ
          </h4>
          <div className="text-sm text-gray-700">
            <p className="font-medium">{address.recipient_name}</p>
            <p>{address.address_line_1}</p>
            {address.address_line_2 && <p>{address.address_line_2}</p>}
            <p className="text-green-600 font-medium">🇹🇭 ประเทศไทย</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddress;
