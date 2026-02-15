'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TREND_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TrendMobileNav() {
  const pathname = usePathname();
  const allItems = TREND_NAV_ITEMS.flatMap(g => [...g.items]);

  return (
    <div className="lg:hidden overflow-x-auto scrollbar-hidden border-b border-white/5 bg-[#13161b] sticky top-0 z-10">
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
  );
}
