'use client';

import { FC3DStatistics } from '@/types/fc3d';
import { getHeatColor, getPositionLabel } from '@/utils/fc3d-calc';

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
            <h4 className="text-sm font-bold mb-3 text-[#1d1d1f]">{getPositionLabel(pos)}遗漏热力图</h4>
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
              {posStats.map(stat => (
                <div
                  key={`${stat.position}-${stat.digit}`}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: getHeatColor(stat.currentMissing) }}
                >
                  <span className="text-base lg:text-lg font-bold">{stat.digit}</span>
                  <span className="text-[10px] opacity-80">{stat.currentMissing}期</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-4 justify-center flex-wrap">
        {[
          { color: '#27ae60', label: '0-2期' },
          { color: '#2ecc71', label: '3-5期' },
          { color: '#f59e0b', label: '6-10期' },
          { color: '#e67e22', label: '11-15期' },
          { color: '#e74c3c', label: '16-20期' },
          { color: '#c0392b', label: '20期以上' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
