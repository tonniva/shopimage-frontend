// components/GoogleMapsControls.js
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Settings, 
  RotateCcw, 
  Map,
  Satellite,
  Layers,
  Mountain,
  Navigation,
  ChevronDown,
  ChevronUp,
  Download,
  Eye
} from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import GoogleMapsDisplay from './GoogleMapsDisplay';

export default function GoogleMapsControls({ 
  location, 
  nearbyPlaces = [],
  transportationStops = [],
  onMapsGenerated = null,
  showAdvancedControls = true,
  className = ''
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [generatedMaps, setGeneratedMaps] = useState([]);
  
  // Map parameters
  const [mapType, setMapType] = useState('roadmap');
  const [size, setSize] = useState({ width: 640, height: 480 });
  const [zoom, setZoom] = useState(15);
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(1);
  const [language, setLanguage] = useState('th');

  const {
    loading,
    error,
    generateStaticMap,
    generatePropertyMap,
    generateTransportationMap,
    generateAreaMap,
    generateComprehensivePropertyMap,
    resetError
  } = useGoogleMaps();

  const generateBasicMap = async () => {
    if (!location || !location.lat || !location.lng) {
      alert('กรุณาระบุตำแหน่งก่อน');
      return;
    }

    resetError();
    
    const result = await generateStaticMap({
      center: location,
      zoom,
      size,
      mapType,
      format,
      scale,
      language
    });

    if (result.success) {
      const newMap = {
        ...result.data,
        type: 'static',
        title: 'แผนที่พื้นฐาน',
        description: `แผนที่${getMapTypeName(mapType)} ขนาด ${size.width}×${size.height}`,
        mapType,
        size,
        zoom,
        format
      };
      
      setGeneratedMaps(prev => [...prev, newMap]);
      if (onMapsGenerated) {
        onMapsGenerated([...generatedMaps, newMap]);
      }
    }
  };

  const generatePropertyMapWithPlaces = async () => {
    if (!location || !location.lat || !location.lng) {
      alert('กรุณาระบุตำแหน่งก่อน');
      return;
    }

    resetError();
    
    const result = await generatePropertyMap({
      propertyLocation: location,
      nearbyPlaces,
      mapType,
      size,
      zoom
    });

    if (result.success) {
      const newMap = {
        ...result.data,
        type: 'property',
        title: 'แผนที่อสังหาริมทรัพย์',
        description: `แผนที่อสังหาริมทรัพย์พร้อมสถานที่ใกล้เคียง ${nearbyPlaces.length} แห่ง`,
        mapType,
        size,
        zoom,
        nearbyPlaces
      };
      
      setGeneratedMaps(prev => [...prev, newMap]);
      if (onMapsGenerated) {
        onMapsGenerated([...generatedMaps, newMap]);
      }
    }
  };

  const generateTransportationMapWithStops = async () => {
    if (!location || !location.lat || !location.lng) {
      alert('กรุณาระบุตำแหน่งก่อน');
      return;
    }

    resetError();
    
    const result = await generateTransportationMap({
      propertyLocation: location,
      transportationStops,
      mapType,
      size,
      zoom
    });

    if (result.success) {
      const newMap = {
        ...result.data,
        type: 'transportation',
        title: 'แผนที่การเดินทาง',
        description: `แผนที่การเดินทางพร้อมจุดเชื่อมต่อ ${transportationStops.length} แห่ง`,
        mapType,
        size,
        zoom,
        transportationStops
      };
      
      setGeneratedMaps(prev => [...prev, newMap]);
      if (onMapsGenerated) {
        onMapsGenerated([...generatedMaps, newMap]);
      }
    }
  };

  const generateAreaOverviewMap = async () => {
    if (!location || !location.lat || !location.lng) {
      alert('กรุณาระบุตำแหน่งก่อน');
      return;
    }

    resetError();
    
    const result = await generateAreaMap({
      center: location,
      radius: 1000,
      mapType,
      size,
      zoom: zoom - 2
    });

    if (result.success) {
      const newMap = {
        ...result.data,
        type: 'area',
        title: 'แผนที่ภาพรวมพื้นที่',
        description: 'แผนที่ภาพรวมพื้นที่รัศมี 1 กิโลเมตร',
        mapType,
        size,
        zoom: zoom - 2,
        radius: 1000
      };
      
      setGeneratedMaps(prev => [...prev, newMap]);
      if (onMapsGenerated) {
        onMapsGenerated([...generatedMaps, newMap]);
      }
    }
  };

  const generateComprehensiveMap = async () => {
    if (!location || !location.lat || !location.lng) {
      alert('กรุณาระบุตำแหน่งก่อน');
      return;
    }

    resetError();
    
    const result = await generateComprehensivePropertyMap({
      propertyLocation: location,
      nearbyPlaces,
      transportationStops,
      mapType,
      size,
      zoom
    });

    if (result.success) {
      const newMap = {
        ...result.data,
        type: 'comprehensive',
        title: 'แผนที่ครบถ้วน',
        description: `แผนที่ครบถ้วนพร้อมสถานที่ใกล้เคียง ${nearbyPlaces.length} แห่ง และจุดเชื่อมต่อ ${transportationStops.length} แห่ง`,
        mapType,
        size,
        zoom,
        nearbyPlaces,
        transportationStops
      };
      
      setGeneratedMaps(prev => [...prev, newMap]);
      if (onMapsGenerated) {
        onMapsGenerated([...generatedMaps, newMap]);
      }
    }
  };

  const resetSettings = () => {
    setMapType('roadmap');
    setSize({ width: 640, height: 480 });
    setZoom(15);
    setFormat('png');
    setScale(1);
    setLanguage('th');
  };

  const clearAllMaps = () => {
    setGeneratedMaps([]);
    if (onMapsGenerated) {
      onMapsGenerated([]);
    }
  };

  const mapTypeOptions = [
    { value: 'roadmap', label: 'แผนที่ถนน', icon: Map },
    { value: 'satellite', label: 'ภาพดาวเทียม', icon: Satellite },
    { value: 'hybrid', label: 'แผนที่ผสม', icon: Layers },
    { value: 'terrain', label: 'แผนที่ภูมิประเทศ', icon: Mountain }
  ];

  const sizeOptions = [
    { value: { width: 320, height: 240 }, label: '320×240 (เล็ก)' },
    { value: { width: 640, height: 480 }, label: '640×480 (กลาง)' },
    { value: { width: 800, height: 600 }, label: '800×600 (ใหญ่)' },
    { value: { width: 1024, height: 768 }, label: '1024×768 (ใหญ่ที่สุด)' }
  ];

  const formatOptions = [
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'gif', label: 'GIF' }
  ];

  const scaleOptions = [
    { value: 1, label: '1x (ปกติ)' },
    { value: 2, label: '2x (ความละเอียดสูง)' }
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Google Maps</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllMaps}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
            >
              ล้างทั้งหมด
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              <span>ตั้งค่า</span>
              {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <button
            onClick={generateBasicMap}
            disabled={loading || !location}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Map className="w-4 h-4" />
            แผนที่พื้นฐาน
          </button>
          
          <button
            onClick={generatePropertyMapWithPlaces}
            disabled={loading || !location}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            แผนที่อสังหา
          </button>
          
          <button
            onClick={generateTransportationMapWithStops}
            disabled={loading || !location}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            แผนที่การเดินทาง
          </button>
          
          <button
            onClick={generateAreaOverviewMap}
            disabled={loading || !location}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            ภาพรวมพื้นที่
          </button>
          
          <button
            onClick={generateComprehensiveMap}
            disabled={loading || !location}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 col-span-2"
          >
            <Layers className="w-4 h-4" />
            แผนที่ครบถ้วน
          </button>
        </div>

        {/* Advanced Settings */}
        {showSettings && showAdvancedControls && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Map Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทแผนที่
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mapTypeOptions.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setMapType(option.value)}
                        className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                          mapType === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ขนาดแผนที่
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

              {/* Zoom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ระดับซูม: {zoom}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>ไกล</span>
                  <span>ใกล้</span>
                </div>
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

              {/* Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความละเอียด
                </label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {scaleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ภาษา
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="th">ไทย</option>
                  <option value="en">English</option>
                </select>
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

      {/* Maps Display */}
      {generatedMaps.length > 0 && (
        <GoogleMapsDisplay
          maps={generatedMaps}
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
                ต้องระบุตำแหน่งก่อนจึงจะสร้างแผนที่ได้
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get map type name in Thai
 * @param {string} mapType - Map type
 * @returns {string} Thai map type name
 */
function getMapTypeName(mapType) {
  const typeMap = {
    'roadmap': 'แผนที่ถนน',
    'satellite': 'ภาพดาวเทียม',
    'hybrid': 'แผนที่ผสม',
    'terrain': 'แผนที่ภูมิประเทศ'
  };
  return typeMap[mapType] || 'แผนที่ถนน';
}
