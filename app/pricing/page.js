"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "0 บาท",
    period: "",
    highlight: false,
    blurb: "เริ่มต้นใช้งานฟรี เหมาะสำหรับทดลองระบบ",
    features: [
      "20 รูป/วัน",
      "รองรับ WebP / JPEG",
      "อัปโหลดหลายไฟล์",
    ],
    cta: { label: "เริ่มใช้งานฟรี", href: "/" },
  },
  {
    id: "pro",
    name: "Pro",
    price: "250 บาท",
    period: "/เดือน",
    highlight: true, // ⭐ แนะนำ
    blurb: "เร็วกว่า ไม่มีโฆษณา สำหรับผู้ขายจริงจัง",
    features: [
      "1,000 รูป/เดือน",
      "คิวประมวลผลเร็วพิเศษ (Priority)",
      "ไม่มีโฆษณา",
    ],
    cta: { label: "เริ่มต้น Pro", href: "/signup" },
  },
  {
    id: "business",
    name: "Business",
    price: "สอบถาม",
    period: "/เดือน",
    highlight: false,
    blurb: "สำหรับทีม/ธุรกิจที่มีปริมาณงานสูง",
    features: [
      "10,000 รูป/เดือน",
      "รองรับทีม/สิทธิ์หลายระดับ",
      "ซัพพอร์ตสำหรับธุรกิจ",
    ],
    cta: { label: "ติดต่อเรา", href: "/contact" },
  },
];

function Dot() {
  return <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-black" />;
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-medium">
      {children}
    </span>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-black">
      {/* Header */}
      <header className="border-b border-black bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-7 w-7 bg-black" />
            <div className="leading-tight">
              <div className="text-base font-semibold">ShopImage</div>
              <div className="text-[11px] text-gray-500">Pricing</div>
            </div>
          </Link>
          <Link href="/" className="text-xs underline underline-offset-4">
            กลับหน้าแปลงรูป
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            เลือกแพ็กเกจที่เหมาะกับงานของคุณ
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            เริ่มจาก <span className="font-medium">Free</span> แล้วอัปเกรดเมื่อปริมาณงานเพิ่มขึ้น
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-3">
          {plans.map((p) => {
            const ring = p.highlight
              ? "shadow-[6px_6px_0_#000] -translate-y-0.5"
              : "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]";
            return (
              <Card
                key={p.id}
                className={`border border-black bg-white transition-all duration-150 ${ring}`}
              >
                <CardContent className="p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    {p.highlight && <Badge>แนะนำ</Badge>}
                  </div>

                  <div>
                    <div className="text-2xl font-semibold">{p.price}</div>
                    {p.period ? (
                      <div className="text-xs text-gray-500">{p.period}</div>
                    ) : null}
                  </div>

                  <p className="text-sm text-gray-600">{p.blurb}</p>

                  <ul className="space-y-2">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Dot />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {p.id === "free" && (
                    <p className="text-[11px] text-gray-500">ไม่ต้องใช้บัตรเครดิต</p>
                  )}
                  <Link href={p.cta.href} className="block">
                    <Button
                      className={`w-full border border-black text-black ${
                        p.highlight
                          ? "bg-black text-black hover:bg-black"
                          : "bg-white text-black hover:bg-black hover:text-black"
                      } transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000]`}
                    >
                      {p.cta.label}
                      
                    </Button>
                  </Link>

                
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notes */}
        <div className="mt-8 grid gap-4 md:grid-cols-3 text-xs text-gray-600">
          <div className="rounded-lg border border-black bg-white p-3">
            ทุกแพ็กเกจรองรับการแปลง WebP/JPEG และอัปโหลดหลายไฟล์
          </div>
          <div className="rounded-lg border border-black bg-white p-3">
            แพ็กเกจ Pro มีคิวประมวลผลเร็วพิเศษ และไม่มีโฆษณา
          </div>
          <div className="rounded-lg border border-black bg-white p-3">
            Business รองรับทีมและมีซัพพอร์ตสำหรับธุรกิจ
          </div>
        </div>
      </main>
 
    </div>
  );
}