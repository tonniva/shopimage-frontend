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

    // แสดง UI ทันที ระหว่างที่กำลัง sync session
    setReady(true);

    // Helper: แปลง user จาก server endpoint → รูปแบบเหมือน Supabase client
    const mapServerUser = (u) => {
      if (!u) return null;
      return {
        id: u.id,
        email: u.email,
        user_metadata: {
          full_name: u.name,
          avatar_url: u.image,
        },
      };
    };

    const init = async () => {
      try {
        // 1) ยิงหา server session ก่อน แล้ว set ทันทีที่เจอ (ไม่รอ client)
        fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
          .then(r => (r.ok ? r.json() : null))
          .then((serverJson) => {
            if (!mounted || !serverJson?.user) return;
            const serverUser = mapServerUser(serverJson.user);
            setUser((prev) => prev ?? serverUser);
          })
          .catch(() => {});

        // 2) ดึง client session ต่อ (อาจช้ากว่า) เพื่ออัปเดตความสดใหม่
        supabase.auth.getSession()
          .then(({ data }) => {
            if (!mounted) return;
            const clientUser = data?.session?.user ?? null;
            if (clientUser) setUser(clientUser);
          })
          .catch(() => {});
      } catch {
        if (mounted) setUser(null);
      }
    };

    init();

    // sync เมื่อ login/logout/refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setReady(true);
      console.log("session : ",session );
    });

    // กันเคส auto-refresh ที่มากับ visibilitychange
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