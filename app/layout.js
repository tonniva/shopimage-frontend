// app/layout.js
import "./globals.css";
import { Toaster } from "sonner";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import AuthProvider from "@/components/AuthProvider";

// ✅ SEO Metadata
export const metadata = {
  title: "Convert to WebP | ลดขนาดรูปภาพออนไลน์ฟรี แปลงภาพ WebP/JPG/PNG",
  description:
    "เว็บแปลงรูปออนไลน์ฟรี Convert to WebP | ลดขนาดรูปภาพ คมชัด คุณภาพสูง รองรับ Shopee, Lazada, Facebook, LINE OA, Instagram ไม่มีลายน้ำ ใช้งานฟรี!",
  keywords: [
    "convert to webp",
    "webp converter",
    "แปลงรูป webp",
    "ลดขนาดรูป",
    "บีบอัดรูป",
    "compress image",
    "image compressor",
    "แปลงรูปออนไลน์",
    "แปลงไฟล์ JPG เป็น WebP",
    "บีบอัดรูปภาพออนไลน์",
    "แปลงรูป Shopee",
    "แปลงรูป Lazada",
    "ขายของออนไลน์"
  ],
  authors: [{ name: "To WebP" }],
  openGraph: {
    title: "Convert to WebP | ลดขนาดรูปออนไลน์ฟรี",
    description:
      "เครื่องมือแปลงรูป WebP / JPEG / PNG ออนไลน์ ความละเอียดสูง ใช้งานง่าย เหมาะสำหรับพ่อค้าแม่ค้าออนไลน์",
    url: "https://your-domain.com",
    siteName: "To WebP",
    images: [
      {
        url: "https://your-domain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Convert to WebP | Online Image Converter"
      }
    ],
    locale: "th_TH",
    type: "website"
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="antialiased">
        <AuthProvider>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AppHeader />
            <main className="pt-6 md:pt-8">{children}</main>
            <AppFooter />
          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}