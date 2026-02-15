'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7434f3]/8 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#7434f3]/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/4 right-0 w-[200px] h-[200px] bg-[#00d4aa]/5 rounded-full blur-[80px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-4 lg:px-6 pt-16 pb-12 lg:pt-24 lg:pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7434f3]/10 border border-[#7434f3]/20 mb-6">
          <Sparkles size={12} className="text-[#7434f3]" />
          <span className="text-xs text-[#7434f3] font-medium">AI 驱动的彩票数据分析</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl lg:text-5xl font-black text-white mb-4 tracking-tight">
          福彩3D{' '}
          <span className="bg-gradient-to-r from-[#7434f3] to-[#9b59b6] bg-clip-text text-transparent">
            智能分析平台
          </span>
        </h1>
        <p className="text-gray-400 text-sm lg:text-base max-w-lg mx-auto mb-8 leading-relaxed">
          基于海量历史数据，结合 AI 智能分析模型，为您提供专业的走势分析、冷热追踪和数据统计服务
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/ai"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7434f3] to-[#9b59b6] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#7434f3]/20"
          >
            <Sparkles size={16} />
            开始 AI 分析
          </Link>
          <Link
            href="/trend"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            查看走势图
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
