'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

/**
 * Navbar — Material Design 3 Top App Bar (Small)
 *
 * MD3 规范:
 * - 使用 surface-container 作为背景色（非纯白/毛玻璃）
 * - 导航项使用 on-surface / on-surface-variant 色
 * - 激活态使用 primary 色 + 填充指示器 (primary-container)
 * - 高度 64px (h-16)，紧凑模式可用 48px
 * - 阴影使用 MD3 elevation-2
 */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden lg:block sticky top-0 z-50"
      style={{
        background: 'var(--md-surface-container)',
        boxShadow: 'var(--md-elevation-2)',
      }}
    >
      <div className="max-w-[980px] mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className="md3-title-medium tracking-tight"
              style={{ color: 'var(--md-primary)' }}
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Navigation links — MD3 Navigation Tab 风格 */}
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
                    'px-4 py-2 md3-label-large rounded-full transition-all',
                    isActive
                      ? ''
                      : 'hover:bg-[var(--md-surface-container-highest)]'
                  )}
                  style={
                    isActive
                      ? {
                          background: 'var(--md-secondary-container)',
                          color: 'var(--md-on-secondary-container)',
                        }
                      : {
                          color: 'var(--md-on-surface-variant)',
                        }
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User — MD3 Icon Button + Label */}
        <Link
          href="/user"
          className="md3-icon-btn flex items-center gap-2 w-auto px-3"
          style={{ color: 'var(--md-on-surface-variant)' }}
        >
          <User size={20} strokeWidth={1.5} />
          <span className="md3-label-medium">用户中心</span>
        </Link>
      </div>
    </nav>
  );
}
