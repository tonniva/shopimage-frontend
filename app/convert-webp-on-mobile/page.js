import Link from "next/link";
import { ArrowLeft, Smartphone, CheckCircle, Zap, Shield } from "lucide-react";

export const metadata = {
  title: "แปลงรูป WebP บนมือถือ ไม่ต้องลงแอพ | ฟรี 2025",
  description: "วิธีแปลงรูป WebP บนมือถือ iPhone Android ไม่ต้องลงแอพ ใช้งานผ่านเว็บได้ทันที ฟรี ไม่มีลายน้ำ รองรับทุกมือถือ",
  keywords: ["แปลง webp มือถือ", "convert webp mobile", "webp converter", "แปลงรูปบนมือถือ", "ไม่ต้องลงแอพ"],
  openGraph: {
    title: "แปลงรูป WebP บนมือถือ ไม่ต้องลงแอพ",
    description: "แปลงรูปเป็น WebP จากมือถือ ใช้งานง่าย ฟรี ไม่มีลายน้ำ",
  },
};

export default function ConvertWebPOnMobile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-black   top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-semibold hover:text-purple-600 transition-colors"
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
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Smartphone size={64} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            แปลงรูป WebP บนมือถือ<br />ไม่ต้องลงแอพ
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8">
            ใช้งานผ่านเว็บได้ทันที รองรับทั้ง iPhone และ Android ฟรี ไม่มีลายน้ำ
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          >
            <Zap size={24} />
            เริ่มแปลงเลย
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Why Use Mobile */}
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">ทำไมต้องแปลง WebP บนมือถือ?</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              หลายคนขายของออนไลน์โดยใช้มือถือเป็นหลัก ไม่มีคอมพิวเตอร์ หรืออาจจะอยู่นอกบ้าน ต้องการแปลงรูปด่วนๆ การที่สามารถ<strong>แปลงรูป WebP ผ่านมือถือโดยไม่ต้องลงแอพ</strong>จึงสะดวกมาก!
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>ไม่ต้องลงแอพ</strong> - ประหยัดพื้นที่ในมือถือ ไม่ต้องติดตั้งอะไรเพิ่ม</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>ใช้งานทันที</strong> - เปิดเว็บ อัปโหลด แปลง ดาวน์โหลด เสร็จ!</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>รองรับทุกมือถือ</strong> - ทั้ง iPhone, Samsung, Oppo, Vivo, Xiaomi</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>แปลงได้ทุกที่</strong> - อยู่ที่ไหนก็แปลงได้ มีแค่เน็ต</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                <span><strong>ฟรี 100%</strong> - ไม่มีค่าใช้จ่าย ไม่ต้องสมัครสมาชิก</span>
              </li>
            </ul>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Smartphone className="text-purple-600" size={36} />
            วิธีแปลงรูป WebP บนมือถือ
          </h2>
          
          <div className="bg-white rounded-lg p-6 border border-purple-300 space-y-6">
            <p className="text-gray-700 text-lg">
              ง่ายมาก! ทำตามขั้นตอนนี้เลย 👇
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">เปิดเว็บไซต์</h3>
                  <p className="text-gray-700 mb-3">
                    เปิดเบราว์เซอร์บนมือถือ (Safari, Chrome, หรืออะไรก็ได้) แล้วเข้า <Link href="/" className="text-purple-600 underline font-semibold">ย่อรูป.com</Link>
                  </p>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                    💡 <strong>Tip:</strong> บันทึกเว็บไว้ในบุ๊กมาร์คเพื่อเข้าใช้งานง่ายครั้งหน้า
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">เลือกรูปจากมือถือ</h3>
                  <p className="text-gray-700 mb-3">
                    กดปุ่ม &ldquo;เลือกไฟล์&rdquo; หรือ &ldquo;Upload&rdquo; แล้วเลือกรูปจาก:
                  </p>
                  <ul className="space-y-2 ml-4 text-gray-700">
                    <li>📸 รูปที่ถ่ายใหม่ (กล้อง)</li>
                    <li>🖼️ คลังรูปภาพ (Gallery)</li>
                    <li>📁 ไฟล์ที่ดาวน์โหลดไว้</li>
                  </ul>
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-300 text-sm">
                    ✅ รองรับหลายรูปพร้อมกัน เลือกได้เลยไม่ต้องทีละรูป!
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">ตั้งค่าการแปลง</h3>
                  <p className="text-gray-700 mb-3">
                    เลือกรูปแบบเป็น <strong className="text-purple-600">WebP</strong> และเลือก Preset ตามแพลตฟอร์มที่ใช้:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg text-center">
                      <div className="font-bold text-orange-900">🛒 Shopee</div>
                      <div className="text-xs text-gray-600 mt-1">800x800px</div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-center">
                      <div className="font-bold text-blue-900">🛍️ Lazada</div>
                      <div className="text-xs text-gray-600 mt-1">1000x1000px</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">กดแปลงและดาวน์โหลด</h3>
                  <p className="text-gray-700 mb-3">
                    กดปุ่ม <strong>&ldquo;Convert&rdquo;</strong> รอสักครู่ (ไม่เกิน 10 วินาที) จากนั้นกด <strong>&ldquo;Download&rdquo;</strong> เพื่อบันทึกรูปลงมือถือ
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-300 text-sm">
                    📱 รูปจะบันทึกลงในแกลเลอรี่หรือโฟลเดอร์ดาวน์โหลดของมือถือคุณ
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 rounded-lg">
              <h4 className="font-bold text-green-900 text-lg mb-3 flex items-center gap-2">
                <Shield className="text-green-600" />
                ปลอดภัย 100%
              </h4>
              <p className="text-sm text-gray-700">
                การประมวลผลรูปภาพทั้งหมดเกิดขึ้นในเบราว์เซอร์ของคุณ <strong>ไม่มีการอัปโหลดรูปไปเซิร์ฟเวอร์</strong> รูปของคุณปลอดภัย 100%
              </p>
            </div>
          </div>
        </div>

        {/* Comparison iPhone vs Android */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">รองรับทุกมือถือ</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border-2 border-blue-400">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">🍎 iPhone / iOS</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>iOS 14 ขึ้นไป</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>ใช้ Safari หรือ Chrome</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>รองรับทุกรุ่น iPhone</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>iPad ก็ใช้ได้</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-600">
                <strong>เคล็ดลับ:</strong> เพิ่มเว็บไปหน้าจอหลักเหมือนแอพได้ด้วย &ldquo;Add to Home Screen&rdquo;
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-green-400">
              <h3 className="text-2xl font-bold mb-4 text-green-900">🤖 Android</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>Android 8.0 ขึ้นไป</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>Chrome, Firefox, Edge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>Samsung, Oppo, Vivo, etc.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>Tablet Android ก็โอเค</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-gray-600">
                <strong>เคล็ดลับ:</strong> ใน Chrome กด &ldquo;เพิ่มที่หน้าจอหลัก&rdquo; เพื่อเข้าถึงได้ง่าย
              </div>
            </div>
          </div>
        </div>

        {/* Benefits of WebP on Mobile */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">ทำไมต้อง WebP สำหรับมือถือ?</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-5 border border-orange-300">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                📦 ประหยัดเน็ต
              </h4>
              <p className="text-gray-700 text-sm">
                WebP เล็กกว่า JPG ถึง <strong>25-35%</strong> ลูกค้าที่ใช้เน็ตมือถือจะชอบมาก เพราะโหลดเร็วและประหยัดค่าเน็ต
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-orange-300">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                ⚡ โหลดเร็วบนมือถือ
              </h4>
              <p className="text-gray-700 text-sm">
                ไฟล์เล็กทำให้รูปโหลดเร็วขึ้นมาก สำคัญมากสำหรับคนใช้มือถือที่มีสัญญาณไม่แรง
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-orange-300">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                🎨 คมชัดบนหน้าจอมือถือ
              </h4>
              <p className="text-gray-700 text-sm">
                WebP รักษาคุณภาพได้ดีมาก รูปสินค้าจะคมชัดสวยงามบนหน้าจอมือถือทุกรุ่น
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-orange-300">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                ✅ รองรับทุกแพลตฟอร์ม
              </h4>
              <p className="text-gray-700 text-sm">
                Shopee, Lazada, Facebook, Instagram, LINE รองรับ WebP หมดแล้ว ใช้ได้ไม่มีปัญหา
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">💡 เทคนิคการใช้งานบนมือถือ</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-bold mb-2">1. ถ่ายรูปด้วยมือถือแล้วแปลงทันที</h4>
              <p className="text-sm text-gray-700">
                ถ่ายรูปสินค้าเสร็จ → เปิดเว็บ → เลือกรูปที่เพิ่งถ่าย → แปลงเป็น WebP → อัปโหลดลง Shopee ได้เลย!
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold mb-2">2. บันทึกเป็น Bookmark</h4>
              <p className="text-sm text-gray-700">
                เก็บเว็บไว้ในบุ๊กมาร์ค หรือเพิ่มไปหน้าจอหลัก จะได้เข้าใช้งานง่ายทุกครั้ง
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-bold mb-2">3. แปลงหลายรูปพร้อมกัน</h4>
              <p className="text-sm text-gray-700">
                เลือกหลายรูปพร้อมกัน ประหยัดเวลามาก ไม่ต้องทีละรูป
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-bold mb-2">4. ใช้ WiFi ถ้าแปลงรูปเยอะ</h4>
              <p className="text-sm text-gray-700">
                ถ้ามีรูปเยอะ แนะนำใช้ WiFi จะได้ไม่เปลืองเน็ตมือถือ
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 text-center border-4 border-black">
          <h2 className="text-3xl font-bold mb-4">พร้อมแปลงรูปบนมือถือแล้วหรือยัง?</h2>
          <p className="text-xl mb-6 text-purple-100">
            ไม่ต้องลงแอพ เปิดเว็บแปลงได้เลย ฟรี!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
          >
            <Smartphone size={24} />
            เปิดเว็บแปลงเลย
          </Link>
          <p className="text-sm mt-4 text-purple-100">
            รองรับทั้ง iPhone และ Android • ไม่ต้องสมัคร • ฟรี 100%
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white border-2 border-black rounded-lg p-8 mt-8">
          <h2 className="text-3xl font-bold mb-6">คำถามที่พบบ่อย</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">ต้องลงแอพไหม?</h3>
              <p className="text-gray-700">
                ไม่ต้องเลย! ใช้งานผ่านเว็บเบราว์เซอร์ได้เลย ไม่ต้องติดตั้งอะไรเพิ่ม ประหยัดพื้นที่ในมือถือ
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">iPhone ใช้ได้ไหม?</h3>
              <p className="text-gray-700">
                ได้สบายๆ! รองรับทั้ง iPhone และ iPad เปิด Safari หรือ Chrome แล้วเข้าเว็บได้เลย
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg mb-2">รูปจะหายไหม?</h3>
              <p className="text-gray-700">
                ไม่หายค่ะ การประมวลผลทั้งหมดเกิดในเบราว์เซอร์ของคุณ รูปไม่ได้ถูกส่งไปเซิร์ฟเวอร์ปลอดภัย 100%
              </p>
            </div>

            <div className="pb-4">
              <h3 className="font-bold text-lg mb-2">เน็ตช้าใช้ได้ไหม?</h3>
              <p className="text-gray-700">
                ได้ค่ะ เพียงแค่โหลดหน้าเว็บได้ ก็แปลงได้แล้ว ส่วนการประมวลผลจะทำในมือถือของคุณ ไม่ต้องใช้เน็ตเยอะ
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 mt-8">
          <h3 className="text-2xl font-bold mb-4">บทความที่เกี่ยวข้อง</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/how-to-reduce-image-size" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-purple-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-purple-600 mb-1">วิธีลดขนาดรูป</h4>
              <p className="text-sm text-gray-600">ลดขนาดรูปให้ไม่แตก</p>
            </Link>
            <Link href="/webp-vs-jpg" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-purple-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-purple-600 mb-1">WebP vs JPG</h4>
              <p className="text-sm text-gray-600">ต่างกันยังไง ควรใช้ไฟล์ไหน</p>
            </Link>
            <Link href="/shopee-image-size" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-purple-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-purple-600 mb-1">ขนาดภาพ Shopee</h4>
              <p className="text-sm text-gray-600">ขนาดที่ถูกต้องสำหรับ Shopee</p>
            </Link>
            <Link href="/facebook-image-guide" className="p-4 bg-white border border-gray-300 rounded-lg hover:border-purple-500 hover:shadow-md transition-all">
              <h4 className="font-bold text-purple-600 mb-1">ไซส์รูป Facebook</h4>
              <p className="text-sm text-gray-600">คู่มือขนาดรูป Facebook ล่าสุด</p>
            </Link>
          </div>
        </div>

      </article>

      {/* Footer */}
      
    </div>
  );
}

