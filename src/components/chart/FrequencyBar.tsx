'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { FC3DStatistics } from '@/types/fc3d';
import { getPositionLabel } from '@/utils/fc3d-calc';

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface FrequencyBarProps {
  statistics: FC3DStatistics[];
  position: number;
  periods?: number;
}

export default function FrequencyBar({ statistics, position, periods = 50 }: FrequencyBarProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    const posStats = statistics
      .filter(s => s.position === position)
      .sort((a, b) => a.digit - b.digit);

    const countField = periods <= 30 ? 'last30Count' : periods <= 50 ? 'last50Count' : 'last100Count';
    const counts = posStats.map(s => s[countField]);

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#ffffff',
        borderColor: '#ebebed',
        textStyle: { color: '#1d1d1f', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = (params as Array<{ name: string; value: number }>)[0];
          return `数字 ${p.name}<br/>出现 <b>${p.value}次</b><br/>频率 ${((p.value / periods) * 100).toFixed(1)}%`;
        },
      },
      grid: { top: 30, right: 20, bottom: 30, left: 40 },
      xAxis: {
        type: 'category',
        data: posStats.map(s => String(s.digit)),
        axisLabel: { fontSize: 12, color: '#6e6e73' },
        axisLine: { lineStyle: { color: '#ebebed' } },
        axisTick: { lineStyle: { color: '#ebebed' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#6e6e73' },
        axisLine: { lineStyle: { color: '#ebebed' } },
        splitLine: { lineStyle: { color: '#f5f5f7' } },
      },
      series: [{
        type: 'bar',
        data: counts.map((c) => ({
          value: c,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#0071e3' },
              { offset: 1, color: '#0077ed' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          color: '#6e6e73',
        },
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [statistics, position, periods]);

  return (
    <div>
      <h4 className="text-sm font-bold mb-2 text-[#1d1d1f]">
        {getPositionLabel(position)}频率分布（近{periods}期）
      </h4>
      <div ref={chartRef} className="w-full h-[250px] lg:h-[300px]" />
    </div>
  );
}
