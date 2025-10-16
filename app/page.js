"use client";
import { useState } from "react";
import { SettingsPanel } from "@/components/SettingsPanel";
import { UploadBox } from "@/components/UploadBox";
import { PreviewList } from "@/components/PreviewList";
import { ProgressList } from "@/components/ProgressList";
import DownloadAllButton from "@/components/DownloadAllButton";
import SkeletonGrid from "@/components/SkeletonGrid";
import { convertSingleWithProgress } from "@/lib/api";
import { logUsageOnce } from "@/lib/usage";
import confetti from "canvas-confetti";
// โปร layout
import { SectionCard } from "@/components/SectionCard";
import { StatBar } from "@/components/StatBar";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function Page() { 
  const supabase = createClient();
  const [quota, setQuota] = useState(null); // ✅ เก็บ quota state
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [settings, setSettings] = useState({
    target_w: "",
    target_h: "",
    format: "webp",
    max_upload_mb: "8",
    max_kb: "400",
  });
  const [selectedPreset, setSelectedPreset] = useState("");
  const [error, setError] = useState("");

  const updateProgress = (i, pct, phase) => {
    setProgressItems((prev) =>
      prev.map((it, idx) =>
        idx === i ? { ...it, progress: pct, phase: phase || it.phase } : it
      )
    );
  };

  // เมื่อกด Preset
  const handlePreset = (key, cfg) => {
    setSelectedPreset(key);
    setSettings((prev) => ({
      ...prev,
      target_w: String(cfg.w),
      target_h: String(cfg.h),
      format: cfg.format,
      max_kb: String(cfg.max_kb),
    }));
    toast.success(`Preset: ${cfg.label} ถูกตั้งค่าให้แล้ว`);
  };
 
  async function parseError(err) {
    // ถ้าเป็น Response ที่โยนออกมาจาก fetch
    if (err?.json) {
      try {
        const j = await err.json();
        return j; // { ok:false, error:"...", quota:{...} }
      } catch {}
    }
    // ถ้าเป็น Error ปกติ
    if (typeof err?.message === "string") {
      try {
        const j = JSON.parse(err.message);
        return j;
      } catch {}
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Unknown error" };
  }
const handleConvert = async () => {
  setError("");
  setResults([]);

  // ใส่ header quota
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id || "anon";
  const plan   = localStorage.getItem("plan") || "free";

  if (!files.length) {
    setError("กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์");
    toast.error("❌ กรุณาเลือกไฟล์ก่อนเริ่มแปลง");
    return;
  }

  toast.info("⚙️ กำลังแปลงรูปด้วย Preset/Settings ...");
  setProgressItems(files.map(f => ({ name: f.name, progress: 0, phase: "queued" })));
  setLoading(true);

  try {
    const query = {
      target_w: settings.target_w,
      target_h: settings.target_h,
      format: settings.format || "webp",
      max_upload_mb: settings.max_upload_mb || 8,
      max_kb: settings.max_kb || 400,
    };

    const out = [];
    let lastQuota = null;

    for (let i = 0; i < files.length; i++) {
      try {
        const res = await convertSingleWithProgress(
          files[i],
          query,
          (pct, phase) => updateProgress(i, pct, phase),
          {
            renameWithPreset: selectedPreset || undefined,
            extraHeaders: { "x-user-id": userId, "x-plan": plan },
          }
        );

        // ✅ success: quota มาพร้อม res.quota
        if (res?.quota) {
          setQuota(res.quota);
          console.log('res :: ', res);
          console.log('res.quota', res.quota);
          lastQuota = res.quota;
        }

        out.push({ ok: true, ...res });
        updateProgress(i, 100, "done");

        await logUsageOnce(); // นับเฉพาะสำเร็จ
      } catch (e) {
        const errBody = await parseError(e);
        // ✅ error: quota อาจมากับ body error
        if (errBody?.quota) {
          setQuota(errBody.quota);
          lastQuota = errBody.quota;
        }

        out.push({
          ok: false,
          error: errBody?.error || "upload failed",
          filename: files[i].name,
        });
        updateProgress(i, 100, "failed");
        toast.error(errBody?.error || "เกิดข้อผิดพลาด");
      }
    }

    setResults(out);

    if (out.some(it => it.ok)) {
      toast.success("✅ แปลงรูปสำเร็จ!");
      fireConfetti();
    } else {
      toast.error("❌ ทุกไฟล์แปลงไม่สำเร็จ");
    }

    // ✅ แจ้ง quota สรุปหลังจบ (ถ้ามี)
    console.log('lastQuota', lastQuota);
    if (lastQuota) {
      setTimeout(() => {
        toast.info(
          `📊 โควตาเหลือวันนี้: ${lastQuota.remaining_day ?? "-"} — เดือนนี้: ${lastQuota.remaining_month ?? "-"}`
        );
      }, 800);
    }
  } catch (e) {
    setError(e?.message || "เกิดข้อผิดพลาด");
    toast.error(e?.message || "❌ แปลงรูปไม่สำเร็จ กรุณาลองใหม่");
  } finally {
    setLoading(false);
  }
};

  function fireConfetti() {
    // ช็อตกลางจอ
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  
    // เพิ่มซ้าย-ขวา ให้ฟุ้ง
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
  
    // ช็อตหนึบ ๆ ต่อท้าย
    setTimeout(() => confetti({ particleCount: 80, spread: 80, scalar: 0.9 }), 200);
    setTimeout(() => confetti({ particleCount: 60, spread: 70, scalar: 1.1 }), 400);
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-black">
      {/* Header โปร */}
      <header className="border-b border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-black bg-black" />
            <div>
              <div className="text-base font-semibold leading-none">IMG → WEBP</div>
              <div className="text-[11px] text-gray-500">Fast WebP/JPEG Optimizer</div>
            </div>
          </div>
          {/* <div className="text-xs text-gray-500">v1</div> */}
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Stat bar */}
        <StatBar files={files} results={results} quota={quota} />

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Upload + Results */}
          <div className="md:col-span-2 space-y-6">
            <SectionCard title="Upload" subtitle="ลากวางไฟล์ หรือกดเลือกจากเครื่อง">
              <UploadBox files={files} setFiles={setFiles} />
              {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
            </SectionCard>

            {/* Progress */}
            {loading && progressItems?.length > 0 ? (
              <SectionCard title="Progress">
                <ProgressList items={progressItems} />
              </SectionCard>
            ) : null}

            {/* Skeleton */}
            {loading ? (
              <SectionCard title="Preparing previews…">
                <SkeletonGrid count={files?.length || 3} />
              </SectionCard>
            ) : null}

            {/* Results */}
            {results?.length ? (
              <SectionCard title="Results" right={<DownloadAllButton results={results} />}>
                <PreviewList results={results} />
              </SectionCard>
            ) : (
              <SectionCard title="Results" subtitle="ผลลัพธ์จะแสดงที่นี่หลังแปลงเสร็จ" />
            )}
          </div>

          {/* Right: Settings (Sticky) */}
          <div className="md:col-span-1">
            <div className="md:sticky md:top-6 space-y-4">
              <SectionCard
                title="Settings"
                subtitle="ขนาด นามสกุล และเพดานไฟล์"
                right={
                  <button
                    onClick={handleConvert}
                    disabled={loading || !files.length}
                    className="px-3 py-2 border border-black   text-black
                    motion-safe:transition-all duration-150
                    hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                    active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing…" : "Convert"}
                  </button>
                }
              >
                <SettingsPanel
                  value={settings}
                  onChange={setSettings}
                  onSubmit={handleConvert}
                  loading={loading}
                  onPreset={handlePreset}         
                  selectedPreset={selectedPreset}    
                />
              </SectionCard>

              {/* Tips */}
              <div className="border border-black bg-white p-3 text-xs text-gray-600">
                แนะนำ: ใช้ <b>WebP</b> เพื่อขนาดไฟล์เล็กและคมชัดกว่า JPEG และตั้งค่า <b>max_kb</b> ให้เหมาะกับแพลตฟอร์มปลายทาง
              </div>
            </div>
          </div>
        </div>
      </main>
 
    </div>
  );
}