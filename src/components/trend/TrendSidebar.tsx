'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TREND_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TrendSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-[220px] shrink-0 bg-white rounded-2xl shadow-apple p-3 self-start sticky top-20">
      {TREND_NAV_ITEMS.map((group) => (
        <div key={group.category} className="mb-3 last:mb-0">
          <div className="text-[11px] text-[#6e6e73] font-semibold px-3 py-1.5 uppercase tracking-wider">
            {group.category}
          </div>
          {group.items.map((item) => {
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
        </div>
      ))}
    </aside>
  );
}
