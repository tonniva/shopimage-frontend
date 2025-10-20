"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, Settings, QrCode, Type, Image as ImageIcon, Archive } from "lucide-react";
import QRCode from "qrcode";
import JSZip from "jszip";

export default function AddQRToImageEN() {
  const [images, setImages] = useState([]);
  const [qrText, setQrText] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [qrPosition, setQrPosition] = useState("bottom-right");
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-left");
  const [qrSize, setQrSize] = useState(100);
  const [watermarkSize, setWatermarkSize] = useState(16);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.7);
  const [watermarkColor, setWatermarkColor] = useState("#FFFFFF");
  const [processedImages, setProcessedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const generateQRCode = async () => {
    if (!qrText.trim()) return;
    
    try {
      const qrDataURL = await QRCode.toDataURL(qrText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const processImage = async (imageData) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw main image
        ctx.drawImage(img, 0, 0);
        
        // Draw QR Code
        if (qrCode) {
          const qrImg = new Image();
          qrImg.onload = () => {
            let qrX, qrY;
            const margin = 20;
            
            switch (qrPosition) {
              case 'top-left':
                qrX = margin;
                qrY = margin;
                break;
              case 'top-right':
                qrX = canvas.width - qrSize - margin;
                qrY = margin;
                break;
              case 'bottom-left':
                qrX = margin;
                qrY = canvas.height - qrSize - margin;
                break;
              case 'bottom-right':
                qrX = canvas.width - qrSize - margin;
                qrY = canvas.height - qrSize - margin;
                break;
              case 'center':
                qrX = (canvas.width - qrSize) / 2;
                qrY = (canvas.height - qrSize) / 2;
                break;
            }
            
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            
            // Draw watermark
            if (watermarkText) {
              ctx.font = `${watermarkSize}px Arial`;
              ctx.fillStyle = watermarkColor;
              ctx.globalAlpha = watermarkOpacity;
              
              const textWidth = ctx.measureText(watermarkText).width;
              let wmX, wmY;
              
              switch (watermarkPosition) {
                case 'top-left':
                  wmX = margin;
                  wmY = watermarkSize + margin;
                  break;
                case 'top-right':
                  wmX = canvas.width - textWidth - margin;
                  wmY = watermarkSize + margin;
                  break;
                case 'bottom-left':
                  wmX = margin;
                  wmY = canvas.height - margin;
                  break;
                case 'bottom-right':
                  wmX = canvas.width - textWidth - margin;
                  wmY = canvas.height - margin;
                  break;
                case 'center':
                  wmX = (canvas.width - textWidth) / 2;
                  wmY = canvas.height / 2;
                  break;
              }
              
              ctx.fillText(watermarkText, wmX, wmY);
            }
            
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          };
          qrImg.src = qrCode;
        } else {
          // Draw watermark only
          if (watermarkText) {
            ctx.font = `${watermarkSize}px Arial`;
            ctx.fillStyle = watermarkColor;
            ctx.globalAlpha = watermarkOpacity;
            
            const textWidth = ctx.measureText(watermarkText).width;
            let wmX, wmY;
            
            switch (watermarkPosition) {
              case 'top-left':
                wmX = 20;
                wmY = watermarkSize + 20;
                break;
              case 'top-right':
                wmX = canvas.width - textWidth - 20;
                wmY = watermarkSize + 20;
                break;
              case 'bottom-left':
                wmX = 20;
                wmY = canvas.height - 20;
                break;
              case 'bottom-right':
                wmX = canvas.width - textWidth - 20;
                wmY = canvas.height - 20;
                break;
              case 'center':
                wmX = (canvas.width - textWidth) / 2;
                wmY = canvas.height / 2;
                break;
            }
            
            ctx.fillText(watermarkText, wmX, wmY);
          }
          
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        }
      };
      img.src = imageData.preview;
    });
  };

  const processAllImages = async () => {
    if (!images.length) return;
    
    setIsProcessing(true);
    const results = [];
    
    for (const image of images) {
      const processedDataURL = await processImage(image);
      results.push({
        ...image,
        processed: processedDataURL
      });
    }
    
    setProcessedImages(results);
    setIsProcessing(false);
  };

  const downloadImage = (dataURL, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
  };

  const downloadAll = async () => {
    if (processedImages.length === 1) {
      // Single image - download normally
      downloadImage(processedImages[0].processed, 'qr-watermark.jpg');
    } else {
      // Multiple images - create ZIP file
      const zip = new JSZip();
      
      processedImages.forEach((img, index) => {
        // Convert dataURL to blob
        const base64Data = img.processed.split(',')[1];
        const filename = `qr-watermark-${index + 1}.jpg`;
        zip.file(filename, base64Data, { base64: true });
      });
      
      // Generate ZIP file and download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-watermark-images-${processedImages.length}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-black sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-pink-200 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="text-sm text-white font-semibold">Image Compressor</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <QrCode size={64} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Add QR Code and Watermark to Images
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8">
            Add QR codes and text watermarks to product images. Choose positions and customize settings.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Image Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Upload */}
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Upload className="text-purple-600" />
                Upload Images
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-semibold mb-2">Click to select images</p>
                  <p className="text-gray-600">Supports multiple files</p>
                </label>
              </div>
              
              {images.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold mb-3">Selected Images ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {processedImages.length > 0 && (
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {processedImages.map((img, index) => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.processed}
                        alt={`Processed ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage(img.processed)}
                      />
                      <button
                        onClick={() => downloadImage(img.processed, `qr-watermark-${index + 1}.jpg`)}
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={downloadAll}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {processedImages.length > 1 ? (
                    <>
                      <Archive size={20} />
                      Download All (ZIP)
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Download Image
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            
            {/* QR Code Settings */}
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <QrCode className="text-purple-600" />
                QR Code
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">QR Code Text</label>
                  <input
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <button
                  onClick={generateQRCode}
                  disabled={!qrText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate QR Code
                </button>
                
                {qrCode && (
                  <div className="text-center">
                    <img src={qrCode} alt="QR Code" className="mx-auto border rounded-lg" />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold mb-2">QR Code Position</label>
                  <select
                    value={qrPosition}
                    onChange={(e) => setQrPosition(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">QR Code Size: {qrSize}px</label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Watermark Settings */}
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Type className="text-pink-600" />
                Watermark
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="© 2025 MyShop"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Watermark Position</label>
                  <select
                    value={watermarkPosition}
                    onChange={(e) => setWatermarkPosition(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Watermark Size: {watermarkSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={watermarkSize}
                    onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Watermark Color</label>
                  <div className="flex gap-2">
                    {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map(color => (
                      <button
                        key={color}
                        onClick={() => setWatermarkColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          watermarkColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 text-center">
              <button
                onClick={processAllImages}
                disabled={!images.length || isProcessing}
                className="w-full bg-white text-purple-600 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Process All Images'}
              </button>
              <p className="text-sm mt-2 text-purple-100">
                {images.length} images • {qrCode ? 'QR Code' : 'No QR Code'} • {watermarkText ? 'Watermark' : 'No Watermark'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link href="/en" className="text-2xl font-bold text-purple-600 hover:text-purple-700 mb-2 block">
            Image Compressor
          </Link>
          <p className="text-gray-500 text-xs mt-4">© 2025 Image Compressor</p>
        </div>
      </footer>

      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300 transition-colors z-10"
            >
              ×
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-auto max-w-full max-h-[80vh] mx-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
