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
      <aside className="hidden lg:block w-[220px] shrink-0 bg-[#13161b] border border-white/5 rounded-2xl p-3 self-start sticky top-20">
        <div className="text-[11px] text-gray-500 font-semibold px-3 py-1.5 uppercase tracking-wider">
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
                  ? 'bg-[#7434f3]/10 text-[#7434f3] font-semibold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </aside>
      {/* Mobile horizontal nav */}
      <div className="lg:hidden overflow-x-auto scrollbar-hidden border-b border-white/5 bg-[#13161b] sticky top-0 z-10 mb-4">
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
                    ? 'text-[#7434f3] border-[#7434f3] font-semibold'
                    : 'text-gray-500 border-transparent'
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
