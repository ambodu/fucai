'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TREND_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TrendSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-[220px] shrink-0 bg-[#f5f5f7] rounded-2xl p-3 self-start sticky top-16">
      {TREND_NAV_ITEMS.map((group) => (
        <div key={group.category} className="mb-3 last:mb-0">
          <div className="text-[11px] text-[#8e8e93] font-semibold px-3 py-1.5 uppercase tracking-wider">
            {group.category}
          </div>
          {group.items.map((item) => {
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
        </div>
      ))}
    </aside>
  );
}
