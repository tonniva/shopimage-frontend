"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/utils/supabase/client";

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
  const search = useSearchParams();
  const pathname = usePathname();

  const supabase = useMemo(() => createClient(), []);

  // --- สร้างลิงก์สลับภาษา (คง query string เดิม) ---
  const isEN = pathname?.startsWith("/en");
  // path ปลายทาง
  const targetPath = isEN
    ? pathname.replace(/^\/en/, "") || "/"
    : (pathname === "/" ? "/en" : `/en${pathname}`);
  // เก็บ query เดิม
  const qs = search?.toString();
  const switchHref = qs ? `${targetPath}?${qs}` : targetPath;

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
  const BMAC_URL = "https://www.buymeacoffee.com/mulufabo";
  const QR_SRC = "/qr-code.png";
  const LOGO = "/logo.png";
  const LOGO_SM = "/image_sm.png";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-auto py-2 md:py-0 md:h-16 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Brand */}
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
            </div>

            {/* Mobile: Support */}
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

          {/* Right: Auth + Lang */}
          <div className="flex items-center gap-2 md:order-3">
            {/* ปุ่มสลับภาษา */}
            <Link
              href={switchHref}
              className="px-3 py-1 border border-black rounded-xl text-sm bg-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition"
              aria-label="Switch language"
              title={isEN ? "สลับเป็นภาษาไทย" : "Switch to English"}
            >
              {isEN ? "ไทย" : "EN"}
            </Link>

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
            ) : (
              <>
                {/* <NavLink href="/login">Login</NavLink>
                <NavLink href="/register">Register</NavLink> */}
              </>
            )}
          </div>

          {/* Center/Right: Support block */}
          <div className="md:order-2 w-full">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex-1 min-w-0 pb-2">
                <p className="text-base md:text-lg font-semibold tracking-tight">
                  Every donation = cat food 🐱❤️
                </p>
                <p className="text-xs md:text-sm text-gray-600">
                  Your support means food and love for my cats ❤️🐱
                </p>
                <p className="text-[11px] md:text-xs text-gray-500">
                  100% of all support is used for cat food only. 👉 *Files auto deleted after midnight 🔥
                </p>
              </div>

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