"use client";
import Link from "next/link";
import Image from "next/image";

export default function AppFooter() {
  const BMAC_URL = "https://www.buymeacoffee.com/mulufabo";
  const QR_SRC = "/qr-code.png";

  return (
    <footer className="mt-12 border-t-2 border-black bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Side: Info & Messages */}
          <div className="space-y-4">
            <div className="text-sm text-white leading-relaxed">
              <p className="font-bold text-xl text-gray-900 mb-3">
                Every donation = cat food 🐱❤️
              </p>
              <p className="font-medium text-white mb-2">
                Your support means food and love for my cats ❤️🐱
              </p>
              <p className="text-xs text-white">
                100% of all support is used for cat food only.
              </p>
              <div className="text-xs text-white mt-2">
                👉 *Files auto deleted after midnight 🔥
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-white">
                © {new Date().getFullYear()} To Webp — All rights reserved.
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href="mailto:tongiggabite@gmail.com"
                className="px-4 py-2 border-2 border-black rounded-lg bg-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] transition-all duration-150 font-semibold text-sm"
              >
                Email Contact
              </a>
            </div>
          </div>

          {/* Right Side: Support QR */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <Link
              href={BMAC_URL}
              target="_blank"
              rel="noopener"
              className="group"
            >
              <div className="p-4 border-2 border-black rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-y-0 active:shadow-[3px_3px_0_#000] transition-all duration-150">
                <Image
                  src={QR_SRC}
                  alt="Support QR"
                  width={140}
                  height={140}
                  className="rounded-xl"
                  priority
                />
              </div>
              <div className="text-center mt-3">
                <div className="text-base font-bold text-gray-900">Support 🐱❤️</div>
                <div className="text-sm text-white">Scan to donate</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
