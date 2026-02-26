'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Navbar — 桌面端顶部导航栏
 *
 * - 高度 44px (h-11)，轻薄不遮挡内容
 * - 毛玻璃背景
 * - "我的" 已在 NAV_ITEMS 中，不再单独显示用户中心
 */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block sticky top-0 z-50 apple-nav">
      <div className="max-w-[980px] mx-auto flex items-center justify-between h-11 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--md-primary)' }}>
              {APP_NAME}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-1 text-[13px] rounded-full transition-all',
                    isActive
                      ? 'font-semibold'
                      : 'hover:bg-black/[0.04]'
                  )}
                  style={{
                    color: isActive
                      ? 'var(--md-primary)'
                      : 'var(--md-on-surface-variant)',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
