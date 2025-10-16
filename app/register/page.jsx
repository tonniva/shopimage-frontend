"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
        },
      });
      if (error) throw error;
      toast.success("สมัครสมาชิกสำเร็จ! กรุณายืนยันอีเมล แล้วเข้าสู่ระบบ");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border border-black p-5 bg-white rounded-xl">
        <h1 className="text-lg font-semibold">สมัครสมาชิก</h1>
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input className="w-full border px-3 py-2 rounded" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input className="w-full border px-3 py-2 rounded" value={pass} onChange={(e)=>setPass(e.target.value)} type="password" required />
        </div>
        <button disabled={loading} className="w-full border border-black bg-black text-white py-2 rounded">
          {loading ? "กำลังสมัคร..." : "Register"}
        </button>
        <p className="text-xs text-gray-500">
          มีบัญชีแล้ว? <a href="/login" className="underline">เข้าสู่ระบบ</a>
        </p>
      </form>
    </main>
  );
}