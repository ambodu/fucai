'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, TrendingUp, Sparkles, BarChart3, Database } from 'lucide-react';

const MOBILE_TABS = [
  { label: '首页', href: '/', icon: Home },
  { label: '走势', href: '/trend', icon: TrendingUp },
  { label: 'AI', href: '/ai', icon: Sparkles },
  { label: '统计', href: '/stats', icon: BarChart3 },
  { label: '数据', href: '/data', icon: Database },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)] apple-nav border-t-0" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex">
        {MOBILE_TABS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-1.5 pt-2 transition-all min-h-[50px]"
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  'transition-colors mb-0.5',
                  isActive ? 'text-[#E13C39]' : 'text-[#8e8e93]'
                )}
              />
              <span className={cn(
                'text-[10px] leading-tight transition-colors',
                isActive ? 'text-[#E13C39] font-semibold' : 'text-[#8e8e93]'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
