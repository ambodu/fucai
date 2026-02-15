'use client';

import { TrendingUp, Hash, Flame, Target, BarChart3, Layers } from 'lucide-react';
import { mockDraws } from '@/lib/mock/fc3d-draws';

export default function StatsOverview() {
  const recent50 = mockDraws.slice(0, 50);
  const totalPeriods = mockDraws.length;

  // Average sum
  const avgSum = (recent50.reduce((a, d) => a + d.sum, 0) / recent50.length).toFixed(1);

  // Hottest digit (most frequent in recent 50)
  const digitCounts: Record<number, number> = {};
  for (let d = 0; d <= 9; d++) digitCounts[d] = 0;
  recent50.forEach(draw => {
    digitCounts[draw.digit1]++;
    digitCounts[draw.digit2]++;
    digitCounts[draw.digit3]++;
  });
  const hottest = Object.entries(digitCounts).sort(([, a], [, b]) => b - a)[0];

  // Max missing
  let maxMissing = 0;
  let maxMissingDigit = 0;
  for (let d = 0; d <= 9; d++) {
    const idx = mockDraws.findIndex(draw => draw.digit1 === d || draw.digit2 === d || draw.digit3 === d);
    const m = idx === -1 ? mockDraws.length : idx;
    if (m > maxMissing) {
      maxMissing = m;
      maxMissingDigit = d;
    }
  }

  // Pair ratio in recent 50
  const pairCount = recent50.filter(d => d.group === 'pair').length;
  const pairRatio = ((pairCount / recent50.length) * 100).toFixed(0);

  // Average span
  const avgSpan = (recent50.reduce((a, d) => a + d.span, 0) / recent50.length).toFixed(1);

  const stats = [
    { label: '总期数', value: totalPeriods.toLocaleString(), icon: Hash, color: '#7434f3' },
    { label: '平均和值', value: avgSum, icon: TrendingUp, color: '#00d4aa', sub: '近50期' },
    { label: '最热号码', value: hottest[0], icon: Flame, color: '#e74c3c', sub: `${hottest[1]}次` },
    { label: '最大遗漏', value: String(maxMissing), icon: Target, color: '#e67e22', sub: `号码${maxMissingDigit}` },
    { label: '对子比例', value: `${pairRatio}%`, icon: Layers, color: '#3498db', sub: '近50期' },
    { label: '平均跨度', value: avgSpan, icon: BarChart3, color: '#9b59b6', sub: '近50期' },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
      <h2 className="text-lg font-bold text-white mb-4 text-center">数据概览</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div
            key={s.label}
            className="bg-[#13161b] border border-white/5 rounded-xl p-4 text-center"
          >
            <div
              className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
            {s.sub && <div className="text-[10px] text-gray-600 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
