'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#0b0e11]/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 hidden lg:block">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7434f3] to-[#9b59b6] flex items-center justify-center text-white text-sm font-bold">
            彩
          </div>
          <span className="text-lg font-semibold text-white">{APP_NAME}</span>
        </Link>

        {/* Nav Links */}
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm transition-colors',
                  isActive
                    ? 'bg-[#7434f3]/10 text-[#7434f3] font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <Link
          href="/ai"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7434f3] to-[#9b59b6] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Sparkles size={14} />
          开始分析
        </Link>
      </div>
    </nav>
  );
}
