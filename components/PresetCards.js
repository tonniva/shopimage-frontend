"use client";

const PRESETS = {
  shopee:   { label: "Shopee",    w: 1080, h: 1080, format: "webp", max_kb: 400 },
  lazada:   { label: "Lazada",    w: 1080, h: 1080, format: "webp", max_kb: 400 },
  lineoa:   { label: "LINE OA",   w: 1040, h: 1040, format: "webp", max_kb: 400 },
  instagram:{ label: "Instagram", w: 1080, h: 1080, format: "webp", max_kb: 600 },
  facebook: { label: "Facebook",  w: 1200, h: 1200, format: "webp", max_kb: 600 },
};

export function getPresetConfig(key) {
  return PRESETS[key];
}

export default function PresetCards({ onPreset, selected }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold tracking-wide text-gray-700">
        Presets
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {Object.entries(PRESETS).map(([key, p]) => {
          const active = selected === key;

          return (
            <button
              key={key}
              type="button"
              title={`${p.label}: ${p.w}×${p.h} · ${p.format.toUpperCase()} · ≤ ${p.max_kb}KB`}
              onClick={() => onPreset?.(key, p)}
              className={[
                "w-full text-left rounded-lg border bg-white p-2.5",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                active
                  ? "border-black shadow-[3px_3px_0_#000] -translate-y-0.5"
                  : "border-gray-300 hover:border-gray-900 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]",
              ].join(" ")}
            >
              {/* ชื่อ preset: เล็กลงและกระชับ */}
              <div className="text-[11px] font-semibold font-medium leading-5 truncate ">
                {p.label}
              </div>

              {/* รายละเอียด: ตัวเล็กลงและสีอ่อน */}
              <div className="mt-0.5 space-y-0.5 text-[11px] leading-4 text-gray-600">
                <div>{p.w}×{p.h}</div>
                <div>• {p.format.toUpperCase()}</div>
                <div>• ≤ {p.max_kb}KB</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}