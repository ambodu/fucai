'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass border-b border-[#ebebed] sticky top-0 z-50 hidden lg:block">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-12 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-semibold text-[#1d1d1f]">{APP_NAME}</span>
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
                  'px-3.5 py-1.5 rounded-full text-sm transition-colors',
                  isActive
                    ? 'bg-[#0071e3]/8 text-[#0071e3] font-medium'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
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
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-colors"
        >
          <Sparkles size={13} />
          AI 分析
        </Link>
      </div>
    </nav>
  );
}
