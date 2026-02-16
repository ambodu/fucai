'use client';

import Link from 'next/link';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import FC3DBall from '@/components/lottery/FC3DBall';
import { formatPeriod } from '@/utils/format';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const latest = mockDraws[0];

  return (
    <section className="bg-white">
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 py-12 lg:py-20">
        {/* Mobile header with logo */}
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <span className="text-[15px] font-semibold text-[#E13C39]">彩数通</span>
          <span className="text-[#8e8e93] text-[11px]">福彩3D数据平台</span>
        </div>

        <div className="text-center">
          {/* Main headline */}
          <h1 className="text-[#1d1d1f] text-3xl lg:text-5xl font-semibold tracking-tight mb-4 lg:mb-5">
            <span className="text-[#E13C39]">福彩3D</span> 智能分析平台
          </h1>
          <p className="text-[#8e8e93] text-base lg:text-xl leading-relaxed mb-8 lg:mb-10 max-w-[600px] mx-auto">
            汇集 {mockDraws.length.toLocaleString()}+ 期历史数据，AI 驱动的专业数据分析工具
          </p>

          {/* Latest draw card */}
          {latest && (
            <div className="inline-block apple-card p-6 lg:p-8 mb-8 lg:mb-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] bg-[#f5f5f7] text-[#8e8e93]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  最新开奖
                </span>
                <span className="text-[#8e8e93] text-[13px]">{formatPeriod(latest.period)}</span>
                <span className="text-[#8e8e93]/60 text-[12px]">{latest.drawDate}</span>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <FC3DBall digit={latest.digit1} size="lg" />
                <FC3DBall digit={latest.digit2} size="lg" />
                <FC3DBall digit={latest.digit3} size="lg" />
              </div>

              <div className="flex justify-center gap-6 text-[#8e8e93] text-[13px]">
                <span>和值 <strong className="text-[#1d1d1f]">{latest.sum}</strong></span>
                <span>跨度 <strong className="text-[#1d1d1f]">{latest.span}</strong></span>
                <span>{latest.bigSmallPattern}</span>
                <span>{latest.oddEvenPattern}</span>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex justify-center gap-3 mb-12 lg:mb-16">
            <Link
              href="/ai"
              className="apple-btn gap-1.5"
            >
              <Sparkles size={14} />
              AI 智能分析
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/trend"
              className="apple-btn-outline"
            >
              走势图表
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[680px] mx-auto">
            {[
              { value: mockDraws.length.toLocaleString(), label: '历史数据', unit: '期' },
              { value: '3', label: 'AI分析', unit: '秒' },
              { value: '100%', label: '官方数据源', unit: '' },
              { value: '10+', label: '分析维度', unit: '' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-semibold text-[#1d1d1f]">
                  {stat.value}<span className="text-[13px] text-[#8e8e93] font-normal ml-0.5">{stat.unit}</span>
                </div>
                <div className="text-[13px] text-[#8e8e93] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
