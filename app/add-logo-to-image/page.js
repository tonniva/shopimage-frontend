"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, Settings, Image as ImageIcon, Type, Archive } from "lucide-react";
import JSZip from "jszip";

export default function AddLogoToImage() {
  const [images, setImages] = useState([]);
  const [logo, setLogo] = useState(null);
  const [logoOpacity, setLogoOpacity] = useState(0.9);
  const [logoPosition, setLogoPosition] = useState("bottom-right");
  const [logoSize, setLogoSize] = useState("medium");
  const [processedImages, setProcessedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const canvasRef = useRef(null);

  // Logo position options
  const positionOptions = [
    { value: "top-left", label: "มุมซ้ายบน", icon: "↖️" },
    { value: "top-right", label: "มุมขวาบน", icon: "↗️" },
    { value: "bottom-left", label: "มุมซ้ายล่าง", icon: "↙️" },
    { value: "bottom-right", label: "มุมขวาล่าง", icon: "↘️" },
    { value: "center", label: "กลาง", icon: "🎯" },
    { value: "top-center", label: "บนกลาง", icon: "⬆️" },
    { value: "bottom-center", label: "ล่างกลาง", icon: "⬇️" }
  ];

  // Logo size options
  const sizeOptions = [
    { value: "small", label: "เล็ก (5%)", percentage: 0.05 },
    { value: "medium", label: "กลาง (10%)", percentage: 0.10 },
    { value: "large", label: "ใหญ่ (15%)", percentage: 0.15 },
    { value: "xlarge", label: "ใหญ่มาก (20%)", percentage: 0.20 }
  ];

  const downloadImage = (dataURL, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
  };

  const processImages = async () => {
    if (!logo || images.length === 0) return;

    const processed = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load main image
      const mainImg = new Image();
      mainImg.src = img.preview;
      
      await new Promise((resolve) => {
        mainImg.onload = () => {
          canvas.width = mainImg.width;
          canvas.height = mainImg.height;
          
          // Draw main image
          ctx.drawImage(mainImg, 0, 0);
          
          // Load and draw logo
          const logoImg = new Image();
          logoImg.src = logo.preview;
          
          logoImg.onload = () => {
            // Calculate logo size
            const sizeOption = sizeOptions.find(s => s.value === logoSize);
            const logoWidth = canvas.width * sizeOption.percentage;
            const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
            
            // Calculate logo position
            let x, y;
            switch (logoPosition) {
              case "top-left":
                x = 20;
                y = 20;
                break;
              case "top-right":
                x = canvas.width - logoWidth - 20;
                y = 20;
                break;
              case "bottom-left":
                x = 20;
                y = canvas.height - logoHeight - 20;
                break;
              case "bottom-right":
                x = canvas.width - logoWidth - 20;
                y = canvas.height - logoHeight - 20;
                break;
              case "center":
                x = (canvas.width - logoWidth) / 2;
                y = (canvas.height - logoHeight) / 2;
                break;
              case "top-center":
                x = (canvas.width - logoWidth) / 2;
                y = 20;
                break;
              case "bottom-center":
                x = (canvas.width - logoWidth) / 2;
                y = canvas.height - logoHeight - 20;
                break;
            }
            
            // Draw logo with transparency
            ctx.globalAlpha = logoOpacity;
            ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
            
            processed.push({
              original: img.preview,
              processed: canvas.toDataURL('image/jpeg', 0.9),
              filename: img.file.name
            });
            
            resolve();
          };
        };
      });
    }
    
    setProcessedImages(processed);
  };

  const downloadAll = async () => {
    if (processedImages.length === 1) {
      downloadImage(processedImages[0].processed, 'logo-watermark.jpg');
    } else {
      const zip = new JSZip();
      
      processedImages.forEach((img, index) => {
        const base64Data = img.processed.split(',')[1];
        const filename = `logo-watermark-${index + 1}.jpg`;
        zip.file(filename, base64Data, { base64: true });
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logo-watermark-images-${processedImages.length}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-black  top-0 z-0 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-pink-200 transition-colors">
            <ArrowLeft size={20} />
            กลับหน้าหลัก
          </Link>
          <h1 className="text-xl font-bold text-center text-white">เพิ่ม Logo ลงรูป</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Upload & Preview */}
          <div className="space-y-6">
            
            {/* Upload Images */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload size={20} />
                อัปโหลดรูปภาพ
              </h2>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const newImages = files.map(file => ({
                    file,
                    preview: URL.createObjectURL(file)
                  }));
                  setImages([...images, ...newImages]);
                }}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              />
              <p className="text-sm text-gray-500 mt-2">
                รองรับ JPG, PNG, WebP (สูงสุด 10 รูป)
              </p>
              
              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">รูปที่อัปโหลด ({images.length})</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img.preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                        <button
                          onClick={() => {
                            const newImages = images.filter((_, i) => i !== index);
                            setImages(newImages);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Logo */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                อัปโหลด Logo
              </h2>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setLogo({
                      file,
                      preview: URL.createObjectURL(file)
                    });
                  }
                }}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              />
              {logo && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Logo Preview</h3>
                  <div className="flex items-center gap-4">
                    <img src={logo.preview} alt="Logo Preview" className="w-32 h-32 object-contain border border-gray-300 rounded-lg bg-white" />
                    <button
                      onClick={() => setLogo(null)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      ลบ Logo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Process Button */}
            <button
              onClick={processImages}
              disabled={!logo || images.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ประมวลผลรูปภาพ
            </button>

            {/* Results */}
            {processedImages.length > 0 && (
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">ผลลัพธ์</h2>
                <div className="grid grid-cols-2 gap-4">
                  {processedImages.map((img, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-2">
                      <img 
                        src={img.processed} 
                        alt={`Result ${index + 1}`} 
                        className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => setPreviewImage(img.processed)}
                      />
                      <button
                        onClick={() => downloadImage(img.processed, `logo-watermark-${index + 1}.jpg`)}
                        className="mt-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        ดาวน์โหลด
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
                      ดาวน์โหลดทั้งหมด (ZIP)
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      ดาวน์โหลดรูป
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            
            {/* Logo Position */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">ตำแหน่ง Logo</h2>
              <div className="grid grid-cols-2 gap-3">
                {positionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLogoPosition(option.value)}
                    className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                      logoPosition === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Size */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">ขนาด Logo</h2>
              <div className="space-y-3">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLogoSize(option.value)}
                    className={`w-full p-3 border-2 rounded-lg font-semibold transition-all ${
                      logoSize === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Opacity */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings size={20} />
                ความโปร่งใส Logo
              </h2>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={logoOpacity}
                  onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>โปร่งใส</span>
                  <span className="font-bold text-purple-600">{Math.round(logoOpacity * 100)}%</span>
                  <span>ทึบ</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-800">วิธีใช้งาน</h2>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>1. อัปโหลดรูปภาพที่ต้องการเพิ่ม Logo</li>
                <li>2. อัปโหลด Logo ของคุณ (PNG, JPG)</li>
                <li>3. เลือกตำแหน่งและขนาด Logo</li>
                <li>4. ปรับความโปร่งใสของ Logo</li>
                <li>5. กดปุ่ม &ldquo;ประมวลผลรูปภาพ&rdquo;</li>
                <li>6. ดาวน์โหลดผลลัพธ์</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

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
