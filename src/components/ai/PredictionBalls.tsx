'use client';

import { PredictionResult } from '@/types/ai';
import FC3DBall from '@/components/lottery/FC3DBall';
import { Target } from 'lucide-react';

interface PredictionBallsProps {
  prediction: PredictionResult;
}

export default function PredictionBalls({ prediction }: PredictionBallsProps) {
  return (
    <div className="bg-gradient-to-br from-[#f5f5f7] to-white rounded-2xl p-5 mb-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-[#0071e3]" />
        <h4 className="text-sm font-bold text-[#1d1d1f]">下期推荐号码</h4>
      </div>

      {/* Positions */}
      <div className="space-y-4">
        {prediction.positions.map((pos) => (
          <div key={pos.label}>
            <div className="text-[11px] text-[#6e6e73] font-medium mb-2">{pos.label}</div>
            <div className="flex gap-3 items-start">
              {pos.recommended.map((digit) => (
                <div key={digit} className="flex flex-col items-center gap-1">
                  <FC3DBall digit={digit} size="lg" variant="purple" />
                  <span className="text-[9px] text-[#6e6e73] text-center max-w-[56px] leading-tight">
                    {pos.reasons[digit] || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#ebebed] my-4" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/80 rounded-xl px-3 py-2">
          <div className="text-[10px] text-[#6e6e73]">和值参考</div>
          <div className="text-sm font-bold text-[#1d1d1f]">
            {prediction.sumRange.min}-{prediction.sumRange.max}
          </div>
          <div className="text-[10px] text-[#6e6e73]">均值 {prediction.sumRange.avg}</div>
        </div>
        <div className="bg-white/80 rounded-xl px-3 py-2">
          <div className="text-[10px] text-[#6e6e73]">跨度参考</div>
          <div className="text-sm font-bold text-[#1d1d1f]">
            {prediction.spanRange.min}-{prediction.spanRange.max}
          </div>
          <div className="text-[10px] text-[#6e6e73]">均值 {prediction.spanRange.avg}</div>
        </div>
      </div>

      {/* Patterns */}
      {(prediction.patterns.bigSmall.length > 0 || prediction.patterns.oddEven.length > 0) && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {prediction.patterns.bigSmall.map(p => (
            <span key={p} className="px-2 py-0.5 bg-[#0071e3]/8 text-[#0071e3] rounded-lg text-[10px] font-medium">{p}</span>
          ))}
          {prediction.patterns.oddEven.map(p => (
            <span key={p} className="px-2 py-0.5 bg-[#8b5cf6]/8 text-[#8b5cf6] rounded-lg text-[10px] font-medium">{p}</span>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-3 text-[9px] text-[#6e6e73]/60 leading-relaxed">
        以上推荐基于历史数据统计，仅供参考。请理性购彩，量力而行。
      </div>
    </div>
  );
}
