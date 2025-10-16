// utils/supabase/client.js
"use client";
import { createBrowserClient } from "@supabase/ssr";

let _client;
export function createClient() {
  if (_client) return _client;
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
  return _client;
}