"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthHeader } from "@/components/AuthHeader";
import { ImageIcon, FileText, QrCode, Image as ImageIconLucide, Film, Layers, PawPrint, Bed, Magnet, Scissors, Menu, X, Home } from "lucide-react";

// Professional UX/UI optimized header
export default function AppHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const LOGO = "/logo.png";
  const BMAC_URL = "https://www.buymeacoffee.com/mulufabo";

  // Mobile menu items
  const mobileMenuItems = [
    { href: "/", icon: ImageIcon, label: "IMG to WEBP", color: "blue" },
    { href: "/pdf-converter", icon: FileText, label: "PDF to JPG", color: "red" },
    // { href: "/property-snap", icon: Home, label: "Property Snap", color: "indigo" },
    { href: "/add-qr-to-image", icon: QrCode, label: "Add QR Code", color: "purple" },
    { href: "/add-logo-to-image", icon: ImageIconLucide, label: "Add Logo", color: "green" },
    { href: "/gif-maker", icon: Film, label: "GIF Maker", color: "orange" },
    { href: "/pdf-merger", icon: Layers, label: "PDF Merger", color: "yellow" },
    { href: "/pet-tag-maker", icon: PawPrint, label: "Pet Tag", color: "pink" },
    { href: "/remove-background", icon: Scissors, label: "Remove BG", color: "cyan" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Typewriter Effect
  useEffect(() => {
    if (!isMounted || !pathname) return;
    
    const isEN = pathname.startsWith('/en');
    let fullText = '';
    
    if (pathname === '/' || pathname === '/en') {
      fullText = isEN ? 'Convert Images to WebP Format' : 'แปลงรูปเป็น WebP อัตโนมัติ';
    } else if (pathname.includes('/pdf-converter')) {
      fullText = isEN ? 'Convert PDF to JPG Images' : 'แปลง PDF เป็นรูป JPG';
    } else if (pathname.includes('/add-qr-to-image')) {
      fullText = isEN ? 'Add QR Code to Your Images' : 'เพิ่ม QR Code ลงรูปภาพ';
    } else if (pathname.includes('/add-logo-to-image')) {
      fullText = isEN ? 'Add Logo Watermark to Images' : 'เพิ่ม Logo ลงรูปภาพ';
    } else if (pathname.includes('/gif-maker')) {
      fullText = isEN ? 'Create Animated GIF from Images' : 'สร้าง GIF เคลื่อนไหวจากรูปภาพ';
    } else if (pathname.includes('/pdf-merger')) {
      fullText = isEN ? 'Merge Multiple PDFs into One' : 'รวมไฟล์ PDF หลายไฟล์เป็นไฟล์เดียว';
    } else if (pathname.includes('/pet-tag-maker')) {
      fullText = isEN ? 'Create QR Pet Tags for Your Pets' : 'ทำป้ายชื่อสัตว์เลี้ยงพร้อม QR Code';
    } else if (pathname.includes('/pet-to-pillow')) {
      fullText = isEN ? 'Create Custom Pet Pillows' : 'สร้างหมอนรูปสัตว์เลี้ยง';
    } else if (pathname.includes('/mica-magnetic-photos')) {
      fullText = isEN ? 'Create Mica Magnetic Photos' : 'สร้างภาพถ่ายด้วยไมก้าแม่เหล็ก';
    } else if (pathname.includes('/remove-background')) {
      fullText = isEN ? 'Remove Image Backgrounds with AI' : 'ลบพื้นหลังอัตโนมัติด้วย AI';
    } else {
      fullText = isEN ? 'Image Tools & Converter' : 'เครื่องมือแปลงและแก้ไขรูปภาพ';
    }
    
    setDisplayText("");
    setCurrentIndex(0);

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= fullText.length) {
          clearInterval(timer);
          return prevIndex;
        }
        setDisplayText(fullText.substring(0, prevIndex + 1));
        return prevIndex + 1;
      });
    }, 50); // ความเร็วในการพิมพ์

    return () => clearInterval(timer);
  }, [pathname, isMounted]);

  // Hide header on share pages (after hooks)
  if (pathname && pathname.startsWith('/share/')) {
    return null;
  }

  if (!isMounted) {
    // Return a simplified version for SSR
    return (
      <header className="bg-white border-b-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex-shrink-0 p-2 border-2 border-black rounded-xl bg-white">
                <Image
                  src={LOGO}
                  alt="Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-xl"
                  priority
                />
              </Link>
              <div className="px-4 py-2 border-2 border-black rounded-xl bg-white">
                <span className="text-sm font-semibold">Convert</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 border-2 border-black rounded-lg bg-white">
                <span className="text-sm font-semibold">EN</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.08)]" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Bar: Logo + Hamburger */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
            <Link
              href="/"
              className="flex-shrink-0 p-1.5 border-2 border-black rounded-xl bg-white hover:bg-gray-50 active:scale-95 transition-all duration-150"
            >
              <Image
                src={LOGO}
                alt="Logo"
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg"
                priority
              />
            </Link>
            
            <div className="flex items-center gap-3">
              <AuthHeader />
              <button
                onClick={toggleMobileMenu}
                className="p-2 border-2 border-black rounded-xl bg-white hover:bg-gray-50 active:scale-95 transition-all duration-150"
              >
                <Menu size={20} className="text-gray-800" />
              </button>
            </div>
          </div>

          {/* Typewriter Text - Mobile */}
          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-700 min-h-[16px]">
                {displayText}
                <span className="inline-block w-0.5 h-3 bg-purple-600 ml-0.5 animate-pulse"></span>
              </p>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                onClick={closeMobileMenu}
              />
              
              {/* Full Screen Menu */}
              <div className="fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <Image
                      src={LOGO}
                      alt="Logo"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg"
                    />
                    <span className="text-white font-bold text-xl">Menu</span>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-3 border-2 border-white rounded-xl bg-white hover:bg-gray-50 active:scale-95 transition-all duration-150"
                  >
                    <X size={24} className="text-gray-800" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-3">
                  {mobileMenuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    const isDisabled = item.href === "/mica-magnetic-photos";
                    
                    if (isDisabled) {
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-4 px-6 py-4 rounded-xl border border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 cursor-not-allowed opacity-50"
                        >
                          <Magnet size={24} className="text-gray-400" />
                          <span className="text-gray-500 font-semibold text-lg">Mica Photos (Coming Soon)</span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 border-black bg-gradient-to-r hover:shadow-lg active:scale-95 transition-all duration-150 ${
                          item.color === 'blue' ? 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200' :
                          item.color === 'red' ? 'from-red-50 to-red-100 hover:from-red-100 hover:to-red-200' :
                          item.color === 'indigo' ? 'from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200' :
                          item.color === 'purple' ? 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200' :
                          item.color === 'green' ? 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200' :
                          item.color === 'orange' ? 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200' :
                          item.color === 'yellow' ? 'from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200' :
                          item.color === 'pink' ? 'from-pink-50 to-rose-100 hover:from-pink-100 hover:to-rose-200' :
                          'from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200'
                        }`}
                      >
                        <IconComponent 
                          size={24} 
                          className={
                            item.color === 'blue' ? 'text-blue-600' :
                            item.color === 'red' ? 'text-red-600' :
                            item.color === 'indigo' ? 'text-indigo-600' :
                            item.color === 'purple' ? 'text-purple-600' :
                            item.color === 'green' ? 'text-green-600' :
                            item.color === 'orange' ? 'text-orange-600' :
                            item.color === 'yellow' ? 'text-yellow-700' :
                            item.color === 'pink' ? 'text-pink-600' :
                            'text-cyan-600'
                          } 
                        />
                        <span className="font-semibold text-gray-800 text-lg">{item.label}</span>
                      </Link>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Top Bar: Logo + Auth */}
          <div className="flex items-center justify-between px-6 lg:px-8 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-600">
            <Link
              href="/"
              className="flex-shrink-0 p-2 border-2 border-black rounded-2xl bg-white hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-y-0 active:shadow-[3px_3px_0_#000] transition-all duration-150"
            >
              <Image
                src={LOGO}
                alt="Logo"
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl"
                priority
              />
            </Link>

            {/* Right: Auth */}
            <div className="flex-shrink-0">
              <AuthHeader />
            </div>
          </div>

          {/* Typewriter Text */}
          <div className="px-6 lg:px-8 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <div className="text-center">
              <p className="text-sm font-semibold text-purple-700 min-h-[20px]">
                {displayText}
                <span className="inline-block w-0.5 h-4 bg-purple-600 ml-1 animate-pulse"></span>
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-center flex-wrap gap-1">
              <Link
                href="/"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <ImageIcon size={14} className="text-blue-600" />
                <span>IMG</span>
              </Link>

              <Link
                href="/pdf-converter"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <FileText size={14} className="text-red-600" />
                <span>PDF</span>
              </Link>

              {/* <Link
                href="/property-snap"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <Home size={14} className="text-indigo-600" />
                <span>Property</span>
              </Link> */}

              <Link
                href="/add-qr-to-image"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <QrCode size={14} className="text-purple-600" />
                <span>QR</span>
              </Link>

              <Link
                href="/add-logo-to-image"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <ImageIconLucide size={14} className="text-green-600" />
                <span>Logo</span>
              </Link>

              <Link
                href="/gif-maker"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <Film size={14} className="text-orange-600" />
                <span>GIF</span>
              </Link>

              <Link
                href="/pdf-merger"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <Layers size={14} className="text-yellow-700" />
                <span>Merge</span>
              </Link>

              <Link
                href="/pet-tag-maker"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-pink-50 to-rose-100 hover:from-pink-100 hover:to-rose-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <PawPrint size={14} className="text-pink-600" />
                <span>Tag</span>
              </Link>
              {/* <Link
                href="/pet-to-pillow"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 border-black bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150"
              >
                <Bed size={16} className="text-indigo-600" />
                <span>Pet Pillow</span>
              </Link> */}

              {/* <div
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 cursor-not-allowed opacity-50 transition-all duration-150"
              >
                <Magnet size={14} className="text-gray-400" />
                <span className="text-gray-500">Mica</span>
              </div> */}

              {/* <Link
                href="/remove-background"
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold border border-black bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all duration-150 "
              >
                <Scissors size={14} className="text-cyan-600" />
                <span>BG</span>
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
