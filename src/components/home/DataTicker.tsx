'use client';

import Link from 'next/link';
import { Sparkles, TrendingUp, BarChart3, Database } from 'lucide-react';

const NAV_ITEMS = [
  { icon: TrendingUp, label: '走势图', desc: '号码走势分析', href: '/trend' },
  { icon: Sparkles, label: 'AI分析', desc: '智能数据问答', href: '/ai' },
  { icon: BarChart3, label: '统计', desc: '频率遗漏统计', href: '/stats' },
  { icon: Database, label: '数据中心', desc: '历史开奖查询', href: '/data' },
];

export default function DataTicker() {
  return (
    <section className="max-w-[980px] mx-auto px-4 lg:px-6">
      <div className="grid grid-cols-4 gap-3 lg:gap-4">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="apple-card-hover flex flex-col items-center gap-2 p-4 lg:p-6"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-[#f5f5f7]">
              <item.icon size={20} className="text-[#1d1d1f]" />
            </div>
            <div className="text-[13px] font-semibold text-[#1d1d1f]">{item.label}</div>
            <div className="text-[11px] text-[#8e8e93] hidden sm:block text-center">{item.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
