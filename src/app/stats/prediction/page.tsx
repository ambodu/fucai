'use client';

import { useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { generatePrediction } from '@/utils/trend-calc';
import { Brain } from 'lucide-react';
import FC3DBall from '@/components/lottery/FC3DBall';

export default function PredictionPage() {
  const prediction = useMemo(() => generatePrediction(mockDraws), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain size={20} className="text-[#AF52DE]" />
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">智能预测分析</h2>
          <p className="text-[12px] text-[#8e8e93] mt-0.5">基于近50期数据统计分析，仅供参考</p>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="bg-[#f5f5f7] rounded-2xl p-4">
        <p className="text-[12px] text-[#8e8e93] leading-relaxed">
          以下分析仅基于历史数据统计，不构成投注建议。彩票每期开奖均为独立随机事件，历史数据不代表未来结果。请理性购彩，量力而行。
        </p>
      </div>

      {/* Position analysis cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {prediction.positions.map(pos => (
          <div key={pos.position} className="rounded-2xl shadow-card bg-white p-5">
            <h3 className="text-[14px] font-semibold mb-4 text-[#007AFF]">{pos.positionLabel}分析</h3>

            {/* Hot digits */}
            <div className="mb-4">
              <div className="text-[11px] text-[#8e8e93] font-medium mb-2">热号（高频出现）</div>
              <div className="space-y-1.5">
                {pos.hotDigits.map(h => (
                  <div key={h.digit} className="flex items-center gap-2.5">
                    <FC3DBall digit={h.digit} size="sm" variant="red" />
                    <span className="text-[12px] text-[#8e8e93]">{h.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold digits */}
            <div className="mb-4">
              <div className="text-[11px] text-[#8e8e93] font-medium mb-2">冷号（长期未出）</div>
              <div className="space-y-1.5">
                {pos.coldDigits.map(c => (
                  <div key={c.digit} className="flex items-center gap-2.5">
                    <FC3DBall digit={c.digit} size="sm" variant="blue" />
                    <span className="text-[12px] text-[#8e8e93]">{c.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div className="pt-3 border-t border-[#e5e5ea]">
              <div className="text-[11px] text-[#8e8e93] font-medium mb-2">推荐号码</div>
              <div className="flex gap-2">
                {pos.recommendedDigits.map(d => (
                  <FC3DBall key={d} digit={d} size="md" variant="purple" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="rounded-2xl shadow-card bg-white p-5">
        <h3 className="text-[14px] font-semibold mb-4 text-[#1d1d1f]">综合指标分析</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f5f5f7] rounded-xl p-3.5">
            <div className="text-[11px] text-[#8e8e93] mb-1">和值范围</div>
            <div className="text-base font-semibold text-[#1d1d1f]">{prediction.sumRange.min} - {prediction.sumRange.max}</div>
            <div className="text-[12px] text-[#8e8e93]">均值: {prediction.sumRange.avg}</div>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-3.5">
            <div className="text-[11px] text-[#8e8e93] mb-1">跨度范围</div>
            <div className="text-base font-semibold text-[#1d1d1f]">{prediction.spanRange.min} - {prediction.spanRange.max}</div>
            <div className="text-[12px] text-[#8e8e93]">均值: {prediction.spanRange.avg}</div>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-3.5">
            <div className="text-[11px] text-[#8e8e93] mb-1">常见大小形态</div>
            <div className="flex gap-1 flex-wrap mt-1">
              {prediction.likelyPatterns.bigSmall.map(p => (
                <span key={p} className="px-2 py-0.5 bg-[#FF3B30]/8 text-[#FF3B30] rounded-full text-[11px] font-medium">{p}</span>
              ))}
            </div>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-3.5">
            <div className="text-[11px] text-[#8e8e93] mb-1">常见奇偶形态</div>
            <div className="flex gap-1 flex-wrap mt-1">
              {prediction.likelyPatterns.oddEven.map(p => (
                <span key={p} className="px-2 py-0.5 bg-[#AF52DE]/8 text-[#AF52DE] rounded-full text-[11px] font-medium">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
