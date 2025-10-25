// components/StreetViewControls.js
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Compass, 
  Settings, 
  RotateCcw, 
  Camera,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useGoogleStreetView } from '@/hooks/useGoogleStreetView';
import StreetViewDisplay from './StreetViewDisplay';

export default function StreetViewControls({ 
  location, 
  onImagesGenerated = null,
  showAdvancedControls = true,
  className = ''
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [streetViewImages, setStreetViewImages] = useState([]);
  const [availability, setAvailability] = useState(null);
  
  // Street View parameters
  const [size, setSize] = useState({ width: 640, height: 480 });
  const [quality, setQuality] = useState(2);
  const [format, setFormat] = useState('jpg');
  const [pitch, setPitch] = useState(0);
  const [fov, setFov] = useState(90);
  const [angles, setAngles] = useState([0, 90, 180, 270]);
  const [propertyType, setPropertyType] = useState('house');

  const {
    loading,
    error,
    getMultipleImages,
    getPropertyImages,
    checkAvailability,
    resetError
  } = useGoogleStreetView();

  // Check availability when location changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      checkStreetViewAvailability();
    }
  }, [location]);

  const checkStreetViewAvailability = async () => {
    const result = await checkAvailability(location);
    if (result.success) {
      setAvailability(result.data);
    }
  };

  const generateStreetViewImages = async () => {
    if (!location || !location.lat || !location.lng) {
      alert('กรุณาระบุตำแหน่งก่อน');
      return;
    }

    resetError();
    
    const result = await getMultipleImages({
      location,
      size,
      quality,
      format,
      pitch,
      fov,
      angles
    });

    if (result.success) {
      setStreetViewImages(result.data.images);
      if (onImagesGenerated) {
        onImagesGenerated(result.data.images);
      }
    }
  };

  const generatePropertyImages = async () => {
    if (!location || !location.lat || !location.lng) {
      alert('กรุณาระบุตำแหน่งก่อน');
      return;
    }

    resetError();
    
    const result = await getPropertyImages({
      location,
      propertyType,
      size,
      quality
    });

    if (result.success) {
      setStreetViewImages(result.data.images);
      if (onImagesGenerated) {
        onImagesGenerated(result.data.images);
      }
    }
  };

  const resetSettings = () => {
    setSize({ width: 640, height: 480 });
    setQuality(2);
    setFormat('jpg');
    setPitch(0);
    setFov(90);
    setAngles([0, 90, 180, 270]);
    setPropertyType('house');
  };

  const sizeOptions = [
    { value: { width: 320, height: 240 }, label: '320×240 (เล็ก)' },
    { value: { width: 640, height: 480 }, label: '640×480 (กลาง)' },
    { value: { width: 800, height: 600 }, label: '800×600 (ใหญ่)' },
    { value: { width: 1024, height: 768 }, label: '1024×768 (ใหญ่ที่สุด)' }
  ];

  const qualityOptions = [
    { value: 1, label: 'ต่ำ (เร็ว)' },
    { value: 2, label: 'กลาง (สมดุล)' },
    { value: 3, label: 'สูง (ช้า)' }
  ];

  const formatOptions = [
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' }
  ];

  const propertyTypeOptions = [
    { value: 'house', label: 'บ้านเดี่ยว' },
    { value: 'apartment', label: 'อพาร์ตเมนต์' },
    { value: 'condo', label: 'คอนโดมิเนียม' },
    { value: 'commercial', label: 'เชิงพาณิชย์' },
    { value: 'land', label: 'ที่ดิน' }
  ];

  const angleOptions = [
    { value: [0], label: 'เหนือ' },
    { value: [90], label: 'ตะวันออก' },
    { value: [180], label: 'ใต้' },
    { value: [270], label: 'ตะวันตก' },
    { value: [0, 90, 180, 270], label: 'ทุกทิศทาง' },
    { value: [0, 180], label: 'หน้า-หลัง' },
    { value: [90, 270], label: 'ซ้าย-ขวา' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Info */}
      {location && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              ตำแหน่ง: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {/* Availability Status */}
      {availability !== null && (
        <div className={`border rounded-lg p-3 ${
          availability.available 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <Eye className={`w-4 h-4 ${
              availability.available ? 'text-green-600' : 'text-red-600'
            }`} />
            <span className={`text-sm font-medium ${
              availability.available ? 'text-green-800' : 'text-red-800'
            }`}>
              {availability.available 
                ? 'Street View พร้อมใช้งาน' 
                : 'Street View ไม่พร้อมใช้งานในตำแหน่งนี้'
              }
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Street View</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่า</span>
            {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={generateStreetViewImages}
            disabled={loading || !availability?.available}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            สร้าง Street View
          </button>
          
          <button
            onClick={generatePropertyImages}
            disabled={loading || !availability?.available}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            สำหรับอสังหา
          </button>
        </div>

        {/* Advanced Settings */}
        {showSettings && showAdvancedControls && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ขนาดภาพ
                </label>
                <select
                  value={JSON.stringify(size)}
                  onChange={(e) => setSize(JSON.parse(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sizeOptions.map(option => (
                    <option key={JSON.stringify(option.value)} value={JSON.stringify(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คุณภาพ
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {qualityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปแบบไฟล์
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทอสังหา
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Angles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                มุมมอง
              </label>
              <select
                value={JSON.stringify(angles)}
                onChange={(e) => setAngles(JSON.parse(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {angleOptions.map(option => (
                  <option key={JSON.stringify(option.value)} value={JSON.stringify(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความชัน (Pitch): {pitch}°
                </label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  มุมมอง (FOV): {fov}°
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={fov}
                  onChange={(e) => setFov(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end">
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4" />
                รีเซ็ตการตั้งค่า
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Street View Display */}
      {streetViewImages.length > 0 && (
        <StreetViewDisplay
          images={streetViewImages}
          loading={loading}
          error={error}
          showControls={true}
          showMetadata={true}
        />
      )}

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
                ต้องระบุตำแหน่งก่อนจึงจะสร้าง Street View ได้
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
