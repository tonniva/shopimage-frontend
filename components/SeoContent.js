export default function SeoContent({ lang = "th" }) {
  if (lang === "en") {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-8">
        {/* Main SEO Content */}
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Free Online Image Compressor for Shopee & Lazada | Convert to WebP
          </h1>
          
          <div className="bg-white border-2 border-black p-6 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold">
              Professional Image Compression Tool for E-commerce
            </h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Looking for an online image compression tool?</strong> Our website is the perfect solution for online sellers, especially those selling on <strong>Shopee</strong> and <strong>Lazada</strong>. We support converting to <strong>WebP</strong>, <strong>JPG</strong>, and <strong>PNG</strong> formats with automatic size optimization for each platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With our advanced compression technology, your product images will remain <strong>sharp and clear</strong> while reducing file sizes by up to <strong>70-80%</strong> compared to the original. This helps your store pages load faster, improves customer experience, and saves internet data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 border-2 border-black p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🚀 Why Choose Our Service?
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ <strong>100% Free</strong> - No hidden fees, unlimited use</li>
                <li>✅ <strong>Crystal Clear Quality</strong> - Advanced compression without quality loss</li>
                <li>✅ <strong>Fast Processing</strong> - Convert hundreds of images in minutes</li>
                <li>✅ <strong>No Watermarks</strong> - Get clean, professional results</li>
                <li>✅ <strong>Secure</strong> - All processing done in your browser</li>
                <li>✅ <strong>Mobile Friendly</strong> - Works on all devices</li>
              </ul>
            </div>

            <div className="bg-red-50 border-2 border-black p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🎯 Perfect for E-commerce Platforms
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>🛒 <strong>Shopee</strong> - Optimized for 1:1 square format</li>
                <li>🛍️ <strong>Lazada</strong> - Perfect dimensions for listings</li>
                <li>📱 <strong>Facebook Shop</strong> - Social media optimized</li>
                <li>🌐 <strong>Your Own Website</strong> - Faster loading times</li>
                <li>📸 <strong>Instagram Shop</strong> - Social commerce ready</li>
                <li>💼 <strong>LINE Shopping</strong> - Thai market optimized</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-black p-6 rounded-lg mt-6">
            <h3 className="text-xl font-bold mb-4">
              📊 Recommended Image Sizes for Popular Platforms
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded border border-gray-300">
                <h4 className="font-bold text-lg mb-2">Shopee</h4>
                <p className="text-gray-600">Size: <strong>800x800px</strong></p>
                <p className="text-gray-600">Max: <strong>2MB</strong></p>
                <p className="text-gray-600">Format: <strong>WebP, JPG</strong></p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-300">
                <h4 className="font-bold text-lg mb-2">Lazada</h4>
                <p className="text-gray-600">Size: <strong>1000x1000px</strong></p>
                <p className="text-gray-600">Max: <strong>1MB</strong></p>
                <p className="text-gray-600">Format: <strong>WebP, JPG</strong></p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-300">
                <h4 className="font-bold text-lg mb-2">Facebook</h4>
                <p className="text-gray-600">Size: <strong>1200x1200px</strong></p>
                <p className="text-gray-600">Max: <strong>1MB</strong></p>
                <p className="text-gray-600">Format: <strong>WebP, JPG</strong></p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 rounded-lg mt-6">
            <h3 className="text-xl font-bold mb-4">
              💡 How to Use - 3 Easy Steps
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <strong>Upload Images</strong> - Drag and drop or click to select your product images (supports multiple files)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <strong>Choose Settings</strong> - Select your platform preset (Shopee/Lazada) or customize dimensions and format
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <strong>Download Results</strong> - Click convert and download your optimized images in seconds!
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 border-2 border-black p-6 rounded-lg mt-6">
            <h3 className="text-xl font-bold mb-4">
              🌟 WebP Format - Why It's Better?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>WebP</strong> is a modern image format developed by Google that provides superior compression compared to traditional JPEG and PNG formats. When you convert your product images to WebP:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>📦 <strong>Smaller File Size</strong> - 25-35% smaller than JPEG, 80% smaller than PNG</li>
              <li>⚡ <strong>Faster Loading</strong> - Reduced file size means faster page loads</li>
              <li>🎨 <strong>Better Quality</strong> - Maintains image sharpness and color accuracy</li>
              <li>💾 <strong>Save Storage</strong> - Use less storage space on your hosting</li>
              <li>🔋 <strong>Save Data</strong> - Customers use less mobile data</li>
              <li>📈 <strong>Better SEO</strong> - Google loves fast-loading pages</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-black p-6 rounded-lg mt-6">
            <h3 className="text-xl font-bold mb-4">
              ❓ Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-lg mb-2">Is this service really free?</h4>
                <p className="text-gray-700">
                  Yes! We offer 100% free image compression with no hidden fees. Perfect for online sellers who need to optimize hundreds of product images.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Will the image quality decrease?</h4>
                <p className="text-gray-700">
                  Our advanced compression algorithm maintains excellent image quality while significantly reducing file size. Your product images will remain sharp and clear.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Can I upload multiple images at once?</h4>
                <p className="text-gray-700">
                  Absolutely! You can upload and process multiple images simultaneously, saving you time when preparing product listings.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">What file formats are supported?</h4>
                <p className="text-gray-700">
                  We support all common image formats including JPG, JPEG, PNG, and WebP. You can convert between formats easily.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Is my data secure?</h4>
                <p className="text-gray-700">
                  Yes, all image processing happens in your browser. Your images are never uploaded to our servers, ensuring complete privacy and security.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-black p-6 rounded-lg mt-6">
            <h3 className="text-xl font-bold mb-4">
              🎁 Perfect For Online Sellers
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Whether you're a small business owner, dropshipper, or large e-commerce store, our image compression tool helps you:
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>💰 <strong>Save Time</strong> - Batch process hundreds of images quickly</li>
              <li>💡 <strong>Save Money</strong> - No need for expensive photo editing software</li>
              <li>📱 <strong>Mobile Ready</strong> - Optimize images right from your phone</li>
              <li>🌏 <strong>Work Anywhere</strong> - No installation required, works in browser</li>
              <li>🚀 <strong>Boost Sales</strong> - Faster loading pages = better conversion rates</li>
              <li>⭐ <strong>Professional Results</strong> - High-quality images that impress customers</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-black p-6 rounded-lg mt-6 text-center">
            <h3 className="text-2xl font-bold mb-4">
              🚀 Start Optimizing Your Product Images Now!
            </h3>
            <p className="text-gray-700 text-lg mb-4">
              Join thousands of online sellers who trust our free image compression tool
            </p>
            <p className="text-sm text-gray-600">
              No registration required • 100% Free • No watermarks • Fast processing
            </p>
          </div>
        </div>

        {/* Keywords Footer */}
        <div className="border-t-2 border-black pt-6 mt-12">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Related Keywords:</strong> image compressor, compress image, reduce image size, convert to webp, 
            webp converter, jpg to webp, png to webp, image optimizer, online image compression, 
            free image compressor, shopee image size, lazada image requirements, e-commerce image tool, 
            product image optimization, bulk image resize, batch image converter, webp format, 
            image quality reducer, fast image compression, no watermark, free online tool, 
            image resizer, photo compressor, picture optimizer, web image format
          </p>
        </div>
      </div>
    );
  }

  // Thai Version
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-8">
      {/* Main SEO Content */}
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          ย่อรูปภาพออนไลน์ฟรี สำหรับ Shopee & Lazada | แปลงเป็น WebP
        </h1>
        
        <div className="bg-white border-2 border-black p-6 rounded-lg space-y-4">
          <h2 className="text-2xl font-bold">
            เครื่องมือย่อรูปภาพมาตรฐานมืออาชีพสำหรับการขายออนไลน์
          </h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>กำลังมองหาเว็บย่อรูปภาพอยู่ใช่ไหม?</strong> เว็บไซต์ของเราคือคำตอบที่สมบูรณ์แบบสำหรับพ่อค้าแม่ค้าออนไลน์ โดยเฉพาะคนขายของบน <strong>Shopee</strong> และ <strong>Lazada</strong> เรารองรับการแปลงเป็น <strong>WebP</strong>, <strong>JPG</strong> และ <strong>PNG</strong> พร้อมปรับขนาดอัตโนมัติตามแต่ละแพลตฟอร์ม
          </p>
          <p className="text-gray-700 leading-relaxed">
            ด้วยเทคโนโลยีการบีบอัดที่ทันสมัย รูปสินค้าของคุณจะยังคง<strong>คมชัดสวยงาม</strong> ในขณะที่ขนาดไฟล์ลดลงถึง <strong>70-80%</strong> จากต้นฉบับ ช่วยให้หน้าร้านของคุณโหลดเร็วขึ้น ประหยัดเน็ต และสร้างประสบการณ์ที่ดีให้ลูกค้า
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 border-2 border-black p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🚀 ทำไมต้องเลือกเราใช้?
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ <strong>ใช้ฟรี 100%</strong> - ไม่มีค่าใช้จ่ายแอบแฝง ใช้ได้ไม่จำกัด</li>
              <li>✅ <strong>คมชัดสุดๆ</strong> - เทคโนโลยีบีบอัดขั้นสูง ไม่ลดคุณภาพ</li>
              <li>✅ <strong>แปลงเร็ว</strong> - ประมวลผลได้หลายร้อยรูปในไม่กี่นาที</li>
              <li>✅ <strong>ไม่มีลายน้ำ</strong> - รับไฟล์สะอาดใช้งานได้ทันที</li>
              <li>✅ <strong>ปลอดภัย</strong> - ประมวลผลในเบราว์เซอร์ของคุณ</li>
              <li>✅ <strong>รองรับมือถือ</strong> - ใช้งานได้ทุกอุปกรณ์</li>
            </ul>
          </div>

          <div className="bg-red-50 border-2 border-black p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🎯 เหมาะกับแพลตฟอร์มอีคอมเมิร์ซทุกประเภท
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>🛒 <strong>Shopee</strong> - ปรับขนาดเหมาะกับ Shopee โดยเฉพาะ</li>
              <li>🛍️ <strong>Lazada</strong> - ขนาดลงตัวสำหรับการลิสต์สินค้า</li>
              <li>📱 <strong>Facebook Shop</strong> - เหมาะกับโซเชียลมีเดีย</li>
              <li>🌐 <strong>เว็บไซต์ของคุณเอง</strong> - โหลดเร็วขึ้น</li>
              <li>📸 <strong>Instagram Shop</strong> - พร้อมขายบน IG</li>
              <li>💼 <strong>LINE Shopping</strong> - เหมาะกับตลาดไทย</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-black p-6 rounded-lg mt-6">
          <h3 className="text-xl font-bold mb-4">
            📊 ขนาดรูปที่แนะนำสำหรับแพลตฟอร์มยอดนิยม
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded border border-gray-300">
              <h4 className="font-bold text-lg mb-2">Shopee</h4>
              <p className="text-gray-600">ขนาด: <strong>800x800px</strong></p>
              <p className="text-gray-600">สูงสุด: <strong>2MB</strong></p>
              <p className="text-gray-600">ไฟล์: <strong>WebP, JPG</strong></p>
            </div>
            <div className="bg-white p-4 rounded border border-gray-300">
              <h4 className="font-bold text-lg mb-2">Lazada</h4>
              <p className="text-gray-600">ขนาด: <strong>1000x1000px</strong></p>
              <p className="text-gray-600">สูงสุด: <strong>1MB</strong></p>
              <p className="text-gray-600">ไฟล์: <strong>WebP, JPG</strong></p>
            </div>
            <div className="bg-white p-4 rounded border border-gray-300">
              <h4 className="font-bold text-lg mb-2">Facebook</h4>
              <p className="text-gray-600">ขนาด: <strong>1200x1200px</strong></p>
              <p className="text-gray-600">สูงสุด: <strong>1MB</strong></p>
              <p className="text-gray-600">ไฟล์: <strong>WebP, JPG</strong></p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-lg mt-6">
          <h3 className="text-xl font-bold mb-4">
            💡 วิธีใช้งาน - ง่ายๆ แค่ 3 ขั้นตอน
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <strong>อัปโหลดรูป</strong> - ลากวางหรือคลิกเลือกรูปสินค้าของคุณ (รองรับหลายไฟล์พร้อมกัน)
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <strong>เลือกการตั้งค่า</strong> - เลือก preset ตามแพลตฟอร์ม (Shopee/Lazada) หรือปรับแต่งเองตามต้องการ
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <strong>ดาวน์โหลดผลลัพธ์</strong> - กดแปลงและดาวน์โหลดรูปที่ย่อแล้วภายในไม่กี่วินาที!
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-green-50 border-2 border-black p-6 rounded-lg mt-6">
          <h3 className="text-xl font-bold mb-4">
            🌟 WebP Format - ทำไมถึงดีกว่า?
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>WebP</strong> เป็นรูปแบบไฟล์รูปภาพสมัยใหม่ที่พัฒนาโดย Google ให้การบีบอัดที่ดีกว่า JPEG และ PNG แบบดั้งเดิม เมื่อคุณแปลงรูปสินค้าเป็น WebP:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>📦 <strong>ไฟล์เล็กกว่า</strong> - เล็กกว่า JPEG 25-35%, เล็กกว่า PNG 80%</li>
            <li>⚡ <strong>โหลดเร็วกว่า</strong> - ไฟล์เล็กทำให้หน้าเว็บโหลดไวขึ้น</li>
            <li>🎨 <strong>คุณภาพดีกว่า</strong> - รักษาความคมชัดและสีสันได้ดี</li>
            <li>💾 <strong>ประหยัดพื้นที่</strong> - ใช้พื้นที่จัดเก็บน้อยลง</li>
            <li>🔋 <strong>ประหยัดเน็ต</strong> - ลูกค้าใช้เน็ตน้อยลง</li>
            <li>📈 <strong>SEO ดีขึ้น</strong> - Google ชอบเว็บที่โหลดเร็ว</li>
          </ul>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-lg mt-6">
          <h3 className="text-xl font-bold mb-4">
            ❓ คำถามที่พบบ่อย
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2">ใช้ฟรีจริงหรือ?</h4>
              <p className="text-gray-700">
                ใช่ค่ะ! เราให้บริการย่อรูปภาพฟรี 100% ไม่มีค่าใช้จ่ายแอบแฝง เหมาะสำหรับพ่อค้าแม่ค้าออนไลน์ที่ต้องย่อรูปสินค้าหลายร้อยรูป
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">คุณภาพรูปจะลดลงไหม?</h4>
              <p className="text-gray-700">
                อัลกอริทึมการบีบอัดของเรารักษาคุณภาพภาพได้ดีมาก พร้อมกับลดขนาดไฟล์อย่างมีนัยสำคัญ รูปสินค้าของคุณจะยังคงคมชัดสวยงาม
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">อัปโหลดได้ทีละหลายรูปไหม?</h4>
              <p className="text-gray-700">
                ได้เลยค่ะ! คุณสามารถอัปโหลดและประมวลผลหลายรูปพร้อมกันได้ ช่วยประหยัดเวลาในการเตรียมรูปสินค้า
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">รองรับไฟล์รูปแบบไหนบ้าง?</h4>
              <p className="text-gray-700">
                เรารองรับไฟล์รูปภาพทั่วไปทั้งหมด รวมถึง JPG, JPEG, PNG และ WebP คุณสามารถแปลงระหว่างรูปแบบได้ง่ายๆ
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">ข้อมูลของฉันปลอดภัยไหม?</h4>
              <p className="text-gray-700">
                ปลอดภัยมากค่ะ การประมวลผลรูปภาพทั้งหมดเกิดขึ้นในเบราว์เซอร์ของคุณ รูปของคุณจะไม่ถูกอัปโหลดไปยังเซิร์ฟเวอร์ของเรา รับประกันความเป็นส่วนตัวและความปลอดภัย
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-black p-6 rounded-lg mt-6">
          <h3 className="text-xl font-bold mb-4">
            🎁 เหมาะสำหรับพ่อค้าแม่ค้าออนไลน์
          </h3>
          <p className="text-gray-700 leading-relaxed">
            ไม่ว่าคุณจะเป็นเจ้าของธุรกิจขนาดเล็ก นักดรอปชิป หรือร้านค้าออนไลน์ขนาดใหญ่ เครื่องมือย่อรูปของเราช่วยคุณ:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>💰 <strong>ประหยัดเวลา</strong> - ย่อรูปได้หลายร้อยรูปอย่างรวดเร็ว</li>
            <li>💡 <strong>ประหยัดเงิน</strong> - ไม่ต้องซื้อโปรแกรมแต่งรูปราคาแพง</li>
            <li>📱 <strong>ใช้งานบนมือถือได้</strong> - ย่อรูปจากมือถือได้เลย</li>
            <li>🌏 <strong>ทำงานได้ทุกที่</strong> - ไม่ต้องติดตั้ง ใช้งานผ่านเบราว์เซอร์</li>
            <li>🚀 <strong>เพิ่มยอดขาย</strong> - หน้าเว็บโหลดเร็ว = ยอดขายดีขึ้น</li>
            <li>⭐ <strong>ผลลัพธ์มืออาชีพ</strong> - รูปคุณภาพสูงที่สร้างความประทับใจ</li>
          </ul>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-lg mt-6 text-center">
          <h3 className="text-2xl font-bold mb-4">
            🚀 เริ่มย่อรูปสินค้าของคุณตอนนี้เลย!
          </h3>
          <p className="text-gray-700 text-lg mb-4">
            เข้าร่วมกับพ่อค้าแม่ค้าออนไลน์หลายพันคนที่ไว้วางใจเครื่องมือย่อรูปฟรีของเรา
          </p>
          <p className="text-sm text-gray-600">
            ไม่ต้องสมัครสมาชิก • ใช้ฟรี 100% • ไม่มีลายน้ำ • ประมวลผลเร็ว
          </p>
        </div>
      </div>

      {/* Keywords Footer */}
      <div className="border-t-2 border-black pt-6 mt-12">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>คำค้นยอดนิยม:</strong> ย่อรูป, ย่อรูปออนไลน์, ลดขนาดรูป, แปลงรูป webp, 
          convert to webp, compress image, เว็บย่อรูป, บีบอัดรูปภาพ, ย่อรูป shopee, 
          ขนาดรูป shopee, ย่อรูป lazada, แปลงรูป lazada, ขายของออนไลน์, 
          ทำร้านค้าออนไลน์, เว็บลดขนาดรูป, เปลี่ยน JPG เป็น WebP, ย่อรูปฟรี, 
          ย่อรูปไม่เสียคุณภาพ, เครื่องมือย่อรูป, ปรับขนาดรูป, รีไซส์รูป, 
          optimize image, image compressor, webp converter, ย่อรูปสินค้า, ย่อรูปเร็ว,
          ย่อรูปคมชัด, ย่อรูปไม่มีลายน้ำ
        </p>
      </div>
    </div>
  );
}

