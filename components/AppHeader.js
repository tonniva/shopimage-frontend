"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";

function HeaderButton({ className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-sm border border-black bg-white transition";
  return (
    <button
      className={`${base} hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "px-2 py-1 rounded-md text-sm transition-all duration-150 border",
        active
          ? "bg-black text-white border-black shadow-[3px_3px_0_#000]"
          : "bg-white text-black border-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
};

export default function AppHeader() {
  const [hover, setHover] = useState(false);
  const { user, ready } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      localStorage.removeItem("sb-zrpqkfqkbjrulawdpwsf-auth-token");
      sessionStorage.clear();
      router.replace("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // === Config ===
  const BMAC_URL = "https://www.buymeacoffee.com/mulufabo"; // เปลี่ยนเป็นของคุณ
  const QR_SRC = "/qr-code.png"; // วางไฟล์ไว้ที่ public/qr-bmac.png
  const LOGO = "/logo.png"; // วางไฟล์ไว้ที่ public/qr-bmac.png
  const LOGO_SM = "/image_sm.png"; // วางไฟล์ไว้ที่ public/qr-bmac.png

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-auto py-2 md:py-0 md:h-16 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Brand + nav */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
            <Link
            href="/"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="p-2 border border-black rounded-2xl bg-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition"
          >
            <Image
              src={hover ? LOGO_SM : LOGO}
              alt="Cat Logo"
              width={100}
              height={100}
              className="rounded-xl"
              priority
            />
          </Link>
          
              {/* <span className="hidden sm:inline text-xs text-gray-500">v1</span> */}
            </div>

            {/* Mobile: QR button shortcut */}
            <Link
              href={BMAC_URL}
              target="_blank"
              rel="noopener"
              className="md:hidden inline-flex items-center gap-2 rounded-xl border border-black bg-white px-3 py-1 text-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition"
              aria-label="Support Cat Food"
            >
              <span>Support</span>
              <span className="text-xs">🐱❤️</span>
            </Link>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-2 md:order-3">
            {!ready ? (
              <span className="text-xs text-gray-500">Checking…</span>
            ) : user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs uppercase">
                    {user.email?.[0] ?? "U"}
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-700 hover:underline max-w-[150px] truncate"
                  >
                    {user.email}
                  </Link>
                </div>
                <HeaderButton onClick={handleLogout}>Logout</HeaderButton>
              </>
              ) :
                (
              <>
                {/* <NavLink href="/login">Login</NavLink>
                <NavLink href="/register">Register</NavLink> */}
              </>
            )
            
            }
          </div>

          {/* Center/Right: Support block (QR + texts) */}
          <div className="md:order-2 w-full">
            <div className="flex w-full items-center justify-between gap-4">
              {/* Messages */}
              <div className="flex-1 min-w-0 pb-2">
                <p className="text-base md:text-lg font-semibold tracking-tight">
                  Every donation = cat food 🐱❤️
                </p>
                <p className="text-xs md:text-sm text-gray-600">
                  Your support means food and love for my cats ❤️🐱
                </p>
                <p className="text-[11px] md:text-xs text-gray-500">
                  100% of all support is used for cat food only.  👉 *Files auto deleted after midnight 🔥
                </p>  
              </div>

              {/* QR */}
              <Link
                href={BMAC_URL}
                target="_blank"
                rel="noopener"
                aria-label="Support on Buy Me a Coffee"
                className="shrink-0 hidden sm:block"
              >
                <div className="p-2 border border-black rounded-2xl bg-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition">
                  <Image
                    src={QR_SRC}
                    alt="Buy Me a Coffee QR — 100% goes to cat food"
                    width={100}
                    height={100}
                    className="rounded-xl"
                    priority
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}