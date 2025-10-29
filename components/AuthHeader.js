"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import { LoginModal } from "@/components/LoginModal";
import { LogIn, LogOut, ChevronDown, LayoutDashboard, ImageIcon, FileText } from "lucide-react";

// Dynamic auth component that handles login/logout
export function AuthHeader() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setLoginModalOpen(false);
        // No need to reload - callback route handles database sync
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Language switching
  const isEN = pathname?.startsWith("/en");
  const switchHref = isEN
    ? pathname.replace(/^\/en/, "") || "/"
    : pathname === "/"
    ? "/en"
    : `/en${pathname}`;

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

  // Show loading state while auth is not ready
  if (!ready) {
    return (
      <>
        {/* Auth + Lang */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
          {/* Language Switch */}
          <Link
            href={switchHref}
            className="px-3 py-2 border-2 border-black rounded-lg text-xs md:text-sm font-semibold bg-white hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
            aria-label="Switch language"
            title={isEN ? "สลับเป็นภาษาไทย" : "Switch to English"}
          >
            {isEN ? "🇹🇭 ไทย" : "🇬🇧 EN"}
          </Link>

          {/* Loading Auth Skeleton */}
          <div className="flex items-center gap-2 px-3 py-2 border-2 border-black rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-7 h-7 rounded-full bg-gray-300 animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-300 rounded animate-pulse hidden sm:block"></div>
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Auth + Lang */}
      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
        {/* Language Switch */}
        <Link
          href={switchHref}
          className="px-3 py-2 border-2 border-black rounded-lg text-xs md:text-sm font-semibold bg-white hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
          aria-label="Switch language"
          title={isEN ? "สลับเป็นภาษาไทย" : "Switch to English"}
        >
          {isEN ? "🇹🇭 ไทย" : "🇬🇧 EN"}
        </Link>

        {user ? (
          <>
            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                className="flex items-center gap-2 px-3 py-2 border-2 border-black rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold uppercase shadow-sm">
                  {user.email?.[0] ?? "U"}
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 max-w-[80px] md:max-w-[100px] truncate hidden sm:inline">
                  {user.email}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_#000] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-base font-bold uppercase shadow-sm">
                        {user.email?.[0] ?? "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {user.email?.split('@')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  {user.email?.toLowerCase() == 'tongiggabite@gmail.com' && (
                    <Link
                    href={"/admin/property-snap"} 
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white flex items-center justify-center text-base font-bold uppercase shadow-sm">
                        A
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          { user.email?.toLowerCase()=='tongiggabite@gmail.com'?'Admin':'User' }
                        </div> 
                      </div>
                    </div>
                      </div>
                      </Link>)  }
                
                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href={isEN ? "/en/dashboard" : "/dashboard"}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 active:bg-blue-100 transition-colors group"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <LayoutDashboard size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">Dashboard</div>
                        <div className="text-xs text-gray-500">{isEN ? "View your stats" : "ดูสถิติของคุณ"}</div>
                      </div>
                    </Link>

                    <div className="h-px bg-gray-200 mx-3"> 
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 active:bg-red-100 transition-colors group"
                    >
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <LogOut size={18} className="text-red-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm text-gray-900">Logout</div>
                        <div className="text-xs text-gray-500">Sign out of account</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Login Button */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg text-xs md:text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-150"
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>
          </>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </>
  );
}
