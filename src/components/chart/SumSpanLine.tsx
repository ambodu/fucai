'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TrendDataPoint } from '@/types/fc3d';

echarts.use([LineChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

interface SumSpanLineProps {
  data: TrendDataPoint[];
  type: 'sum' | 'span';
}

export default function SumSpanLine({ data, type }: SumSpanLineProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    const values = data.map(d => type === 'sum' ? d.sum : d.span);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1d23',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = (params as Array<{ name: string; value: number }>)[0];
          return `${p.name}期<br/>${type === 'sum' ? '和值' : '跨度'}: <b>${p.value}</b>`;
        },
      },
      grid: { top: 30, right: 20, bottom: 30, left: 45 },
      xAxis: {
        type: 'category',
        data: data.map(d => d.period.slice(-3)),
        axisLabel: { fontSize: 10, rotate: 45, color: '#9ca3af' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: type === 'sum' ? 27 : 9,
        axisLabel: { fontSize: 11, color: '#9ca3af' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#7434f3', width: 2 },
          itemStyle: { color: '#7434f3' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(116, 52, 243, 0.15)' },
              { offset: 1, color: 'rgba(116, 52, 243, 0.01)' },
            ]),
          },
          markLine: {
            silent: true,
            data: [{ yAxis: avg, name: '平均' }],
            lineStyle: { color: '#00d4aa', type: 'dashed' },
            label: { formatter: `均值 ${avg.toFixed(1)}`, fontSize: 10, color: '#00d4aa' },
          },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data, type]);

  return (
    <div>
      <h4 className="text-sm font-bold mb-2 text-gray-200">
        {type === 'sum' ? '和值' : '跨度'}走势
      </h4>
      <div ref={chartRef} className="w-full h-[250px] lg:h-[300px]" />
    </div>
  );
}
