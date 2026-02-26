'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, TrendingUp, Sparkles, BarChart3, Database } from 'lucide-react';

/**
 * MobileTabBar — Material Design 3 Navigation Bar
 *
 * MD3 规范:
 * - 使用 surface-container 背景
 * - 每个 tab 有 icon + label
 * - 激活态 icon 使用 secondary-container 作为 pill 指示器背景
 * - 激活态文字使用 on-surface，非激活态使用 on-surface-variant
 * - 高度 80px（含 safe area）
 * - 图标区域: 64×32 pill shape 指示器
 */
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
    <div
      className="md3-nav-bar lg:hidden"
    >
      <div className="flex w-full">
        {MOBILE_TABS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center pt-3 pb-4 transition-all"
            >
              {/* MD3 Active Indicator — pill shape behind icon */}
              <div
                className={cn(
                  'w-16 h-8 rounded-2xl flex items-center justify-center mb-1 transition-all',
                  isActive ? '' : 'bg-transparent'
                )}
                style={
                  isActive
                    ? { background: 'var(--md-secondary-container)' }
                    : undefined
                }
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    color: isActive
                      ? 'var(--md-on-secondary-container)'
                      : 'var(--md-on-surface-variant)',
                  }}
                />
              </div>
              <span
                className={cn(
                  'md3-label-small transition-colors',
                  isActive ? 'font-medium' : ''
                )}
                style={{
                  color: isActive
                    ? 'var(--md-on-surface)'
                    : 'var(--md-on-surface-variant)',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
