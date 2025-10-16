// lib/usage.js
import { supabase } from "@/lib/supabase";

export async function logUsageOnce() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // ยังไม่ได้ล็อกอินก็ไม่ log
  await supabase.from("usage_log").insert({
    user_id: user.id,
    action: "convert",
    amount: 1,
  });
}