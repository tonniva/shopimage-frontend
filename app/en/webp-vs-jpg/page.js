import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export const metadata = {
  title: "WebP vs JPG: Which Format is Better? Complete Comparison 2025",
  description: "Compare WebP vs JPG image formats. Pros, cons, and which to use for Shopee, Lazada. Complete guide.",
  keywords: ["webp vs jpg", "image format comparison", "webp or jpg"],
};

export default function WebPvsJPGEN() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-sm font-semibold hover:text-green-600 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">WebP vs JPG<br />Which Format is Better?</h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8">Complete comparison to help you choose the right format</p>
          <Link href="/en" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <Zap size={24} />
            Convert to WebP Free
          </Link>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">Quick Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-green-900">✅ WebP</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>🚀 <strong>Smaller files</strong> 25-35% than JPG</li>
                <li>🎨 <strong>Better quality</strong> at same size</li>
                <li>⚡ <strong>Faster loading</strong> saves bandwidth</li>
                <li>✅ <strong>Modern standard</strong> for web</li>
              </ul>
            </div>

            <div className="p-6 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-yellow-900">⚠️ JPG</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📦 <strong>Larger files</strong> than WebP</li>
                <li>🔧 <strong>Universal support</strong> even old devices</li>
                <li>📷 <strong>Traditional format</strong> widely used</li>
                <li>⏳ <strong>Slower loading</strong> than WebP</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 text-center border-4 border-black">
          <h2 className="text-3xl font-bold mb-4">Recommendation: Use WebP!</h2>
          <p className="text-xl mb-6">For online sellers, WebP is the best choice</p>
          <Link href="/en" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl">
            Convert to WebP Now
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

