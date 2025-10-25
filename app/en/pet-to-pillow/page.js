"use client";

import React, { useState, useRef } from "react";
import { Upload, Download, Eye, Settings, Palette, Zap, Sparkles, Loader2 } from "lucide-react";

export default function PetToPillowPage() {
  // State variables
  const [petImage, setPetImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [pillowSize, setPillowSize] = useState("60");
  const [pillowStyle, setPillowStyle] = useState("classic");
  const [backgroundOption, setBackgroundOption] = useState("simple");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Pillow sizes (based on the image provided)
  const pillowSizes = [
    { name: "45 cm", value: "45", width: 180, height: 180, price: "500.-" },
    { name: "60 cm", value: "60", width: 240, height: 240, price: "700.-" },
    { name: "80 cm", value: "80", width: 320, height: 320, price: "1200.-" },
    { name: "100 cm", value: "100", width: 400, height: 400, price: "1700.-" },
    { name: "120 cm", value: "120", width: 480, height: 480, price: "2290.-" },
    { name: "150 cm", value: "150", width: 600, height: 600, price: "2890.-" }
  ];

  // Pillow styles
  const pillowStyles = [
    { name: "Classic", value: "classic", color: "#f8f9fa", texture: "smooth" },
    { name: "Velvet", value: "velvet", color: "#6c757d", texture: "rough" },
    { name: "Cotton", value: "cotton", color: "#ffffff", texture: "soft" },
    { name: "Memory Foam", value: "memory", color: "#e9ecef", texture: "dense" }
  ];

  // Background removal options
  const backgroundOptions = [
    { 
      name: "Remove White Background", 
      value: "simple", 
      icon: "⚪", 
      description: "Free & Fast",
      badge: "✓ Unlimited"
    },
    { 
      name: "AI Background Removal", 
      value: "ai", 
      icon: "🤖", 
      description: "High Quality",
      badge: "✅ Ready to use"
    }
  ];

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPetImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove background using API
  const removeBackgroundAPI = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/remove-bg`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.ok && result.download_url) {
          // Use download_url from API response
          return result.download_url;
        } else {
          throw new Error('Invalid API response');
        }
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  };

  // Remove background using frontend (simple white background removal)
  const removeBackgroundFrontend = (imageData) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Remove white background
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          // If it's white, make it transparent
          if (r > 240 && g > 240 && b > 240) {
            imageData.data[i + 3] = 0; // alpha = 0
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageData;
    });
  };

  // Process image
  const processImage = async () => {
    if (!petImage) return;

    setIsProcessing(true);
    
    try {
      let processedImageUrl;
      
      if (backgroundOption === 'ai') {
        // Check if user is subscribed (mock for now)
        const isSubscribed = true; // Mock: user is subscribed
        if (!isSubscribed) {
          alert('Subscription required to use AI Background Removal feature');
          setIsProcessing(false);
          return;
        }
        
        // Convert base64 to file
        const response = await fetch(petImage);
        const blob = await response.blob();
        const file = new File([blob], 'pet.jpg', { type: 'image/jpeg' });
        
        processedImageUrl = await removeBackgroundAPI(file);
      } else {
        processedImageUrl = await removeBackgroundFrontend(petImage);
      }
      
      setProcessedImage(processedImageUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create pillow preview using CSS
  const createPillowPreview = () => {
    if (!processedImage) return null;

    const selectedSize = pillowSizes.find(size => size.value === pillowSize);
    const selectedStyle = pillowStyles.find(style => style.value === pillowStyle);

    return (
      <div className="pillow-preview mx-auto relative">
        {/* Preview container */}
        <div 
          className="w-full h-80 rounded-lg border-2 border-gray-300 flex items-center justify-center relative overflow-hidden mb-4"
          style={{ 
            backgroundColor: '#f8f9fa'
          }}
        >
          <div 
            className="pillow-container"
            style={{
              width: `${Math.min(selectedSize.width, 200)}px`,
              height: `${Math.min(selectedSize.height, 200)}px`,
              margin: '0 auto',
              position: 'relative', 
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Pillow Base */}
            <div
              className="pillow-base"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '12%',
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%),
                  linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%),
                  ${selectedStyle.color}
                `,
                boxShadow: `
                  0 40px 80px rgba(0,0,0,0.3),
                  0 20px 40px rgba(0,0,0,0.2),
                  inset 0 0 60px rgba(0,0,0,0.1),
                  inset -20px -20px 40px rgba(0,0,0,0.15),
                  inset 20px 20px 40px rgba(255,255,255,0.3)
                `,
                transform: 'translateZ(-20px)'
              }}
            />

            {/* Pet Image with Transparency Background */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                right: '6px',
                bottom: '6px',
                borderRadius: '10%',
                overflow: 'hidden', 
                transform: 'translateZ(0px)',
                // Checkerboard pattern for transparency
                backgroundImage: `
                  linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(-45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              <img
                src={processedImage}
                alt="Pet on pillow"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: `drop-shadow(white 0px 0px 4px) drop-shadow(white 0px 0px 4px) drop-shadow(white 0px 0px 0px) drop-shadow(white 0px 0px 0px) drop-shadow(white 0px 0px 0px) drop-shadow(rgba(255, 255, 255, 0.8) -10px -10px 15px) drop-shadow(rgba(0, 0, 0, 0.4) 15px 10px 20px) drop-shadow(rgba(0, 0, 0, 0.3) 5px 5px 15px)`,
                  position: 'relative'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Download processed image
  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `pet-pillow-${pillowSize}cm.png`;
    link.click();
  };

  // Show preview modal
  const showPreviewModal = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🛏️ Pet to Pillow
            </h1>
            <p className="text-gray-600">
              Create custom pet pillows
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            
            {/* Image Upload */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload className="text-purple-600" size={20} />
                Upload Pet Image
              </h3>
              
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                
                {petImage && (
                  <div className="text-center">
                    <img 
                      src={petImage} 
                      alt="Pet" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pillow Size */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="text-purple-600" size={20} />
                Choose Pillow Size
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {pillowSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setPillowSize(size.value)}
                    className={`p-3 border-2 rounded-lg text-sm font-semibold transition-all ${
                      pillowSize === size.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-bold">{size.name}</div>
                    {/* <div className="text-xs text-gray-600">{size.price}</div> */}
                  </button>
                ))}
              </div>
            </div>

            {/* Pillow Style - Removed */}

            {/* Background Removal Options */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="text-purple-600" size={20} />
                Background Removal
              </h3>
              
              <div className="space-y-3">
                {backgroundOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBackgroundOption(option.value)}
                    className={`w-full p-4 border-2 rounded-lg transition-all ${
                      backgroundOption === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-800">{option.name}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                        <div className="text-xs mt-1">{option.badge}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {backgroundOption === 'ai' && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="text-green-600">✅</div>
                    <div className="text-sm text-green-800">
                      <strong>Ready to use!</strong> You are subscribed and can use AI Background Removal
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Process Button */}
            <button
              onClick={processImage}
              disabled={!petImage || isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Create Pillow
                </>
              )}
            </button>
          </div>

          {/* Center Column - Preview ( ) */}
          <div className="lg:  lg:top-24 lg:self-start">
            <div className="space-y-6">
              
              {/* Preview */}
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Eye className="text-purple-600" size={20} />
                  Pillow Preview
                </h3>
                
                <div className="text-center">
                  {isProcessing ? (
                    <div className="w-full h-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                        <div className="text-lg font-semibold">Processing...</div>
                        <div className="text-sm">Please wait a moment</div>
                      </div>
                    </div>
                  ) : createPillowPreview() || (
                    <div className="w-full h-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🛏️</div>
                        <div>Upload image to see preview</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Download */}
              {processedImage && (
                <div className="bg-white border-2 border-black rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Download className="text-purple-600" size={20} />
                    Download
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => showPreviewModal(processedImage)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      View Large Preview
                    </button>
                    
                    <button
                      onClick={downloadImage}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Advanced Settings */}
          <div className="space-y-6">
            
            {/* Size Info */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Size Information</h3>
              
              {pillowSizes.map((size) => (
                <div 
                  key={size.value}
                  className={`p-3 rounded-lg mb-2 ${
                    pillowSize === size.value ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{size.name}</div>
                      <div className="text-sm text-gray-600">{size.width}×{size.height}px</div>
                    </div>
                    {/* <div className="font-bold text-purple-600">{size.price}</div> */}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">💡 Tips</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="text-blue-500">📸</div>
                  <div>Use clear pet photos</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-green-500">⚪</div>
                  <div>White backgrounds work best</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-500">🤖</div>
                  <div>AI handles complex backgrounds</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-orange-500">🛏️</div>
                  <div>Larger sizes look better</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <div 
              className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Pillow Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="text-center">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
