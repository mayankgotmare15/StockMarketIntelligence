import React from "react";

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-24 bg-[#EBE8DF] rounded-lg" />
          <div className="h-3 w-36 bg-[#EBE8DF]/60 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#EBE8DF]" />
          <div className="w-9 h-9 rounded-full bg-[#EBE8DF]" />
        </div>
      </div>

      {/* Pill Carousel Skeleton */}
      <div className="flex gap-2 overflow-hidden py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-[#EBE8DF] rounded-full shrink-0" />
        ))}
      </div>

      {/* Main Hero Card Skeleton */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-[#EBE8DF] rounded-md" />
          <div className="h-8 w-44 bg-[#EBE8DF] rounded-lg" />
        </div>
        <div className="h-28 w-full bg-[#FAF9F5] rounded-2xl border border-[#EBE8DF]/60" />
        <div className="h-8 w-full bg-[#FAF9F5] rounded-xl" />
      </div>

      {/* Grid Split Skeletons */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-[#EBE8DF]/80 h-28 space-y-2">
          <div className="h-3 w-20 bg-[#EBE8DF] rounded-md" />
          <div className="h-6 w-24 bg-[#EBE8DF] rounded-lg" />
          <div className="h-2 w-full bg-[#EBE8DF] rounded-full" />
        </div>
        <div className="bg-white rounded-3xl p-4 border border-[#EBE8DF]/80 h-28 space-y-2">
          <div className="h-3 w-20 bg-[#EBE8DF] rounded-md" />
          <div className="h-6 w-24 bg-[#EBE8DF] rounded-lg" />
          <div className="h-2 w-full bg-[#EBE8DF] rounded-full" />
        </div>
      </div>
    </div>
  );
};
