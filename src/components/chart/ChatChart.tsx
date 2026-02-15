'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ChartData } from '@/types/ai';
import { CHART_COLORS, CHART_THEME } from '@/lib/echarts-theme';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
  CanvasRenderer,
]);

interface ChatChartProps {
  chart: ChartData;
}

function buildOption(chart: ChartData): echarts.EChartsCoreOption {
  const { type, xAxis, series } = chart;

  const baseTooltip = {
    ...CHART_THEME.tooltip,
    trigger: type === 'pie' ? 'item' : 'axis',
  };

  if (type === 'pie') {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...CHART_THEME.tooltip,
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        ...CHART_THEME.legend,
        bottom: 0,
        type: 'scroll',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#13161b',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: '#9ca3af',
            fontSize: 11,
          },
          data: xAxis
            ? xAxis.map((name, i) => ({
                name,
                value: series[0]?.data[i] ?? 0,
                itemStyle: {
                  color: series[0]?.color || CHART_COLORS[i % CHART_COLORS.length],
                },
              }))
            : series[0]?.data.map((value, i) => ({
                name: `${i}`,
                value,
                itemStyle: {
                  color: CHART_COLORS[i % CHART_COLORS.length],
                },
              })) || [],
        },
      ],
    };
  }

  if (type === 'radar') {
    const maxVal = Math.max(...series.flatMap(s => s.data));
    return {
      backgroundColor: 'transparent',
      tooltip: { ...CHART_THEME.tooltip, trigger: 'item' },
      legend: {
        ...CHART_THEME.legend,
        bottom: 0,
        data: series.map(s => s.name),
      },
      radar: {
        indicator: (xAxis || []).map(name => ({ name, max: Math.ceil(maxVal * 1.2) })),
        shape: 'polygon',
        axisName: { color: '#9ca3af', fontSize: 11 },
        splitArea: { areaStyle: { color: ['rgba(116,52,243,0.02)', 'rgba(116,52,243,0.05)'] } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [
        {
          type: 'radar',
          data: series.map((s, i) => ({
            name: s.name,
            value: s.data,
            lineStyle: { color: s.color || CHART_COLORS[i % CHART_COLORS.length], width: 2 },
            itemStyle: { color: s.color || CHART_COLORS[i % CHART_COLORS.length] },
            areaStyle: { color: `${s.color || CHART_COLORS[i % CHART_COLORS.length]}20` },
          })),
        },
      ],
    };
  }

  // Bar or Line chart
  return {
    backgroundColor: 'transparent',
    tooltip: baseTooltip,
    legend:
      series.length > 1
        ? { ...CHART_THEME.legend, bottom: 0, data: series.map(s => s.name) }
        : undefined,
    grid: { ...CHART_THEME.grid, bottom: series.length > 1 ? 45 : 30 },
    xAxis: {
      type: 'category',
      data: xAxis || [],
      ...CHART_THEME.xAxis,
    },
    yAxis: {
      type: 'value',
      ...CHART_THEME.yAxis,
    },
    series: series.map((s, i) => {
      const color = s.color || CHART_COLORS[i % CHART_COLORS.length];
      if (type === 'line') {
        return {
          name: s.name,
          type: 'line',
          data: s.data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color, width: 2 },
          itemStyle: { color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}25` },
              { offset: 1, color: `${color}02` },
            ]),
          },
        };
      }
      // Bar
      return {
        name: s.name,
        type: 'bar',
        data: s.data,
        barMaxWidth: 28,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color },
            { offset: 1, color: `${color}80` },
          ]),
          borderRadius: [3, 3, 0, 0],
        },
      };
    }),
  };
}

export default function ChatChart({ chart }: ChatChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const instance = echarts.init(chartRef.current);
    instance.setOption(buildOption(chart));

    const handleResize = () => instance.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      instance.dispose();
    };
  }, [chart]);

  return (
    <div className="mt-3">
      {chart.title && (
        <h5 className="text-xs font-semibold text-gray-300 mb-1.5">{chart.title}</h5>
      )}
      <div
        ref={chartRef}
        className="w-full h-[260px] bg-[#0b0e11]/50 rounded-xl"
      />
    </div>
  );
}
