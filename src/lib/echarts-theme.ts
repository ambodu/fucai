// ECharts Apple-style theme constants

export const CHART_COLORS = [
  '#0071e3',  // Apple Blue — primary
  '#10b981',  // Emerald
  '#f59e0b',  // Amber
  '#8b5cf6',  // Violet
  '#ef4444',  // Red
  '#06b6d4',  // Cyan
  '#ec4899',  // Pink
  '#6366f1',  // Indigo
] as const;

export const CHART_THEME = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#6e6e73',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  title: {
    textStyle: { color: '#1d1d1f', fontSize: 14, fontWeight: 600 },
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#ebebed',
    borderRadius: 12,
    textStyle: { color: '#1d1d1f', fontSize: 12 },
    extraCssText: 'box-shadow: 0 4px 24px rgba(0,0,0,0.08);',
  },
  legend: {
    textStyle: { color: '#6e6e73', fontSize: 11 },
  },
  grid: {
    top: 40,
    right: 20,
    bottom: 30,
    left: 45,
  },
  xAxis: {
    axisLine: { lineStyle: { color: '#ebebed' } },
    axisTick: { lineStyle: { color: '#ebebed' } },
    axisLabel: { color: '#6e6e73', fontSize: 11 },
    splitLine: { lineStyle: { color: '#f5f5f7' } },
  },
  yAxis: {
    axisLine: { lineStyle: { color: '#ebebed' } },
    axisTick: { lineStyle: { color: '#ebebed' } },
    axisLabel: { color: '#6e6e73', fontSize: 11 },
    splitLine: { lineStyle: { color: '#f5f5f7' } },
  },
} as const;
