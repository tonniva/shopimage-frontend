"use client";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon, QrCode, Image as ImageIconLucide, Film, Layers, PawPrint, Bed, Magnet, Scissors } from "lucide-react";

export default function AppFooter() {
  const BMAC_URL = "https://www.buymeacoffee.com/mulufabo";
  const QR_SRC = "/qr-code.png";

  const tools = {
    imageTools: [
      { name: "Image Converter", name_th: "แปลงรูปภาพ", href: "/", icon: ImageIcon },
      { name: "Add QR to Image", name_th: "เพิ่ม QR บนรูป", href: "/add-qr-to-image", icon: QrCode },
      { name: "Add Logo to Image", name_th: "เพิ่มโลโก้บนรูป", href: "/add-logo-to-image", icon: ImageIconLucide },
      { name: "Remove Background", name_th: "ลบพื้นหลัง", href: "/remove-background", icon: Scissors },
    ],
    creativeTools: [
      { name: "GIF Maker", name_th: "สร้าง GIF", href: "/gif-maker", icon: Film },
      { name: "Pet Tag Maker", name_th: "ป้ายชื่อสัตว์เลี้ยง", href: "/pet-tag-maker", icon: PawPrint },
      // { name: "Pet to Pillow", name_th: "หมอนรูปสัตว์เลี้ยง", href: "/pet-to-pillow", icon: Bed },
      { name: "Mica Magnetic Photos", name_th: "ภาพถ่ายไมก้าแม่เหล็ก", href: "/mica-magnetic-photos", icon: Magnet },
    ],
    pdfTools: [
      { name: "PDF Merger", name_th: "รวมไฟล์ PDF", href: "/pdf-merger", icon: Layers },
    ]
  };

  return (
    <footer className="mt-12 border-t-2 border-black bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-r from-purple-600 to-pink-600">
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Image Tools */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              เครื่องมือรูปภาพ
            </h3>
            <ul className="space-y-2">
              {tools.imageTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href}
                    className="text-white hover:text-yellow-200 text-sm flex items-center gap-2 transition-colors"
                  >
                    <tool.icon size={16} />
                    {tool.name_th}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creative Tools */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Film size={20} />
              เครื่องมือสร้างสรรค์
            </h3>
            <ul className="space-y-2">
              {tools.creativeTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href}
                    className="text-white hover:text-yellow-200 text-sm flex items-center gap-2 transition-colors"
                  >
                    <tool.icon size={16} />
                    {tool.name_th}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Layers size={20} />
              เครื่องมือ PDF
            </h3>
            <ul className="space-y-2">
              {tools.pdfTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href}
                    className="text-white hover:text-yellow-200 text-sm flex items-center gap-2 transition-colors"
                  >
                    <tool.icon size={16} />
                    {tool.name_th}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              🐱 สนับสนุน & ติดต่อ
            </h3>
            <div className="space-y-3">
              <Link
                href={BMAC_URL}
                target="_blank"
                rel="noopener"
                className="block"
              >
                <div className="p-3 border-2 border-black rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] transition-all duration-150">
                  <Image
                    src={QR_SRC}
                    alt="Support QR"
                    width={120}
                    height={120}
                    className="rounded-lg mx-auto"
                    priority
                  />
                  <p className="text-center text-xs font-bold text-gray-900 mt-2">
                    Support 🐱❤️
                  </p>
                </div>
              </Link>
              
              <a
                href="mailto:tongiggabite@gmail.com"
                className="block text-center px-4 py-2 border-2 border-black rounded-lg bg-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] transition-all duration-150 font-semibold text-sm"
              >
                 Email
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Info */}
        <div className="border-t border-white/30 pt-6">
          <div className="grid md:grid-cols-2 gap-4 text-white text-sm">
            <div>
              <p className="font-bold text-lg mb-2">
                Every donation = cat food 🐱❤️
              </p>
              <p className="text-xs opacity-90">
                Your support means food and love for my cats ❤️🐱
              </p>
              <p className="text-xs opacity-75 mt-1">
                100% of all support is used for cat food only.
              </p>
            </div>
            <div className="text-right"> 
              <p className="text-xs opacity-75">
                © 2024 To Webp — All rights reserved.
              </p>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
