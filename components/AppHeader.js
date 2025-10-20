"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthHeader } from "@/components/AuthHeader";
import { ImageIcon, FileText, QrCode, Image as ImageIconLucide } from "lucide-react";

// Professional UX/UI optimized header
export default function AppHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const pathname = usePathname();
  const LOGO = "/logo.png";
  const BMAC_URL = "https://www.buymeacoffee.com/mulufabo";

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

  if (!isMounted) {
    // Return a simplified version for SSR
    return (
      <header className="sticky top-0 z-50 bg-white border-b-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
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
    <header className="sticky top-0 z-50 bg-white border-b-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.08)]" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Bar: Logo */}
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
            
            <div className="flex-shrink-0">
              <AuthHeader />
            </div>
          </div>

          {/* Typewriter Text - Mobile */}
          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <div className="text-center">
              <p className="text-xs font-semibold text-purple-700 min-h-[16px]">
                {displayText}
                <span className="inline-block w-0.5 h-3 bg-purple-600 ml-0.5 animate-pulse"></span>
              </p>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="px-4 py-3 bg-gradient-to-br from-gray-50 to-white">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs font-semibold border-2 border-black bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 active:scale-95 transition-all duration-150 shadow-sm"
              >
                <ImageIcon size={16} className="text-blue-600" />
                <span>IMG to WEBP</span>
              </Link>

              <Link
                href="/pdf-converter"
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs font-semibold border-2 border-black bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 active:scale-95 transition-all duration-150 shadow-sm"
              >
                <FileText size={16} className="text-red-600" />
                <span>PDF to JPG</span>
              </Link>

              <Link
                href="/add-qr-to-image"
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs font-semibold border-2 border-black bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 active:scale-95 transition-all duration-150 shadow-sm"
              >
                <QrCode size={16} className="text-purple-600" />
                <span>Add QR</span>
              </Link>

              <Link
                href="/add-logo-to-image"
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs font-semibold border-2 border-black bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 active:scale-95 transition-all duration-150 shadow-sm"
              >
                <ImageIconLucide size={16} className="text-green-600" />
                <span>Add Logo</span>
              </Link>
            </div>
          </div>
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
          <div className="px-6 lg:px-8 py-3 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border-2 border-black bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
              >
                <ImageIcon size={18} className="text-blue-600" />
                <span>IMG to WEBP</span>
              </Link>

              <Link
                href="/pdf-converter"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border-2 border-black bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
              >
                <FileText size={18} className="text-red-600" />
                <span>PDF to JPG</span>
              </Link>

              <Link
                href="/add-qr-to-image"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border-2 border-black bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
              >
                <QrCode size={18} className="text-purple-600" />
                <span>Add QR</span>
              </Link>

              <Link
                href="/add-logo-to-image"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border-2 border-black bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
              >
                <ImageIconLucide size={18} className="text-green-600" />
                <span>Add Logo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
