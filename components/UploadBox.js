// components/UploadBox.js
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ImagePlus, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function formatKB(n) {
  return Math.max(1, Math.round(n / 1024)) + " KB";
}

export function UploadBox({ files, setFiles }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]); // [{url, name, size, type, idx}]
  const [isOver, setIsOver] = useState(false);
  const [invalidNames, setInvalidNames] = useState([]); // ชื่อไฟล์ที่ไม่รองรับ

  // สร้าง object URLs สำหรับ preview และล้างเมื่อเปลี่ยน/ออก
  useEffect(() => {
    // ล้าง URL เก่า
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ล้าง URL เก่าก่อนสร้างใหม่
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    const next = (files || []).map((f, idx) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
      type: f.type,
      idx,
    }));
    setPreviews(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const addFiles = useCallback(
    (list) => {
      const incoming = Array.from(list || []);
      if (!incoming.length) return;

      const invalid = [];
      const valid = [];

      // แยกไฟล์ถูก/ผิดประเภท
      for (const f of incoming) {
        if (allowedTypes.includes(f.type)) valid.push(f);
        else invalid.push(f.name);
      }

      if (invalid.length) {
        setInvalidNames((prev) => [...prev, ...invalid]);
        toast.error(`ไม่รองรับไฟล์: ${invalid.join(", ")}`);
      }

      if (!valid.length) return;

      // กันไฟล์ซ้ำ (ชื่อ+ขนาด) แบบง่าย ๆ
      const exists = new Set((files || []).map((f) => `${f.name}-${f.size}`));
      const merged = [
        ...(files || []),
        ...valid.filter((f) => !exists.has(`${f.name}-${f.size}`)),
      ];
      setFiles(merged);
    },
    [files, setFiles]
  );

  // ลบไฟล์ตาม index
  const removeAt = (idx) => {
    const arr = [...files];
    arr.splice(idx, 1);
    setFiles(arr);
  };

  // ล้างทั้งหมด
  const clearAll = () => {
    setFiles([]);
    setInvalidNames([]);
  };

  // Drag & drop handlers
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsOver(false);
  };

  return (
    <Card
      className={[
        "border border-black bg-white",
        "transition-all duration-200 will-change-transform",
        "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]",
        "active:translate-y-0 active:shadow-[2px_2px_0_#000]",
      ].join(" ")}
    >
      <CardContent className="p-6 space-y-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Dropzone"
          className={[
            "rounded-2xl p-6 text-center",
            "border-2 border-dashed",
            "transition-all duration-150",
            "flex flex-col items-center justify-center bg-white",
            isOver
              ? "border-black ring-2 ring-black -translate-y-0.5 shadow-[4px_4px_0_#000]"
              : "border-gray-400",
          ].join(" ")}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          <ImagePlus className="mb-2" />
          <p className="text-sm text-gray-600">
            ลากไฟล์มาวาง หรือคลิกเลือกหลาย ๆ รูปได้ <br />
            <span className="text-xs text-gray-500">
              รองรับเฉพาะ .jpg / .jpeg / .png / .webp
            </span>
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => addFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex gap-2 mt-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="px-3 py-2 border border-black bg-black text-black
                         motion-safe:transition-all duration-150
                         hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                         active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              type="button"
            >
              เลือกไฟล์
            </Button>

            {files?.length ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="px-3 py-2 border border-black bg-white text-red-700
                           motion-safe:transition-all duration-150
                           hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                           active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                type="button"
                variant="outline"
              >
                ล้างรายการ
              </Button>
            ) : null}
          </div>

          {files?.length ? (
            <p className="text-sm text-gray-500 mt-3">เลือกแล้ว {files.length} ไฟล์</p>
          ) : null}

          {/* แจ้งไฟล์ที่ไม่รองรับ (กรณีมี) */}
          {invalidNames.length > 0 && (
            <div className="mt-3 inline-flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle size={16} className="mt-0.5" />
              <div>
                ไม่รองรับไฟล์:{" "}
                <span className="font-medium">{invalidNames.join(", ")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((p, i) => (
              <div
                key={i}
                className="group rounded-xl border border-black p-2 bg-white
                           transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]"
              >
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-black">
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>

                <div className="flex items-start justify-between gap-2 mt-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" title={p.name}>
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatKB(p.size)} · {p.type || "image"}
                    </div>
                  </div>

                  <button
                    className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-red-600
                               border border-red-600
                               transition-all duration-150
                               hover:bg-red-600 hover:text-black
                               hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]
                               active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    title="ลบรูปนี้"
                    onClick={() => removeAt(i)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}