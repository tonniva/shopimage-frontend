"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Download, PawPrint, Settings, Phone, Mail, MessageCircle, Globe, Square, Heart, Star, Upload, X, Image as ImageIcon } from "lucide-react";

export default function PetTagMaker() {
  // Pet Info
  const [petName, setPetName] = useState("");
  const [line1, setLine1] = useState("If Lost");
  const [line2, setLine2] = useState("Please Call:");
  const [phone, setPhone] = useState("");
  
  // Contact Type
  const [contactType, setContactType] = useState("phone");
  const [contactData, setContactData] = useState("");
  
  // Design Settings
  const [tagSize, setTagSize] = useState(30); // mm
  const [frontBgColor, setFrontBgColor] = useState("#FFFFFF");
  const [frontTextColor, setFrontTextColor] = useState("#000000");
  const [backBgColor, setBackBgColor] = useState("#FFFFFF");
  
  // QR Settings
  const [qrShape, setQrShape] = useState("square");
  const [qrStyle, setQrStyle] = useState("rounded");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrSize, setQrSize] = useState(70); // percentage
  
  // Pet Photo Settings
  const [petPhoto, setPetPhoto] = useState(null);
  const [photoLayout, setPhotoLayout] = useState("top"); // "top" (Option 4), "beside" (Option 3), "collar" (Option 5)
  const [photoShape, setPhotoShape] = useState("rounded"); // "square", "rounded", "circle"
  const [photoSize, setPhotoSize] = useState(40); // percentage
  
  // Collar Tag Settings (Option 5)
  const [collarSize, setCollarSize] = useState({ width: 80, height: 25, label: "Medium" });
  const [textAlign, setTextAlign] = useState("left"); // "left", "center", "right"
  
  // Emoji Picker
  const [showEmojiFor, setShowEmojiFor] = useState(null);
  
  // Preview
  const [currentSide, setCurrentSide] = useState("front"); // front or back
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const qrRef = useRef(null);
  
  // Pet-themed emojis for different fields
  const petEmojis = {
    name: ['🐕', '🐶', '🐩', '🦮', '🐕‍🦺', '🐈', '🐱', '😺', '😸', '😻', '🐾', '❤️', '⭐', '👑', '💎', '🔔', '🦴', '🏠'],
    line1: ['🆘', '⚠️', '📍', '🏠', '📞', '💙', '❤️', '🔔', '⭐', '✨', '👋', '🙏', '💕', '🐾', '📱', '☎️'],
    line2: ['📱', '☎️', '📞', '💬', '📧', '🆘', '⚠️', '👋', '🙏', '💙', '📍', '🏠', '❤️', '✨', '💕', '🐾'],
    phone: ['📱', '☎️', '📞', '💬', '📧', '🆘', '⚠️'],
  };

  const contactTypes = [
    { value: "phone", label: "Phone", icon: Phone, placeholder: "081-234-5678", prefix: "tel:" },
    { value: "line", label: "LINE", icon: MessageCircle, placeholder: "line.me/ti/p/abc123", prefix: "" },
    { value: "email", label: "Email", icon: Mail, placeholder: "owner@email.com", prefix: "mailto:" },
    { value: "website", label: "Website", icon: Globe, placeholder: "https://...", prefix: "" },
  ];

  const tagSizes = [
    { value: 20, label: "Mini", desc: "20mm (Cat)" },
    { value: 25, label: "Small", desc: "25mm (Coin size)" },
    { value: 30, label: "Medium", desc: "30mm (Standard)" },
    { value: 40, label: "Large", desc: "40mm (Big dog)" },
    { value: 50, label: "XL", desc: "50mm (Extra large)" },
  ];

  const qrShapes = [
    { value: "square", label: "Square", icon: Square },
    { value: "rounded", label: "Rounded", icon: Square },
  ];

  const collarTagSizes = [
    { width: 60, height: 20, label: "Small Collar", desc: "60x20mm (Cat/Small dog)" },
    { width: 80, height: 25, label: "Medium Collar", desc: "80x25mm (Medium dog)" },
    { width: 100, height: 30, label: "Large Collar", desc: "100x30mm (Large dog)" },
  ];

  const qrStyles = [
    { value: "square", label: "Classic", preview: "■" },
    { value: "rounded", label: "Rounded", preview: "●" },
    { value: "dots", label: "Dots", preview: "·" },
    { value: "classy", label: "Elegant", preview: "◆" },
  ];

  const formatContactData = () => {
    const type = contactTypes.find(t => t.value === contactType);
    if (!type) return contactData;
    
    let data = contactData.trim();
    
    if (contactType === "phone") {
      const cleaned = data.replace(/[^0-9]/g, '');
      return `tel:+66${cleaned.substring(1)}`;
    }
    
    if (contactType === "email") {
      return `mailto:${data}`;
    }
    
    if (contactType === "line") {
      if (!data.startsWith('http')) {
        return `https://${data}`;
      }
    }
    
    return data;
  };

  const generateQRCode = async () => {
    // Dynamic import for client-side only
    const QRCodeStyling = (await import('qr-code-styling')).default;
    
    const qrData = formatContactData();
    
    const qr = new QRCodeStyling({
      width: 1000,
      height: 1000,
      data: qrData,
      dotsOptions: {
        color: qrColor,
        type: qrStyle
      },
      cornersSquareOptions: {
        type: qrStyle === "square" ? "square" : "extra-rounded",
        color: qrColor
      },
      cornersDotOptions: {
        type: qrStyle === "square" ? "square" : "dot",
        color: qrColor
      },
      backgroundOptions: {
        color: backBgColor
      },
      qrOptions: {
        errorCorrectionLevel: "M"
      }
    });

    return qr;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPetPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawFrontSide = () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    
    const dpi = 300;
    
    // Check if collar layout (rectangular)
    if (photoLayout === 'collar') {
      const widthPx = (collarSize.width / 25.4) * dpi;
      const heightPx = (collarSize.height / 25.4) * dpi;
      
      canvas.width = widthPx;
      canvas.height = heightPx;
      
      const ctx = canvas.getContext('2d');
      
      // Background
      ctx.fillStyle = frontBgColor;
      ctx.fillRect(0, 0, widthPx, heightPx);
      
      // Draw Pet Photo (if uploaded) - left side
      if (petPhoto) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // Photo on left (square, taking 80% of height)
          const photoSize = heightPx * 0.8;
          const photoX = heightPx * 0.1;
          const photoY = (heightPx - photoSize) / 2;
          
          ctx.save();
          
          // Apply shape clipping
          if (photoShape === 'circle') {
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
            ctx.clip();
          } else if (photoShape === 'rounded') {
            const radius = photoSize * 0.15;
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoSize, photoSize, radius);
            ctx.clip();
          }
          
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          ctx.restore();
          
          // Border
          ctx.strokeStyle = frontTextColor;
          ctx.lineWidth = heightPx * 0.015;
          if (photoShape === 'circle') {
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
            ctx.stroke();
          } else if (photoShape === 'rounded') {
            const radius = photoSize * 0.15;
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoSize, photoSize, radius);
            ctx.stroke();
          } else {
            ctx.strokeRect(photoX, photoY, photoSize, photoSize);
          }
          
          // Text beside photo (alignment based on textAlign state)
          ctx.fillStyle = frontTextColor;
          
          const textCenterY = heightPx / 2;
          let textX;
          
          if (textAlign === 'left') {
            ctx.textAlign = 'left';
            textX = photoX + photoSize + heightPx * 0.15;
          } else if (textAlign === 'center') {
            ctx.textAlign = 'center';
            textX = photoX + photoSize + (widthPx - photoX - photoSize) / 2;
          } else { // right
            ctx.textAlign = 'right';
            textX = widthPx - heightPx * 0.15;
          }
          
          // Pet Name (top)
          ctx.font = `bold ${heightPx * 0.30}px Kanit`;
          ctx.fillText(petName || "NAME", textX, textCenterY - heightPx * 0.05);
          
          // Phone (below name)
          ctx.font = `bold ${heightPx * 0.22}px Kanit`;
          ctx.fillText(phone || "081-234-5678", textX, textCenterY + heightPx * 0.25);
        };
        img.src = petPhoto;
      } else {
        // No photo - text only (horizontal layout with alignment)
        ctx.fillStyle = frontTextColor;
        ctx.textAlign = textAlign;
        
        let textX;
        if (textAlign === 'left') {
          textX = widthPx * 0.1;
        } else if (textAlign === 'center') {
          textX = widthPx / 2;
        } else { // right
          textX = widthPx * 0.9;
        }
        
        ctx.font = `bold ${heightPx * 0.35}px Kanit`;
        ctx.fillText(petName || "NAME", textX, heightPx * 0.42);
        ctx.font = `bold ${heightPx * 0.25}px Kanit`;
        ctx.fillText(phone || "081-234-5678", textX, heightPx * 0.72);
      }
      
      return; // Exit early for collar layout
    }
    
    // Regular round tag layout
    const sizeInPixels = (tagSize / 25.4) * dpi;
    
    canvas.width = sizeInPixels;
    canvas.height = sizeInPixels;
    
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = frontBgColor;
    ctx.fillRect(0, 0, sizeInPixels, sizeInPixels);
    
    // Draw Pet Photo (if uploaded)
    if (petPhoto) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (photoLayout === 'top') {
          // Option 4: Photo at top
          const photoHeight = sizeInPixels * (photoSize / 100);
          const photoWidth = photoHeight;
          const photoX = (sizeInPixels - photoWidth) / 2;
          const photoY = sizeInPixels * 0.05;
          
          ctx.save();
          
          // Apply shape clipping
          if (photoShape === 'circle') {
            ctx.beginPath();
            ctx.arc(sizeInPixels / 2, photoY + photoHeight / 2, photoHeight / 2, 0, Math.PI * 2);
            ctx.clip();
          } else if (photoShape === 'rounded') {
            const radius = photoWidth * 0.15;
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoWidth, photoHeight, radius);
            ctx.clip();
          }
          
          // Draw photo
          ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
          ctx.restore();
          
          // Draw border
          ctx.strokeStyle = frontTextColor;
          ctx.lineWidth = sizeInPixels * 0.005;
          if (photoShape === 'circle') {
            ctx.beginPath();
            ctx.arc(sizeInPixels / 2, photoY + photoHeight / 2, photoHeight / 2, 0, Math.PI * 2);
            ctx.stroke();
          } else if (photoShape === 'rounded') {
            const radius = photoWidth * 0.15;
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoWidth, photoHeight, radius);
            ctx.stroke();
          } else {
            ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
          }
          
          // Text below photo
          ctx.fillStyle = frontTextColor;
          ctx.textAlign = 'center';
          
          const textStartY = photoY + photoHeight + sizeInPixels * 0.12;
          
          // Pet Name
          ctx.font = `bold ${sizeInPixels * 0.10}px Kanit`;
          ctx.fillText(petName || "NAME", sizeInPixels / 2, textStartY);
          
          // Line 1
          ctx.font = `${sizeInPixels * 0.05}px Kanit`;
          ctx.fillText(line1, sizeInPixels / 2, textStartY + sizeInPixels * 0.10);
          
          // Line 2
          ctx.fillText(line2, sizeInPixels / 2, textStartY + sizeInPixels * 0.16);
          
          // Phone
          ctx.font = `bold ${sizeInPixels * 0.07}px Kanit`;
          ctx.fillText(phone, sizeInPixels / 2, textStartY + sizeInPixels * 0.25);
          
          // Paw icon
          ctx.font = `${sizeInPixels * 0.12}px Arial`;
          ctx.fillText('🐾', sizeInPixels / 2, textStartY + sizeInPixels * 0.38);
          
        } else {
          // Option 3: Photo beside name
          const photoSize = sizeInPixels * 0.25;
          const photoX = sizeInPixels * 0.10;
          const photoY = sizeInPixels * 0.10;
          
          ctx.save();
          
          // Apply shape clipping
          if (photoShape === 'circle') {
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
            ctx.clip();
          } else if (photoShape === 'rounded') {
            const radius = photoSize * 0.15;
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoSize, photoSize, radius);
            ctx.clip();
          }
          
          // Draw photo
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          ctx.restore();
          
          // Draw border
          ctx.strokeStyle = frontTextColor;
          ctx.lineWidth = sizeInPixels * 0.005;
          if (photoShape === 'circle') {
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
            ctx.stroke();
          } else if (photoShape === 'rounded') {
            const radius = photoSize * 0.15;
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoSize, photoSize, radius);
            ctx.stroke();
          } else {
            ctx.strokeRect(photoX, photoY, photoSize, photoSize);
          }
          
          // Text beside photo
          ctx.fillStyle = frontTextColor;
          ctx.textAlign = 'left';
          
          const textX = photoX + photoSize + sizeInPixels * 0.05;
          const nameY = photoY + photoSize * 0.35;
          
          // Pet Name (beside photo)
          ctx.font = `bold ${sizeInPixels * 0.09}px Kanit`;
          ctx.fillText(petName || "NAME", textX, nameY);
          
          // Text below (centered)
          ctx.textAlign = 'center';
          
          // Line 1
          ctx.font = `${sizeInPixels * 0.05}px Kanit`;
          ctx.fillText(line1, sizeInPixels / 2, sizeInPixels * 0.45);
          
          // Line 2
          ctx.fillText(line2, sizeInPixels / 2, sizeInPixels * 0.52);
          
          // Phone
          ctx.font = `bold ${sizeInPixels * 0.07}px Kanit`;
          ctx.fillText(phone, sizeInPixels / 2, sizeInPixels * 0.65);
          
          // Paw icon
          ctx.font = `${sizeInPixels * 0.12}px Arial`;
          ctx.fillText('🐾', sizeInPixels / 2, sizeInPixels * 0.85);
        }
      };
      img.src = petPhoto;
    } else {
      // No photo - original layout
      ctx.fillStyle = frontTextColor;
      ctx.textAlign = 'center';
      
      // Pet Name (large)
      ctx.font = `bold ${sizeInPixels * 0.12}px Kanit`;
      ctx.fillText(petName || "NAME", sizeInPixels / 2, sizeInPixels * 0.25);
      
      // Line 1
      ctx.font = `${sizeInPixels * 0.06}px Kanit`;
      ctx.fillText(line1, sizeInPixels / 2, sizeInPixels * 0.40);
      
      // Line 2
      ctx.fillText(line2, sizeInPixels / 2, sizeInPixels * 0.50);
      
      // Phone (larger)
      ctx.font = `bold ${sizeInPixels * 0.08}px Kanit`;
      ctx.fillText(phone, sizeInPixels / 2, sizeInPixels * 0.65);
      
      // Paw icon
      ctx.font = `${sizeInPixels * 0.15}px Arial`;
      ctx.fillText('🐾', sizeInPixels / 2, sizeInPixels * 0.85);
    }
  };

  const drawBackSide = async () => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    
    const dpi = 300;
    const sizeInPixels = (tagSize / 25.4) * dpi;
    
    canvas.width = sizeInPixels;
    canvas.height = sizeInPixels;
    
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = backBgColor;
    ctx.fillRect(0, 0, sizeInPixels, sizeInPixels);
    
    // Generate QR Code
    if (contactData) {
      try {
        const qr = await generateQRCode();
        
        // Create temporary div for QR
        const tempDiv = document.createElement('div');
        qr.append(tempDiv);
        
        // Wait for QR to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const qrCanvas = tempDiv.querySelector('canvas');
        if (qrCanvas) {
          const qrSizePixels = sizeInPixels * (qrSize / 100);
          const qrX = (sizeInPixels - qrSizePixels) / 2;
          const qrY = (sizeInPixels - qrSizePixels) / 3;
          
          // Apply shape mask (removed circle to ensure QR code is scannable)
          if (qrShape === 'rounded') {
            ctx.save();
            const radius = qrSizePixels * 0.1;
            ctx.beginPath();
            ctx.roundRect(qrX, qrY, qrSizePixels, qrSizePixels, radius);
            ctx.clip();
            ctx.drawImage(qrCanvas, qrX, qrY, qrSizePixels, qrSizePixels);
            ctx.restore();
          } else {
            // square - draw directly without clipping
            ctx.drawImage(qrCanvas, qrX, qrY, qrSizePixels, qrSizePixels);
          }
        }
        
        tempDiv.remove();
      } catch (error) {
        console.error('Error generating QR:', error);
      }
    }
    
    // Bottom text
    ctx.fillStyle = frontTextColor;
    ctx.textAlign = 'center';
    ctx.font = `${sizeInPixels * 0.05}px Kanit`;
    ctx.fillText('Scan to Contact', sizeInPixels / 2, sizeInPixels * 0.85);
  };

  useEffect(() => {
    const updatePreviews = async () => {
      drawFrontSide();
      await drawBackSide();
    };
    
    updatePreviews();
  }, [petName, line1, line2, phone, contactData, tagSize, frontBgColor, frontTextColor, backBgColor, qrShape, qrStyle, qrColor, qrSize, petPhoto, photoLayout, photoShape, photoSize, collarSize, textAlign]);

  const downloadSide = (side) => {
    const canvas = side === 'front' ? frontCanvasRef.current : backCanvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `pet-tag-${side}-${petName || 'unnamed'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadBoth = () => {
    downloadSide('front');
    setTimeout(() => downloadSide('back'), 500);
  };

  // Function to add emoji to field
  const addEmojiToField = (field, emoji) => {
    if (field === 'name') setPetName(prev => prev + emoji);
    else if (field === 'phone') setPhone(prev => prev + emoji);
    else if (field === 'line1') setLine1(prev => prev + emoji);
    else if (field === 'line2') setLine2(prev => prev + emoji);
    setShowEmojiFor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-black   top-0 z-0 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-pink-200 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-xl font-bold text-center text-white">Pet Tag Maker</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Input */}
          <div className="space-y-6">
            
            {/* Pet Info */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PawPrint size={20} />
                Pet Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Pet Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="BUDDY"
                      className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiFor(showEmojiFor === 'name' ? null : 'name')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-125 transition-all duration-200 hover:rotate-12"
                      title="Add Emoji"
                    >
                      😊
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiFor(showEmojiFor === 'phone' ? null : 'phone')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-125 transition-all duration-200 hover:rotate-12"
                      title="Add Emoji"
                    >
                      😊
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Line 1 Text</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="If Lost"
                      className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiFor(showEmojiFor === 'line1' ? null : 'line1')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-125 transition-all duration-200 hover:rotate-12"
                      title="Add Emoji"
                    >
                      😊
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Line 2 Text</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      placeholder="Please Call:"
                      className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiFor(showEmojiFor === 'line2' ? null : 'line2')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-125 transition-all duration-200 hover:rotate-12"
                      title="Add Emoji"
                    >
                      😊
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pet Photo Upload */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Pet Photo (Optional)
              </h2>
              
              {/* Upload Button */}
              <div className="mb-4">
                <label className="block w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 cursor-pointer transition-colors">
                    {petPhoto ? (
                      <div className="relative inline-block">
                        <img src={petPhoto} alt="Pet" className="w-32 h-32 object-cover mx-auto rounded-lg" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setPetPhoto(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-semibold">Upload Pet Photo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (Recommended 500x500px)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
              
              {/* Layout Selector (only if photo uploaded) */}
              {petPhoto && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-3">Layout Style</label>
                    <div className="space-y-3">
                      <button
                        onClick={() => setPhotoLayout('top')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                          photoLayout === 'top'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            photoLayout === 'top' ? 'border-purple-500' : 'border-gray-400'
                          }`}>
                            {photoLayout === 'top' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">Photo on Top (Option 4)</p>
                            <p className="text-xs text-gray-600 mt-1">Large photo at top + text below</p>
                          
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setPhotoLayout('beside')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                          photoLayout === 'beside'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            photoLayout === 'beside' ? 'border-purple-500' : 'border-gray-400'
                          }`}>
                            {photoLayout === 'beside' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">Photo Beside Name (Option 3)</p>
                            <p className="text-xs text-gray-600 mt-1">Small photo beside name + text below</p>
                          
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setPhotoLayout('collar')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                          photoLayout === 'collar'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            photoLayout === 'collar' ? 'border-purple-500' : 'border-gray-400'
                          }`}>
                            {photoLayout === 'collar' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">📎 Attach to Collar Strap (Option 5)</p>
                            <p className="text-xs text-gray-600 mt-1">Rectangular tag for collar attachment</p>
                            <div className="mt-2 text-[10px] leading-tight text-gray-500 font-mono">
                              ┌────────────────┐<br/>
                              │ 📸 NAME Phone  │<br/>
                              └────────────────┘
                            </div>
                            
                            {/* Collar Preview */}
                            {photoLayout === 'collar' && (
                              <div className="mt-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                                <div className="text-[10px] text-center text-amber-800 font-semibold mb-2">
                                  On Collar:
                                </div>
                                <div className="relative">
                                  {/* Collar strap */}
                                  <div className="h-12 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 rounded-lg shadow-lg relative overflow-hidden">
                                    {/* Stitching */}
                                    <div className="absolute top-2 left-0 right-0 border-t border-dashed border-amber-950 opacity-40"></div>
                                    <div className="absolute bottom-2 left-0 right-0 border-t border-dashed border-amber-950 opacity-40"></div>
                                    
                                    {/* Buckle holes */}
                                    <div className="absolute inset-0 flex items-center justify-around px-4">
                                      {[...Array(10)].map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 bg-amber-950 rounded-full"></div>
                                      ))}
                                    </div>
                                    
                                    {/* Bell 🔔 */}
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl">
                                      🔔
                                    </div>
                                    
                                    {/* D-Ring */}
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 border-2 border-gray-400 rounded-full bg-gradient-to-br from-gray-300 to-gray-500"></div>
                                    
                                    {/* Tag on collar */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                      <div className="bg-white border-2 border-gray-800 rounded px-4 py-1.5 shadow-xl">
                                        <div className="flex items-center gap-2">
                                          <div className="text-xs">📸</div>
                                          <div className="text-left">
                                            <div className="text-[9px] font-bold text-gray-800 leading-tight">{petName || "BUDDY"}</div>
                                            <div className="text-[8px] text-gray-600 leading-tight">{phone || "081-xxx"}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <p className="text-[9px] text-center text-amber-700 mt-2">
                                    💡 Tag will attach to collar like this
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Collar Size Selector (only for collar layout) */}
                  {photoLayout === 'collar' && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Tag Size (for Collar Strap)</label>
                      <div className="space-y-2">
                        {collarTagSizes.map((size) => (
                          <button
                            key={`${size.width}x${size.height}`}
                            onClick={() => setCollarSize(size)}
                            className={`w-full p-3 border-2 rounded-lg font-semibold transition-all text-left ${
                              collarSize.width === size.width && collarSize.height === size.height
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            <span className="font-bold">{size.label}</span>
                            <span className="text-xs text-gray-600 ml-2">{size.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Text Alignment (only for collar layout) */}
                  {photoLayout === 'collar' && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Text Alignment</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setTextAlign('left')}
                          className={`p-3 border-2 rounded-lg font-semibold transition-all text-center ${
                            textAlign === 'left'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-xl mb-1">⬅️</div>
                          <div className="text-[10px]">Left</div>
                        </button>
                        <button
                          onClick={() => setTextAlign('center')}
                          className={`p-3 border-2 rounded-lg font-semibold transition-all text-center ${
                            textAlign === 'center'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-xl mb-1">↕️</div>
                          <div className="text-[10px]">Center</div>
                        </button>
                        <button
                          onClick={() => setTextAlign('right')}
                          className={`p-3 border-2 rounded-lg font-semibold transition-all text-center ${
                            textAlign === 'right'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-xl mb-1">➡️</div>
                          <div className="text-[10px]">Right</div>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Photo Shape */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Photo Shape</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPhotoShape('square')}
                        className={`p-3 border-2 rounded-lg font-semibold transition-all text-center ${
                          photoShape === 'square'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl">⬜</div>
                        <div className="text-[10px] mt-1">Square</div>
                      </button>
                      <button
                        onClick={() => setPhotoShape('rounded')}
                        className={`p-3 border-2 rounded-lg font-semibold transition-all text-center ${
                          photoShape === 'rounded'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl">▢</div>
                        <div className="text-[10px] mt-1">Rounded</div>
                      </button>
                      <button
                        onClick={() => setPhotoShape('circle')}
                        className={`p-3 border-2 rounded-lg font-semibold transition-all text-center ${
                          photoShape === 'circle'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl">⭕</div>
                        <div className="text-[10px] mt-1">Circle</div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Photo Size (only for "top" layout) */}
                  {photoLayout === 'top' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Photo Size ({photoSize}%)
                      </label>
                      <input
                        type="range"
                        min="25"
                        max="50"
                        value={photoSize}
                        onChange={(e) => setPhotoSize(parseInt(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Small</span>
                        <span>Large</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Contact Method */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Contact Method (QR Code)</h2>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {contactTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setContactType(type.value)}
                      className={`p-3 border-2 rounded-lg font-semibold transition-all flex flex-col items-center gap-1 ${
                        contactType === type.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <input
                type="text"
                value={contactData}
                onChange={(e) => setContactData(e.target.value)}
                placeholder={contactTypes.find(t => t.value === contactType)?.placeholder}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                QR Code will link to {contactTypes.find(t => t.value === contactType)?.label}
              </p>
            </div>

            {/* Size */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Tag Size</h2>
              
              <div className="space-y-2">
                {tagSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setTagSize(size.value)}
                    className={`w-full p-3 border-2 rounded-lg font-semibold transition-all text-left ${
                      tagSize === size.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <span className="font-bold">{size.label}</span>
                    <span className="text-xs text-gray-600 ml-2">{size.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column - Preview (  on desktop) */}
          <div className="space-y-6 lg:  lg:top-24 lg:self-start">
            
            {/* Side Toggle */}
            <div className="bg-white border-2 border-black rounded-xl p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentSide('front')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    currentSide === 'front'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Front Side
                </button>
                <button
                  onClick={() => setCurrentSide('back')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    currentSide === 'back'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Back Side
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">
                Preview {currentSide === 'front' ? 'Front' : 'Back'}
              </h2>
              
              <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg">
                <div className="relative">
                  <canvas
                    ref={frontCanvasRef}
                    className={`border-2 border-black shadow-2xl ${currentSide === 'front' ? 'block' : 'hidden'}`}
                    style={{
                      maxWidth: '300px',
                      maxHeight: '300px',
                      borderRadius: qrShape === 'circle' ? '50%' : qrShape === 'rounded' ? '20px' : '0'
                    }}
                  />
                  <canvas
                    ref={backCanvasRef}
                    className={`border-2 border-black shadow-2xl ${currentSide === 'back' ? 'block' : 'hidden'}`}
                    style={{
                      maxWidth: '300px',
                      maxHeight: '300px',
                      borderRadius: qrShape === 'circle' ? '50%' : qrShape === 'rounded' ? '20px' : '0'
                    }}
                  />
                </div>
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                📏 Actual size: {tagSize}mm × {tagSize}mm
              </p>
            </div>

            {/* Download Buttons */}
            <div className="bg-white border-2 border-black rounded-xl p-6 space-y-3">
              <button
                onClick={() => downloadSide('front')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download Front
              </button>
              
              <button
                onClick={() => downloadSide('back')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download Back
              </button>
              
              <button
                onClick={downloadBoth}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download Both Sides
              </button>
            </div>
          </div>

          {/* Right Column - Design Settings */}
          <div className="space-y-6">
            
            {/* Colors */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Front Colors</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-2">Background</label>
                  <input
                    type="color"
                    value={frontBgColor}
                    onChange={(e) => setFrontBgColor(e.target.value)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Text Color</label>
                  <input
                    type="color"
                    value={frontTextColor}
                    onChange={(e) => setFrontTextColor(e.target.value)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* QR Shape */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">QR Code Shape</h2>
              
              <div className="grid grid-cols-3 gap-2">
                {qrShapes.map((shape) => {
                  const Icon = shape.icon;
                  return (
                    <button
                      key={shape.value}
                      onClick={() => setQrShape(shape.value)}
                      className={`p-3 border-2 rounded-lg font-semibold transition-all flex flex-col items-center gap-2 ${
                        qrShape === shape.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs">{shape.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QR Style */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">QR Code Style</h2>
              
              <div className="grid grid-cols-2 gap-2">
                {qrStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setQrStyle(style.value)}
                    className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                      qrStyle === style.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.preview}</div>
                    <div className="text-xs">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* QR Settings */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">QR Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    QR Size ({qrSize}%)
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="90"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">QR Code Color</label>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Background Color</label>
                  <input
                    type="color"
                    value={backBgColor}
                    onChange={(e) => setBackBgColor(e.target.value)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-800">How to Use</h2>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>1. Enter pet information</li>
                <li>2. Choose contact method (Phone, LINE, etc.)</li>
                <li>3. Select tag size</li>
                <li>4. Customize colors and QR shape</li>
                <li>5. Download both sides</li>
                <li>6. Print and attach to collar</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      
      {/* Global Emoji Picker Popup */}
      {showEmojiFor && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowEmojiFor(null)}
          />
          
          {/* Emoji Panel */}
          <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-purple-500 rounded-xl shadow-2xl p-4 w-80 animate-slideDown">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-purple-700 flex items-center gap-2">
                <span>✨</span>
                Select Emoji
              </span>
              <button
                type="button"
                onClick={() => setShowEmojiFor(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Emoji Grid */}
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {petEmojis[showEmojiFor]?.map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addEmojiToField(showEmojiFor, emoji)}
                  className="text-2xl hover:bg-purple-50 rounded-lg p-2 transition-all hover:scale-125 active:scale-95"
                  title="Add emoji"
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {/* Helper Text */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                💡 Click to add emoji to text
              </p>
            </div>
          </div>
        </>
      )}
      
      <div ref={qrRef} className="hidden"></div>
    </div>
  );
}

