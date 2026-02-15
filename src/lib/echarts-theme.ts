// ECharts dark theme constants for Kraken-style dark UI

export const CHART_COLORS = [
  '#7434f3',  // purple - primary
  '#00d4aa',  // neon green
  '#e67e22',  // orange
  '#3498db',  // blue
  '#e74c3c',  // red
  '#9b59b6',  // light purple
  '#00d4ff',  // cyan
  '#f1c40f',  // yellow
] as const;

export const CHART_THEME = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#9ca3af',
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  title: {
    textStyle: { color: '#f1f5f9', fontSize: 14, fontWeight: 600 },
  },
  tooltip: {
    backgroundColor: '#1a1d23',
    borderColor: 'rgba(255,255,255,0.1)',
    textStyle: { color: '#f1f5f9', fontSize: 12 },
  },
  legend: {
    textStyle: { color: '#9ca3af', fontSize: 11 },
  },
  grid: {
    top: 40,
    right: 20,
    bottom: 30,
    left: 45,
  },
  xAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
  },
  yAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
  },
} as const;
