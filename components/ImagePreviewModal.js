'use client';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function ImagePreviewModal({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0,
  onIndexChange 
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentImageIndex);
    }
  }, [currentImageIndex, onIndexChange]);

  const handlePrevious = () => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : images.length - 1
    );
    setZoom(1);
    setRotation(0);
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => 
      prev < images.length - 1 ? prev + 1 : 0
    );
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (images[currentImageIndex]?.url) {
      const link = document.createElement('a');
      link.href = images[currentImageIndex].url;
      link.download = `image-${currentImageIndex + 1}.jpg`;
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share && images[currentImageIndex]?.url) {
      try {
        await navigator.share({
          title: 'Property Image',
          url: images[currentImageIndex].url
        });
      } catch (error) {
        // Handle share cancellation or error
        if (error.name === 'AbortError') {
          // User canceled the share - this is normal, don't show error
          console.log('Share canceled by user');
          return;
        }
        
        // Other errors - fallback to clipboard
        console.error('Share error:', error);
        try {
          await navigator.clipboard.writeText(images[currentImageIndex].url);
          alert('ลิงก์รูปภาพถูกคัดลอกแล้ว');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert('ไม่สามารถแชร์หรือคัดลอกลิ้งได้');
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(images[currentImageIndex]?.url || '');
        alert('ลิงก์รูปภาพถูกคัดลอกแล้ว');
      } catch (error) {
        console.error('Clipboard error:', error);
        alert('ไม่สามารถคัดลอกลิ้งได้');
      }
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
        handleRotate();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div className="relative max-w-full max-h-full p-8">
        <img
          src={currentImage?.url || currentImage}
          alt={`Image ${currentImageIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            cursor: zoom > 1 ? 'grab' : 'default'
          }}
          draggable={false}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 text-white p-2 rounded-lg">
        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Rotate */}
        <button
          onClick={handleRotate}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto p-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentImageIndex 
                  ? 'border-white' 
                  : 'border-transparent hover:border-white hover:border-opacity-50'
              }`}
            >
              <img
                src={image?.url || image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
