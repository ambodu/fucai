'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Navbar — 桌面端顶部导航栏
 */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block sticky top-0 z-50 apple-nav border-b border-[#f1dfdd]">
      <div className="w-full h-11 px-6 xl:px-10">
        <div className="h-full w-full max-w-[1400px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/" className="flex items-center gap-2 shrink-0 justify-self-start">
            <span className="text-[15px] font-semibold tracking-tight bg-gradient-to-r from-[#E13C39] to-[#ff6a65] bg-clip-text text-transparent">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#E13C39]/75 border border-[#f5c8c6] rounded-full px-1.5 py-0.5">
              AI
            </span>
          </Link>

          <div className="flex items-center gap-1 justify-self-center">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const isAI = item.href === '/ai';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-1 text-[13px] rounded-full transition-all',
                    isActive
                      ? isAI
                        ? 'font-semibold text-white bg-gradient-to-r from-[#FF5C57] to-[#E13C39] shadow-[0_6px_16px_rgba(225,60,57,0.32)]'
                        : 'font-semibold bg-black/[0.04]'
                      : isAI
                        ? 'text-[#E13C39] hover:bg-[#ffeceb]'
                        : 'hover:bg-black/[0.04]'
                  )}
                  style={
                    isActive && !isAI
                      ? { color: 'var(--md-primary)' }
                      : !isAI
                        ? { color: 'var(--md-on-surface-variant)' }
                        : undefined
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="justify-self-end w-[90px]" aria-hidden />
        </div>
      </div>
    </nav>
  );
}
