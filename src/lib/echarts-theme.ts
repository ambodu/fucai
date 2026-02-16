// ECharts Apple-inspired theme constants

export const CHART_COLORS = [
  '#007AFF',  // Apple Blue — primary
  '#FF3B30',  // Apple Red
  '#34C759',  // Apple Green
  '#FF9500',  // Apple Orange
  '#AF52DE',  // Apple Purple
  '#5AC8FA',  // Apple Teal
  '#FF2D55',  // Apple Pink
  '#5856D6',  // Apple Indigo
] as const;

export const CHART_THEME = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#8e8e93',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  title: {
    textStyle: { color: '#1d1d1f', fontSize: 15, fontWeight: 600 },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 12,
    textStyle: { color: '#1d1d1f', fontSize: 13 },
    extraCssText: 'box-shadow: 0 8px 30px rgba(0,0,0,0.12); backdrop-filter: blur(20px);',
  },
  legend: {
    textStyle: { color: '#8e8e93', fontSize: 12 },
  },
  grid: {
    top: 48,
    right: 24,
    bottom: 36,
    left: 48,
  },
  xAxis: {
    axisLine: { lineStyle: { color: '#e5e5ea' } },
    axisTick: { show: false },
    axisLabel: { color: '#8e8e93', fontSize: 12 },
    splitLine: { lineStyle: { color: '#f2f2f7' } },
  },
  yAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#8e8e93', fontSize: 12 },
    splitLine: { lineStyle: { color: '#f2f2f7', type: 'dashed' } },
  },
} as const;
