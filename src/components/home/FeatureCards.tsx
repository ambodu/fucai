'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TrendingUp, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { mockDraws } from '@/lib/mock/fc3d-draws';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

function MiniChart({ type, data, color }: { type: 'bar' | 'line'; data: number[]; color: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const option = type === 'bar'
      ? {
          backgroundColor: 'transparent',
          grid: { top: 5, right: 5, bottom: 5, left: 5 },
          xAxis: { type: 'category', show: false },
          yAxis: { type: 'value', show: false },
          series: [{
            type: 'bar',
            data,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color },
                { offset: 1, color: `${color}40` },
              ]),
              borderRadius: [2, 2, 0, 0],
            },
            barWidth: '60%',
          }],
        }
      : {
          backgroundColor: 'transparent',
          grid: { top: 5, right: 5, bottom: 5, left: 5 },
          xAxis: { type: 'category', show: false },
          yAxis: { type: 'value', show: false },
          series: [{
            type: 'line',
            data,
            smooth: true,
            symbol: 'none',
            lineStyle: { color, width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${color}30` },
                { offset: 1, color: `${color}05` },
              ]),
            },
          }],
        };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [type, data, color]);

  return <div ref={ref} className="w-full h-[80px]" />;
}

export default function FeatureCards() {
  const recent20 = mockDraws.slice(0, 20);

  // Feature 1: AI prediction — frequency bar data
  const freqData: number[] = [];
  for (let d = 0; d <= 9; d++) {
    freqData.push(
      recent20.filter(draw => draw.digit1 === d || draw.digit2 === d || draw.digit3 === d).length
    );
  }

  // Feature 2: Trend — sum values line
  const sumData = recent20.map(d => d.sum).reverse();

  // Feature 3: Hot/cold — missing counts bar
  const missingData: number[] = [];
  for (let d = 0; d <= 9; d++) {
    const idx = mockDraws.findIndex(draw => draw.digit1 === d || draw.digit2 === d || draw.digit3 === d);
    missingData.push(idx === -1 ? 30 : idx);
  }

  const features = [
    {
      icon: Sparkles,
      title: 'AI 智能预测',
      desc: '基于多维度数据分析，AI 给出号码参考建议',
      href: '/ai',
      chartType: 'bar' as const,
      chartData: freqData,
      chartColor: '#7434f3',
    },
    {
      icon: TrendingUp,
      title: '数据走势分析',
      desc: '和值、跨度、形态等多维走势图表',
      href: '/trend',
      chartType: 'line' as const,
      chartData: sumData,
      chartColor: '#00d4aa',
    },
    {
      icon: Flame,
      title: '冷热号码追踪',
      desc: '实时追踪号码冷热状态与遗漏周期',
      href: '/stats/hot-cold',
      chartType: 'bar' as const,
      chartData: missingData,
      chartColor: '#e67e22',
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map(f => (
          <Link
            key={f.title}
            href={f.href}
            className="group bg-[#13161b] border border-white/5 rounded-2xl p-5 hover:border-[#7434f3]/30 transition-all"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#7434f3]/10 flex items-center justify-center">
                <f.icon size={18} className="text-[#7434f3]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{f.title}</h3>
                <p className="text-[11px] text-gray-500">{f.desc}</p>
              </div>
            </div>
            <MiniChart type={f.chartType} data={f.chartData} color={f.chartColor} />
          </Link>
        ))}
      </div>
    </section>
  );
}
