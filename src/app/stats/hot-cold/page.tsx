'use client';

import { useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { Flame } from 'lucide-react';

export default function HotColdPage() {
  const analysis = useMemo(() => {
    const draws = mockDraws.slice(0, 50);
    const positions = [
      { label: '百位', key: 'digit1' as const },
      { label: '十位', key: 'digit2' as const },
      { label: '个位', key: 'digit3' as const },
    ];

    return positions.map(pos => {
      const freq: Record<number, number> = {};
      const missing: Record<number, number> = {};
      for (let d = 0; d <= 9; d++) {
        freq[d] = 0;
        missing[d] = -1;
      }
      draws.forEach((draw, idx) => {
        freq[draw[pos.key]]++;
        if (missing[draw[pos.key]] === -1) missing[draw[pos.key]] = idx;
      });
      for (let d = 0; d <= 9; d++) {
        if (missing[d] === -1) missing[d] = draws.length;
      }

      const digits = Array.from({ length: 10 }, (_, d) => ({
        digit: d,
        count: freq[d],
        missing: missing[d],
        pct: ((freq[d] / draws.length) * 100).toFixed(1),
      }));

      const hot = [...digits].sort((a, b) => b.count - a.count).slice(0, 3);
      const cold = [...digits].sort((a, b) => b.missing - a.missing).slice(0, 3);

      return { label: pos.label, digits, hot, cold };
    });
  }, []);

  function getHeatColor(count: number, max: number): string {
    if (max === 0) return 'bg-[#f5f5f7] text-[#8e8e93]';
    const ratio = count / max;
    if (ratio >= 0.8) return 'bg-[#FF3B30] text-white';
    if (ratio >= 0.6) return 'bg-[#FF9500] text-white';
    if (ratio >= 0.4) return 'bg-[#FF9500]/60 text-[#1d1d1f]';
    if (ratio >= 0.2) return 'bg-[#FF9500]/20 text-[#1d1d1f]';
    return 'bg-[#f5f5f7] text-[#8e8e93]';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Flame size={20} className="text-[#FF3B30]" />
        <div>
          <h2 className="text-lg font-semibold text-[#E13C39]">冷热号码分析</h2>
          <p className="text-[12px] text-[#8e8e93] mt-0.5">近50期号码出现频率热力图 + 冷热排行</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl shadow-card bg-white p-5">
        <h3 className="text-[14px] font-semibold mb-4 text-[#1d1d1f]">频率热力图</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="text-[11px] text-[#8e8e93] font-medium py-2 px-2 text-left">位置</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className="text-[11px] text-[#8e8e93] font-medium py-2 px-1">{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.map(pos => {
                const max = Math.max(...pos.digits.map(d => d.count));
                return (
                  <tr key={pos.label}>
                    <td className="text-[12px] font-semibold text-[#1d1d1f] py-2 px-2 text-left">{pos.label}</td>
                    {pos.digits.map(d => (
                      <td key={d.digit} className="py-1.5 px-1">
                        <div className={`w-10 h-10 mx-auto rounded-xl flex flex-col items-center justify-center ${getHeatColor(d.count, max)} transition-colors`}>
                          <span className="text-[12px] font-semibold">{d.count}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-4 justify-center">
          <span className="text-[10px] text-[#8e8e93]">冷</span>
          <div className="flex gap-0.5">
            <div className="w-6 h-3 rounded-sm bg-[#f5f5f7]" />
            <div className="w-6 h-3 rounded-sm bg-[#FF9500]/20" />
            <div className="w-6 h-3 rounded-sm bg-[#FF9500]/60" />
            <div className="w-6 h-3 rounded-sm bg-[#FF9500]" />
            <div className="w-6 h-3 rounded-sm bg-[#FF3B30]" />
          </div>
          <span className="text-[10px] text-[#8e8e93]">热</span>
        </div>
      </div>

      {/* Hot & Cold Rankings */}
      <div className="grid gap-4 lg:grid-cols-3">
        {analysis.map(pos => (
          <div key={pos.label} className="rounded-2xl shadow-card bg-white p-5">
            <h3 className="text-[14px] font-semibold mb-4 text-[#1d1d1f]">{pos.label}</h3>

            {/* Hot */}
            <div className="mb-4">
              <div className="text-[11px] text-[#8e8e93] font-medium mb-2 flex items-center gap-1">
                <Flame size={12} className="text-[#FF3B30]" /> 热号 TOP3
              </div>
              <div className="space-y-1.5">
                {pos.hot.map((h, i) => (
                  <div key={h.digit} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-md text-[10px] font-semibold flex items-center justify-center ${
                      i === 0 ? 'bg-[#FF3B30] text-white' : i === 1 ? 'bg-[#FF9500] text-white' : 'bg-[#FF9500]/60 text-[#1d1d1f]'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF3B30] to-[#D70015] text-white text-[12px] font-semibold flex items-center justify-center">
                      {h.digit}
                    </span>
                    <span className="text-[12px] text-[#8e8e93]">{h.count}次 ({h.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold */}
            <div>
              <div className="text-[11px] text-[#8e8e93] font-medium mb-2 flex items-center gap-1">
                <span className="text-[#007AFF]">*</span> 冷号 TOP3
              </div>
              <div className="space-y-1.5">
                {pos.cold.map((c, i) => (
                  <div key={c.digit} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-md text-[10px] font-semibold flex items-center justify-center ${
                      i === 0 ? 'bg-[#007AFF] text-white' : i === 1 ? 'bg-[#007AFF]/80 text-white' : 'bg-[#007AFF]/60 text-white'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#007AFF] to-[#0056CC] text-white text-[12px] font-semibold flex items-center justify-center">
                      {c.digit}
                    </span>
                    <span className="text-[12px] text-[#8e8e93]">遗漏{c.missing}期</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-[#f5f5f7] rounded-2xl p-4">
        <p className="text-[12px] text-[#8e8e93] leading-relaxed">
          以上分析仅基于历史数据统计，不构成投注建议。彩票每期开奖均为独立随机事件，历史数据不代表未来结果。请理性购彩，量力而行。
        </p>
      </div>
    </div>
  );
}
