import Link from "next/link";
import { ArrowLeft, Download, Settings, Zap, Shield, CheckCircle } from "lucide-react";

export const metadata = {
  title: "วิธีลดขนาดรูปให้ไม่แตก 2025 | คู่มือลดไฟล์รูปภาพฟรี",
  description: "คู่มือสอนลดขนาดรูปให้ไม่แตก รักษาคุณภาพคมชัด เหมาะกับ Shopee Lazada ง่ายๆ ฟรี ไม่ต้องลงโปรแกรม ใช้งานได้ทันที 2025",
  keywords: ["วิธีลดขนาดรูป", "ลดขนาดรูปให้ไม่แตก", "ย่อรูปไม่เสียคุณภาพ", "compress image", "reduce image size"],
  openGraph: {
    title: "วิธีลดขนาดรูปให้ไม่แตก | คู่มือฉบับสมบูรณ์",
    description: "เรียนรู้วิธีลดขนาดรูปภาพให้ไม่แตก คงความคมชัด พร้อมเทคนิคดีๆ สำหรับพ่อค้าแม่ค้าออนไลน์",
  },
};

export default function HowToReduceImageSize() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            กลับหน้าแรก
          </Link>
          <div className="text-sm text-gray-600">
            ย่อรูป.com
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            วิธีลดขนาดรูปให้ไม่แตก
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            คู่มือสอนลดขนาดไฟล์รูปภาพ รักษาคุณภาพคมชัด เหมาะกับพ่อค้าแม่ค้าออนไลน์
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          >
            <Zap size={24} />
            ลองใช้เครื่องมือฟรี
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Introduction */}
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">ทำไมต้องลดขนาดรูป?</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              การลดขนาดไฟล์รูปภาพเป็นสิ่งสำคัญมากสำหรับ<strong>พ่อค้าแม่ค้าออนไลน์</strong> โดยเฉพาะคนที่ขายของบน <strong>Shopee</strong>, <strong>Lazada</strong> หรือ <strong>Facebook</strong> เพราะรูปที่มีขนาดเล็กจะช่วยให้:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>หน้าเว็บโหลดเร็วขึ้น</strong> - ลูกค้าไม่ต้องรอนาน ลดโอกาสที่จะกดออกจากหน้าเว็บ</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>ประหยัดเน็ตลูกค้า</strong> - รูปเล็กใช้เน็ตน้อย ลูกค้าชอบแน่นอน</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>SEO ดีขึ้น</strong> - Google ชอบเว็บที่โหลดเร็ว จะช่วยให้ติดอันดับดีขึ้น</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>ประหยัดพื้นที่จัดเก็บ</strong> - ใช้พื้นที่ server หรือ cloud น้อยลง</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>อัปโหลดเร็วขึ้น</strong> - เวลาเพิ่มสินค้าใหม่ไม่ต้องรอนาน</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Method 1 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-black rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              1
            </div>
            <h2 className="text-3xl font-bold">ใช้เครื่องมือออนไลน์ฟรี (แนะนำ!)</h2>
          </div>
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-blue-300">
            <h3 className="text-xl font-bold mb-4 text-blue-900">วิธีที่ง่ายที่สุด - ใช้เว็บย่อรูป.com</h3>
            <p className="text-gray-700 mb-4">
              เว็บไซต์ของเราให้บริการย่อรูปออนไลน์ฟรี <strong>ไม่ต้องลงโปรแกรม</strong> ไม่ต้องสมัครสมาชิก ใช้งานได้ทันที!
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <h4 className="font-bold mb-1">เปิดเว็บไซต์</h4>
                  <p className="text-gray-600">ไปที่หน้าแรก <Link href="/" className="text-blue-600 underline">ย่อรูป.com</Link></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <h4 className="font-bold mb-1">อัปโหลดรูป</h4>
                  <p className="text-gray-600">ลากวางรูปภาพของคุณ หรือคลิกเลือกไฟล์ (รองรับหลายไฟล์พร้อมกัน)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <h4 className="font-bold mb-1">เลือก Preset หรือตั้งค่าเอง</h4>
                  <p className="text-gray-600">เลือก Shopee, Lazada หรือปรับขนาดตามต้องการ</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                <div>
                  <h4 className="font-bold mb-1">กดแปลงและดาวน์โหลด</h4>
                  <p className="text-gray-600">รอสักครู่และดาวน์โหลดรูปที่ย่อแล้ว คมชัดสวยงาม!</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
              <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="text-green-600" />
                ข้อดีของการใช้เว็บออนไลน์
              </h4>
              <ul className="text-sm text-gray-700 space-y-1 ml-6">
                <li>✅ ฟรี 100% ไม่มีค่าใช้จ่าย</li>
                <li>✅ ไม่ต้องติดตั้งโปรแกรม ประหยัดพื้นที่</li>
                <li>✅ ใช้งานได้ทุกอุปกรณ์ (คอม/มือถือ/แท็บเล็ต)</li>
                <li>✅ ประมวลผลเร็ว ได้ผลลัพธ์ภายในไม่กี่วินาที</li>
                <li>✅ ปลอดภัย ไม่มีการเก็บรูปของคุณ</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Method 2 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-black rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              2
            </div>
            <h2 className="text-3xl font-bold">เลือกรูปแบบไฟล์ที่เหมาะสม</h2>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-purple-300 space-y-4">
            <p className="text-gray-700">
              การเลือกรูปแบบไฟล์ที่เหมาะสมช่วยลดขนาดได้มาก โดยไม่ทำให้คุณภาพลดลง
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-green-900">WebP</h4>
                <p className="text-sm text-gray-700 mb-2"><strong>แนะนำที่สุด!</strong></p>
                <p className="text-sm text-gray-600">เล็กกว่า JPG 25-35%, เล็กกว่า PNG 80%, คุณภาพดีกว่า</p>
                <div className="mt-2 text-xs text-gray-500">
                  ✅ Shopee ✅ Lazada ✅ Facebook
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-yellow-900">JPG/JPEG</h4>
                <p className="text-sm text-gray-700 mb-2">เหมาะกับรูปถ่าย</p>
                <p className="text-sm text-gray-600">ขนาดปานกลาง รองรับทุกแพลตฟอร์ม</p>
                <div className="mt-2 text-xs text-gray-500">
                  ⚠️ ไฟล์ใหญ่กว่า WebP
                </div>
              </div>

              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-red-900">PNG</h4>
                <p className="text-sm text-gray-700 mb-2">เหมาะกับโลโก้</p>
                <p className="text-sm text-gray-600">รองรับพื้นหลังโปร่งใส แต่ไฟล์ใหญ่มาก</p>
                <div className="mt-2 text-xs text-gray-500">
                  ❌ ไม่แนะนำสำหรับรูปสินค้า
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
              <p className="text-sm font-bold text-blue-900 mb-2">💡 คำแนะนำ:</p>
              <p className="text-sm text-gray-700">
                ใช้ <strong>WebP</strong> สำหรับรูปสินค้าทั่วไป และใช้ <strong>PNG</strong> เฉพาะกรณีที่ต้องการพื้นหลังโปร่งใส (เช่น โลโก้, ไอคอน)
              </p>
            </div>
          </div>
        </div>

        {/* Method 3 */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-black rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              3
            </div>
            <h2 className="text-3xl font-bold">ปรับขนาดมิติให้เหมาะสม</h2>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-orange-300">
            <p className="text-gray-700 mb-4">
              ไม่จำเป็นต้องใช้รูปขนาดใหญ่เกินไป ปรับให้พอดีกับแพลตฟอร์มที่คุณใช้
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-bold mb-2">🛒 Shopee</h4>
                <p className="text-sm text-gray-700">ขนาดแนะนำ: <strong>800x800px</strong> หรือ <strong>1000x1000px</strong></p>
                <p className="text-xs text-gray-600 mt-1">ไฟล์ไม่เกิน 2MB</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-bold mb-2">🛍️ Lazada</h4>
                <p className="text-sm text-gray-700">ขนาดแนะนำ: <strong>1000x1000px</strong> หรือ <strong>1200x1200px</strong></p>
                <p className="text-xs text-gray-600 mt-1">ไฟล์ไม่เกิน 1MB</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-bold mb-2">📱 Facebook/Instagram</h4>
                <p className="text-sm text-gray-700">ขนาดแนะนำ: <strong>1080x1080px</strong> (สำหรับโพสต์)</p>
                <p className="text-xs text-gray-600 mt-1">ไฟล์ไม่เกิน 1MB</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-bold mb-2">🌐 เว็บไซต์ทั่วไป</h4>
                <p className="text-sm text-gray-700">ขนาดแนะนำ: <strong>1200-1500px</strong> ด้านยาว</p>
                <p className="text-xs text-gray-600 mt-1">ไฟล์ไม่เกิน 500KB</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-sm font-bold text-yellow-900">⚠️ ข้อควรระวัง:</p>
              <p className="text-sm text-gray-700 mt-1">
                อย่าใช้รูปที่เล็กเกินไป เพราะจะทำให้ภาพดูไม่คมชัด ควรใช้ขนาดที่แนะนำข้างต้น
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Settings className="text-green-600" size={32} />
            เทคนิคเพิ่มเติม
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-5 border border-green-300">
              <h4 className="font-bold text-lg mb-2">🎯 ตั้งค่า Quality/Compression</h4>
              <p className="text-gray-700 text-sm">
                ส่วนใหญ่แนะนำใช้ Quality <strong>80-85%</strong> จะได้ภาพที่คมชัด ในขณะที่ขนาดไฟล์เล็กลงอย่างเห็นได้ชัด
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-green-300">
              <h4 className="font-bold text-lg mb-2">📐 ใช้ Aspect Ratio ที่เหมาะสม</h4>
              <p className="text-gray-700 text-sm">
                Shopee/Lazada ชอบรูปแบบ <strong>1:1 (สี่เหลี่ยมจัตุรัส)</strong> ส่วน Facebook/IG ใช้ได้ทั้ง 1:1 และ 4:5
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-green-300">
              <h4 className="font-bold text-lg mb-2">🔄 Batch Processing</h4>
              <p className="text-gray-700 text-sm">
                ถ้ามีรูปเยอะ ใช้เครื่องมือที่รองรับการย่อหลายรูปพร้อมกัน จะประหยัดเวลามาก <Link href="/" className="text-blue-600 underline">ย่อรูป.com รองรับ!</Link>
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-green-300">
              <h4 className="font-bold text-lg mb-2">💾 เก็บไฟล์ต้นฉบับไว้</h4>
              <p className="text-gray-700 text-sm">
                แนะนำให้เก็บไฟล์ต้นฉบับคุณภาพสูงไว้ก่อนย่อ เผื่อต้องการใช้งานในอนาคต
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center border-4 border-black">
          <h2 className="text-3xl font-bold mb-4">พร้อมลดขนาดรูปแล้วหรือยัง?</h2>
          <p className="text-xl mb-6 text-blue-100">
            ใช้เครื่องมือฟรีของเรา ย่อรูปได้ไม่จำกัด ไม่มีลายน้ำ!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
          >
            <Download size={24} />
            เริ่มย่อรูปตอนนี้
          </Link>
          <p className="text-sm mt-4 text-blue-100">
            ไม่ต้องสมัคร • ใช้ฟรี 100% • รองรับหลายรูปพร้อมกัน
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white border-2 border-black rounded-lg p-8 mt-8">
          <h2 className="text-3xl font-bold mb-6">คำถามที่พบบ่อย</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">ลดขนาดรูปแล้วจะแตกไหม?</h3>
              <p className="text-gray-700">
                ถ้าใช้เครื่องมือที่ดีและตั้งค่าถูกต้อง รูปจะไม่แตก! แนะนำใช้ WebP format และ quality 80-85% จะได้รูปที่คมชัดและขนาดเล็ก
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">ลดได้สูงสุดกี่ %?</h3>
              <p className="text-gray-700">
                ขึ้นอยู่กับรูปต้นฉบับ โดยเฉลี่ยลดได้ 60-80% โดยที่คุณภาพยังคงดี ถ้าแปลงจาก PNG เป็น WebP อาจลดได้ถึง 90%!
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">ต้องลงโปรแกรมไหม?</h3>
              <p className="text-gray-700">
                ไม่ต้องเลย! ใช้เว็บออนไลน์สะดวกกว่า เข้าใช้งานผ่านเบราว์เซอร์ได้เลย รองรับทั้งคอมและมือถือ
              </p>
            </div>

            <div className="pb-4">
              <h3 className="font-bold text-lg mb-2">ย่อได้ทีละกี่รูป?</h3>
              <p className="text-gray-700">
                <Link href="/" className="text-blue-600 underline">ย่อรูป.com</Link> รองรับการย่อหลายรูปพร้อมกัน ประหยัดเวลามากสำหรับคนที่มีรูปเยอะ!
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 mt-8">
          <h3 className="text-2xl font-bold mb-4">บทความที่เกี่ยวข้อง</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/webp-vs-jpg" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-blue-600 mb-1">WebP vs JPG</h4>
              <p className="text-sm text-gray-600">ต่างกันยังไง ควรใช้ไฟล์แบบไหนดี</p>
            </Link>
            <Link href="/shopee-image-size" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-blue-600 mb-1">ขนาดภาพ Shopee</h4>
              <p className="text-sm text-gray-600">ขนาดที่ถูกต้องสำหรับ Shopee</p>
            </Link>
            <Link href="/convert-webp-on-mobile" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-blue-600 mb-1">แปลง WebP บนมือถือ</h4>
              <p className="text-sm text-gray-600">ไม่ต้องลงแอพ ทำผ่านเว็บได้เลย</p>
            </Link>
            <Link href="/facebook-image-guide" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-blue-600 mb-1">ไซส์รูป Facebook</h4>
              <p className="text-sm text-gray-600">คู่มือขนาดรูป Facebook ล่าสุด</p>
            </Link>
          </div>
        </div>

      </article>

      {/* Footer */} 
    </div>
  );
}

