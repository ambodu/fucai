'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, TrendingUp, Sparkles, BarChart3, User } from 'lucide-react';

/**
 * MobileTabBar — 底部导航栏
 *
 * 5 个 tab: 首页 / 走势 / AI / 统计 / 我的
 * "我的" 替换原来的 "数据"，作为付费转化入口
 *
 * 设计原则:
 * - 紧凑高度 50px + safe area
 * - 毛玻璃背景，轻薄通透
 * - 激活态使用 primary 色，非激活态灰色
 */
const MOBILE_TABS = [
  { label: '首页', href: '/', icon: Home },
  { label: '走势', href: '/trend', icon: TrendingUp },
  { label: 'AI', href: '/ai', icon: Sparkles },
  { label: '统计', href: '/stats', icon: BarChart3 },
  { label: '我的', href: '/user', icon: User },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden apple-nav pb-[env(safe-area-inset-bottom)]"
      style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
    >
      <div className="flex">
        {MOBILE_TABS.map((item) => {
          const isActive =
            pathname === item.href ||
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
                className="transition-colors mb-0.5"
                style={{
                  color: isActive
                    ? 'var(--md-primary)'
                    : 'var(--md-on-surface-variant)',
                }}
              />
              <span
                className={cn(
                  'text-[10px] leading-tight transition-colors',
                  isActive ? 'font-semibold' : ''
                )}
                style={{
                  color: isActive
                    ? 'var(--md-primary)'
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
