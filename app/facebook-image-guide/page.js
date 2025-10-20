import Link from "next/link";
import { ArrowLeft, Zap, Facebook } from "lucide-react";

export const metadata = {
  title: "ไซส์รูป Facebook ล่าสุด 2025 | คู่มือขนาดรูปภาพ Facebook ครบถ้วน",
  description: "ขนาดรูปภาพ Facebook ที่ถูกต้อง โพสต์ รูปปก โปรไฟล์ สตอรี่ วิดีโอ โฆษณา อัพเดทล่าสุด 2025 ครบทุกประเภท",
  keywords: ["ไซส์รูป facebook", "ขนาดรูป facebook", "facebook image size", "facebook photo size 2025"],
};

export default function FacebookImageGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} />
            กลับหน้าแรก
          </Link>
          <div className="text-sm text-gray-600">ย่อรูป.com</div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Facebook size={64} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">ไซส์รูป Facebook ล่าสุด 2025</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">คู่มือขนาดรูปภาพ Facebook ฉบับสมบูรณ์ ครบทุกประเภท</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <Zap size={24} />
            ปรับขนาดรูปตาม Facebook
          </Link>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile & Cover */}
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">👤 รูปโปรไฟล์และรูปปก</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 border-2 border-blue-400 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">รูปโปรไฟล์ (Profile Picture)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>📐 <strong>ขนาด:</strong> 180 x 180 พิกเซล (แสดงผล 170 x 170)</li>
                <li>📏 <strong>อัตราส่วน:</strong> 1:1 (สี่เหลี่ยมจัตุรัส)</li>
                <li>📦 <strong>ไฟล์:</strong> JPG, PNG, WebP</li>
                <li>💡 <strong>หมายเหตุ:</strong> จะแสดงเป็นวงกลม</li>
              </ul>
            </div>

            <div className="p-6 bg-indigo-50 border-2 border-indigo-400 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-indigo-900">รูปปก (Cover Photo)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>📐 <strong>ขนาด:</strong> 820 x 312 พิกเซล (มือถือ) หรือ 820 x 462 px (คอม)</li>
                <li>📏 <strong>อัตราส่วน:</strong> ประมาณ 2.6:1</li>
                <li>📦 <strong>ไฟล์:</strong> JPG, PNG, WebP</li>
                <li>💡 <strong>แนะนำ:</strong> 820 x 360 px รองรับทุกอุปกรณ์</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">📱 โพสต์ (Posts)</h2>
          
          <div className="bg-white rounded-lg p-6 border border-green-300 space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2">รูปโพสต์ธรรมดา</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>ขนาดแนะนำ:</strong> 1200 x 630 พิกเซล</li>
                <li>📏 <strong>อัตราส่วน:</strong> 1.91:1</li>
                <li>📦 <strong>ขนาดไฟล์:</strong> ไม่เกิน 1 MB</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">รูปสี่เหลี่ยมจัตุรัส</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>ขนาด:</strong> 1080 x 1080 พิกเซล</li>
                <li>📏 <strong>อัตราส่วน:</strong> 1:1</li>
                <li>💡 <strong>เหมาะกับ:</strong> รูปสินค้า โพสต์อินสตาแกรม</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">รูปแนวตั้ง (Portrait)</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>ขนาด:</strong> 1080 x 1350 พิกเซล</li>
                <li>📏 <strong>อัตราส่วน:</strong> 4:5</li>
                <li>💡 <strong>เหมาะกับ:</strong> โพสต์มือถือ</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stories */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">📖 สตอรี่ (Stories)</h2>
          
          <div className="bg-white rounded-lg p-6 border border-purple-300">
            <ul className="space-y-3 text-gray-700">
              <li>📐 <strong>ขนาด:</strong> 1080 x 1920 พิกเซล</li>
              <li>📏 <strong>อัตราส่วน:</strong> 9:16 (แนวตั้งเต็มจอมือถือ)</li>
              <li>⏱️ <strong>ระยะเวลา:</strong> รูป 5 วินาที, วิดีโอ สูงสุด 15 วินาที</li>
              <li>📦 <strong>ไฟล์:</strong> JPG, PNG, WebP สำหรับรูป</li>
            </ul>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm">
              💡 <strong>Tip:</strong> ใส่เนื้อหาสำคัญตรงกลางหน้าจอ ไม่ให้โดน Profile/UI บัง
            </div>
          </div>
        </div>

        {/* Ads */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">💰 โฆษณา Facebook (Ads)</h2>
          
          <div className="bg-white rounded-lg p-6 border border-red-300 space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2">รูปโฆษณา</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>ขนาด:</strong> 1200 x 628 พิกเซล</li>
                <li>📏 <strong>อัตราส่วน:</strong> 1.91:1</li>
                <li>📝 <strong>ข้อความ:</strong> ไม่เกิน 20% ของรูป</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">โฆษณาแบบ Carousel</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>ขนาด:</strong> 1080 x 1080 พิกเซล</li>
                <li>📏 <strong>อัตราส่วน:</strong> 1:1</li>
                <li>🖼️ <strong>จำนวน:</strong> 2-10 รูป</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">🎥 วิดีโอ (Video)</h2>
          
          <div className="bg-white rounded-lg p-6 border border-yellow-300">
            <ul className="space-y-3 text-gray-700">
              <li>📐 <strong>ขนาดแนะนำ:</strong> 1280 x 720 พิกเซล (HD)</li>
              <li>📏 <strong>อัตราส่วน:</strong> 16:9 หรือ 1:1 หรือ 9:16</li>
              <li>⏱️ <strong>ระยะเวลา:</strong> สูงสุด 240 นาที</li>
              <li>📦 <strong>ขนาดไฟล์:</strong> สูงสุด 4 GB</li>
              <li>🎬 <strong>ไฟล์:</strong> MP4, MOV แนะนำ</li>
            </ul>
          </div>
        </div>

        {/* Quick Reference Table */}
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">📊 ตารางสรุป</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">ประเภท</th>
                  <th className="p-3 text-center">ขนาด (พิกเซล)</th>
                  <th className="p-3 text-center">อัตราส่วน</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">รูปโปรไฟล์</td>
                  <td className="p-3 text-center">180 x 180</td>
                  <td className="p-3 text-center">1:1</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3">รูปปก</td>
                  <td className="p-3 text-center">820 x 360</td>
                  <td className="p-3 text-center">2.3:1</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">โพสต์ธรรมดา</td>
                  <td className="p-3 text-center">1200 x 630</td>
                  <td className="p-3 text-center">1.91:1</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3">โพสต์สี่เหลี่ยม</td>
                  <td className="p-3 text-center">1080 x 1080</td>
                  <td className="p-3 text-center">1:1</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">สตอรี่</td>
                  <td className="p-3 text-center">1080 x 1920</td>
                  <td className="p-3 text-center">9:16</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 text-center border-4 border-black mb-8">
          <h2 className="text-3xl font-bold mb-4">ปรับขนาดรูปให้พอดีกับ Facebook</h2>
          <p className="text-xl mb-6 text-blue-100">ใช้เครื่องมือของเราปรับอัตโนมัติ ง่าย รวดเร็ว ฟรี!</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
            <Zap size={24} />
            ปรับขนาดรูปเลย
          </Link>
        </div>

        {/* FAQ */}
        <div className="bg-white border-2 border-black rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">คำถามที่พบบ่อย</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">Facebook รองรับ WebP ไหม?</h3>
              <p className="text-gray-700">รองรับค่ะ! Facebook รองรับไฟล์ WebP แล้ว แนะนำให้ใช้เพื่อลดขนาดไฟล์</p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">ขนาดไหนเหมาะกับโพสต์ธรรมดา?</h3>
              <p className="text-gray-700">แนะนำ 1200 x 630 px (แนวนอน) หรือ 1080 x 1080 px (สี่เหลี่ยมจัตุรัส) สำหรับรูปสินค้า</p>
            </div>

            <div className="pb-4">
              <h3 className="font-bold text-lg mb-2">รูปเบลอบน Facebook ทำยังไง?</h3>
              <p className="text-gray-700">
                ใช้รูปคุณภาพสูง และปรับขนาดให้ถูกต้อง ใช้ <Link href="/" className="text-blue-600 underline">เว็บย่อรูป.com</Link> ช่วยปรับให้เหมาะสม
              </p>
            </div>
          </div>
        </div>
      </article>

     
    </div>
  );
}

