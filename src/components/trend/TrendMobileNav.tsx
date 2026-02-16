'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TREND_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TrendMobileNav() {
  const pathname = usePathname();
  const allItems = TREND_NAV_ITEMS.flatMap(g => [...g.items]);

  return (
    <div className="lg:hidden overflow-x-auto scrollbar-hidden apple-nav sticky top-0 z-10">
      <div className="flex gap-0 px-2 min-w-max">
        {allItems.map((item) => {
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
  );
}
