import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/components/AuthProvider";
import LayoutContent from "@/components/LayoutContent";
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
  twitter: {
    card: "summary_large_image",
    title: "ย่อรูปสินค้า Shopee Lazada | แปลง WebP ออนไลน์ฟรี",
    description:
      "ลดขนาดรูปภาพ คมชัด ไม่แตก เว็บย่อรูปฟรี รองรับ Shopee Lazada ใช้งานง่าย ไม่ต้องสมัครสมาชิก",
    images: ["https://ย่อรูป.com/og-image.jpg"]
  },
  alternates: {
    languages: {
      th: "https://ย่อรูป.com",
      en: "https://ย่อรูป.com/en",
    },
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
        <meta name='impact-site-verification' value='390615bf-59e3-43eb-ab39-385172758237'></meta>
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
        
        {/* ✅ Impact Tracking */}
        <Script id="impact-tracking" strategy="afterInteractive">
          {`
            (function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A6622999-b6f9-4df3-a315-cea5579174dc1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}