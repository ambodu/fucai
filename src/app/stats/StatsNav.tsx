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
      <aside className="hidden lg:block w-[220px] shrink-0 bg-[#f5f5f7] rounded-2xl p-3 self-start sticky top-16">
        <div className="text-[11px] text-[#8e8e93] font-semibold px-3 py-1.5 uppercase tracking-wider">
          统计分析
        </div>
        {STATS_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-xl text-[13px] transition-all mb-0.5',
                isActive
                  ? 'bg-white text-[#E13C39] font-semibold shadow-sm'
                  : 'text-[#8e8e93] hover:bg-white/60 hover:text-[#1d1d1f]'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </aside>
      {/* Mobile horizontal nav */}
      <div className="lg:hidden overflow-x-auto scrollbar-hidden apple-nav sticky top-0 z-10 mb-4">
        <div className="flex gap-0 px-2 min-w-max">
          {STATS_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2.5 text-[12px] whitespace-nowrap border-b-2 transition-all',
                  isActive
                    ? 'text-[#E13C39] border-[#E13C39] font-semibold'
                    : 'text-[#8e8e93] border-transparent'
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
