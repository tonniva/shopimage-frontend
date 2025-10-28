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
debugger
    // 1) อ่าน session ทันที (เร็วกว่า getUser ในหลายเคส)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setReady(true);
    });

    // 2) sync เมื่อ login/logout/refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
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