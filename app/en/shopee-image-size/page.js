import Link from "next/link";
import { ArrowLeft, Zap, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Shopee Image Size Requirements 2025 | Seller Guide",
  description: "Complete Shopee image size requirements, specs for product photos, banners. Updated 2025.",
  keywords: ["shopee image size", "shopee photo requirements", "shopee image specs"],
};

export default function ShopeeImageSizeEN() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-sm font-semibold hover:text-orange-600 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShoppingBag size={64} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Shopee Image Size Requirements</h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-8">Complete guide for product images, updated 2025</p>
          <Link href="/en" className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl">
            <Zap size={24} />
            Resize Images Automatically
          </Link>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">📦 Product Images</h2>
          
          <div className="p-6 bg-orange-50 border-2 border-orange-400 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-orange-900">Requirements</h3>
            <ul className="space-y-3 text-gray-700">
              <li>📐 <strong>Size:</strong> 800 x 800px to 1000 x 1000px</li>
              <li>📏 <strong>Ratio:</strong> 1:1 (square)</li>
              <li>📦 <strong>Max file size:</strong> 2 MB</li>
              <li>📄 <strong>Format:</strong> JPG, JPEG, PNG, WebP</li>
              <li>🖼️ <strong>Count:</strong> 1-9 images per product</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg p-8 text-center border-4 border-black">
          <h2 className="text-3xl font-bold mb-4">Resize for Shopee</h2>
          <p className="text-xl mb-6 text-orange-100">Use our tool to auto-resize. Easy, fast, free!</p>
          <Link href="/en" className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl">
            <Zap size={24} />
            Resize Now
          </Link>
        </div>
      </article>

      <footer className="border-t-2 border-black bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-xs">© 2025 Image Compressor</p>
        </div>
      </footer>
    </div>
  );
}

