// components/SkeletonGrid.js
import SkeletonCard from "@/components/SkeletonCard";

export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: Math.max(1, count) }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}