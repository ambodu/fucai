import Link from 'next/link';
import { APP_NAME, DISCLAIMER_TEXT } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="hidden lg:block bg-[#f5f5f7] mt-8">
      <div className="max-w-[980px] mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[15px] font-semibold text-[#1d1d1f]">{APP_NAME}</span>
            </div>
            <p className="text-[13px] text-[#6e6e73] max-w-md">
              福彩3D历史数据查询与AI智能分析平台
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="text-[13px] font-semibold mb-3 text-[#1d1d1f]">功能导航</h4>
              <ul className="space-y-2 text-[13px] text-[#6e6e73]">
                <li><Link href="/ai" className="hover:text-[#1d1d1f] transition-colors">AI 智能分析</Link></li>
                <li><Link href="/trend" className="hover:text-[#1d1d1f] transition-colors">走势图表</Link></li>
                <li><Link href="/data" className="hover:text-[#1d1d1f] transition-colors">数据查询</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-3 text-[#1d1d1f]">更多服务</h4>
              <ul className="space-y-2 text-[13px] text-[#6e6e73]">
                <li><Link href="/stats" className="hover:text-[#1d1d1f] transition-colors">统计分析</Link></li>
                <li><Link href="/stats/frequency" className="hover:text-[#1d1d1f] transition-colors">号码频率</Link></li>
                <li><Link href="/user" className="hover:text-[#1d1d1f] transition-colors">会员中心</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-[#d2d2d7] pt-5">
          <p className="text-[12px] text-[#8e8e93] leading-relaxed">
            {DISCLAIMER_TEXT}
          </p>
          <p className="text-[12px] text-[#8e8e93]/60 mt-3">
            &copy; 2025 {APP_NAME}. 数据来源于中国福利彩票官方网站。
          </p>
        </div>
      </div>
    </footer>
  );
}
