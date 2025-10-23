"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, Eye, Settings, Palette, Zap, Sparkles, X, Loader2, Play, Pause, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MicaMagneticPhotosPage() {
  const router = useRouter();
  
  // State variables
  const [uploadedImages, setUploadedImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedSize, setSelectedSize] = useState("type1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [imageZoom, setImageZoom] = useState(25);
  const [imagePositions, setImagePositions] = useState([]); // Array of positions for each image
  const [draggingIndex, setDraggingIndex] = useState(null); // Which image is being dragged
  const previewContainerRef = useRef(null);
  
  // ✅ เพิ่ม state สำหรับตัวเลือก AI
  const [useAIRemoveBG, setUseAIRemoveBG] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  
  // Customer info for checkout
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // ✅ เพิ่ม loading state สำหรับปุ่มสั่งซื้อ
  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false);

  // Initialize positions when images are processed
  React.useEffect(() => {
    if (processedImages.length > 0 && imagePositions.length !== processedImages.length) {
      const newPositions = processedImages.map((_, index) => ({
        x: 30 + (index * 15) % 50, // Distribute horizontally
        y: 30 + (index * 10) % 40  // Distribute vertically
      }));
      setImagePositions(newPositions);
    }
  }, [processedImages]);

  // Size templates based on the price list
  const sizeTemplates = [
    { 
      id: "type1", 
      name: "แบบที่ 1", 
      dimensions: "5x5 ซม.", 
      price: "30 บาท/ชิ้น",
      width: 200,
      height: 200,
      description: "รูปหัว"
    },
    { 
      id: "type2", 
      name: "แบบที่ 2", 
      dimensions: "5.4x7.8 ซม.", 
      price: "35 บาท/ชิ้น",
      width: 216,
      height: 312,
      description: "รูปเต็มตัว"
    },
    { 
      id: "type3", 
      name: "แบบที่ 3", 
      dimensions: "5.4x7.8 ซม.", 
      price: "30 บาท/ชิ้น",
      width: 216,
      height: 312,
      description: "รูปสี่เหลี่ยม"
    }
  ];

  // Background templates for slideshow
  const backgroundTemplates = [
    { id: "fridge1", name: "ตู้เย็น 1", image: "/bg-slide/ตู้เย็น.jpg" },
    { id: "fridge2", name: "ตู้เย็น 2", image: "/bg-slide/ตู้เย็น_2.jpg" },
    { id: "fridge3", name: "ตู้เย็น 3", image: "/bg-slide/ตู้เย็น_3.jpg" }
  ];

  const [selectedBackground, setSelectedBackground] = useState("fridge1");

  // Handle multiple image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map((file, index) => ({
        id: Date.now() + index,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        processed: false,
        processedUrl: null
      }));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  // Remove image from list
  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    setProcessedImages(prev => prev.filter(img => img.id !== id));
  };

  // Remove background using API
  const removeBackgroundAPI = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('http://localhost:8080/api/remove-bg', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.ok && result.download_url) {
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

  // Process all images
  const processAllImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsProcessingImages(true);
    const newProcessedImages = [];

    for (let i = 0; i < uploadedImages.length; i++) {
      const image = uploadedImages[i];
      try {
        let processedUrl;
        
        if (useAIRemoveBG) {
          // ✅ ใช้ AI remove background
          processedUrl = await removeBackgroundAPI(image.file);
        } else {
          // ✅ ไม่ใช้ AI - ใช้รูปต้นฉบับ
          processedUrl = image.url;
        }
        
        newProcessedImages.push({
          ...image,
          processed: true,
          processedUrl,
          usedAI: useAIRemoveBG
        });
        
        // Update progress
        setProcessedImages([...newProcessedImages]);
      } catch (error) {
        console.error(`Error processing image ${image.name}:`, error);
        // Add original image if AI fails
        newProcessedImages.push({
          ...image,
          processed: false,
          processedUrl: image.url,
          usedAI: false,
          error: error.message
        });
        setProcessedImages([...newProcessedImages]);
      }
    }

    setProcessedImages(newProcessedImages);
    setIsProcessingImages(false);
    
    // Auto show all images when processing is complete
    if (newProcessedImages.length > 0) {
      setIsShowingAll(true);
    }
  };

  // Download single image
  const downloadImage = (image) => {
    if (!image.processedUrl) return;

    const link = document.createElement('a');
    link.href = image.processedUrl;
    link.download = `mica-magnetic-${image.name}`;
    link.click();
  };

  // Download all images as ZIP
  const downloadAllImages = async () => {
    if (processedImages.length === 0) return;

    if (processedImages.length === 1) {
      downloadImage(processedImages[0]);
      return;
    }

    // For multiple images, create ZIP
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (let i = 0; i < processedImages.length; i++) {
      const image = processedImages[i];
      if (image.processedUrl) {
        const response = await fetch(image.processedUrl);
        const blob = await response.blob();
        zip.file(`mica-magnetic-${i + 1}-${image.name}`, blob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'mica-magnetic-photos.zip';
    link.click();
  };

  // Download scene with images (composite image)
  const downloadSceneWithImages = async () => {
    if (!previewContainerRef.current || processedImages.length === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match preview
    const width = 1200;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    try {
      // Load and draw background image
      const bgTemplate = backgroundTemplates.find(bg => bg.id === selectedBackground);
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
        bgImg.src = bgTemplate.image;
      });

      ctx.drawImage(bgImg, 0, 0, width, height);

      // Draw all processed images
      for (let i = 0; i < processedImages.length; i++) {
        const image = processedImages[i];
        const position = imagePositions[i];
        
        if (image.processedUrl && position) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = image.processedUrl;
          });

          // Calculate position and size
          const imgWidth = (width * imageZoom) / 100;
          const imgHeight = (height * imageZoom) / 100;
          const maxSize = Math.min(imgWidth, imgHeight, 400);
          
          const aspectRatio = img.width / img.height;
          let drawWidth = maxSize;
          let drawHeight = maxSize;
          
          if (aspectRatio > 1) {
            drawHeight = maxSize / aspectRatio;
          } else {
            drawWidth = maxSize * aspectRatio;
          }

          const x = (position.x / 100) * width - drawWidth / 2;
          const y = (position.y / 100) * height - drawHeight / 2;

          // Apply drop-shadow(2px 4px 6px black) effect
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 4;
          
          // Draw image with shadow
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Reset shadow for next image
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      }

      // Download
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `mica-scene-${Date.now()}.png`;
        link.click();
      });

    } catch (error) {
      console.error('Error creating scene:', error);
      alert('เกิดข้อผิดพลาดในการสร้างรูป กรุณาลองอีกครั้ง');
    }
  };


  // Toggle show all images
  const toggleShowAll = () => {
    setIsShowingAll(!isShowingAll);
  };

  // Proceed to checkout
  const proceedToCheckout = async () => {
    // ✅ ป้องกันการกดซ้ำ
    if (isProceedingToCheckout) {
      console.log('⚠️ Already proceeding to checkout, skipping...');
      return;
    }
    
    setIsProceedingToCheckout(true);
    
    try {
      // Validate customer info
      if (!customerName || !customerEmail) {
        alert('กรุณากรอกชื่อและอีเมลก่อนชำระเงิน');
        return;
      }

      if (processedImages.length === 0) {
        alert('กรุณาประมวลผลรูปภาพก่อนชำระเงิน');
        return;
      }

    // Capture scene as dataURL for checkout
    let sceneDataUrl = null;
    if (previewContainerRef.current && isShowingAll) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 800;
        const height = 800;
        canvas.width = width;
        canvas.height = height;

        // Load background
        const bgTemplate = backgroundTemplates.find(bg => bg.id === selectedBackground);
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve;
          bgImg.onerror = reject;
          bgImg.src = bgTemplate.image;
        });

        ctx.drawImage(bgImg, 0, 0, width, height);

        // Draw images
        for (let i = 0; i < processedImages.length; i++) {
          const image = processedImages[i];
          const position = imagePositions[i];
          
          if (image.processedUrl && position) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = image.processedUrl;
            });

            const maxSize = (width * imageZoom) / 100;
            const aspectRatio = img.width / img.height;
            let drawWidth = maxSize;
            let drawHeight = maxSize;
            
            if (aspectRatio > 1) {
              drawHeight = maxSize / aspectRatio;
            } else {
              drawWidth = maxSize * aspectRatio;
            }

            const x = (position.x / 100) * width - drawWidth / 2;
            const y = (position.y / 100) * height - drawHeight / 2;

            ctx.shadowColor = 'black';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        }

        sceneDataUrl = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error creating scene preview:', error);
      }
    }

    // Prepare checkout data
    const checkoutData = {
      customerName,
      customerEmail,
      customerPhone,
      productType: 'mica-magnetic-photos',
      quantity: processedImages.length,
      totalPrice: calculateTotalPrice(),
      sizeLabel: sizeTemplates.find(t => t.id === selectedSize)?.name,
      selectedSize,
      selectedBackground,
      imageZoom,
      imagePositions,
      fileUrls: processedImages.map(img => img.processedUrl),
      sceneUrl: sceneDataUrl
    };

      // Save to localStorage for checkout page
      localStorage.setItem('mica-checkout-data', JSON.stringify(checkoutData));
      
      // ✅ Clear old payment intent to force new one for new order
      localStorage.removeItem('mica-payment-intent');

      // Navigate to checkout
      router.push('/checkout');
      
    } catch (error) {
      console.error('Error in proceedToCheckout:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsProceedingToCheckout(false);
    }
  };

  // Handle mouse drag for image positioning
  const handleImageMouseDown = (e, index) => {
    e.stopPropagation();
    setDraggingIndex(index);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null || !previewContainerRef.current) return;
    
    const container = previewContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newPositions = [...imagePositions];
    newPositions[draggingIndex] = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
    setImagePositions(newPositions);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  // Handle touch drag for mobile
  const handleImageTouchStart = (e, index) => {
    e.stopPropagation();
    setDraggingIndex(index);
  };

  const handleTouchMove = (e) => {
    if (draggingIndex === null || !previewContainerRef.current) return;
    
    const touch = e.touches[0];
    const container = previewContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    const newPositions = [...imagePositions];
    newPositions[draggingIndex] = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
    setImagePositions(newPositions);
  };

  const handleTouchEnd = () => {
    setDraggingIndex(null);
  };

  // No auto-slideshow effect needed - showing all images at once

  // Calculate total price
  const calculateTotalPrice = () => {
    const template = sizeTemplates.find(t => t.id === selectedSize);
    const basePrice = template.price.includes('35') ? 35 : 30;
    return processedImages.length * basePrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧲 Mica Magnetic Photos
            </h1>
            <p className="text-gray-600">
              สร้างภาพถ่ายด้วยไมก้าแม่เหล็กของคุณเอง
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Upload & Settings */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Image Upload */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800">
                <Upload size={18} />
                อัปโหลดรูปภาพ
              </h3>
              
              <div className="space-y-3">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors text-sm"
                />
                
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">รูปที่อัปโหลด ({uploadedImages.length} รูป)</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                          <img src={image.url} alt={image.name} className="w-10 h-10 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{image.name}</p>
                            <p className="text-xs text-gray-500">
                              {image.processed ? '✅ ประมวลผลแล้ว' : '⏳ รอประมวลผล'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ AI Remove Background Option */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800">
                <Sparkles size={18} />
                ตัวเลือกการประมวลผล
              </h3>
              
              <div className="space-y-3">
                {/* AI Remove Background Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      useAIRemoveBG ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                    }`}>
                      {useAIRemoveBG && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">AI Remove Background</p>
                      <p className="text-xs text-gray-600">ลบพื้นหลังอัตโนมัติด้วย AI</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseAIRemoveBG(!useAIRemoveBG)}
                    className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                      useAIRemoveBG 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {useAIRemoveBG ? 'เปิด' : 'ปิด'}
                  </button>
                </div>

                {/* Processing Button */}
                {uploadedImages.length > 0 && (
                  <button
                    onClick={processAllImages}
                    disabled={isProcessingImages}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 text-sm ${
                      isProcessingImages
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}
                  >
                    {isProcessingImages ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        กำลังประมวลผล...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        {useAIRemoveBG ? 'ประมวลผลด้วย AI' : 'ประมวลผลรูปภาพ'}
                      </>
                    )}
                  </button>
                )}

                {/* Status Info */}
                <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border">
                  <p className="font-semibold mb-1">
                    {useAIRemoveBG ? '🤖 AI Mode' : '📷 Normal Mode'}
                  </p>
                  <p>
                    {useAIRemoveBG 
                      ? 'จะลบพื้นหลังอัตโนมัติด้วย AI (ใช้เวลานานขึ้น)'
                      : 'ใช้รูปต้นฉบับโดยไม่ลบพื้นหลัง (เร็ว)'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            {/* <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings size={20} />
                เลือกขนาด
              </h3>
              
              <div className="space-y-3">
                {sizeTemplates.map((template) => (
                  <label key={template.id} className="block">
                    <input
                      type="radio"
                      name="size"
                      value={template.id}
                      checked={selectedSize === template.id}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSize === template.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <p className="text-sm text-gray-500">{template.dimensions}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{template.price}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div> */}

            {/* Background Selection */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette size={20} />
                เลือกฉากหลังตู้เย็น
              </h3>
              
              <div className="space-y-3">
                {backgroundTemplates.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg.id)}
                    className={`w-full p-2 border-2 rounded-lg transition-all ${
                      selectedBackground === bg.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={bg.image}
                        alt={bg.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <p className="text-sm font-medium">{bg.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={processAllImages}
              disabled={uploadedImages.length === 0 || isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>กำลังประมวลผล...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>AI Remove Background</span>
                </>
              )}
            </button>

            {/* Price Summary */}
            {processedImages.length > 0 && (
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">สรุปราคา</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>จำนวนรูป:</span>
                    <span className="font-bold">{processedImages.length} รูป</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ราคาต่อรูป:</span>
                    <span className="font-bold">{sizeTemplates.find(t => t.id === selectedSize)?.price}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>รวม:</span>
                      <span className="text-purple-600">{calculateTotalPrice()} บาท</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Preview (ใหญ่ขึ้น) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 lg:self-start">
            
            {/* Slideshow Preview */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Preview บนตู้เย็น</h3>
                <button
                  onClick={toggleShowAll}
                  disabled={processedImages.length === 0}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 ${
                    isShowingAll 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isShowingAll ? 'ซ่อนรูป' : 'แสดงทั้งหมด'}
                </button>
              </div>

              {isProcessing ? (
                <div className="w-full h-80 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
                    <div className="text-lg font-semibold text-gray-700">กำลังประมวลผล...</div>
                    <div className="text-sm text-gray-500">กรุณารอสักครู่</div>
                  </div>
                </div>
              ) : processedImages.length > 0 ? (
                <div className="relative space-y-3">
                  {/* Zoom Control */}
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-gray-300">
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">ขนาด:</span>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      value={imageZoom}
                      onChange={(e) => setImageZoom(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-sm font-bold text-purple-600 min-w-[50px] text-right">{imageZoom}%</span>
                  </div>

                  <div 
                    ref={previewContainerRef}
                    className="w-full h-[500px] rounded-lg border-2 border-gray-300 relative overflow-hidden select-none"
                    style={{ 
                      backgroundImage: `url(${backgroundTemplates.find(bg => bg.id === selectedBackground)?.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {!isShowingAll ? (
                      <div className="absolute inset-0 flex items-center justify-center text-center text-white bg-black bg-opacity-30">
                        <div>
                          <Eye size={48} className="mx-auto mb-2" />
                          <p className="font-semibold">กด &quot;แสดงทั้งหมด&quot; เพื่อดูรูป</p>
                          <p className="text-sm mt-1">ลากรูปเพื่อจัดตำแหน่งบนตู้เย็น</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Show all images at once */}
                        {processedImages.map((image, index) => (
                          <img
                            key={image.id}
                            src={image.processedUrl}
                            alt={`Image ${index + 1}`}
                            className="absolute object-contain transition-all duration-100"
                            style={{
                              filter: 'drop-shadow(2px 4px 6px black)',
                              width: `${imageZoom}%`,
                              height: `${imageZoom}%`,
                              maxWidth: '200px',
                              maxHeight: '200px',
                              left: `${imagePositions[index]?.x || 50}%`,
                              top: `${imagePositions[index]?.y || 50}%`,
                              transform: 'translate(-50%, -50%)',
                              cursor: draggingIndex === index ? 'grabbing' : 'grab',
                              zIndex: draggingIndex === index ? 10 : 1
                            }}
                            draggable={false}
                            onMouseDown={(e) => handleImageMouseDown(e, index)}
                            onTouchStart={(e) => handleImageTouchStart(e, index)}
                          />
                        ))}
                        
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                          {processedImages.length} รูป - ลากเพื่อย้าย
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-80 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Upload size={48} className="mx-auto mb-2" />
                    <p>อัปโหลดรูปเพื่อดู Preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download with Scene Button */}
            {processedImages.length > 0 && isShowingAll && (
              <button
                onClick={downloadSceneWithImages}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                <Download size={20} />
                <span>ดาวน์โหลดรูปพร้อมฉาก</span>
              </button>
            )}
          </div>

          {/* Right Column - Download & Info */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Customer Info Form */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800">
                <User size={18} />
                ข้อมูลสำหรับสั่งซื้อ
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ชื่อของคุณ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Download ZIP Button */}
            {processedImages.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800">
                  <Download size={18} />
                  ดาวน์โหลดฟรี
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={downloadAllImages}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Download size={18} />
                    <span>ดาวน์โหลดทั้งหมด (ZIP)</span>
                  </button>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">จำนวนรูป:</span>
                        <span className="font-bold text-blue-600">{processedImages.length} รูป</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">ราคาต่อรูป:</span>
                        <span className="font-bold text-gray-800">{sizeTemplates.find(t => t.id === selectedSize)?.price}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between text-lg">
                          <span className="font-bold text-gray-800">รวมทั้งหมด:</span>
                          <span className="font-bold text-blue-600">{calculateTotalPrice()} บาท</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={proceedToCheckout}
                    disabled={!customerName || !customerEmail || isProceedingToCheckout}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {isProceedingToCheckout ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>กำลังเตรียมการชำระเงิน...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        <span>สั่งซื้อและชำระเงิน</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    💡 หรือดาวน์โหลดฟรีด้านบน (ไม่มี Mica แม่เหล็ก)
                  </p>
                </div>
              </div>
            )}

            {/* Image List Summary */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">รายการรูป</h3>
              
              {processedImages.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {processedImages.map((image, index) => (
                    <div key={image.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <img 
                        src={image.processedUrl} 
                        alt={image.name} 
                        className="w-12 h-12 object-cover rounded border-2 border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{image.name}</p>
                        <p className="text-xs text-gray-500">รูปที่ {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Sparkles size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ยังไม่มีรูปที่ประมวลผลแล้ว</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
