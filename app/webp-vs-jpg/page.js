import Link from "next/link";
import { ArrowLeft, Zap, FileImage } from "lucide-react";

export const metadata = {
  title: "WebP vs JPG ต่างกันยังไง? ควรใช้ไฟล์ไหนดี | เปรียบเทียบ 2025",
  description: "เปรียบเทียบ WebP กับ JPG ต่างกันอย่างไร ข้อดีข้อเสีย ควรใช้ไฟล์แบบไหนสำหรับ Shopee Lazada คำแนะนำฉบับสมบูรณ์",
  keywords: ["webp vs jpg", "เปรียบเทียบ webp jpg", "ความต่าง webp jpg", "ควรใช้ webp หรือ jpg"],
};

export default function WebPvsJPG() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-green-600 transition-colors">
            <ArrowLeft size={20} />
            กลับหน้าแรก
          </Link>
          <div className="text-sm text-gray-600">ย่อรูป.com</div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            WebP vs JPG<br />ต่างกันยังไง? ควรใช้ไฟล์ไหนดี
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8">
            เปรียบเทียบครบถ้วน ข้อดี ข้อเสีย ช่วยคุณเลือกไฟล์ที่เหมาะสม
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <Zap size={24} />
            แปลงเป็น WebP ฟรี
          </Link>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">สรุปสั้นๆ WebP vs JPG</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-green-900">✅ WebP</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>🚀 <strong>ไฟล์เล็กกว่า</strong> JPG 25-35%</li>
                <li>🎨 <strong>คุณภาพดีกว่า</strong> ที่ขนาดเดียวกัน</li>
                <li>⚡ <strong>โหลดเร็วกว่า</strong> ประหยัดเน็ต</li>
                <li>💾 <strong>ประหยัดพื้นที่</strong> จัดเก็บ</li>
                <li>📱 <strong>รองรับทุกแพลตฟอร์ม</strong> สมัยใหม่</li>
                <li>✅ <strong>แนะนำสำหรับ</strong> Shopee, Lazada, เว็บไซต์</li>
              </ul>
            </div>

            <div className="p-6 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-yellow-900">⚠️ JPG/JPEG</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📦 <strong>ไฟล์ใหญ่กว่า</strong> WebP</li>
                <li>🔧 <strong>รองรับทุกที่</strong> แม้เครื่องเก่า</li>
                <li>📷 <strong>มาตรฐานเดิม</strong> ใช้กันมานาน</li>
                <li>⏳ <strong>โหลดช้ากว่า</strong> WebP</li>
                <li>💿 <strong>ใช้พื้นที่มากกว่า</strong></li>
                <li>👴 <strong>เหมาะกับ</strong> เครื่องเก่า, ความเข้ากันได้สูง</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">เปรียบเทียบโดยตรง</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-2 border-black rounded-lg">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="p-4 text-left font-bold">คุณสมบัติ</th>
                  <th className="p-4 text-center font-bold text-green-700">WebP</th>
                  <th className="p-4 text-center font-bold text-yellow-700">JPG</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold">ขนาดไฟล์</td>
                  <td className="p-4 text-center text-green-700 font-bold">เล็กกว่า 25-35%</td>
                  <td className="p-4 text-center text-yellow-700">ใหญ่กว่า</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold">คุณภาพภาพ</td>
                  <td className="p-4 text-center text-green-700 font-bold">ดีกว่า</td>
                  <td className="p-4 text-center text-yellow-700">ดี</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold">ความเร็วโหลด</td>
                  <td className="p-4 text-center text-green-700 font-bold">เร็วกว่า</td>
                  <td className="p-4 text-center text-yellow-700">ช้ากว่า</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold">รองรับเบราว์เซอร์</td>
                  <td className="p-4 text-center text-green-700">✅ 95%+</td>
                  <td className="p-4 text-center text-green-700">✅ 100%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold">Shopee / Lazada</td>
                  <td className="p-4 text-center text-green-700 font-bold">✅ รองรับ</td>
                  <td className="p-4 text-center text-green-700">✅ รองรับ</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-semibold">SEO</td>
                  <td className="p-4 text-center text-green-700 font-bold">ดีกว่า (เร็ว)</td>
                  <td className="p-4 text-center text-yellow-700">ปานกลาง</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <p className="font-bold text-green-900 mb-2">📊 สรุป:</p>
            <p className="text-sm text-gray-700">
              <strong>WebP ชนะเกือบทุกด้าน</strong> ไฟล์เล็กกว่า คุณภาพดีกว่า โหลดเร็วกว่า เหมาะกับการใช้งานยุคใหม่มากกว่า JPG
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 text-center border-4 border-black mb-8">
          <h2 className="text-3xl font-bold mb-4">แนะนำ: ใช้ WebP!</h2>
          <p className="text-xl mb-6">
            สำหรับคนขายของออนไลน์ WebP คือทางเลือกที่ดีที่สุด
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
            <FileImage size={24} />
            แปลงเป็น WebP ตอนนี้
          </Link>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">คำถามที่พบบ่อย</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">Shopee Lazada รองรับ WebP ไหม?</h3>
              <p className="text-gray-700">รองรับแล้วค่ะ! ทั้ง Shopee และ Lazada รองรับไฟล์ WebP เต็มรูปแบบ แนะนำให้ใช้เลย</p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">WebP คุณภาพดีกว่าจริงหรือ?</h3>
              <p className="text-gray-700">ใช่! WebP ใช้อัลกอริทึมที่ทันสมัยกว่า ทำให้ได้คุณภาพดีกว่าที่ขนาดเดียวกัน หรือเล็กกว่าที่คุณภาพเดียวกัน</p>
            </div>

            <div className="pb-4">
              <h3 className="font-bold text-lg mb-2">จะแปลง JPG เป็น WebP ได้ยังไง?</h3>
              <p className="text-gray-700">
                ใช้ <Link href="/" className="text-blue-600 underline">เว็บย่อรูป.com</Link> ของเราเลย อัปโหลด เลือก WebP กดแปลง เสร็จ!
              </p>
            </div>
          </div>
        </div>
      </article>

      <footer className="border-t-2 border-black bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/" className="text-2xl font-bold text-green-600 hover:text-green-700 mb-2 block">ย่อรูป.com</Link>
          <p className="text-gray-500 text-xs mt-4">© 2025 ย่อรูป.com</p>
        </div>
      </footer>
    </div>
  );
}

