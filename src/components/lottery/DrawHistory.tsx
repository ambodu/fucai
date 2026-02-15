import { FC3DDraw } from '@/types/fc3d';
import FC3DBall from './FC3DBall';
import { formatDate, formatPeriod } from '@/utils/format';
import { getGroupLabel } from '@/utils/fc3d-calc';

interface DrawHistoryProps {
  draws: FC3DDraw[];
}

export default function DrawHistory({ draws }: DrawHistoryProps) {
  return (
    <div className="bg-[#13161b] border border-white/5 rounded-2xl overflow-hidden">
      {/* Mobile: Card list */}
      <div className="lg:hidden">
        {draws.map((draw) => (
          <div key={draw.period} className="p-4 border-b border-white/5 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">{formatPeriod(draw.period)}</span>
              <span className="text-xs text-gray-500">{formatDate(draw.drawDate)}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <FC3DBall digit={draw.digit1} size="sm" />
              <FC3DBall digit={draw.digit2} size="sm" />
              <FC3DBall digit={draw.digit3} size="sm" />
              <span className="text-xs text-gray-500 ml-2">
                和值{draw.sum} · 跨度{draw.span} · {getGroupLabel(draw.group)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">期号</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">日期</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">开奖号码</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-semibold">和值</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-semibold">跨度</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-semibold">奇偶</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-semibold">大小</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-semibold">类型</th>
            </tr>
          </thead>
          <tbody>
            {draws.map((draw) => (
              <tr key={draw.period} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-sm font-semibold text-white">{draw.period}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(draw.drawDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <FC3DBall digit={draw.digit1} size="sm" />
                    <FC3DBall digit={draw.digit2} size="sm" />
                    <FC3DBall digit={draw.digit3} size="sm" />
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm"><span className="text-[#00d4aa] font-semibold">{draw.sum}</span></td>
                <td className="px-4 py-3 text-center text-sm"><span className="text-[#00d4aa] font-semibold">{draw.span}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-400">{draw.oddCount}:{draw.evenCount}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-400">{draw.bigCount}:{draw.smallCount}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-400">{getGroupLabel(draw.group)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
