"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const DICT = {
  th: {
    pageNumber: "Page Number",
    pageNumberHelp: "หมายเลขหน้าที่ต้องการแปลง (เริ่มจาก 1)",
    outputFormat: "Output Format",
    targetWidth: "Target Width (optional)",
    targetWidthHelp: "ความกว้างของรูปที่ต้องการ (พิกเซล)",
    targetHeight: "Target Height (optional)",
    targetHeightHelp: "ความสูงของรูปที่ต้องการ (พิกเซล)",
    convertButton: "Convert PDF",
    converting: "Converting...",
    tipsTitle: "💡 Tips:",
    tip1: "• ถ้าไม่ระบุขนาด จะใช้ขนาดเดิมของ PDF",
    tip2: "• JPEG เหมาะสำหรับรูปภาพทั่วไป",
    tip3: "• PNG เหมาะสำหรับรูปที่มีความโปร่งใส",
    tip4: "• หน้า 1 = หน้าแรกของ PDF",
  },
  en: {
    pageNumber: "Page Number",
    pageNumberHelp: "Page number to convert (starting from 1)",
    outputFormat: "Output Format",
    targetWidth: "Target Width (optional)",
    targetWidthHelp: "Desired image width (pixels)",
    targetHeight: "Target Height (optional)",
    targetHeightHelp: "Desired image height (pixels)",
    convertButton: "Convert PDF",
    converting: "Converting...",
    tipsTitle: "💡 Tips:",
    tip1: "• If no size specified, original PDF size will be used",
    tip2: "• JPEG is suitable for general images",
    tip3: "• PNG is suitable for images with transparency",
    tip4: "• Page 1 = first page of PDF",
  },
};

export function PdfSettingsPanel({ 
  mode, // "single" or "all"
  value, 
  onChange, 
  onSubmit, 
  loading = false,
  lang = "th"
}) {
  const L = DICT[lang] || DICT.th;
  const [settings, setSettings] = useState({
    page: "1",
    format: "jpeg",
    target_w: "",
    target_h: "",
    ...value
  });

  const handleChange = (key, val) => {
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
    onChange?.(newSettings);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Page Number - Only for Single Page mode */}
      {mode === "single" && (
        <div className="space-y-2">
          <Label htmlFor="page">{L.pageNumber}</Label>
          <Input
            id="page"
            type="number"
            min="1"
            value={settings.page}
            onChange={(e) => handleChange("page", e.target.value)}
            placeholder="1"
            className="border border-black"
          />
          <p className="text-xs text-gray-500">
            {L.pageNumberHelp}
          </p>
        </div>
      )}

      {/* Format */}
      <div className="space-y-2">
        <Label htmlFor="format">{L.outputFormat}</Label>
        <Select
          id="format"
          value={settings.format}
          onChange={(e) => handleChange("format", e.target.value)}
          className="border border-black"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </Select>
      </div>

      {/* Target Width */}
      <div className="space-y-2">
        <Label htmlFor="target_w">{L.targetWidth}</Label>
        <Input
          id="target_w"
          type="number"
          min="1"
          value={settings.target_w}
          onChange={(e) => handleChange("target_w", e.target.value)}
          placeholder="800"
          className="border border-black"
        />
        <p className="text-xs text-gray-500">
          {L.targetWidthHelp}
        </p>
      </div>

      {/* Target Height */}
      <div className="space-y-2">
        <Label htmlFor="target_h">{L.targetHeight}</Label>
        <Input
          id="target_h"
          type="number"
          min="1"
          value={settings.target_h}
          onChange={(e) => handleChange("target_h", e.target.value)}
          placeholder="600"
          className="border border-black"
        />
        <p className="text-xs text-gray-500">
          {L.targetHeightHelp}
        </p>
      </div>

      {/* Convert Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full px-3 py-2 border border-black bg-black text-white
                   motion-safe:transition-all duration-150
                   hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                   active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? L.converting : L.convertButton}
      </Button>

      {/* Tips */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="font-medium mb-1">{L.tipsTitle}</p>
        <ul className="space-y-1 text-xs">
          <li>{L.tip1}</li>
          <li>{L.tip2}</li>
          <li>{L.tip3}</li>
          {mode === "single" && <li>{L.tip4}</li>}
        </ul>
      </div>
    </form>
  );
}
