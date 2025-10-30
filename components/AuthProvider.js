"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const AuthCtx = createContext({ user: null, ready: false });
export function useAuth() { return useContext(AuthCtx); }

export default function AuthProvider({ children }) {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Fast path: Check if we have session data in localStorage (optimistic loading)
    // This allows the UI to render immediately while session loads in background
    if (typeof window !== 'undefined') {
      try {
        // Supabase stores session in localStorage with this key pattern
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
          const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
          if (projectRef) {
            const storedKey = `sb-${projectRef}-auth-token`;
            const stored = localStorage.getItem(storedKey);
            if (stored) {
              // If we have stored session, set ready early to show UI
              // Actual user data will be updated when getSession() completes
              setReady(true);
            }
          }
        }
      } catch (e) {
        // Ignore localStorage errors (e.g., in SSR or private browsing)
      }
    }
    
    // 1) อ่าน session ทันที (เร็วกว่า getUser ในหลายเคส)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      debugger
      setReady(true);
    }).catch((error) => {
      console.error('Error getting session:', error);
      // Set ready even on error to show UI (user might not be logged in)
      if (mounted) {
        setReady(true);
      }
    });

    // 2) sync เมื่อ login/logout/refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      // Set ready on auth state change if not already ready
      setReady(true);
    });

    // 3) กันเคส auto-refresh ที่มากับ visibilitychange
    const onVis = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [supabase]);

  return <AuthCtx.Provider value={{ user, ready }}>{children}</AuthCtx.Provider>;
}