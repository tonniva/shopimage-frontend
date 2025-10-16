import "./globals.css";
import { Toaster } from "sonner";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import AuthProvider from "@/components/AuthProvider";
import Script from "next/script";

// ✅ SEO Metadata
export const metadata = {
  title: "ย่อรูปสินค้า Shopee Lazada | Convert to WebP ฟรี คมชัด ไม่แตก",
  description:
    "ย่อรูปสินค้า Shopee Lazada ออนไลน์ฟรี รองรับ WebP / JPG / PNG ลดขนาดรูปแต่ยังคมชัด ไม่ลดคุณภาพ เหมาะสำหรับพ่อค้าแม่ค้าออนไลน์ ปรับขนาดตามแพลตฟอร์มอัตโนมัติ ใช้งานฟรี 100%",
  keywords: [
    "ย่อรูป",
    "ย่อรูปออนไลน์",
    "ลดขนาดรูป",
    "แปลงรูป webp",
    "convert to webp",
    "compress image",
    "เว็บย่อรูป",
    "บีบอัดรูปภาพ",
    "ย่อรูป shopee",
    "ขนาดรูป shopee",
    "ย่อรูป lazada",
    "แปลงรูป lazada",
    "ขายของออนไลน์",
    "ทำร้านค้าออนไลน์",
    "เว็บลดขนาดรูป",
    "เปลี่ยน JPG เป็น WebP"
  ],
  authors: [{ name: "ย่อรูป.com" }],
  openGraph: {
    title: "ย่อรูปสินค้า Shopee Lazada | แปลง WebP ฟรี คมชัด ไม่แตก",
    description:
      "เว็บย่อรูปแนะนำสำหรับ Shopee Lazada ขายของออนไลน์ ลดขนาดภาพ โหลดไว ประหยัดเน็ต ไม่มีลายน้ำ ใช้งานฟรี!",
    url: "https://ย่อรูป.com",
    siteName: "ย่อรูป.com",
    images: [
      {
        url: "https://ย่อรูป.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ย่อรูป Shopee Lazada ออนไลน์ฟรี"
      }
    ],
    locale: "th_TH",
    type: "website"
  },
  icons: {
    icon: "/favicon.ico"
  },
  metadataBase: new URL("https://ย่อรูป.com"),
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="th">
      <head>
        {/* ✅ Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-setup" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
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