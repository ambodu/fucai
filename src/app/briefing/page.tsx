'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';
import Disclaimer from '@/components/layout/Disclaimer';
import FC3DBall from '@/components/lottery/FC3DBall';
import { mockBriefings } from '@/lib/mock/briefings';
import { formatDate, formatPeriod } from '@/utils/format';
import { getPositionLabel } from '@/utils/fc3d-calc';
import { Briefing } from '@/types/fc3d';

export default function BriefingPage() {
  const [selected, setSelected] = useState<Briefing>(mockBriefings[0]);

  return (
    <div className="min-h-screen pb-[70px] lg:pb-0 bg-[#f5f5f7]">
      <Navbar />

      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-6 lg:py-10">
        <div className="max-w-[1200px] mx-auto lg:px-6">
          <h1 className="text-[#1d1d1f] text-lg lg:text-2xl font-bold mb-1">数据简报</h1>
          <p className="text-[#6e6e73] text-xs lg:text-sm">
            每期开奖后自动生成数据分析简报
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-4">
        <div className="lg:flex lg:gap-6">
          {/* Briefing List */}
          <div className="lg:w-[320px] lg:shrink-0 mb-4 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-apple overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f5f5f7]">
                <h3 className="text-sm font-bold text-[#1d1d1f]">历史简报</h3>
              </div>
              {mockBriefings.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className={`w-full text-left px-4 py-3 border-b border-[#f5f5f7] last:border-b-0 transition-colors ${
                    selected.id === b.id ? 'bg-[#0071e3]/5' : 'hover:bg-[#f5f5f7]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${selected.id === b.id ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>
                      {formatPeriod(b.period)}
                    </span>
                    <span className="text-[11px] text-[#6e6e73]">{formatDate(b.drawDate)}</span>
                  </div>
                  <p className="text-xs text-[#6e6e73] line-clamp-2">{b.contentText}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Briefing Detail */}
          <div className="flex-1">
            <BriefingDetail briefing={selected} />
          </div>
        </div>
      </div>

      <Disclaimer />
      <Footer />
      <MobileTabBar />
    </div>
  );
}

function BriefingDetail({ briefing }: { briefing: Briefing }) {
  const { content } = briefing;
  const { drawNumbers, basicFeatures, missingChanges, frequencyData, sumTrend } = content;

  return (
    <div className="space-y-4">
      {/* Draw Result */}
      <div className="bg-white rounded-2xl shadow-apple p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#1d1d1f]">{formatPeriod(briefing.period)} 数据简报</h3>
          <span className="text-xs text-[#6e6e73]">{formatDate(briefing.drawDate)}</span>
        </div>

        {/* Balls */}
        <div className="flex items-center gap-3 mb-4">
          <FC3DBall digit={drawNumbers.digit1} size="lg" />
          <FC3DBall digit={drawNumbers.digit2} size="lg" />
          <FC3DBall digit={drawNumbers.digit3} size="lg" />
        </div>

        {/* Basic Features */}
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { label: '和值', value: basicFeatures.sum },
            { label: '跨度', value: basicFeatures.span },
            { label: '奇偶比', value: basicFeatures.oddEven },
            { label: '大小比', value: basicFeatures.bigSmall },
            { label: '组态', value: basicFeatures.group },
          ].map(item => (
            <div key={item.label} className="bg-[#f5f5f7] rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-[#6e6e73] mb-0.5">{item.label}</div>
              <div className="text-sm font-bold text-[#0071e3]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Changes */}
      <div className="bg-white rounded-2xl shadow-apple p-4 lg:p-6">
        <h4 className="text-sm font-bold text-[#1d1d1f] mb-3">遗漏变化</h4>

        {missingChanges.endedMissing.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-[#6e6e73] mb-2">本期结束遗漏</div>
            <div className="flex gap-2 flex-wrap">
              {missingChanges.endedMissing.map((m, i) => (
                <div key={i} className="px-3 py-1.5 bg-[#10b981]/8 rounded-lg text-xs">
                  <span className="text-[#10b981] font-medium">
                    {getPositionLabel(m.position)} 数字{m.digit}
                  </span>
                  <span className="text-[#6e6e73] ml-1">（结束{m.wasMissing}期遗漏）</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {missingChanges.longestMissing.length > 0 && (
          <div>
            <div className="text-xs text-[#6e6e73] mb-2">当前最长遗漏</div>
            <div className="flex gap-2 flex-wrap">
              {missingChanges.longestMissing.map((m, i) => (
                <div key={i} className="px-3 py-1.5 bg-[#ef4444]/8 rounded-lg text-xs">
                  <span className="text-[#ef4444] font-medium">
                    {getPositionLabel(m.position)} 数字{m.digit}
                  </span>
                  <span className="text-[#6e6e73] ml-1">（已遗漏{m.currentMissing}期）</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Frequency */}
      <div className="bg-white rounded-2xl shadow-apple p-4 lg:p-6">
        <h4 className="text-sm font-bold text-[#1d1d1f] mb-3">频率数据（近{frequencyData.digit1Top.in}期）</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#e74c3c]/5 rounded-xl p-3">
            <div className="text-[10px] text-[#6e6e73] mb-1">百位最热号码</div>
            <div className="flex items-center gap-2">
              <FC3DBall digit={frequencyData.digit1Top.digit} size="sm" />
              <span className="text-sm font-bold text-[#e74c3c]">
                {frequencyData.digit1Top.count}次
              </span>
            </div>
          </div>
          <div className="bg-[#0071e3]/5 rounded-xl p-3">
            <div className="text-[10px] text-[#6e6e73] mb-1">百位最冷号码</div>
            <div className="flex items-center gap-2">
              <FC3DBall digit={frequencyData.digit1Bottom.digit} size="sm" variant="blue" />
              <span className="text-sm font-bold text-[#0071e3]">
                {frequencyData.digit1Bottom.count}次
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sum Trend */}
      <div className="bg-white rounded-2xl shadow-apple p-4 lg:p-6">
        <h4 className="text-sm font-bold text-[#1d1d1f] mb-3">和值走势（近10期）</h4>
        <div className="flex items-end gap-1 h-[80px] mb-2">
          {sumTrend.last10.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <span className="text-[9px] text-[#6e6e73] mb-0.5">{v}</span>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(v / 27) * 100}%`,
                  background: v >= sumTrend.avg50
                    ? 'linear-gradient(to top, #f59e0b, #ef4444)'
                    : 'linear-gradient(to top, #0071e3, #06b6d4)',
                }}
              />
            </div>
          ))}
        </div>
        <div className="text-xs text-[#6e6e73] text-center">
          近50期平均和值：<span className="text-[#0071e3] font-semibold">{sumTrend.avg50}</span>
        </div>
      </div>
    </div>
  );
}
