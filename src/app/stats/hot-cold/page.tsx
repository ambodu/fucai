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
    if (max === 0) return 'bg-white/5 text-gray-500';
    const ratio = count / max;
    if (ratio >= 0.8) return 'bg-[#e74c3c] text-white';
    if (ratio >= 0.6) return 'bg-[#e67e22] text-white';
    if (ratio >= 0.4) return 'bg-[#f1c40f] text-gray-900';
    if (ratio >= 0.2) return 'bg-[#f1c40f]/30 text-gray-300';
    return 'bg-white/5 text-gray-500';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Flame size={20} className="text-[#e74c3c]" />
        <div>
          <h2 className="text-lg font-semibold text-white">冷热号码分析</h2>
          <p className="text-xs text-gray-500 mt-0.5">近50期号码出现频率热力图 + 冷热排行</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-[#13161b] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">频率热力图</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="text-[11px] text-gray-500 font-medium py-2 px-2 text-left">位置</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className="text-[11px] text-gray-500 font-medium py-2 px-1">{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.map(pos => {
                const max = Math.max(...pos.digits.map(d => d.count));
                return (
                  <tr key={pos.label}>
                    <td className="text-xs font-semibold text-gray-300 py-2 px-2 text-left">{pos.label}</td>
                    {pos.digits.map(d => (
                      <td key={d.digit} className="py-1.5 px-1">
                        <div className={`w-10 h-10 mx-auto rounded-lg flex flex-col items-center justify-center ${getHeatColor(d.count, max)} transition-colors`}>
                          <span className="text-xs font-bold">{d.count}</span>
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
          <span className="text-[10px] text-gray-500">冷</span>
          <div className="flex gap-0.5">
            <div className="w-6 h-3 rounded-sm bg-white/5" />
            <div className="w-6 h-3 rounded-sm bg-[#f1c40f]/30" />
            <div className="w-6 h-3 rounded-sm bg-[#f1c40f]" />
            <div className="w-6 h-3 rounded-sm bg-[#e67e22]" />
            <div className="w-6 h-3 rounded-sm bg-[#e74c3c]" />
          </div>
          <span className="text-[10px] text-gray-500">热</span>
        </div>
      </div>

      {/* Hot & Cold Rankings */}
      <div className="grid gap-4 lg:grid-cols-3">
        {analysis.map(pos => (
          <div key={pos.label} className="bg-[#13161b] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4 text-white">{pos.label}</h3>

            {/* Hot */}
            <div className="mb-4">
              <div className="text-[11px] text-gray-500 font-medium mb-2 flex items-center gap-1">
                <Flame size={12} className="text-[#e74c3c]" /> 热号 TOP3
              </div>
              <div className="space-y-1.5">
                {pos.hot.map((h, i) => (
                  <div key={h.digit} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                      i === 0 ? 'bg-[#e74c3c] text-white' : i === 1 ? 'bg-[#e67e22] text-white' : 'bg-[#f1c40f] text-gray-900'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white text-xs font-bold flex items-center justify-center">
                      {h.digit}
                    </span>
                    <span className="text-xs text-gray-400">{h.count}次 ({h.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold */}
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-2 flex items-center gap-1">
                <span className="text-[#3498db]">*</span> 冷号 TOP3
              </div>
              <div className="space-y-1.5">
                {pos.cold.map((c, i) => (
                  <div key={c.digit} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                      i === 0 ? 'bg-[#3498db] text-white' : i === 1 ? 'bg-[#3498db]/80 text-white' : 'bg-[#3498db]/60 text-white'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white text-xs font-bold flex items-center justify-center">
                      {c.digit}
                    </span>
                    <span className="text-xs text-gray-400">遗漏{c.missing}期</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-[#7434f3]/5 border border-[#7434f3]/10 rounded-2xl p-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          以上分析仅基于历史数据统计，不构成投注建议。彩票每期开奖均为独立随机事件，历史数据不代表未来结果。请理性购彩，量力而行。
        </p>
      </div>
    </div>
  );
}
