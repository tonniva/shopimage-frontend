"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ImagePlus, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

function formatKB(n) {
  return Math.max(1, Math.round(n / 1024)) + " KB";
}

const DICT = {
  th: {
    dropTitle: "ลากไฟล์มาวาง หรือคลิกเลือกหลาย ๆ รูปได้",
    dropNote: "รองรับเฉพาะ .jpg / .jpeg / .png / .webp",
    chooseFiles: "เลือกไฟล์",
    clearList: "ล้างรายการ",
    selectedCount: (n) => `เลือกแล้ว ${n} ไฟล์`,
    notSupported: "ไม่รองรับไฟล์:",
    removeThis: "ลบรูปนี้",
    dropzoneLabel: "โซนวางไฟล์",
  },
  en: {
    dropTitle: "Drag & drop images or click to select multiple",
    dropNote: "Only .jpg / .jpeg / .png / .webp are supported",
    chooseFiles: "Choose files",
    clearList: "Clear list",
    selectedCount: (n) => `Selected ${n} files`,
    notSupported: "Unsupported:",
    removeThis: "Remove this image",
    dropzoneLabel: "Dropzone",
  },
};

export function UploadBox({ files, setFiles, lang = "th" }) {
  // เลือกชุดข้อความตามภาษา (default -> th)
  const L = useMemo(() => (DICT[lang] ? DICT[lang] : DICT.th), [lang]);

  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]); // [{url, name, size, type, idx}]
  const [isOver, setIsOver] = useState(false);
  const [invalidNames, setInvalidNames] = useState([]); // เก็บชื่อไฟล์ที่ไม่รองรับ

  // อัปเดต preview URLs อย่างปลอดภัย และ revoke URL เก่าเมื่อ files เปลี่ยน
  useEffect(() => {
    const next = (files || []).map((f, idx) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
      type: f.type,
      idx,
    }));
    setPreviews(next);

    // cleanup: revoke URLs ที่เพิ่งสร้างเมื่อ files เปลี่ยนหรือ component unmount
    return () => {
      next.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const addFiles = useCallback(
    (list) => {
      const incoming = Array.from(list || []);
      if (!incoming.length) return;

      const invalid = [];
      const valid = [];

      for (const f of incoming) {
        if (allowedTypes.includes(f.type)) valid.push(f);
        else invalid.push(f.name);
      }

      if (invalid.length) {
        // กันชื่อซ้ำใน invalid
        setInvalidNames((prev) => {
          const merged = new Set([...prev, ...invalid]);
          return Array.from(merged);
        });
        toast.error(`${L.notSupported} ${invalid.join(", ")}`);
      }

      if (!valid.length) return;

      // ใช้ฟังก์ชันใน setFiles เพื่อลด stale closure
      setFiles((prevFiles = []) => {
        const exists = new Set(prevFiles.map((f) => `${f.name}-${f.size}`));
        const toAdd = valid.filter((f) => !exists.has(`${f.name}-${f.size}`));
        return [...prevFiles, ...toAdd];
      });
    },
    [setFiles, L.notSupported]
  );

  const removeAt = (idx) => {
    setFiles((prev = []) => {
      const arr = [...prev];
      arr.splice(idx, 1);
      return arr;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setInvalidNames([]);
  };

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
          aria-label={L.dropzoneLabel}
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
            {L.dropTitle}
            <br />
            <span className="text-xs text-gray-500">{L.dropNote}</span>
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
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
              {L.chooseFiles}
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
                {L.clearList}
              </Button>
            ) : null}
          </div>

          {files?.length ? (
            <p className="text-sm text-gray-500 mt-3">
              {typeof L.selectedCount === "function"
                ? L.selectedCount(files.length)
                : `${files.length}`}
            </p>
          ) : null}

          {invalidNames.length > 0 && (
            <div className="mt-3 inline-flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle size={16} className="mt-0.5" />
              <div>
                {L.notSupported}{" "}
                <span className="font-medium">{invalidNames.join(", ")}</span>
              </div>
            </div>
          )}
        </div>

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
                    title={L.removeThis}
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