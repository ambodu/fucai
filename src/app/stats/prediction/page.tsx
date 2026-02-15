'use client';

import { useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { generatePrediction } from '@/utils/trend-calc';
import { Brain } from 'lucide-react';

export default function PredictionPage() {
  const prediction = useMemo(() => generatePrediction(mockDraws), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain size={20} className="text-[#7434f3]" />
        <div>
          <h2 className="text-lg font-semibold text-white">智能预测分析</h2>
          <p className="text-xs text-gray-500 mt-0.5">基于近50期数据统计分析，仅供参考</p>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="bg-[#7434f3]/5 border border-[#7434f3]/10 rounded-2xl p-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          以下分析仅基于历史数据统计，不构成投注建议。彩票每期开奖均为独立随机事件，历史数据不代表未来结果。请理性购彩，量力而行。
        </p>
      </div>

      {/* Position analysis cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {prediction.positions.map(pos => (
          <div key={pos.position} className="bg-[#13161b] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4 text-[#7434f3]">{pos.positionLabel}分析</h3>

            {/* Hot digits */}
            <div className="mb-4">
              <div className="text-[11px] text-gray-500 font-medium mb-2">热号（高频出现）</div>
              <div className="space-y-1.5">
                {pos.hotDigits.map(h => (
                  <div key={h.digit} className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white text-xs font-bold flex items-center justify-center">
                      {h.digit}
                    </span>
                    <span className="text-xs text-gray-400">{h.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold digits */}
            <div className="mb-4">
              <div className="text-[11px] text-gray-500 font-medium mb-2">冷号（长期未出）</div>
              <div className="space-y-1.5">
                {pos.coldDigits.map(c => (
                  <div key={c.digit} className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white text-xs font-bold flex items-center justify-center">
                      {c.digit}
                    </span>
                    <span className="text-xs text-gray-400">{c.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div className="pt-3 border-t border-white/5">
              <div className="text-[11px] text-gray-500 font-medium mb-2">推荐号码</div>
              <div className="flex gap-2">
                {pos.recommendedDigits.map(d => (
                  <span key={d} className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7434f3] to-[#9b59b6] text-white text-sm font-bold flex items-center justify-center">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="bg-[#13161b] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">综合指标分析</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-3.5">
            <div className="text-[11px] text-gray-500 mb-1">和值范围</div>
            <div className="text-base font-bold text-white">{prediction.sumRange.min} - {prediction.sumRange.max}</div>
            <div className="text-xs text-gray-500">均值: {prediction.sumRange.avg}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3.5">
            <div className="text-[11px] text-gray-500 mb-1">跨度范围</div>
            <div className="text-base font-bold text-white">{prediction.spanRange.min} - {prediction.spanRange.max}</div>
            <div className="text-xs text-gray-500">均值: {prediction.spanRange.avg}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3.5">
            <div className="text-[11px] text-gray-500 mb-1">常见大小形态</div>
            <div className="flex gap-1 flex-wrap mt-1">
              {prediction.likelyPatterns.bigSmall.map(p => (
                <span key={p} className="px-2 py-0.5 bg-[#7434f3]/10 text-[#7434f3] rounded-lg text-[11px] font-medium">{p}</span>
              ))}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3.5">
            <div className="text-[11px] text-gray-500 mb-1">常见奇偶形态</div>
            <div className="flex gap-1 flex-wrap mt-1">
              {prediction.likelyPatterns.oddEven.map(p => (
                <span key={p} className="px-2 py-0.5 bg-[#00d4aa]/10 text-[#00d4aa] rounded-lg text-[11px] font-medium">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
