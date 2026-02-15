'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TREND_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TrendMobileNav() {
  const pathname = usePathname();
  const allItems = TREND_NAV_ITEMS.flatMap(g => [...g.items]);

  return (
    <div className="lg:hidden overflow-x-auto scrollbar-hidden border-b border-[#ebebed] bg-white sticky top-0 z-10">
      <div className="flex gap-0 px-2 min-w-max">
        {allItems.map((item) => {
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
  );
}
