'use client';

import FC3DBall from '@/components/lottery/FC3DBall';
import { mockDraws } from '@/lib/mock/fc3d-draws';

export default function DataTicker() {
  const latest = mockDraws[0];
  if (!latest) return null;

  return (
    <div className="bg-[#13161b] border-y border-white/5">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
            <span className="text-[11px] text-[#00d4aa] font-medium">LIVE</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs text-gray-400">第{latest.period}期</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Balls */}
          <div className="flex gap-1.5">
            <FC3DBall digit={latest.digit1} size="sm" />
            <FC3DBall digit={latest.digit2} size="sm" />
            <FC3DBall digit={latest.digit3} size="sm" />
          </div>
          <div className="w-px h-4 bg-white/10" />
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              和值 <strong className="text-[#00d4aa]">{latest.sum}</strong>
            </span>
            <span>
              跨度 <strong className="text-[#00d4aa]">{latest.span}</strong>
            </span>
            <span className="hidden sm:inline">
              {latest.bigSmallPattern}
            </span>
            <span className="hidden sm:inline">
              {latest.oddEvenPattern}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
