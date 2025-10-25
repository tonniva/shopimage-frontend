import Link from "next/link";
import { ArrowLeft, Zap, Facebook } from "lucide-react";

export const metadata = {
  title: "Facebook Image Size Guide 2025 | Complete Specifications",
  description: "Complete Facebook image size guide for posts, cover, profile, stories, ads. Updated 2025.",
  keywords: ["facebook image size", "facebook photo size", "facebook dimensions 2025"],
};

export default function FacebookImageGuideEN() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white border-b-2 border-black   top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Facebook size={64} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Facebook Image Size Guide 2025</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">Complete specifications for all image types</p>
          <Link href="/en" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl">
            <Zap size={24} />
            Resize for Facebook
          </Link>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">👤 Profile & Cover</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 border-2 border-blue-400 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Profile Picture</h3>
              <ul className="space-y-2 text-gray-700">
                <li>📐 <strong>Size:</strong> 180 x 180 pixels</li>
                <li>📏 <strong>Ratio:</strong> 1:1 (square)</li>
                <li>💡 <strong>Note:</strong> Displays as circle</li>
              </ul>
            </div>

            <div className="p-6 bg-indigo-50 border-2 border-indigo-400 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-indigo-900">Cover Photo</h3>
              <ul className="space-y-2 text-gray-700">
                <li>📐 <strong>Size:</strong> 820 x 360 pixels</li>
                <li>📏 <strong>Ratio:</strong> ~2.3:1</li>
                <li>💡 <strong>Recommended:</strong> Works on all devices</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-black rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">📱 Posts</h2>
          
          <div className="bg-white rounded-lg p-6 border border-green-300 space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2">Regular Post</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>Size:</strong> 1200 x 630 pixels</li>
                <li>📏 <strong>Ratio:</strong> 1.91:1</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">Square Post</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>Size:</strong> 1080 x 1080 pixels</li>
                <li>📏 <strong>Ratio:</strong> 1:1</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">Stories</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📐 <strong>Size:</strong> 1080 x 1920 pixels</li>
                <li>📏 <strong>Ratio:</strong> 9:16 (vertical)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 text-center border-4 border-black">
          <h2 className="text-3xl font-bold mb-4">Resize for Facebook</h2>
          <p className="text-xl mb-6 text-blue-100">Use our tool to auto-resize. Easy, fast, free!</p>
          <Link href="/en" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl">
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

