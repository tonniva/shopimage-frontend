// components/GoogleMapsDisplay.js
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Maximize2, 
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Map,
  Satellite,
  Layers,
  Mountain
} from 'lucide-react';

export default function GoogleMapsDisplay({ 
  maps = [], 
  loading = false, 
  error = null,
  onMapSelect = null,
  showControls = true,
  showMetadata = true,
  className = ''
}) {
  const [currentMapIndex, setCurrentMapIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMapInfo, setShowMapInfo] = useState(true);

  // Reset current map when maps change
  useEffect(() => {
    if (maps.length > 0 && currentMapIndex >= maps.length) {
      setCurrentMapIndex(0);
    }
  }, [maps, currentMapIndex]);

  const currentMap = maps[currentMapIndex];

  const handlePreviousMap = () => {
    setCurrentMapIndex(prev => 
      prev === 0 ? maps.length - 1 : prev - 1
    );
  };

  const handleNextMap = () => {
    setCurrentMapIndex(prev => 
      prev === maps.length - 1 ? 0 : prev + 1
    );
  };

  const handleMapClick = (map, index) => {
    setCurrentMapIndex(index);
    if (onMapSelect) {
      onMapSelect(map, index);
    }
  };

  const handleDownloadMap = async (map) => {
    try {
      const response = await fetch(map.mapUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `map-${map.type || 'static'}-${Date.now()}.${map.format || 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading map:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getMapTypeIcon = (mapType) => {
    const iconMap = {
      'roadmap': Map,
      'satellite': Satellite,
      'hybrid': Layers,
      'terrain': Mountain
    };
    const IconComponent = iconMap[mapType] || Map;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
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

  if (!maps || maps.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">ไม่พบแผนที่</h3>
        <p className="text-gray-500">กรุณาสร้างแผนที่ก่อน</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              แผนที่ ({maps.length} แผนที่)
            </h3>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMapInfo(!showMapInfo)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={showMapInfo ? 'ซ่อนข้อมูลแผนที่' : 'แสดงข้อมูลแผนที่'}
              >
                {showMapInfo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="ขยายเต็มหน้าจอ"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Display */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'aspect-video'} relative bg-gray-100`}>
          {/* Current Map */}
          {currentMap && (
            <img
              src={currentMap.mapUrl}
              alt={currentMap.title || `แผนที่ ${currentMap.type || 'static'}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          )}
          
          {/* Fallback */}
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">ไม่สามารถโหลดแผนที่ได้</p>
            </div>
          </div>

          {/* Map Type Label */}
          {currentMap && showMapInfo && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
              <div className="flex items-center gap-2">
                {getMapTypeIcon(currentMap.mapType || 'roadmap')}
                <span className="text-sm font-medium">
                  {getMapTypeName(currentMap.mapType || 'roadmap')}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {maps.length > 1 && (
            <>
              <button
                onClick={handlePreviousMap}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleNextMap}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Map Counter */}
          {maps.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
              <span className="text-sm">
                {currentMapIndex + 1} / {maps.length}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {currentMap && showControls && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => handleDownloadMap(currentMap)}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                title="ดาวน์โหลดแผนที่"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Fullscreen Close Button */}
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <Navigation className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {maps.length > 1 && !isFullscreen && (
          <div className="p-4 border-t">
            <div className="flex gap-2 overflow-x-auto">
              {maps.map((map, index) => (
                <button
                  key={index}
                  onClick={() => handleMapClick(map, index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentMapIndex 
                      ? 'border-blue-600 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={map.mapUrl}
                    alt={map.title || `แผนที่ ${map.type || 'static'}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Map Metadata */}
        {currentMap && showMetadata && !isFullscreen && (
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">ประเภท:</span>
                <p className="font-medium">{getMapTypeName(currentMap.mapType || 'roadmap')}</p>
              </div>
              <div>
                <span className="text-gray-600">ขนาด:</span>
                <p className="font-medium">{currentMap.size?.width || 640}×{currentMap.size?.height || 480}</p>
              </div>
              <div>
                <span className="text-gray-600">ซูม:</span>
                <p className="font-medium">{currentMap.zoom || 15}</p>
              </div>
              <div>
                <span className="text-gray-600">รูปแบบ:</span>
                <p className="font-medium">{currentMap.format || 'png'}</p>
              </div>
            </div>
            
            {currentMap.title && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600">ชื่อ:</span>
                <p className="text-sm text-gray-700 mt-1">{currentMap.title}</p>
              </div>
            )}

            {currentMap.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600">คำอธิบาย:</span>
                <p className="text-sm text-gray-700 mt-1">{currentMap.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
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
