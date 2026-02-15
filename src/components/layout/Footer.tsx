import { APP_NAME, DISCLAIMER_TEXT } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="hidden lg:block bg-[#0b0e11] border-t border-white/5 mt-8">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7434f3] to-[#9b59b6] flex items-center justify-center text-white text-sm font-bold">
                彩
              </div>
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-500 max-w-md">
              基于AI的福彩3D历史数据查询与统计分析平台
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-400">功能</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>AI 智能分析</li>
                <li>走势图表</li>
                <li>数据查询</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-400">关于</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>使用说明</li>
                <li>隐私政策</li>
                <li>服务条款</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            {DISCLAIMER_TEXT}
          </p>
          <p className="text-[11px] text-gray-700 mt-4">
            © 2025 {APP_NAME}. 数据来源于中国福利彩票官方网站。
          </p>
        </div>
      </div>
    </footer>
  );
}
