'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

/**
 * Navbar — 轻量化顶部导航栏
 *
 * 设计原则:
 * - 高度 44px (h-11)，保持轻薄不遮挡内容
 * - 毛玻璃背景 (frosted glass) + MD3 语义色
 * - 导航项紧凑排列，激活态使用 primary 色
 * - 8pt 网格间距
 */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block sticky top-0 z-50 apple-nav">
      <div className="max-w-[980px] mx-auto flex items-center justify-between h-11 px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--md-primary)' }}>
              {APP_NAME}
            </span>
          </Link>

          {/* Navigation links */}
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

        {/* User */}
        <Link
          href="/user"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] hover:bg-black/[0.04] transition-all"
          style={{ color: 'var(--md-on-surface-variant)' }}
        >
          <User size={14} strokeWidth={1.5} />
          <span>用户中心</span>
        </Link>
      </div>
    </nav>
  );
}
