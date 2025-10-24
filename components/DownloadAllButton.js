// components/DownloadAllButton.js
"use client";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { trackDownload } from "@/lib/analytics";

function deriveName(item, index) {
  // ใช้ชื่อจาก API ก่อน
  if (item?.filename) return item.filename;
  // ลองดึงจาก URL path
  try {
    const u = new URL(item.download_url);
    const last = decodeURIComponent(u.pathname.split("/").pop() || `image-${index + 1}.webp`);
    return last || `image-${index + 1}.webp`;
  } catch {
    // ถ้าเป็น relative URL หรือ parse ไม่ได้
    const rel = (item?.download_url || "").split("/").pop();
    return rel || `image-${index + 1}.webp`;
  }
}

export default function DownloadAllButton({ results = [] }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const canDownload = Array.isArray(results) && results.length > 0;

  const handleDownloadAll = async () => {
    if (!canDownload || downloading) return;
    
    // Track download event
    trackDownload('zip_all', results.length);
    
    setDownloading(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const total = results.length;

      // ดึงไฟล์ทีละไฟล์ (ควบคุมง่าย + อัปเดต progress ชัด)
      for (let i = 0; i < results.length; i++) {
        const item = results[i];
        if (!item?.download_url) continue;

        const url = item.download_url;
        // รองรับทั้ง full และ relative URL
        const absUrl = url.startsWith("http")
          ? url
          : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}${url.startsWith("/") ? "" : "/"}${url}`;

        const res = await fetch(absUrl);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const blob = await res.blob();

        const name = deriveName(item, i);
        zip.file(name, blob);

        setProgress(Math.round(((i + 1) / total) * 90)); // เก็บ 0-90% ให้ phase zip ใช้ต่อ
      }

      const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
        // 90% → 100% ตอน zip
        const pct = 90 + Math.round((metadata.percent || 0) * 0.1);
        setProgress(Math.min(100, pct));
      });

      const date = new Date();
      const tag = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
      saveAs(zipBlob, `convert_file-${tag}.zip`);
      setProgress(100);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Download all failed");
    } finally {
      setDownloading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleDownloadAll}
        disabled={!canDownload || downloading}
         className="px-3 py-2 border border-black bg-white
                    motion-safe:transition-all duration-150
                    hover:bg-black hover:text-white
                    hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                    active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                    disabled:opacity-50 disabled:cursor-not-allowed"
          
          >
        {downloading ? "Preparing…" : "Download All (.zip)"}
      </button>
      {downloading ? (
        <div className="text-xs">
          {progress}%{/* ถ้าอยากสวยกว่านี้ เอา ProgressBar มาใส่แทนตัวเลขได้ */}
        </div>
      ) : null}
    </div>
  );
}