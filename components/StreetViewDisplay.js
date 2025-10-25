// components/StreetViewDisplay.js
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Compass, 
  Maximize2, 
  RotateCcw, 
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function StreetViewDisplay({ 
  images = [], 
  loading = false, 
  error = null,
  onImageSelect = null,
  showControls = true,
  showMetadata = true,
  className = ''
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDirectionLabels, setShowDirectionLabels] = useState(true);

  // Reset current image when images change
  useEffect(() => {
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images, currentImageIndex]);

  const currentImage = images[currentImageIndex];

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleImageClick = (image, index) => {
    setCurrentImageIndex(index);
    if (onImageSelect) {
      onImageSelect(image, index);
    }
  };

  const handleDownloadImage = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `street-view-${image.direction || image.angle}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด Street View...</p>
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

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">ไม่พบ Street View</h3>
        <p className="text-gray-500">Street View ไม่พร้อมใช้งานในตำแหน่งนี้</p>
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
              Street View ({images.length} มุม)
            </h3>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDirectionLabels(!showDirectionLabels)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={showDirectionLabels ? 'ซ่อนป้ายทิศทาง' : 'แสดงป้ายทิศทาง'}
              >
                {showDirectionLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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

      {/* Main Image Display */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'aspect-video'} relative bg-gray-100`}>
          {/* Current Image */}
          {currentImage && (
            <img
              src={currentImage.url}
              alt={currentImage.description || `Street View ${currentImage.direction}`}
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
              <p className="text-gray-500">ไม่สามารถโหลดภาพได้</p>
            </div>
          </div>

          {/* Direction Label */}
          {currentImage && showDirectionLabels && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {currentImage.direction || `มุม ${currentImage.angle}°`}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
              <span className="text-sm">
                {currentImageIndex + 1} / {images.length}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {currentImage && showControls && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => handleDownloadImage(currentImage)}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                title="ดาวน์โหลดภาพ"
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
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && !isFullscreen && (
          <div className="p-4 border-t">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageClick(image, index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-blue-600 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.direction || `มุม ${image.angle}°`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {currentImage && showMetadata && !isFullscreen && (
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">ทิศทาง:</span>
                <p className="font-medium">{currentImage.direction || `มุม ${currentImage.angle}°`}</p>
              </div>
              <div>
                <span className="text-gray-600">มุมมอง:</span>
                <p className="font-medium">{currentImage.heading}°</p>
              </div>
              <div>
                <span className="text-gray-600">ความชัน:</span>
                <p className="font-medium">{currentImage.pitch}°</p>
              </div>
              <div>
                <span className="text-gray-600">มุมมอง:</span>
                <p className="font-medium">{currentImage.fov}°</p>
              </div>
            </div>
            
            {currentImage.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600">คำอธิบาย:</span>
                <p className="text-sm text-gray-700 mt-1">{currentImage.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
