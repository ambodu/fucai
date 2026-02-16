import Link from 'next/link';
import { APP_NAME, DISCLAIMER_TEXT } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="hidden lg:block bg-[#f5f5f7] mt-8">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-lg font-semibold text-[#1d1d1f]">{APP_NAME}</span>
            </div>
            <p className="text-sm text-[#6e6e73] max-w-md">
              基于AI的福彩3D历史数据查询与统计分析平台
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-[#1d1d1f]">功能</h4>
              <ul className="space-y-2 text-sm text-[#6e6e73]">
                <li><Link href="/ai" className="hover:text-[#0071e3] transition-colors">AI 智能分析</Link></li>
                <li><Link href="/trend" className="hover:text-[#0071e3] transition-colors">走势图表</Link></li>
                <li><Link href="/data" className="hover:text-[#0071e3] transition-colors">数据查询</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-[#1d1d1f]">更多</h4>
              <ul className="space-y-2 text-sm text-[#6e6e73]">
                <li><Link href="/stats" className="hover:text-[#0071e3] transition-colors">统计分析</Link></li>
                <li><Link href="/stats/frequency" className="hover:text-[#0071e3] transition-colors">号码频率</Link></li>
                <li><Link href="/stats/hot-cold" className="hover:text-[#0071e3] transition-colors">冷热分析</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-[#ebebed] pt-6">
          <p className="text-[11px] text-[#6e6e73] leading-relaxed">
            {DISCLAIMER_TEXT}
          </p>
          <p className="text-[11px] text-[#6e6e73]/60 mt-4">
            © 2025 {APP_NAME}. 数据来源于中国福利彩票官方网站。
          </p>
        </div>
      </div>
    </footer>
  );
}
