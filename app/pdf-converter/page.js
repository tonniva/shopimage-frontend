"use client";

import { useState } from "react";
import { PdfUploadBox } from "@/components/PdfUploadBox";
import { PdfSettingsPanel } from "@/components/PdfSettingsPanel";
import { PdfResultCard } from "@/components/PdfResultCard";
import { SectionCard } from "@/components/SectionCard";
import { StatBar } from "@/components/StatBar";
import { convertPdfSingle, convertPdfAll } from "@/lib/pdfApi";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function PdfConverterPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("all"); // "single" or "all"
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState({
    page: "1",
    format: "jpeg",
    target_w: "",
    target_h: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [quota, setQuota] = useState(null);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    setError("");
    setResult(null);

    if (!file) {
      setError("กรุณาเลือกไฟล์ PDF");
      toast.error("❌ กรุณาเลือกไฟล์ PDF ก่อนเริ่มแปลง");
      return;
    }

    // Validate settings based on mode
    if (activeTab === "single" && (!settings.page || settings.page < 1)) {
      setError("กรุณาระบุหมายเลขหน้าที่ถูกต้อง (เริ่มจาก 1)");
      toast.error("❌ กรุณาระบุหมายเลขหน้าที่ถูกต้อง (เริ่มจาก 1)");
      return;
    }

    toast.info("⚙️ กำลังแปลง PDF...");
    setLoading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id || "anon";
      const plan = localStorage.getItem("plan") || "free";

      const extraHeaders = {
        "x-user-id": userId,
        "x-plan": plan,
      };

      let response;
      if (activeTab === "single") {
        response = await convertPdfSingle(
          file,
          {
            page: String(parseInt(settings.page) - 1), // Convert to 0-based for backend
            format: settings.format,
            target_w: settings.target_w || undefined,
            target_h: settings.target_h || undefined,
          },
          (pct, phase) => {
            console.log(`Progress: ${pct}% (${phase})`);
          },
          { extraHeaders }
        );
      } else {
        response = await convertPdfAll(
          file,
          {
            format: settings.format,
            target_w: settings.target_w || undefined,
            target_h: settings.target_h || undefined,
          },
          (pct, phase) => {
            console.log(`Progress: ${pct}% (${phase})`);
          },
          { extraHeaders }
        );
      }

      if (response?.quota) {
        setQuota(response.quota);
      }

      // For single page mode, map the result to the correct page index
      if (activeTab === "single" && response?.download_url_array) {
        const pageIndex = parseInt(settings.page) - 1; // Convert back to 0-based
        const singlePageResult = {
          ...response,
          download_url_array: [response.download_url_array[pageIndex] || response.download_url_array[0]]
        };
        setResult({ ok: true, ...singlePageResult });
      } else {
        setResult({ ok: true, ...response });
      }
      
      toast.success("✅ แปลง PDF สำเร็จ!");

      // แจ้ง quota สรุปหลังจบ
      if (response?.quota) {
        setTimeout(() => {
          toast.info(
            `📊 โควตาเหลือวันนี้: ${response.quota.remaining_day ?? "-"} — เดือนนี้: ${response.quota.remaining_month ?? "-"}`
          );
        }, 800);
      }
    } catch (err) {
      console.error("Conversion error:", err);
      const errorMessage = err?.message || "เกิดข้อผิดพลาด";
      setError(errorMessage);
      setResult({ ok: false, error: errorMessage, quota: err?.quota });
      toast.error(`❌ แปลง PDF ไม่สำเร็จ: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ mode, label, description }) => (
    <button
      onClick={() => setActiveTab(mode)}
      className={[
        "px-4 py-3 text-left border border-black rounded-lg transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]",
        activeTab === mode
          ? "bg-black text-white shadow-[3px_3px_0_#000]"
          : "bg-white text-black",
      ].join(" ")}
    >
      <div className="font-medium">{label}</div>
      <div className="text-xs opacity-75">{description}</div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] text-black">
      {/* Header */}
      <header className="border-b border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-black bg-black" />
            <div>
              <div className="text-base font-semibold leading-none">PDF → JPG</div>
              <div className="text-[11px] text-gray-500">PDF to Image Converter</div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Stat bar */}
        <StatBar files={file ? [file] : []} results={result ? [result] : []} quota={quota} />

        {/* Tab Selection */}
        <SectionCard title="Conversion Mode" subtitle="เลือกโหมดการแปลง PDF">
          <div className="grid md:grid-cols-2 gap-4">
         
            <TabButton
              mode="all"
              label="All Pages"
              description="แปลงทุกหน้าในไฟล์"
                      />
            <TabButton
              mode="single"
              label="Single Page"
              description="แปลงเฉพาะหน้าที่ระบุ"
            />
          </div>
        </SectionCard>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Upload + Results */}
          <div className="md:col-span-2 space-y-6">
            <SectionCard 
              title="Upload PDF" 
              subtitle="ลากวางไฟล์ PDF หรือกดเลือกจากเครื่อง"
            >
              <PdfUploadBox file={file} setFile={setFile} />
              {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
            </SectionCard>

            {/* Results */}
            {result ? (
              <SectionCard title="Results" subtitle="ผลลัพธ์การแปลง PDF">
                <PdfResultCard result={result} />
              </SectionCard>
            ) : (
              <SectionCard 
                title="Results" 
                subtitle="ผลลัพธ์จะแสดงที่นี่หลังแปลงเสร็จ" 
              />
            )}
          </div>

          {/* Right: Settings */}
          <div className="md:col-span-1">
            <div className="md:sticky md:top-6 space-y-4">
              <SectionCard
                title="Settings"
                subtitle={`${activeTab === "single" ? "ขนาด นามสกุล และหมายเลขหน้า" : "ขนาด และนามสกุล"}`}
                right={
                  <button
                    onClick={handleConvert}
                    disabled={loading || !file}
                    className={`px-3 py-2 border-2 border-black text-black rounded-lg
                    motion-safe:transition-all duration-150
                    hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                    active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${!loading && file ? 'convert-ready' : ''}`}
                  >
                    {loading ? "Converting..." : "Convert PDF"}
                  </button>
                }
              >
                <PdfSettingsPanel
                  mode={activeTab}
                  value={settings}
                  onChange={setSettings}
                  onSubmit={handleConvert}
                  loading={loading}
                />
              </SectionCard>

              {/* Tips */}
              <div className="border border-black bg-white p-3 text-xs text-gray-600">
                <p className="font-medium mb-1">💡 Tips:</p>
                <ul className="space-y-1">
                  <li>• รองรับไฟล์ PDF ทุกขนาด</li>
                  <li>• ผลลัพธ์จะได้เป็นไฟล์ ZIP</li>
                  <li>• สามารถดูตัวอย่างรูปได้ก่อนดาวน์โหลด</li>
                  {activeTab === "single" && <li>• หน้า 1 = หน้าแรกของ PDF</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
