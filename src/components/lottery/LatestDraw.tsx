import { FC3DDraw } from '@/types/fc3d';
import FC3DBall from './FC3DBall';
import { formatDate, formatPeriod, getWeekday } from '@/utils/format';
import { getGroupLabel } from '@/utils/fc3d-calc';
import Link from 'next/link';

interface LatestDrawProps {
  draw: FC3DDraw;
}

export default function LatestDraw({ draw }: LatestDrawProps) {
  return (
    <div className="bg-white rounded-2xl p-5 lg:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[#e74c3c] text-base lg:text-lg font-bold">福彩3D</span>
        </div>
        <span className="text-xs text-gray-400">
          {formatPeriod(draw.period)} · {formatDate(draw.drawDate)} {getWeekday(draw.drawDate)}
        </span>
      </div>

      {/* Balls */}
      <div className="flex gap-3 items-center mb-4">
        <FC3DBall digit={draw.digit1} size="lg" />
        <FC3DBall digit={draw.digit2} size="lg" />
        <FC3DBall digit={draw.digit3} size="lg" />
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap text-xs text-gray-500 mb-4">
        <span>和值 <strong className="text-[#e67e22]">{draw.sum}</strong></span>
        <span>跨度 <strong className="text-[#e67e22]">{draw.span}</strong></span>
        <span>奇偶 <strong className="text-[#e67e22]">{draw.oddCount}:{draw.evenCount}</strong></span>
        <span>大小 <strong className="text-[#e67e22]">{draw.bigCount}:{draw.smallCount}</strong></span>
        <span>类型 <strong className="text-[#e67e22]">{getGroupLabel(draw.group)}</strong></span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href="/data"
          className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs hover:bg-gray-100 transition-colors"
        >
          历史数据
        </Link>
        <Link
          href="/trend"
          className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs hover:bg-gray-100 transition-colors"
        >
          走势图
        </Link>
        <Link
          href="/ai"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#e74c3c] to-[#e67e22] text-white text-xs hover:opacity-90 transition-opacity"
        >
          AI 查询
        </Link>
      </div>
    </div>
  );
}
