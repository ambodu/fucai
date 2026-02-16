'use client';

import Link from 'next/link';
import { Sparkles, TrendingUp, BarChart3, Database } from 'lucide-react';
import FC3DBall from '@/components/lottery/FC3DBall';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { formatPeriod } from '@/utils/format';

const NAV_ITEMS = [
  { icon: TrendingUp, label: '走势图', desc: '号码走势分析', href: '/trend' },
  { icon: Sparkles, label: 'AI分析', desc: '智能数据问答', href: '/ai' },
  { icon: BarChart3, label: '统计', desc: '频率遗漏统计', href: '/stats' },
  { icon: Database, label: '数据中心', desc: '历史开奖查询', href: '/data' },
];

export default function DataTicker() {
  const latest = mockDraws[0];

  return (
    <section className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6 lg:py-8 space-y-4">
      {/* Latest draw */}
      {latest && (
        <div className="bg-white shadow-apple rounded-2xl p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <div className="text-[#6e6e73] text-xs mb-0.5">最新开奖</div>
                <div className="text-[#1d1d1f] text-sm font-semibold">{formatPeriod(latest.period)}</div>
                <div className="text-[#6e6e73] text-[11px]">{latest.drawDate}</div>
              </div>
              <div className="w-px h-10 bg-[#ebebed] hidden sm:block" />
              <div className="flex gap-2.5">
                <FC3DBall digit={latest.digit1} size="lg" />
                <FC3DBall digit={latest.digit2} size="lg" />
                <FC3DBall digit={latest.digit3} size="lg" />
              </div>
            </div>
            <div className="flex gap-5 w-full sm:w-auto justify-around sm:justify-end">
              <div className="text-center">
                <div className="text-xl font-bold text-[#1d1d1f]">{latest.sum}</div>
                <div className="text-[11px] text-[#6e6e73]">和值</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#1d1d1f]">{latest.span}</div>
                <div className="text-[11px] text-[#6e6e73]">跨度</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-[#1d1d1f] mt-0.5">{latest.bigSmallPattern}</div>
                <div className="text-[11px] text-[#6e6e73]">大小</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-[#1d1d1f] mt-0.5">{latest.oddEvenPattern}</div>
                <div className="text-[11px] text-[#6e6e73]">奇偶</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-4 gap-2.5 lg:gap-3">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1.5 p-3 lg:p-4 rounded-2xl bg-white shadow-apple-sm hover:shadow-apple transition-all active:scale-[0.97]"
          >
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center bg-[#0071e3]/8">
              <item.icon size={20} className="text-[#0071e3]" />
            </div>
            <div className="text-xs font-semibold text-[#1d1d1f]">{item.label}</div>
            <div className="text-[10px] text-[#6e6e73] hidden sm:block text-center">{item.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
