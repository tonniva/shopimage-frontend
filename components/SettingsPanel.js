"use client";

import { useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import PresetCards from "@/components/PresetCards";


export function SettingsPanel({ value, onChange, onSubmit, loading, onPreset, selectedPreset }) {
  const wid = useId(), hid = useId(), fid = useId(), mid = useId(), sk = useId();
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });

  const Field = ({ children }) => (
    <div className="rounded-xl border border-black/70 bg-gray-50 shadow-inner p-3">
      {children}
    </div>
  );

  return (
    <Card className="border border-black bg-white">
      <CardContent className="p-2 space-y-2">
        {/* W/H */}
        <PresetCards onPreset={onPreset} selected={selectedPreset} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={wid} className="text-[13px] font-semibold">
              Width (px)
            </Label>
            <Field>
              <div className="relative">
                <Input
                  id={wid}
                  inputMode="numeric"
                  placeholder=""
                  value={value.target_w}
                  onChange={set("target_w")}
                  className="bg-white/60 border border-black/70 focus:bg-white
                             focus:ring-2 focus:ring-black pr-[15px]"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
              </div>
            </Field>
            <p className="text-[11px] text-gray-500">ว่างทั้งคู่ = ไม่ปรับขนาด (ใช้รูปเดิม)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={hid} className="text-[13px] font-semibold">
              Height (px)
            </Label>
            <Field>
              <div className="relative">
                <Input
                  id={hid}
                  inputMode="numeric"
                  placeholder=""
                  value={value.target_h}
                  onChange={set("target_h")}
                  className="bg-white/60 border border-black/70 focus:bg-white
                             focus:ring-2 focus:ring-black pr-[15px]"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
              </div>
            </Field>
            <p className="text-[11px] text-gray-500">ใส่ทั้งคู่ → ครอปกลางให้อัตราส่วนพอดี</p>
          </div>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label htmlFor={fid} className="text-[13px] font-semibold">Format</Label>
          <Field>
            <Select
              id={fid}
              value={value.format}
              onChange={set("format")}
              className="w-full bg-white/60 border border-black/70 focus:ring-2 focus:ring-black"
            >
              <option value="webp">WebP (แนะนำ: เล็ก/คม)</option>
              <option value="jpeg">JPEG (รองรับกว้าง)</option>
            </Select>
          </Field>
        </div>

        {/* Max upload per file */}
        <div className="space-y-2">
          <Label htmlFor={mid} className="text-[13px] font-semibold">Max upload per file</Label>
          <Field>
            <div className="relative">
              <Input
                id={mid}
                type="number"
                min="1"
                max="8"
                step="1"
                value={value.max_upload_mb}
                onChange={set("max_upload_mb")}
                className="bg-white/60 border border-black/70 focus:bg:white
                           focus:ring-2 focus:ring-black pr-12"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">MB</span>
            </div>
          </Field>
          <p className="text-[11px] text-gray-500">กำหนดเพดานไฟล์ที่อัปโหลด (ดีฟอลต์ 8MB)</p>
        </div>

        {/* Max output size */}
        <div className="space-y-2">
          <Label htmlFor={sk} className="text-[13px] font-semibold">Max output size</Label>
          <Field>
            <div className="relative">
              <Input
                id={sk}
                type="number"
                min="50"
                step="50"
                value={value.max_kb}
                onChange={set("max_kb")}
                className="bg:white/60 border border-black/70 focus:bg-white
                           focus:ring-2 focus:ring-black pr-12"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">KB</span>
            </div>
          </Field>
          <p className="text-[11px] text-gray-500">คุมขนาดไฟล์ผลลัพธ์สูงสุด (ดีฟอลต์ 400KB)</p>
        </div>

        <Button
          className="w-full border border-black bg-black text-black
                     transition-all duration-150
                     hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                     active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "กำลังแปลง..." : "Convert"}
        </Button>
      </CardContent>
    </Card>
  );
}