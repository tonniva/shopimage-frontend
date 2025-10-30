"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// สร้างครั้งเดียวต่อไฟล์ (กัน identity เปลี่ยน)
const supabaseClient = createClient();

export function useSupabaseUser() {
  const supabaseRef = useRef(supabaseClient);
  const supabase = supabaseRef.current;

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsub;

    // helper: รอ user สูงสุด maxWaitMs โดยเช็คทุก intervalMs
    const waitForUser = async (maxWaitMs = 2000, intervalMs = 150) => {
      const start = Date.now();
      while (Date.now() - start < maxWaitMs) {
        const { data } = await supabase.auth.getUser();
        if (data?.user) return data.user;
        await new Promise(r => setTimeout(r, intervalMs));
      }
      return null;
    };

    (async () => {
      // 1) พยายามดึง session ที่แคชไว้ก่อน (ไวสุด)
      const { data: sessData } = await supabase.auth.getSession();
      if (mounted && sessData?.session?.user) {
          setUser(sessData.session.user);
 
        setChecking(false);
        console.log("5",session)
      } else {
        // 2) ถ้าไม่มีทันที → รอ getUser() แบบ retry ภายใน 2s
        const u = await waitForUser(1000, 150);
        if (mounted) {
            setUser(u);
      
          setChecking(false);
          console.log("6",session)
        }
      }

      // 3) subscribe เพื่อให้ตามทันทุกเหตุการณ์ (login/logout/refresh)
      const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null); 
        console.log("7",session)
      });
      unsub = sub?.subscription;
    })();

    return () => {
      mounted = false;
      unsub?.unsubscribe?.();
    };
  }, []); // ❗️ไม่ใส่ supabase เป็น dep

  return { user, checking };
}