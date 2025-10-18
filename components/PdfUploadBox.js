"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { FileText, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const allowedTypes = ["application/pdf"];

function formatKB(n) {
  return Math.max(1, Math.round(n / 1024)) + " KB";
}

const DICT = {
  th: {
    dropTitle: "ลากไฟล์ PDF มาวาง หรือคลิกเลือก",
    dropNote: "รองรับเฉพาะไฟล์ .pdf",
    chooseFile: "เลือกไฟล์ PDF",
    clearFile: "ลบไฟล์",
    selectedFile: "เลือกแล้ว:",
    notSupported: "ไม่รองรับไฟล์:",
    removeThis: "ลบไฟล์นี้",
    dropzoneLabel: "โซนวางไฟล์ PDF",
  },
  en: {
    dropTitle: "Drag & drop PDF file or click to select",
    dropNote: "Only .pdf files are supported",
    chooseFile: "Choose PDF file",
    clearFile: "Remove file",
    selectedFile: "Selected:",
    notSupported: "Unsupported:",
    removeThis: "Remove this file",
    dropzoneLabel: "PDF Dropzone",
  },
};

export function PdfUploadBox({ file, setFile, lang = "th" }) {
  const L = DICT[lang] || DICT.th;
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isOver, setIsOver] = useState(false);
  const [invalidName, setInvalidName] = useState(null);

  // อัปเดต preview เมื่อ file เปลี่ยน
  useEffect(() => {
    if (file) {
      setPreview({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } else {
      setPreview(null);
    }

    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [file]);

  const addFile = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      if (!incoming.length) return;

      const pdfFile = incoming[0]; // รับแค่ไฟล์เดียว
      
      if (allowedTypes.includes(pdfFile.type)) {
        setFile(pdfFile);
        setInvalidName(null);
      } else {
        setInvalidName(pdfFile.name);
        toast.error(`${L.notSupported} ${pdfFile.name}`);
      }
    },
    [setFile, L.notSupported]
  );

  const removeFile = () => {
    setFile(null);
    setInvalidName(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    addFile(e.dataTransfer.files);
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
            "flex flex-col items-center justify-center",
            isOver
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500 -translate-y-0.5 shadow-[4px_4px_0_rgba(59,130,246,0.3)]"
              : "border-blue-500 bg-blue-50/30",
          ].join(" ")}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          <FileText className="mb-2" />
          <p className="text-sm text-gray-600">
            {L.dropTitle}
            <br />
            <span className="text-xs text-gray-500">{L.dropNote}</span>
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => addFile(e.target.files)}
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
              {L.chooseFile}
            </Button>

            {file ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="px-3 py-2 border border-black bg-white text-red-700
                           motion-safe:transition-all duration-150
                           hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                           active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                type="button"
                variant="outline"
              >
                {L.clearFile}
              </Button>
            ) : null}
          </div>

          {file ? (
            <p className="text-sm text-gray-500 mt-3">
              {L.selectedFile} {file.name}
            </p>
          ) : null}

          {invalidName && (
            <div className="mt-3 inline-flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle size={16} className="mt-0.5" />
              <div>
                {L.notSupported}{" "}
                <span className="font-medium">{invalidName}</span>
              </div>
            </div>
          )}
        </div>

        {preview && (
          <div className="rounded-xl border border-black p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center border border-red-300">
                <FileText className="text-red-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" title={preview.name}>
                  {preview.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatKB(preview.size)} · PDF
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
                onClick={removeFile}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
