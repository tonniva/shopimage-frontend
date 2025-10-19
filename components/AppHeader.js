"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { ImageIcon, FileText } from "lucide-react";

// Professional UX/UI optimized header
export default function AppHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const LOGO = "/logo.png";
  const BMAC_URL = "https://www.buymeacoffee.com/mulufabo";

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          {/* Top Bar: Logo + Convert + Support */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2 flex-col">
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
              
              {/* Menu Buttons */}
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border-2 border-black bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 active:scale-95 transition-all duration-150"
              >
                <ImageIcon size={16} className="text-blue-600" />
                <span className="hidden sm:inline">IMG to WEBP</span>
                <span className="sm:hidden">IMG</span>
              </Link>

              <Link
                href="/pdf-converter"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border-2 border-black bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 active:scale-95 transition-all duration-150"
              >
                <FileText size={16} className="text-red-600" />
                <span className="hidden sm:inline">PDF to JPG</span>
                <span className="sm:hidden">PDF</span>
              </Link>
            </div>

            {/* Support Button */} 
          </div>

          {/* Bottom Bar: Auth */}
          <div className="px-4 py-2.5 bg-gray-50">
            <AuthHeader />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between px-6 lg:px-8 py-4">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex-shrink-0 p-2 border-2 border-black rounded-2xl bg-white hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-y-0 active:shadow-[3px_3px_0_#000] transition-all duration-150"
            >
              <Image
                src={LOGO}
                alt="Logo"
                width={64}
                height={64}
                className="w-16 h-16 rounded-xl"
                priority
              />
            </Link>

            {/* Menu Buttons */}
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border-2 border-black bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
            >
              <ImageIcon size={18} className="text-blue-600" />
              <span>IMG to WEBP</span>
            </Link>

            <Link
              href="/pdf-converter"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border-2 border-black bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
            >
              <FileText size={18} className="text-red-600" />
              <span>PDF to JPG</span>
            </Link>
          </div>

          {/* Right: Auth */}
          <div className="flex-shrink-0">
            <AuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
}
