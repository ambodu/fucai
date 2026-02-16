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
    <div className="bg-white rounded-2xl p-5 lg:p-7 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[#1d1d1f] text-base lg:text-lg font-semibold">福彩3D</span>
        </div>
        <span className="text-xs text-[#8e8e93]">
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
      <div className="flex gap-4 flex-wrap text-xs text-[#8e8e93] mb-4">
        <span>和值 <strong className="text-[#1d1d1f]">{draw.sum}</strong></span>
        <span>跨度 <strong className="text-[#1d1d1f]">{draw.span}</strong></span>
        <span>奇偶 <strong className="text-[#1d1d1f]">{draw.oddCount}:{draw.evenCount}</strong></span>
        <span>大小 <strong className="text-[#1d1d1f]">{draw.bigCount}:{draw.smallCount}</strong></span>
        <span>类型 <strong className="text-[#1d1d1f]">{getGroupLabel(draw.group)}</strong></span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href="/data"
          className="px-4 py-2 rounded-full bg-[#f5f5f7] text-[#8e8e93] text-xs hover:bg-[#e5e5ea] transition-colors"
        >
          历史数据
        </Link>
        <Link
          href="/trend"
          className="px-4 py-2 rounded-full bg-[#f5f5f7] text-[#8e8e93] text-xs hover:bg-[#e5e5ea] transition-colors"
        >
          走势图
        </Link>
        <Link
          href="/ai"
          className="px-4 py-2 rounded-full bg-[#1d1d1f] text-white text-xs hover:bg-[#333] transition-colors"
        >
          AI 查询
        </Link>
      </div>
    </div>
  );
}
