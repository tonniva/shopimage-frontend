// app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link"; 
 


function Card({ title, value, subtitle, right }) {
  return (
    <div className="border border-black bg-white rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {subtitle ? <div className="text-xs text-gray-500 mt-1">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}

export default function DashboardPage() {



  const { user, ready } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [plan, setPlan] = useState("free");
  const [quotaDay, setQuotaDay] = useState(20);
  const [quotaMonth, setQuotaMonth] = useState(1000);




  useEffect(() => {
    if (!ready) return;
    if (!user) {
      // ปกป้องหน้า: ถ้าไม่มี user สามารถ redirect ใน client guard ที่คุณมีอยู่แล้ว
      return;
    }
    (async () => {
      setLoading(true);

      // โหลดโปรไฟล์
      const { data: prof } = await supabase
      .from("profiles")
      .select("plan, quota_day, quota_month")
      .eq("id", user.id)
      .maybeSingle();       // ✅ ถ้า 0 แถว -> data = null (ไม่ error 116)
     

      if (prof) {
        setPlan(prof.plan);
        setQuotaDay(prof.quota_day);
        setQuotaMonth(prof.quota_month);
      }

      // นับวันนี้
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date();
      end.setUTCHours(23, 59, 59, 999);
      
      const { count: todayCnt, error } = await supabase
        .from("usage_log")
        .select("id", { count: "exact", head: true }) // head:true = ดึงเฉพาะ count
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
      
      if (error) console.error(error);
      console.log('user.id', user.id);
      console.log('todayCnt', todayCnt);  

      // นับเดือนนี้
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthCnt } = await supabase
        .from("usage_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      setTodayCount(todayCnt ?? 0);
      setMonthCount(monthCnt ?? 0);
      setLoading(false);
    })();
  }, [ready, user]);

  if (!ready) return null;
  if (!user) return null;

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500">สวัสดี {user.email}</p>
        </div>
        <Link
          href="/billing"
          className="px-3 py-2 border border-black bg-black text-white rounded-md hover:opacity-90"
        >
          Billing
        </Link>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Today" value={loading ? "…" : todayCount} subtitle={`จากโควตา ${quotaDay}/วัน`} />
        <Card title="This Month" value={loading ? "…" : monthCount} subtitle={`จากโควตา ${quotaMonth}/เดือน`} />
        <Card title="Plan" value={plan.toUpperCase()} />
      
      </section>

      <section className="border border-black bg-white rounded-xl p-4">
        <div className="text-sm font-semibold mb-2">หมายเหตุ</div>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>ยอดใช้งานอัปเดตทันทีหลังแปลงรูปสำเร็จ</li>
          <li>Free: 20 รูป/วัน, 1,000 รูป/เดือน · Pro/Business ได้โควตาเพิ่ม</li>
          <li>หากต้องการนับ “จำนวนรูปในครั้งเดียว” ให้ส่ง amount  1 ใน usage_log</li>
        </ul>
      </section>
    </main>
  );
}