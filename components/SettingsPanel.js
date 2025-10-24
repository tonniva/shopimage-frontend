"use client";

import { useId, useMemo,useState } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import PresetCards from "@/components/PresetCards";
import { trackEvent, trackConversionStart, EVENTS, CATEGORIES } from "@/lib/analytics";

/**
 * i18n dictionary
 */
const DICT = {
  th: {
    width: "Width (px)",
    height: "Height (px)",
    widthHint: "ว่างทั้งคู่ = ไม่ปรับขนาด (ใช้รูปเดิม)",
    heightHint: "ใส่ทั้งคู่ → ครอปกลางให้อัตราส่วนพอดี",
    format: "Format",
    formatWebp: "WebP (แนะนำ: เล็ก/คม)",
    formatJpeg: "JPEG (รองรับกว้าง)",
    maxUpload: "Max upload per file",
    maxUploadHint: "กำหนดเพดานไฟล์ที่อัปโหลด (ดีฟอลต์ 8MB)",
    maxOutput: "Max output size",
    maxOutputHint: "คุมขนาดไฟล์ผลลัพธ์สูงสุด (ดีฟอลต์ 400KB)",
    convert: "Convert",
    converting: "กำลังแปลง...",
    unitPx: "px",
    unitMB: "MB",
    unitKB: "KB",
  },
  en: {
    width: "Width (px)",
    height: "Height (px)",
    widthHint: "Leave both empty = keep original size",
    heightHint: "Fill both → center-crop to match aspect ratio",
    format: "Format",
    formatWebp: "WebP (Recommended: smaller/sharper)",
    formatJpeg: "JPEG (Broad support)",
    maxUpload: "Max upload per file",
    maxUploadHint: "Cap the per-file upload size (default 8MB)",
    maxOutput: "Max output size",
    maxOutputHint: "Limit the output file size (default 400KB)",
    convert: "Convert",
    converting: "Processing…",
    unitPx: "px",
    unitMB: "MB",
    unitKB: "KB",
  },
};

export function SettingsPanel({
  value,
  onChange,
  onSubmit,
  loading,
  onPreset,
  selectedPreset,
  lang, // optional: "th" | "en"
  hasFiles = false, // NEW: to track if files are uploaded
}) {
  const pathname = usePathname();
  const L = useMemo(() => { 
    if (lang === "th" || lang === "en") return DICT[lang];
    // auto-detect from pathname
    //return pathname?.startsWith("/en") ? DICT.en : DICT.th;
  }, [lang]); 

  const wid = useId(),
    hid = useId(),
    fid = useId(),
    mid = useId(),
    sk = useId();

  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });

  const Field = ({ children }) => (
    <div className="rounded-xl border border-black/70 bg-gray-50 shadow-inner p-3">
      {children}
    </div>
  );

  const [test, setTest] = useState(""); // ✅ สร้างตัวแปรธรรมดา test
  return (
    <Card className="border border-black bg-white">
      <CardContent className="p-2 space-y-2">
        {/* Presets */}
        <PresetCards onPreset={onPreset} selected={selectedPreset} />

        {/* W/H */}
        <div className="grid grid-cols-2 gap-4">
          {/* Width */}
          <div className="space-y-2">
            <Label htmlFor={wid} className="text-[13px] font-semibold">
              {L.width}
            </Label>
 
            <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 shadow-inner p-3 hover:border-gray-400 transition-colors duration-200">
              <div className="relative">
                <Input
                  id={wid}
                  inputMode="numeric"
                  placeholder="เช่น 1080"
                  value={value.target_w}
                  onChange={set("target_w")}
                  className="bg-white/80 border-2 border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 pr-[35px] transition-all duration-200 hover:border-gray-400"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  {L.unitPx}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">{L.widthHint}</p>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor={hid} className="text-[13px] font-semibold">
              {L.height}
            </Label>
            <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 shadow-inner p-3 hover:border-gray-400 transition-colors duration-200">
              <div className="relative">
                <Input
                  id={hid}
                  inputMode="numeric"
                  placeholder="เช่น 1080"
                  value={value.target_h}
                  onChange={set("target_h")}
                  className="bg-white/80 border-2 border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 pr-[35px] transition-all duration-200 hover:border-gray-400"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  {L.unitPx}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">{L.heightHint}</p>
          </div>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label htmlFor={fid} className="text-[13px] font-semibold">
            {L.format}
          </Label>
          <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 shadow-inner p-3 hover:border-gray-400 transition-colors duration-200">
            <Select
              id={fid}
              value={value.format}
              onChange={set("format")}
              className="w-full bg-white/80 border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 hover:border-gray-400"
            >
              <option value="webp">{L.formatWebp}</option>
              <option value="jpeg">{L.formatJpeg}</option>
            </Select>
          </div>
        </div>

        {/* Max upload per file (MB) */}
        <div className="space-y-2">
          <Label htmlFor={mid} className="text-[13px] font-semibold">
            {L.maxUpload}
          </Label>
          <div className="rounded-xl border border-black/70 bg-gray shadow-inner p-3">
            <div className="relative">
            <Input
                  disabled
                  id={mid}
                  type="number"
                  min="1"
                  max="32"
                  step="1"
                  value={value.max_upload_mb}
                  onChange={set("max_upload_mb")}
                  className="
                    bg-gray-200               
                    text-gray-500              
                    border border-black/40     
                    cursor-not-allowed        
                    opacity-80
                  "
                />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                {L.unitMB}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500">{L.maxUploadHint}</p>
        </div>

        {/* Max output size (KB) */}
        <div className="space-y-2">
          <Label htmlFor={sk} className="text-[13px] font-semibold">
            {L.maxOutput}
          </Label>
          <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 shadow-inner p-3 hover:border-gray-400 transition-colors duration-200">
            <div className="relative">
              <Input
                id={sk}
                type="number"
                min="50"
                step="50"
                placeholder="เช่น 400"
                value={value.max_kb}
                onChange={set("max_kb")}
                className="bg-white/80 border-2 border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 pr-[35px] transition-all duration-200 hover:border-gray-400"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                {L.unitKB}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500">{L.maxOutputHint}</p>
        </div>

        {/* Submit */}
        <Button
          className={`w-full border-2 border-black rounded-lg font-bold text-lg py-3
                     motion-safe:transition-all duration-200
                     hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]
                     active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.95]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${!loading && hasFiles 
                       ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700' 
                       : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 hover:from-gray-200 hover:to-gray-300'}`}
          onClick={() => {
            trackEvent(EVENTS.BUTTON_CLICK, CATEGORIES.USER_INTERACTION, 'convert_button', 1);
            onSubmit();
          }}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{L.converting}</span>
            </div>
          ) : (
            <span>{L.convert}</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}