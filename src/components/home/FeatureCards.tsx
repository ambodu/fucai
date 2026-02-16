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
    <section className="max-w-[980px] mx-auto px-4 lg:px-6 pb-6 lg:pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="apple-card-hover p-5 lg:p-6"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#f5f5f7]">
                <s.icon size={16} className="text-[#1d1d1f]" />
              </div>
              <span className="text-[13px] text-[#8e8e93] font-medium">{s.label}</span>
            </div>
            <div className="text-2xl lg:text-3xl font-semibold text-[#1d1d1f]">{s.value}</div>
            {s.sub && <div className="text-[12px] text-[#8e8e93] mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
