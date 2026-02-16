'use client';

import Link from 'next/link';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const latest = mockDraws[0];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Floating gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0071e3]/5 blur-3xl" />
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[30%] w-[350px] h-[350px] rounded-full bg-[#ec4899]/5 blur-3xl" />

      <div className="relative max-w-[1200px] mx-auto px-5 lg:px-6 py-16 lg:py-28 text-center">
        {/* Status badge */}
        {latest && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f7] mb-6 lg:mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs text-[#6e6e73]">数据已更新至第 {latest.period} 期</span>
          </div>
        )}

        {/* Main headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight mb-5 lg:mb-6 animate-fade-in-up">
          <span className="bg-gradient-to-r from-[#0071e3] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
            AI 驱动的
          </span>
          <br />
          <span className="text-[#1d1d1f]">彩票数据分析平台</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base lg:text-xl text-[#6e6e73] max-w-2xl mx-auto mb-8 lg:mb-10 animate-fade-in-up font-normal leading-relaxed px-2">
          基于15,000+期历史数据与人工智能技术，为您提供专业的号码走势分析、智能预测参考与数据可视化服务
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 lg:mb-16 animate-fade-in-up px-4">
          <Link
            href="/ai"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0071e3] text-white rounded-full px-8 py-3.5 text-base font-medium shadow-apple hover:bg-[#0077ed] transition-all hover:shadow-apple-lg active:scale-[0.98]"
          >
            <Sparkles size={18} />
            开始 AI 分析
          </Link>
          <Link
            href="/trend"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f5f5f7] text-[#1d1d1f] rounded-full px-8 py-3.5 text-base font-medium hover:bg-[#ebebed] transition-colors active:scale-[0.98]"
          >
            浏览走势图
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-16 animate-fade-in">
          {[
            { value: '15,000+', label: '历史数据' },
            { value: '3秒', label: 'AI分析速度' },
            { value: '100%', label: '官方数据源' },
            { value: '10+', label: '分析维度' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1d1d1f]">{stat.value}</div>
              <div className="text-xs sm:text-sm text-[#6e6e73] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
