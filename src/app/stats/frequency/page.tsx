'use client';

import { useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { BarChart3 } from 'lucide-react';

export default function FrequencyPage() {
  const stats = useMemo(() => {
    const draws = mockDraws.slice(0, 50);
    const positions = [
      { label: '百位', key: 'digit1' as const },
      { label: '十位', key: 'digit2' as const },
      { label: '个位', key: 'digit3' as const },
    ];

    return positions.map(pos => {
      const freq: Record<number, number> = {};
      for (let d = 0; d <= 9; d++) freq[d] = 0;
      draws.forEach(draw => freq[draw[pos.key]]++);
      const max = Math.max(...Object.values(freq));
      return {
        label: pos.label,
        data: Object.entries(freq).map(([digit, count]) => ({
          digit: Number(digit),
          count,
          pct: ((count / draws.length) * 100).toFixed(1),
          barWidth: max > 0 ? (count / max) * 100 : 0,
        })),
      };
    });
  }, []);

  const totalStats = useMemo(() => {
    const draws = mockDraws.slice(0, 50);
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    draws.forEach(draw => {
      freq[draw.digit1]++;
      freq[draw.digit2]++;
      freq[draw.digit3]++;
    });
    const total = draws.length * 3;
    const max = Math.max(...Object.values(freq));
    return Object.entries(freq)
      .map(([digit, count]) => ({
        digit: Number(digit),
        count,
        pct: ((count / total) * 100).toFixed(1),
        barWidth: max > 0 ? (count / max) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-[#0071e3]" />
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">号码频率统计</h2>
          <p className="text-xs text-[#6e6e73] mt-0.5">近50期各位置数字出现频率分析</p>
        </div>
      </div>

      {/* Total frequency */}
      <div className="bg-white rounded-2xl shadow-apple p-5">
        <h3 className="text-sm font-semibold mb-4 text-[#1d1d1f]">综合频率（全部位置）</h3>
        <div className="space-y-2.5">
          {totalStats.map(item => (
            <div key={item.digit} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0071e3] to-[#0077ed] text-white text-sm font-bold flex items-center justify-center shrink-0">
                {item.digit}
              </span>
              <div className="flex-1 min-w-0">
                <div className="h-6 bg-[#f5f5f7] rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0071e3] to-[#0077ed] rounded-lg flex items-center px-2 transition-all"
                    style={{ width: `${item.barWidth}%` }}
                  >
                    <span className="text-[11px] text-white font-medium whitespace-nowrap">{item.count}次</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#6e6e73] w-12 text-right shrink-0">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-position frequency */}
      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map(pos => (
          <div key={pos.label} className="bg-white rounded-2xl shadow-apple p-5">
            <h3 className="text-sm font-semibold mb-4 text-[#0071e3]">{pos.label}频率</h3>
            <div className="space-y-2">
              {pos.data.sort((a, b) => b.count - a.count).map(item => (
                <div key={item.digit} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#f5f5f7] text-[#1d1d1f] text-xs font-bold flex items-center justify-center shrink-0">
                    {item.digit}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-[#f5f5f7] rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0071e3] to-[#06b6d4] rounded transition-all"
                        style={{ width: `${item.barWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-[#6e6e73] w-16 text-right shrink-0">
                    {item.count}次 ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
