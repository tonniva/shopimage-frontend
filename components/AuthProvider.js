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
        const [serverJson, clientData] = await Promise.all([
          fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null),
          supabase.auth.getSession().then(({ data }) => data).catch(() => null),
        ]);

        if (!mounted) return;

        const serverUser = serverJson?.user ? mapServerUser(serverJson.user) : null;
        const clientUser = clientData?.session?.user ?? null;

        // ให้สิทธิ์ clientUser ก่อน (สดกว่า) ถ้าไม่มีค่อยใช้ serverUser
        setUser(clientUser || serverUser || null); 
        console.log("clientUser : ",clientUser );
        console.log("serverUser : ",serverUser );
        debugger
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