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
    <div className="glass fixed bottom-0 left-0 right-0 border-t border-[#ebebed] flex z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
      {MOBILE_TABS.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center py-2 transition-colors"
          >
            <div className={cn(
              'w-8 h-8 rounded-2xl flex items-center justify-center mb-0.5 transition-colors',
              isActive ? 'bg-[#0071e3]/8' : ''
            )}>
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-[#0071e3]' : 'text-[#6e6e73]'
                )}
              />
            </div>
            <span className={cn(
              'text-[10px] transition-colors',
              isActive ? 'text-[#0071e3] font-semibold' : 'text-[#6e6e73]'
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
