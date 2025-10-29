"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

export function LoginModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const currentPath = window.location.pathname; 
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?returnTo=${encodeURIComponent(currentPath)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      
      // Google will redirect to our callback route which syncs to database
    } catch (error) {
      console.error("Login error:", error);
      toast.error("❌ เข้าสู่ระบบไม่สำเร็จ");
      setLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-2 border-black bg-white rounded-2xl shadow-[8px_8px_0_#000] p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg border border-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all"
            disabled={loading}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">เข้าสู่ระบบ</h2>
            <p className="text-sm text-gray-600">
              เข้าสู่ระบบเพื่อใช้งานฟีเจอร์เพิ่มเติม
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 
                       border-2 border-black bg-white rounded-xl
                       transition-all duration-150
                       hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                       active:translate-y-0 active:shadow-[2px_2px_0_#000]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}
            </span>
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            เมื่อเข้าสู่ระบบ คุณยอมรับ{" "}
            <a href="#" className="underline">เงื่อนไขการใช้งาน</a>
          </p>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal outside of header
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return null;
}

