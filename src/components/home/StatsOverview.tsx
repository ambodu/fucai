'use client';

import { mockDraws } from '@/lib/mock/fc3d-draws';

export default function StatsOverview() {
  const recent50 = mockDraws.slice(0, 50);

  const positions = ['百位', '十位', '个位'] as const;
  const positionData = positions.map((label, posIdx) => {
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    recent50.forEach(draw => {
      const digit = posIdx === 0 ? draw.digit1 : posIdx === 1 ? draw.digit2 : draw.digit3;
      freq[digit]++;
    });

    const maxCount = Math.max(...Object.values(freq));

    return { label, freq, maxCount };
  });

  return (
    <section className="max-w-[980px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="apple-section-title">冷热号码速览</h2>
        <span className="text-[12px] text-[#8e8e93]">近50期</span>
      </div>
      <div className="apple-card overflow-hidden">
        {positionData.map((pos) => (
          <div key={pos.label} className="flex items-center px-4 sm:px-5 py-3 border-b border-[#f2f2f7] last:border-b-0">
            <div className="w-10 sm:w-12 text-[13px] font-semibold text-[#1d1d1f] shrink-0">{pos.label}</div>
            <div className="flex-1 flex gap-1.5 sm:gap-2 justify-between sm:justify-start">
              {Array.from({ length: 10 }, (_, d) => {
                const count = pos.freq[d];
                const isHot = count >= pos.maxCount - 1;
                const isCold = count <= 2;
                return (
                  <div
                    key={d}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-[12px] font-semibold shrink-0 transition-all ${
                      isHot
                        ? 'bg-[#FF3B30] text-white'
                        : isCold
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-[#f5f5f7] text-[#6e6e73]'
                    }`}
                    title={`${d}: ${count}次`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="px-4 sm:px-5 py-2.5 bg-[#f5f5f7] flex items-center gap-5 text-[11px] sm:text-[12px] text-[#8e8e93]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#FF3B30] inline-block" /> 热号</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#007AFF] inline-block" /> 冷号</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f5f5f7] border border-[#e5e5ea] inline-block" /> 正常</span>
        </div>
      </div>
    </section>
  );
}
