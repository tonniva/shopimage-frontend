import Link from "next/link";
import { ArrowLeft, Zap, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "ขนาดภาพ Shopee ที่ถูกต้อง 2025 | คู่มือสำหรับผู้ขาย",
  description: "ขนาดรูปภาพ Shopee ที่ถูกต้อง ข้อกำหนด spec รูปสินค้า ปก banner Shopee Mall อัพเดทล่าสุด 2025",
  keywords: ["ขนาดภาพ shopee", "ขนาดรูปสินค้า shopee", "spec รูป shopee", "shopee image size"],
};

export default function ShopeeImageSize() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <header className="bg-white border-b-2 border-black   top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-orange-600 transition-colors">
            <ArrowLeft size={20} />
            กลับหน้าแรก
          </Link>
          <div className="text-sm text-gray-600">ย่อรูป.com</div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShoppingBag size={64} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">ขนาดภาพ Shopee ที่ถูกต้อง</h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-8">ข้อกำหนดรูปภาพ Shopee ฉบับสมบูรณ์ อัพเดท 2025</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <Zap size={24} />
            ปรับขนาดรูปอัตโนมัติ
          </Link>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">📦 รูปสินค้า Shopee (Product Images)</h2>
          
          <div className="p-6 bg-orange-50 border-2 border-orange-400 rounded-lg mb-6">
            <h3 className="text-2xl font-bold mb-4 text-orange-900">ข้อกำหนดหลัก</h3>
            <ul className="space-y-3 text-gray-700">
              <li>📐 <strong>ขนาดแนะนำ:</strong> 800 x 800 พิกเซล ถึง 1000 x 1000 พิกเซล</li>
              <li>📏 <strong>อัตราส่วน:</strong> 1:1 (สี่เหลี่ยมจัตุรัส)</li>
              <li>📦 <strong>ขนาดไฟล์:</strong> ไม่เกิน 2 MB</li>
              <li>📄 <strong>ไฟล์ที่รองรับ:</strong> JPG, JPEG, PNG, WebP</li>
              <li>🖼️ <strong>จำนวนรูป:</strong> 1-9 รูปต่อสินค้า (รูปแรกเป็นรูปหลัก)</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
              <h4 className="font-bold text-green-900 mb-2">✅ ควรทำ</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• ใช้รูปคมชัดสวยงาม</li>
                <li>• พื้นหลังสะอาด ไม่รก</li>
                <li>• แสดงสินค้าชัดเจน</li>
                <li>• ใช้ WebP เพื่อไฟล์เล็ก</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
              <h4 className="font-bold text-red-900 mb-2">❌ ไม่ควรทำ</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• รูปเบลอหรือไม่ชัด</li>
                <li>• ใส่ลายน้ำที่มากเกินไป</li>
                <li>• รูปสินค้าเล็กเกินไป</li>
                <li>• ใช้ไฟล์ใหญ่เกิน 2MB</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">🎨 รูปปก Shop (Shop Banner)</h2>
          
          <div className="bg-white rounded-lg p-6 border border-purple-300">
            <ul className="space-y-3 text-gray-700">
              <li>📐 <strong>ขนาด:</strong> 1920 x 600 พิกเซล</li>
              <li>📏 <strong>อัตราส่วน:</strong> 16:5</li>
              <li>📦 <strong>ขนาดไฟล์:</strong> ไม่เกิน 1 MB</li>
              <li>📄 <strong>ไฟล์:</strong> JPG, PNG, WebP</li>
            </ul>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm">
              💡 <strong>Tip:</strong> ออกแบบให้ดูดีทั้งบนมือถือและคอมพิวเตอร์
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">⭐ Shopee Mall</h2>
          
          <div className="bg-white rounded-lg p-6 border border-blue-300">
            <p className="text-gray-700 mb-4">Shopee Mall มีข้อกำหนดที่เข้มงวดกว่าร้านทั่วไป:</p>
            <ul className="space-y-3 text-gray-700">
              <li>📐 <strong>ขนาดแนะนำ:</strong> 1000 x 1000 พิกเซล (ขั้นต่ำ 800 x 800)</li>
              <li>🎯 <strong>คุณภาพ:</strong> ต้องคมชัดสูง</li>
              <li>🖼️ <strong>พื้นหลัง:</strong> ควรเป็นสีขาวหรือสะอาด</li>
              <li>📷 <strong>รูปสินค้า:</strong> ต้องครบทุกมุม</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg p-8 text-center border-4 border-black mb-8">
          <h2 className="text-3xl font-bold mb-4">ปรับขนาดรูปให้ตรงกับ Shopee</h2>
          <p className="text-xl mb-6 text-orange-100">ใช้เครื่องมือของเราปรับอัตโนมัติ ง่าย รวดเร็ว ฟรี!</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
            <Zap size={24} />
            ปรับขนาดรูปเลย
          </Link>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">คำถามที่พบบ่อย</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">Shopee รองรับ WebP ไหม?</h3>
              <p className="text-gray-700">รองรับค่ะ! Shopee รองรับไฟล์ WebP แล้ว แนะนำให้ใช้เพราะไฟล์เล็กกว่า JPG</p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">ควรใช้ขนาดเท่าไหร่?</h3>
              <p className="text-gray-700">แนะนำ 800x800 หรือ 1000x1000 พิกเซล เหมาะสมทั้งมือถือและคอมพิวเตอร์</p>
            </div>

            <div className="pb-4">
              <h3 className="font-bold text-lg mb-2">รูปใหญ่เกินไปทำยังไง?</h3>
              <p className="text-gray-700">
                ใช้ <Link href="/" className="text-orange-600 underline">เว็บย่อรูป.com</Link> ปรับขนาดและบีบอัดให้เหมาะกับ Shopee อัตโนมัติ
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 mt-8">
          <h3 className="text-2xl font-bold mb-4">บทความที่เกี่ยวข้อง</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/how-to-reduce-image-size" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-orange-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-orange-600 mb-1">วิธีลดขนาดรูป</h4>
              <p className="text-sm text-gray-600">ลดขนาดให้ไม่แตก</p>
            </Link>
            <Link href="/webp-vs-jpg" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-orange-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-orange-600 mb-1">WebP vs JPG</h4>
              <p className="text-sm text-gray-600">ควรใช้ไฟล์ไหน</p>
            </Link>
          </div>
        </div>
      </article>

    
    </div>
  );
}

