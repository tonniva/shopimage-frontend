// utils/supabase/middleware.js
import { createServerClient } from "@supabase/ssr";

export function createMiddlewareSupabaseClient(req, res) {
  const cookies = {
    get(name) {
      return req.cookies.get(name)?.value;
    },
    set(name, value, options) {
      // ต้องเซ็ตทั้ง req และ res เพื่อส่งคุกกี้กลับไปที่เบราว์เซอร์
      req.cookies.set({ name, value, ...options });
      res.cookies.set({ name, value, ...options });
    },
    remove(name, options) {
      req.cookies.set({ name, value: "", ...options });
      res.cookies.set({ name, value: "", ...options });
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies }
  );
}