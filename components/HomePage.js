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
import { SectionCard } from "@/components/SectionCard";
import { StatBar } from "@/components/StatBar";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import SeoContent from "@/components/SeoContent";
import { trackEvent, trackConversionStart, trackConversionSuccess, trackConversionFailure, EVENTS, CATEGORIES } from "@/lib/analytics";

const dict = {
  th: {
    brandTitle: "IMG → WEBP",
    brandSub: "Fast WebP/JPEG Optimizer",
    uploadTitle: "Upload",
    uploadSub: "ลากวางไฟล์ หรือกดเลือกจากเครื่อง",
    progressTitle: "Progress",
    preparingTitle: "Preparing previews…",
    resultsTitle: "Results",
    resultsSub: "ผลลัพธ์จะแสดงที่นี่หลังแปลงเสร็จ",
    settingsTitle: "Settings",
    settingsSub: "ขนาด นามสกุล และเพดานไฟล์",
    convert: "Convert",
    converting: "Processing…",
    needFiles: "❌ กรุณาเลือกไฟล์ก่อนเริ่มแปลง",
    convertingInfo: "⚙️ กำลังแปลงรูปด้วย Preset/Settings ...",
    presetSet: (l) => `Preset: ${l} ถูกตั้งค่าให้แล้ว`,
    allFailed: "❌ ทุกไฟล์แปลงไม่สำเร็จ",
    someOk: "✅ แปลงรูปสำเร็จ!",
    errorHappened: "❌ แปลงรูปไม่สำเร็จ กรุณาลองใหม่",
    tips:
      "แนะนำ: ใช้ WebP เพื่อขนาดไฟล์เล็กและคมชัดกว่า JPEG และตั้งค่า max_kb ให้เหมาะกับแพลตฟอร์มปลายทาง",
    quotaToast: (d, m) => `📊 โควตาเหลือวันนี้: ${d ?? "-"} — เดือนนี้: ${m ?? "-"}`
  },
  en: {
    brandTitle: "IMG → WEBP",
    brandSub: "Fast WebP/JPEG Optimizer",
    uploadTitle: "Upload",
    uploadSub: "Drag & drop or pick files",
    progressTitle: "Progress",
    preparingTitle: "Preparing previews…",
    resultsTitle: "Results",
    resultsSub: "Converted results will appear here",
    settingsTitle: "Settings",
    settingsSub: "Size, format, and file limits",
    convert: "Convert",
    converting: "Processing…",
    needFiles: "❌ Please select at least one file",
    convertingInfo: "⚙️ Converting with current preset/settings ...",
    presetSet: (l) => `Preset: ${l} has been applied`,
    allFailed: "❌ All files failed to convert",
    someOk: "✅ Converted successfully!",
    errorHappened: "❌ Conversion failed, please try again",
    tips:
      "Tip: Use WebP for smaller size & better clarity than JPEG. Set max_kb to match the destination platform.",
    quotaToast: (d, m) => `📊 Remaining today: ${d ?? "-"} — this month: ${m ?? "-"}`
  }
};

export default function HomePage({ lang = "th" }) {
    console.log("HomePage lang:", lang);
  const t = dict[lang] ?? dict.th;

  const supabase = createClient();
  const [quota, setQuota] = useState(null);
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

  // Preset
  const handlePreset = (key, cfg) => {
    setSelectedPreset(key);
    setSettings((prev) => ({
      ...prev,
      target_w: String(cfg.w),
      target_h: String(cfg.h),
      format: cfg.format,
      max_kb: String(cfg.max_kb),
    }));
    toast.success(t.presetSet(cfg.label));
  };

  async function parseError(err) {
    if (err?.json) {
      try { const j = await err.json(); return j; } catch {}
    }
    if (typeof err?.message === "string") {
      try { return JSON.parse(err.message); } catch {}
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Unknown error" };
  }

  const handleConvert = async () => {
    setError("");
    setResults([]);

    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id || "anon";
    const plan   = (typeof window !== "undefined" && localStorage.getItem("plan")) || "free";

    if (!files.length) {
      setError(t.needFiles);
      toast.error(t.needFiles);
      trackEvent(EVENTS.BUTTON_CLICK, CATEGORIES.USER_INTERACTION, 'convert_button_no_files', 0);
      return;
    }

    // Track conversion start
    trackConversionStart(files.length, settings);

    toast.info(t.convertingInfo);
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

          if (res?.quota) {
            setQuota(res.quota);
            lastQuota = res.quota;
          }

          out.push({ ok: true, ...res });
          updateProgress(i, 100, "done");
          await logUsageOnce();
        } catch (e) {
          const errBody = await parseError(e);
          if (errBody?.quota) {
            setQuota(errBody.quota);
            lastQuota = errBody.quota;
          }
          out.push({ ok: false, error: errBody?.error || "upload failed", filename: files[i].name });
          updateProgress(i, 100, "failed");
          toast.error(errBody?.error || t.errorHappened);
        }
      }

      setResults(out);

      // Track conversion results
      const successCount = out.filter(it => it.ok).length;
      const failureCount = out.filter(it => !it.ok).length;

      if (successCount > 0) {
        trackConversionSuccess(files.length, successCount, settings);
        toast.success(t.someOk);
        fireConfetti();
      } else {
        trackConversionFailure(files.length, 'all_files_failed');
        toast.error(t.allFailed);
      }

      if (lastQuota) {
        setTimeout(() => {
          toast.info(t.quotaToast(lastQuota.remaining_day, lastQuota.remaining_month));
        }, 800);
      }
    } catch (e) {
      setError(e?.message || t.errorHappened);
      toast.error(e?.message || t.errorHappened);
    } finally {
      setLoading(false);
    }
  };

  function fireConfetti() {
    confetti({ 
      particleCount: 120, 
      spread: 70, 
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444']
    });
    confetti({ 
      particleCount: 60, 
      angle: 60, 
      spread: 55, 
      origin: { x: 0 },
      colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
    });
    confetti({ 
      particleCount: 60, 
      angle: 120, 
      spread: 55, 
      origin: { x: 1 },
      colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
    });
    setTimeout(() => confetti({ 
      particleCount: 80, 
      spread: 80, 
      scalar: 0.9,
      colors: ['#10b981', '#06b6d4', '#8b5cf6']
    }), 200);
    setTimeout(() => confetti({ 
      particleCount: 60, 
      spread: 70, 
      scalar: 1.1,
      colors: ['#f59e0b', '#ef4444', '#8b5cf6']
    }), 400);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-emerald-50 text-black">
      <header className="border-b border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-black bg-black" />
            <div>
              <div className="text-base font-semibold leading-none">{t.brandTitle}</div>
              <div className="text-[11px] text-gray-500">{t.brandSub}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <StatBar files={files} results={results} quota={quota} />

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-6">
            <SectionCard title={t.uploadTitle} subtitle={t.uploadSub}>
              <UploadBox lang={lang} files={files} setFiles={setFiles} />
              {files.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600 animate-pulse">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <span className="text-sm font-semibold">พร้อมแปลง {files.length} ไฟล์</span>
                </div>
              )}
              {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
            </SectionCard>

            {loading && progressItems?.length > 0 ? (
              <SectionCard title={t.progressTitle}>
                <ProgressList items={progressItems} />
              </SectionCard>
            ) : null}

            {loading ? (
              <SectionCard title={t.preparingTitle}>
                <SkeletonGrid count={files?.length || 3} />
              </SectionCard>
            ) : null}

            {results?.length ? (
              <SectionCard title={t.resultsTitle} right={<DownloadAllButton results={results} />}>
                <PreviewList results={results} />
              </SectionCard>
            ) : (
              <SectionCard title={t.resultsTitle} subtitle={t.resultsSub} />
            )}
          </div>

          <div className="md:col-span-1">
            <div className="md:sticky md:top-6 space-y-4">
              <SectionCard
                title={t.settingsTitle}
                subtitle={t.settingsSub}
                right={
                  <button
                    onClick={() => {
                      trackEvent(EVENTS.BUTTON_CLICK, CATEGORIES.USER_INTERACTION, 'convert_button_main', files.length);
                      handleConvert();
                    }}
                    disabled={loading || !files.length}
                    className={`px-4 py-3 border-2 border-black rounded-lg font-bold text-lg
                    motion-safe:transition-all duration-200
                    hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]
                    active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.95]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${!loading && files.length > 0 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 hover:from-gray-200 hover:to-gray-300'}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t.converting}</span>
                      </div>
                    ) : (
                      <span>{t.convert}</span>
                    )}
                  </button>
                }
              >
                <SettingsPanel
                                  lang={ lang}      
                  value={settings}
                  onChange={setSettings}
                  onSubmit={handleConvert}
                  loading={loading}
                  onPreset={handlePreset}
                  selectedPreset={selectedPreset}
                  hasFiles={files.length > 0}
                />
              </SectionCard>

              <div className="border border-black bg-white p-3 text-xs text-gray-600">
                {t.tips}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SEO Content Section */}
      <SeoContent lang={lang} />

      {/* Footer Note */} 
    </div>
  );
}