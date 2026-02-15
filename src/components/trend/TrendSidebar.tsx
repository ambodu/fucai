'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TREND_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TrendSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-[220px] shrink-0 bg-[#13161b] border border-white/5 rounded-2xl p-3 self-start sticky top-20">
      {TREND_NAV_ITEMS.map((group) => (
        <div key={group.category} className="mb-3 last:mb-0">
          <div className="text-[11px] text-gray-500 font-semibold px-3 py-1.5 uppercase tracking-wider">
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
                    ? 'bg-[#7434f3]/10 text-[#7434f3] font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
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
