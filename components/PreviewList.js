// components/PreviewList.js
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function QuotaBadge({ quota }) {
  if (!quota) return null;
  const { plan, remaining_day, remaining_month } = quota;
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
        Plan: <b className="ml-1 uppercase">{plan}</b>
      </span>
      {typeof remaining_day !== "undefined" && remaining_day !== null ? (
        <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
          Today: <b className="ml-1">{remaining_day}</b>
        </span>
      ) : (
        <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
          Today: <b className="ml-1">∞</b>
        </span>
      )}
      <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
        Month: <b className="ml-1">{remaining_month ?? "-"}</b>
      </span>
    </div>
  );
}

export function PreviewList({ results }) {
  if (!results?.length) return null;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {results.map((it, idx) => (
        <Card
          key={idx}
          className="group border border-black bg-white transition-all duration-200
                     hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]"
        >
          <CardContent className="p-4 space-y-3">
            {it.ok ? (
              <>
                {/* รูปแสดงผล */}
                <div className="aspect-square overflow-hidden rounded-md border border-black bg-gray-50 flex items-center justify-center rainbow-border">
                  <img
                    src={it.download_url}
                    alt={it.filename || "converted image"}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                {/* ชื่อไฟล์ + ขนาด */}
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="truncate font-medium" title={it.filename}>
                    {it.filename}
                  </div>
                  <div className="text-green-600 text-xs font-semibold">
                    ✅ {it.size_kb} KB 🔥
                  </div>
                  {/* Quota badge (ถ้ามี) */}
                  <QuotaBadge quota={it.quota} />
                </div>

                {/* ปุ่มโหลด */}
                <a
                  href={it.download_url}
                  download={it.filename || true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className="w-full mt-2 border border-black bg-white text-black
                               transition-all duration-150 
                               hover:bg-black hover:text-black
                               hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                               active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]"
                  >
                    Download
                  </Button>
                </a>
              </>
            ) : (
              <>
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-md">
                  ❌ แปลงไม่สำเร็จ:{" "}
                  {(() => {
                    try {
                      const parsed =
                        typeof it.error === "string" ? JSON.parse(it.error) : it.error;
                      return parsed?.error || parsed?.message || "Unknown error";
                    } catch {
                      return typeof it.error === "string" ? it.error : "Unknown error";
                    }
                  })()}
                </div>
                {/* ถ้า error case ก็แสดง quota ได้เช่นกัน */}
                <QuotaBadge quota={it.quota} />
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}