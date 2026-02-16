'use client';

import { FC3DStatistics } from '@/types/fc3d';
import { getHeatColor, getPositionLabel } from '@/utils/fc3d-calc';
import { HEAT_COLORS } from '@/lib/constants';

interface HeatMapProps {
  statistics: FC3DStatistics[];
  position?: number;
}

export default function HeatMap({ statistics, position }: HeatMapProps) {
  const filtered = position
    ? statistics.filter(s => s.position === position)
    : statistics;

  const positions = position ? [position] : [1, 2, 3];

  return (
    <div className="space-y-6">
      {positions.map(pos => {
        const posStats = filtered
          .filter(s => s.position === pos)
          .sort((a, b) => a.digit - b.digit);

        return (
          <div key={pos}>
            <h4 className="text-[14px] font-semibold mb-3 text-[#1d1d1f]">{getPositionLabel(pos)}遗漏热力图</h4>
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
              {posStats.map(stat => (
                <div
                  key={`${stat.position}-${stat.digit}`}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: getHeatColor(stat.currentMissing) }}
                >
                  <span className="text-base lg:text-lg font-semibold">{stat.digit}</span>
                  <span className="text-[10px] opacity-80">{stat.currentMissing}期</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-4 justify-center flex-wrap">
        {HEAT_COLORS.map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-[12px] text-[#8e8e93]">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
