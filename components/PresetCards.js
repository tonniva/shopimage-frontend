"use client";

import { trackPresetSelection } from "@/lib/analytics";

const PRESETS = {
  shopee:   { label: "Shopee",    icon: "🛒", w: 1080, h: 1080, format: "webp", max_kb: 400, gradient: "from-orange-100 to-red-100", textColor: "text-orange-700", detailColor: "text-orange-600" },
  lazada:   { label: "Lazada",    icon: "🛍️", w: 1080, h: 1080, format: "webp", max_kb: 400, gradient: "from-blue-100 to-purple-100", textColor: "text-blue-700", detailColor: "text-blue-600" },
  lineoa:   { label: "LINE OA",   icon: "💬", w: 1040, h: 1040, format: "webp", max_kb: 400, gradient: "from-green-100 to-green-200", textColor: "text-green-700", detailColor: "text-green-600" },
  instagram:{ label: "Instagram", icon: "📸", w: 1080, h: 1080, format: "webp", max_kb: 600, gradient: "from-purple-100 via-pink-100 to-orange-100", textColor: "text-purple-700", detailColor: "text-purple-600" },
  facebook: { label: "Facebook",  icon: "👥", w: 1200, h: 1200, format: "webp", max_kb: 600, gradient: "from-blue-100 to-blue-200", textColor: "text-blue-700", detailColor: "text-blue-600" },
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
              onClick={() => {
                trackPresetSelection(p.label, p);
                onPreset?.(key, p);
              }}
              className={[
                "w-full text-left rounded-xl border-2 p-2.5 bg-gradient-to-br",
                "transition-all duration-200 transform",
                "hover:scale-105 hover:shadow-lg",
                p.gradient,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                active
                  ? "border-black shadow-[4px_4px_0_#000] -translate-y-1 scale-105"
                  : "border-gray-300 hover:border-gray-900 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]",
              ].join(" ")}
            >
              {/* Icon และชื่อ preset */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm flex-shrink-0">{p.icon}</span>
                <div className={["text-[11px] font-bold leading-4 truncate", p.textColor].join(" ")}>
                  {p.label}
                </div>
              </div>

              {/* รายละเอียด: ขนาดและขนาดไฟล์ */}
              <div className={["space-y-0.5 text-[9px] leading-3 font-medium", p.detailColor].join(" ")}>
                <div className="text-center truncate">
                  {p.w}×{p.h}
                </div>
                <div className="text-center truncate">
                  ≤ {p.max_kb}KB
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}