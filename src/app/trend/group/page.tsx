'use client';

import { useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { Layers } from 'lucide-react';
import { getGroupLabel } from '@/utils/fc3d-calc';

export default function GroupTrendPage() {
  const data = useMemo(() => {
    const draws = mockDraws.slice(0, 100);

    const groupCounts = { triplet: 0, pair: 0, six: 0 };
    draws.forEach(d => groupCounts[d.group]++);
    const total = draws.length;

    const recentTrend = draws.slice(0, 30).map(d => ({
      period: d.period,
      digits: `${d.digit1}${d.digit2}${d.digit3}`,
      group: d.group,
      groupLabel: getGroupLabel(d.group),
    }));

    const pairDigits: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) pairDigits[d] = 0;
    draws.forEach(d => {
      if (d.group === 'pair') {
        const digits = [d.digit1, d.digit2, d.digit3];
        for (let i = 0; i < 3; i++) {
          for (let j = i + 1; j < 3; j++) {
            if (digits[i] === digits[j]) {
              pairDigits[digits[i]]++;
              break;
            }
          }
        }
      }
    });

    const groupMissing: Record<string, number> = {};
    for (const g of ['triplet', 'pair', 'six'] as const) {
      const idx = draws.findIndex(d => d.group === g);
      groupMissing[g] = idx === -1 ? draws.length : idx;
    }

    return { groupCounts, total, recentTrend, pairDigits, groupMissing };
  }, []);

  const groups = [
    { key: 'six' as const, label: '组六', color: 'from-[#00d4aa] to-[#00b894]', badgeColor: 'bg-[#00d4aa]' },
    { key: 'pair' as const, label: '对子', color: 'from-[#3498db] to-[#2980b9]', badgeColor: 'bg-[#3498db]' },
    { key: 'triplet' as const, label: '豹子', color: 'from-[#e74c3c] to-[#c0392b]', badgeColor: 'bg-[#e74c3c]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Layers size={20} className="text-[#7434f3]" />
        <div>
          <h2 className="text-lg font-semibold text-white">组选走势分布</h2>
          <p className="text-xs text-gray-500 mt-0.5">近100期组六/对子/豹子分布分析</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {groups.map(g => (
          <div key={g.key} className="bg-[#13161b] border border-white/5 rounded-2xl p-5 text-center">
            <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-3`}>
              <span className="text-white text-lg font-bold">
                {data.groupCounts[g.key]}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">{g.label}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((data.groupCounts[g.key] / data.total) * 100).toFixed(1)}% · 遗漏{data.groupMissing[g.key]}期
            </div>
          </div>
        ))}
      </div>

      {/* Pair digit distribution */}
      <div className="bg-[#13161b] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">对子重复数字分布</h3>
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {Object.entries(data.pairDigits).map(([digit, count]) => {
            const max = Math.max(...Object.values(data.pairDigits));
            const intensity = max > 0 ? count / max : 0;
            return (
              <div key={digit} className="text-center">
                <div className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center ${
                  intensity >= 0.7 ? 'bg-[#3498db] text-white' :
                  intensity >= 0.4 ? 'bg-[#3498db]/30 text-[#3498db]' :
                  'bg-white/5 text-gray-500'
                } transition-colors`}>
                  <span className="text-lg font-bold">{digit}</span>
                  <span className="text-[10px] opacity-80">{count}次</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent trend table */}
      <div className="bg-[#13161b] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">近30期组选走势</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-[11px] text-gray-500 font-medium py-2 px-2 text-left">期号</th>
                <th className="text-[11px] text-gray-500 font-medium py-2 px-2 text-center">号码</th>
                <th className="text-[11px] text-gray-500 font-medium py-2 px-2 text-center">组六</th>
                <th className="text-[11px] text-gray-500 font-medium py-2 px-2 text-center">对子</th>
                <th className="text-[11px] text-gray-500 font-medium py-2 px-2 text-center">豹子</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTrend.map(row => (
                <tr key={row.period} className="border-b border-white/5 last:border-b-0">
                  <td className="text-xs text-gray-500 py-2 px-2">{row.period}</td>
                  <td className="text-xs font-mono font-semibold text-gray-300 py-2 px-2 text-center">{row.digits}</td>
                  <td className="py-2 px-2 text-center">
                    {row.group === 'six' ? (
                      <span className="inline-block w-6 h-6 rounded-md bg-[#00d4aa] text-white text-[11px] font-bold leading-6">✓</span>
                    ) : (
                      <span className="text-gray-700 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {row.group === 'pair' ? (
                      <span className="inline-block w-6 h-6 rounded-md bg-[#3498db] text-white text-[11px] font-bold leading-6">✓</span>
                    ) : (
                      <span className="text-gray-700 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {row.group === 'triplet' ? (
                      <span className="inline-block w-6 h-6 rounded-md bg-[#e74c3c] text-white text-[11px] font-bold leading-6">✓</span>
                    ) : (
                      <span className="text-gray-700 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
