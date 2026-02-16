'use client';

import { Hash, TrendingUp, Flame, Target } from 'lucide-react';
import { mockDraws } from '@/lib/mock/fc3d-draws';

export default function FeatureCards() {
  const recent50 = mockDraws.slice(0, 50);
  const totalPeriods = mockDraws.length;

  const avgSum = (recent50.reduce((a, d) => a + d.sum, 0) / recent50.length).toFixed(1);

  const pairCount = recent50.filter(d => d.group === 'pair').length;
  const pairRatio = ((pairCount / recent50.length) * 100).toFixed(0);

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

  const stats = [
    { label: '总期数', value: totalPeriods.toLocaleString(), icon: Hash, sub: undefined as string | undefined },
    { label: '平均和值', value: avgSum, icon: TrendingUp, sub: '近50期' },
    { label: '对子比例', value: `${pairRatio}%`, icon: Flame, sub: '近50期' },
    { label: '最大遗漏', value: String(maxMissing), icon: Target, sub: `号码${maxMissingDigit}` },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 lg:px-6 pb-6 lg:pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div
            key={s.label}
            className="bg-white shadow-apple rounded-2xl p-4 lg:p-5 hover:shadow-apple-lg transition-all"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0071e3]/8">
                <s.icon size={17} className="text-[#0071e3]" />
              </div>
              <span className="text-xs text-[#6e6e73] font-medium">{s.label}</span>
            </div>
            <div className="text-2xl lg:text-[28px] font-bold text-[#1d1d1f]">{s.value}</div>
            {s.sub && <div className="text-[11px] text-[#6e6e73] mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
