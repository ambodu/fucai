'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CHART_COLORS, CHART_THEME } from '@/lib/echarts-theme';

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const DEMO_CONVERSATION = [
  {
    role: 'user' as const,
    text: '分析最近50期各数字出现频率',
  },
  {
    role: 'assistant' as const,
    text: '根据最近50期数据统计，各数字出现频率如下。数字 **5** 和 **8** 出现最为频繁，属于当前热号；数字 **2** 和 **0** 出现较少，处于偏冷状态。',
    chart: {
      xAxis: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      data: [5, 8, 3, 7, 6, 12, 4, 9, 11, 6],
    },
  },
];

function DemoChart({ xAxis, data }: { xAxis: string[]; data: number[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { ...CHART_THEME.tooltip, trigger: 'axis' },
      grid: { top: 15, right: 10, bottom: 25, left: 35 },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLabel: { fontSize: 10, color: '#9ca3af' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#6b7280' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLine: { show: false },
      },
      series: [{
        type: 'bar',
        data: data.map((v, i) => ({
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: CHART_COLORS[i % CHART_COLORS.length] },
              { offset: 1, color: `${CHART_COLORS[i % CHART_COLORS.length]}60` },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
        })),
        barMaxWidth: 22,
      }],
    });
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [xAxis, data]);

  return <div ref={ref} className="w-full h-[180px]" />;
}

export default function AIDemo() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white mb-1">AI 对话分析体验</h2>
        <p className="text-xs text-gray-500">向 AI 提问任何数据分析问题，获取结构化图表回复</p>
      </div>

      <div className="bg-[#13161b] border border-white/5 rounded-2xl p-4 lg:p-6 max-w-[700px] mx-auto">
        {/* Demo messages */}
        <div className="space-y-4 mb-5">
          {DEMO_CONVERSATION.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-[#7434f3] to-[#9b59b6] text-white'
                  : 'bg-white/10 text-gray-400'
              }`}>
                {msg.role === 'assistant' ? 'AI' : 'Me'}
              </div>
              <div className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                msg.role === 'assistant'
                  ? 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-sm'
                  : 'bg-[#7434f3]/10 text-gray-300 rounded-tr-sm'
              }`}>
                <div dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                }} />
                {'chart' in msg && msg.chart && (
                  <div className="mt-2">
                    <DemoChart xAxis={msg.chart.xAxis} data={msg.chart.data} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/ai"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#7434f3] to-[#9b59b6] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Sparkles size={14} />
          开始与 AI 对话
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
