import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";

export function ProgressList({ items }) {
  if (!items?.length) return null;
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="text-sm font-medium">กำลังประมวลผล</div>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="truncate">{it.name}</span>
                <span>
                  {it.phase === "upload" ? `${it.progress}%` : it.phase === "processing" ? "processing..." : ""}
                </span>
              </div>
              <ProgressBar value={it.progress} indeterminate={it.phase === "processing"} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}