"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // ปรับ URL ปลายทางให้ตรงกับโดเมนคุณ
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast.success("ส่งลิงก์รีเซ็ตไปที่อีเมลแล้ว");
    } catch (err) {
      toast.error(err.message || "ส่งอีเมลไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border border-black p-5 bg-white rounded-xl">
        <h1 className="text-lg font-semibold">ลืมรหัสผ่าน</h1>
        <div className="space-y-1">
          <label className="text-sm">อีเมล</label>
          <input
            className="w-full border px-3 py-2 rounded"
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <button disabled={sending} className="w-full border border-black bg-black text-white py-2 rounded">
          {sending ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ต"}
        </button>
        <p className="text-xs text-gray-500">
          กลับไป <Link href="/login" className="underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </main>
  );
}