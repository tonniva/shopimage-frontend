"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [working, setWorking] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pass.length < 6) return toast.error("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");
    if (pass !== confirm) return toast.error("รหัสผ่านไม่ตรงกัน");

    setWorking(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      toast.success("ตั้งรหัสผ่านใหม่เรียบร้อย");
      router.replace("/login");
    } catch (err) {
      toast.error(err.message || "อัปเดตรหัสผ่านไม่สำเร็จ");
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border border-black p-5 bg-white rounded-xl">
        <h1 className="text-lg font-semibold">ตั้งรหัสผ่านใหม่</h1>
        <div className="space-y-1">
          <label className="text-sm">รหัสผ่านใหม่</label>
          <input
            className="w-full border px-3 py-2 rounded"
            type="password"
            required
            value={pass}
            onChange={(e)=>setPass(e.target.value)}
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">ยืนยันรหัสผ่าน</label>
          <input
            className="w-full border px-3 py-2 rounded"
            type="password"
            required
            value={confirm}
            onChange={(e)=>setConfirm(e.target.value)}
          />
        </div>
        <button disabled={working} className="w-full border border-black bg-black text-white py-2 rounded">
          {working ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
        </button>
        <p className="text-xs text-gray-500">
          กลับไป <Link href="/login" className="underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </main>
  );
}