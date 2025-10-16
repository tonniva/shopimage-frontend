// components/SkeletonCard.js
export default function SkeletonCard() {
    return (
      <div className="border border-black bg-white p-3 space-y-3">
        {/* ภาพ */}
        <div className="aspect-square border border-black overflow-hidden">
          <div className="w-full h-full shimmer" />
        </div>
  
        {/* ชื่อไฟล์ */}
        <div className="h-4 shimmer w-3/4 border border-black" />
  
        {/* กล่อง Before/After */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-black p-2 space-y-2">
            <div className="h-3 shimmer w-1/2" />
            <div className="h-3 shimmer w-3/4" />
            <div className="h-3 shimmer w-2/3" />
          </div>
          <div className="border border-black p-2 space-y-2">
            <div className="h-3 shimmer w-1/2" />
            <div className="h-3 shimmer w-3/4" />
            <div className="h-3 shimmer w-2/3" />
          </div>
        </div>
      </div>
    );
  }