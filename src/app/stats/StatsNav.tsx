'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STATS_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function StatsNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[220px] shrink-0 bg-white rounded-2xl shadow-apple p-3 self-start sticky top-20">
        <div className="text-[11px] text-[#6e6e73] font-semibold px-3 py-1.5 uppercase tracking-wider">
          统计分析
        </div>
        {STATS_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                isActive
                  ? 'bg-[#0071e3]/8 text-[#0071e3] font-semibold'
                  : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </aside>
      {/* Mobile horizontal nav */}
      <div className="lg:hidden overflow-x-auto scrollbar-hidden border-b border-[#ebebed] bg-white sticky top-0 z-10 mb-4">
        <div className="flex gap-0 px-2 min-w-max">
          {STATS_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'text-[#0071e3] border-[#0071e3] font-semibold'
                    : 'text-[#6e6e73] border-transparent'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
