// app/en/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link"; 

const DICT = {
  dashboard: "Dashboard",
  hello: "Hello",
  billing: "Billing",
  today: "Today",
  thisMonth: "This Month",
  plan: "Plan",
  fromQuota: "out of",
  perDay: "/day",
  perMonth: "/month",
  notes: "Notes",
  note1: "Usage stats update immediately after successful conversion",
  note2: "Free: 20 images/day, 1,000 images/month · Pro/Business get higher quotas",
  note3: "To count multiple images in one batch, send amount 1 in usage_log",
};

function Card({ title, value, subtitle, right }) {
  return (
    <div className="border-2 border-black bg-white rounded-xl p-5 flex items-center justify-between shadow-[4px_4px_0_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] transition-all duration-150">
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</div>
        <div className="text-3xl font-bold mt-1">{value}</div>
        {subtitle ? <div className="text-xs text-gray-500 mt-1">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}

export default function DashboardPageEN() {
  const L = DICT;
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
      return;
    }
    (async () => {
      setLoading(true);

      try {
        // Fetch usage stats from Prisma database via API
        const response = await fetch("/api/usage/stats");
        const result = await response.json();

        if (result.ok && result.stats) {
          setTodayCount(result.stats.todayCount);
          setMonthCount(result.stats.monthCount);
          setPlan(result.stats.plan);
          setQuotaDay(result.stats.quotaDay);
          setQuotaMonth(result.stats.quotaMonth);
          console.log("✅ Loaded usage stats from Prisma database");
        } else {
          console.error("❌ Failed to load usage stats:", result.error);
        }
      } catch (error) {
        console.error("❌ Error loading usage stats:", error);
      }

      setLoading(false);
    })();
  }, [ready, user]);

  if (!ready) return null;
  if (!user) return null;

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{L.dashboard}</h1>
          <p className="text-sm text-gray-600 mt-1">{L.hello} {user.email}</p>
        </div>
        <button
          disabled
          className="px-4 py-2 border-2 border-gray-300 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed opacity-50"
        >
          {L.billing}
        </button>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          title={L.today} 
          value={loading ? "…" : todayCount} 
          subtitle={`${L.fromQuota} ${quotaDay}${L.perDay}`} 
        />
        <Card 
          title={L.thisMonth} 
          value={loading ? "…" : monthCount} 
          subtitle={`${L.fromQuota} ${quotaMonth}${L.perMonth}`} 
        />
        <Card 
          title={L.plan} 
          value={plan.toUpperCase()} 
        />
      </section>

      <section className="border-2 border-black bg-white rounded-xl p-5 shadow-[4px_4px_0_#000]">
        <div className="text-sm font-bold mb-3 flex items-center gap-2">
          <span>💡</span>
          <span>{L.notes}</span>
        </div>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 leading-relaxed">
          <li>{L.note1}</li>
          <li>{L.note2}</li>
          <li>{L.note3}</li>
        </ul>
      </section>
    </main>
  );
}

