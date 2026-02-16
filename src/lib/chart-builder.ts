/**
 * 图表数据生成器 — 根据查询类型从历史数据确定性生成图表
 * 不依赖 AI 模型，保证图表数据100%正确
 */

import { FC3DDraw } from '@/types/fc3d';
import { ChartData, DataCard, PredictionResult } from '@/types/ai';

// --- Query type detection ---

const QUERY_PATTERNS: Array<{ keywords: string[]; type: string }> = [
  { keywords: ['预测', '推荐', '下期', '建议', '选号', '号码推荐', '参考', '胆码', '独胆', '双胆', '定位', '胆'], type: 'prediction' },
  { keywords: ['杀号', '杀码', '排除'], type: 'prediction' },
  { keywords: ['频率', '频次', '次数', '出现'], type: 'frequency' },
  { keywords: ['遗漏', '冷号', '没出', '未出', '回补'], type: 'missing' },
  { keywords: ['和值', '和数', '杀和值', '杀和尾'], type: 'sum' },
  { keywords: ['跨度', '杀跨度'], type: 'span' },
  { keywords: ['走势', '趋势', '变化'], type: 'trend' },
  { keywords: ['冷热', '热号', '温号'], type: 'hot-cold' },
  { keywords: ['奇偶', '大小', '形态'], type: 'pattern' },
  { keywords: ['012路', '路数', '0路', '1路', '2路'], type: '012road' },
  { keywords: ['豹子', '对子', '组选', '组六', '组三', '复隔中', '复码', '重码', '隔码'], type: 'group' },
];

export function detectQueryType(message: string): string {
  const lower = message.toLowerCase();
  for (const { keywords, type } of QUERY_PATTERNS) {
    if (keywords.some(kw => lower.includes(kw))) return type;
  }
  return 'prediction';
}

// --- Helpers ---

function posLabel(pos: number): string {
  return pos === 1 ? '百位' : pos === 2 ? '十位' : '个位';
}

function getDigit(draw: FC3DDraw, pos: number): number {
  return pos === 1 ? draw.digit1 : pos === 2 ? draw.digit2 : draw.digit3;
}

function calcFreq(draws: FC3DDraw[], pos: number): number[] {
  const freq = new Array(10).fill(0);
  draws.forEach(d => freq[getDigit(d, pos)]++);
  return freq;
}

function calcMissing(draws: FC3DDraw[], pos: number): number[] {
  const missing = new Array(10).fill(draws.length);
  for (let digit = 0; digit <= 9; digit++) {
    const idx = draws.findIndex(d => getDigit(d, pos) === digit);
    if (idx >= 0) missing[digit] = idx;
  }
  return missing;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// --- Prediction builder ---

export function buildPrediction(draws: FC3DDraw[]): PredictionResult {
  const r50 = draws.slice(0, 50);
  const positions: PredictionResult['positions'] = [];

  for (let pos = 1; pos <= 3; pos++) {
    const freq = calcFreq(r50, pos);
    const missing = calcMissing(draws, pos);

    // Hot: top 3 by frequency
    const sortedByFreq = Array.from({ length: 10 }, (_, d) => ({ d, f: freq[d] }))
      .sort((a, b) => b.f - a.f);
    const hot = sortedByFreq.slice(0, 3).map(x => x.d);

    // Cold: digits with missing > 8, sorted by missing desc, top 2
    const sortedByMissing = Array.from({ length: 10 }, (_, d) => ({ d, m: missing[d] }))
      .sort((a, b) => b.m - a.m);
    const cold = sortedByMissing.filter(x => x.m > 8).slice(0, 2).map(x => x.d);

    // Recommended: hot digits + cold digits that might return, pick unique 3-4
    const recommended: number[] = [];
    const used = new Set<number>();
    // Add top 2 hot
    for (const d of hot) {
      if (recommended.length >= 4) break;
      recommended.push(d);
      used.add(d);
    }
    // Add cold that might return
    for (const d of cold) {
      if (recommended.length >= 4) break;
      if (!used.has(d)) {
        recommended.push(d);
        used.add(d);
      }
    }
    // Fill up to 3 if needed
    if (recommended.length < 3) {
      for (const x of sortedByFreq) {
        if (recommended.length >= 3) break;
        if (!used.has(x.d)) {
          recommended.push(x.d);
          used.add(x.d);
        }
      }
    }

    const reasons: Record<number, string> = {};
    for (const d of recommended) {
      const f = freq[d];
      const m = missing[d];
      if (m > 8) {
        reasons[d] = `已遗漏${m}期，可能回补`;
      } else if (f >= sortedByFreq[2].f) {
        reasons[d] = `近50期出现${f}次，频率高`;
      } else {
        reasons[d] = `近50期出现${f}次，遗漏${m}期`;
      }
    }

    positions.push({
      label: posLabel(pos),
      recommended,
      hot,
      cold,
      reasons,
    });
  }

  // Sum & span ranges
  const sums = r50.map(d => d.sum);
  const avgSum = round1(sums.reduce((a, b) => a + b, 0) / sums.length);
  const spans = r50.map(d => d.span);
  const avgSpan = round1(spans.reduce((a, b) => a + b, 0) / spans.length);

  // Common patterns
  const bsCount: Record<string, number> = {};
  const oeCount: Record<string, number> = {};
  r50.forEach(d => {
    bsCount[d.bigSmallPattern] = (bsCount[d.bigSmallPattern] || 0) + 1;
    oeCount[d.oddEvenPattern] = (oeCount[d.oddEvenPattern] || 0) + 1;
  });
  const topBS = Object.entries(bsCount).sort(([, a], [, b]) => b - a).slice(0, 2).map(([p]) => p);
  const topOE = Object.entries(oeCount).sort(([, a], [, b]) => b - a).slice(0, 2).map(([p]) => p);

  return {
    positions,
    sumRange: {
      min: Math.max(0, Math.round(avgSum - 3)),
      max: Math.min(27, Math.round(avgSum + 3)),
      avg: avgSum,
    },
    spanRange: {
      min: Math.max(0, Math.round(avgSpan - 2)),
      max: Math.min(9, Math.round(avgSpan + 2)),
      avg: avgSpan,
    },
    patterns: { bigSmall: topBS, oddEven: topOE },
  };
}

// --- Chart builders per query type ---

function buildPredictionCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[]; prediction: PredictionResult } {
  const r50 = draws.slice(0, 50);
  const prediction = buildPrediction(draws);
  const charts: ChartData[] = [];

  for (let pos = 1; pos <= 3; pos++) {
    const freq = calcFreq(r50, pos);
    charts.push({
      type: 'bar',
      title: `${posLabel(pos)}频率分布（近50期）`,
      xAxis: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      series: [{ name: '出现次数', data: freq }],
    });
  }

  const sums = r50.map(d => d.sum);
  const avgSum = round1(sums.reduce((a, b) => a + b, 0) / sums.length);
  const maxMissing = Math.max(...[1, 2, 3].flatMap(pos => calcMissing(draws, pos)));
  const maxMissingDigits = [1, 2, 3].flatMap(pos => {
    const m = calcMissing(draws, pos);
    return Array.from({ length: 10 }, (_, d) => ({ d, m: m[d], pos }));
  }).sort((a, b) => b.m - a.m);

  const dataCards: DataCard[] = [
    { label: '平均和值', value: String(avgSum), trend: avgSum > 13.5 ? 'up' : 'down', sub: '近50期' },
    { label: '平均跨度', value: String(prediction.spanRange.avg), trend: 'neutral', sub: '近50期' },
    { label: '最大遗漏', value: `${maxMissing}期`, trend: 'down', sub: `${posLabel(maxMissingDigits[0].pos)}数字${maxMissingDigits[0].d}` },
    { label: '热门形态', value: prediction.patterns.bigSmall[0] || '-', trend: 'neutral', sub: '大小形态' },
  ];

  return { charts, dataCards, prediction };
}

function buildFrequencyCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r50 = draws.slice(0, 50);
  const charts: ChartData[] = [];
  const dataCards: DataCard[] = [];

  for (let pos = 1; pos <= 3; pos++) {
    const freq = calcFreq(r50, pos);
    charts.push({
      type: 'bar',
      title: `${posLabel(pos)}频率分布（近50期）`,
      xAxis: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      series: [{ name: '出现次数', data: freq }],
    });
    const maxIdx = freq.indexOf(Math.max(...freq));
    dataCards.push({
      label: `${posLabel(pos)}最热`,
      value: String(maxIdx),
      trend: 'up',
      sub: `出现${freq[maxIdx]}次`,
    });
  }

  return { charts, dataCards };
}

function buildMissingCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const charts: ChartData[] = [];
  const allMissing: Array<{ d: number; m: number; pos: number }> = [];

  for (let pos = 1; pos <= 3; pos++) {
    const missing = calcMissing(draws, pos);
    charts.push({
      type: 'bar',
      title: `${posLabel(pos)}当前遗漏值`,
      xAxis: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      series: [{ name: '遗漏期数', data: missing }],
    });
    missing.forEach((m, d) => allMissing.push({ d, m, pos }));
  }

  allMissing.sort((a, b) => b.m - a.m);
  const dataCards: DataCard[] = allMissing.slice(0, 3).map(x => ({
    label: `${posLabel(x.pos)}数字${x.d}`,
    value: `${x.m}期`,
    trend: 'down' as const,
    sub: '遗漏最长',
  }));

  return { charts, dataCards };
}

function buildSumCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r50 = draws.slice(0, 50);
  const r30 = draws.slice(0, 30);
  const sums = r50.map(d => d.sum);
  const avg = round1(sums.reduce((a, b) => a + b, 0) / sums.length);

  // Sum trend line
  const trendData = r30.map(d => d.sum).reverse();
  const trendPeriods = r30.map(d => d.period.slice(-3)).reverse();

  // Sum distribution
  const dist = new Array(28).fill(0);
  sums.forEach(s => dist[s]++);

  const charts: ChartData[] = [
    {
      type: 'line',
      title: '和值走势（近30期）',
      xAxis: trendPeriods,
      series: [{ name: '和值', data: trendData }],
    },
    {
      type: 'bar',
      title: '和值分布（近50期）',
      xAxis: Array.from({ length: 28 }, (_, i) => String(i)),
      series: [{ name: '出现次数', data: dist }],
    },
  ];

  const maxSum = Math.max(...sums);
  const minSum = Math.min(...sums);
  const modeSum = dist.indexOf(Math.max(...dist));

  const dataCards: DataCard[] = [
    { label: '平均和值', value: String(avg), trend: avg > 13.5 ? 'up' : 'down', sub: '近50期' },
    { label: '最大和值', value: String(maxSum), trend: 'up', sub: '近50期' },
    { label: '最小和值', value: String(minSum), trend: 'down', sub: '近50期' },
    { label: '众数和值', value: String(modeSum), trend: 'neutral', sub: `出现${dist[modeSum]}次` },
  ];

  return { charts, dataCards };
}

function buildSpanCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r50 = draws.slice(0, 50);
  const r30 = draws.slice(0, 30);
  const spans = r50.map(d => d.span);
  const avg = round1(spans.reduce((a, b) => a + b, 0) / spans.length);

  const trendData = r30.map(d => d.span).reverse();
  const trendPeriods = r30.map(d => d.period.slice(-3)).reverse();

  const dist = new Array(10).fill(0);
  spans.forEach(s => dist[s]++);

  const charts: ChartData[] = [
    {
      type: 'line',
      title: '跨度走势（近30期）',
      xAxis: trendPeriods,
      series: [{ name: '跨度', data: trendData }],
    },
    {
      type: 'bar',
      title: '跨度分布（近50期）',
      xAxis: Array.from({ length: 10 }, (_, i) => String(i)),
      series: [{ name: '出现次数', data: dist }],
    },
  ];

  const dataCards: DataCard[] = [
    { label: '平均跨度', value: String(avg), trend: 'neutral', sub: '近50期' },
    { label: '最大跨度', value: String(Math.max(...spans)), trend: 'up', sub: '近50期' },
    { label: '最小跨度', value: String(Math.min(...spans)), trend: 'down', sub: '近50期' },
  ];

  return { charts, dataCards };
}

function buildTrendCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r30 = draws.slice(0, 30);
  const periods = r30.map(d => d.period.slice(-3)).reverse();
  const charts: ChartData[] = [];

  for (let pos = 1; pos <= 3; pos++) {
    charts.push({
      type: 'line',
      title: `${posLabel(pos)}走势（近30期）`,
      xAxis: periods,
      series: [{ name: posLabel(pos), data: r30.map(d => getDigit(d, pos)).reverse() }],
    });
  }

  return { charts, dataCards: [] };
}

function buildHotColdCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r50 = draws.slice(0, 50);
  const charts: ChartData[] = [];

  for (let pos = 1; pos <= 3; pos++) {
    const freq = calcFreq(r50, pos);
    charts.push({
      type: 'bar',
      title: `${posLabel(pos)}冷热分布（近50期）`,
      xAxis: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      series: [{ name: '出现次数', data: freq }],
    });
  }

  // Find overall hottest and coldest
  const allFreq = [1, 2, 3].flatMap(pos => {
    const freq = calcFreq(r50, pos);
    return freq.map((f, d) => ({ d, f, pos }));
  });
  allFreq.sort((a, b) => b.f - a.f);
  const hottest = allFreq[0];
  const coldest = allFreq[allFreq.length - 1];

  const allMissing = [1, 2, 3].flatMap(pos => {
    const m = calcMissing(draws, pos);
    return m.map((v, d) => ({ d, m: v, pos }));
  }).sort((a, b) => b.m - a.m);

  const dataCards: DataCard[] = [
    { label: '最热号码', value: `${posLabel(hottest.pos)}-${hottest.d}`, trend: 'up', sub: `出现${hottest.f}次` },
    { label: '最冷号码', value: `${posLabel(coldest.pos)}-${coldest.d}`, trend: 'down', sub: `仅${coldest.f}次` },
    { label: '最长遗漏', value: `${allMissing[0].m}期`, trend: 'down', sub: `${posLabel(allMissing[0].pos)}数字${allMissing[0].d}` },
  ];

  return { charts, dataCards };
}

function buildPatternCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r50 = draws.slice(0, 50);

  const bsCount: Record<string, number> = {};
  const oeCount: Record<string, number> = {};
  r50.forEach(d => {
    bsCount[d.bigSmallPattern] = (bsCount[d.bigSmallPattern] || 0) + 1;
    oeCount[d.oddEvenPattern] = (oeCount[d.oddEvenPattern] || 0) + 1;
  });

  const bsEntries = Object.entries(bsCount).sort(([, a], [, b]) => b - a);
  const oeEntries = Object.entries(oeCount).sort(([, a], [, b]) => b - a);

  const charts: ChartData[] = [
    {
      type: 'pie',
      title: '大小形态分布（近50期）',
      xAxis: bsEntries.map(([p]) => p),
      series: [{ name: '出现次数', data: bsEntries.map(([, c]) => c) }],
    },
    {
      type: 'pie',
      title: '奇偶形态分布（近50期）',
      xAxis: oeEntries.map(([p]) => p),
      series: [{ name: '出现次数', data: oeEntries.map(([, c]) => c) }],
    },
  ];

  const dataCards: DataCard[] = [
    { label: '最常见大小', value: bsEntries[0]?.[0] || '-', trend: 'neutral', sub: `${bsEntries[0]?.[1] || 0}次` },
    { label: '最常见奇偶', value: oeEntries[0]?.[0] || '-', trend: 'neutral', sub: `${oeEntries[0]?.[1] || 0}次` },
  ];

  return { charts, dataCards };
}

function buildGroupCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r50 = draws.slice(0, 50);

  const triplets = r50.filter(d => d.group === 'triplet').length;
  const pairs = r50.filter(d => d.group === 'pair').length;
  const sixes = r50.filter(d => d.group === 'six').length;

  const charts: ChartData[] = [
    {
      type: 'pie',
      title: '组选形态分布（近50期）',
      xAxis: ['组六', '对子', '豹子'],
      series: [{ name: '出现次数', data: [sixes, pairs, triplets] }],
    },
  ];

  // Find last triplet in full history
  const lastTriplet = draws.find(d => d.group === 'triplet');

  const dataCards: DataCard[] = [
    { label: '组六', value: `${sixes}次`, trend: 'neutral', sub: `占${Math.round(sixes / 50 * 100)}%` },
    { label: '对子', value: `${pairs}次`, trend: 'neutral', sub: `占${Math.round(pairs / 50 * 100)}%` },
    { label: '豹子', value: `${triplets}次`, trend: 'neutral', sub: `近50期` },
    { label: '上次豹子', value: lastTriplet ? lastTriplet.period : '无', trend: 'neutral', sub: lastTriplet ? `${lastTriplet.digit1}${lastTriplet.digit2}${lastTriplet.digit3}` : '' },
  ];

  return { charts, dataCards };
}

function build012RoadCharts(draws: FC3DDraw[]): { charts: ChartData[]; dataCards: DataCard[] } {
  const r50 = draws.slice(0, 50);
  const r20 = draws.slice(0, 20);
  const charts: ChartData[] = [];

  // 012 road distribution per position (bar chart)
  for (let pos = 1; pos <= 3; pos++) {
    const roadCount = [0, 0, 0]; // 0路, 1路, 2路
    r50.forEach(d => {
      const digit = getDigit(d, pos);
      roadCount[digit % 3]++;
    });
    charts.push({
      type: 'bar',
      title: `${posLabel(pos)} 012路分布（近50期）`,
      xAxis: ['0路(0369)', '1路(147)', '2路(258)'],
      series: [{ name: '出现次数', data: roadCount }],
    });
  }

  // 012 road trend line (recent 20 periods)
  const periods = r20.map(d => d.period.slice(-3)).reverse();
  for (let pos = 1; pos <= 3; pos++) {
    charts.push({
      type: 'line',
      title: `${posLabel(pos)} 012路走势（近20期）`,
      xAxis: periods,
      series: [{ name: '路数', data: r20.map(d => getDigit(d, pos) % 3).reverse() }],
    });
  }

  // Data cards: most common road per position
  const dataCards: DataCard[] = [];
  for (let pos = 1; pos <= 3; pos++) {
    const roadCount = [0, 0, 0];
    r50.forEach(d => {
      const digit = getDigit(d, pos);
      roadCount[digit % 3]++;
    });
    const maxRoad = roadCount.indexOf(Math.max(...roadCount));
    dataCards.push({
      label: `${posLabel(pos)}主路`,
      value: `${maxRoad}路`,
      trend: 'neutral',
      sub: `出现${roadCount[maxRoad]}次`,
    });
  }

  return { charts, dataCards };
}

// --- Main entry ---

export function buildChartData(
  queryType: string,
  draws: FC3DDraw[]
): { queryType: string; charts: ChartData[]; dataCards: DataCard[]; prediction?: PredictionResult } {
  switch (queryType) {
    case 'prediction': {
      const result = buildPredictionCharts(draws);
      return { queryType, ...result };
    }
    case 'frequency': {
      const result = buildFrequencyCharts(draws);
      return { queryType, ...result };
    }
    case 'missing': {
      const result = buildMissingCharts(draws);
      return { queryType, ...result };
    }
    case 'sum': {
      const result = buildSumCharts(draws);
      return { queryType, ...result };
    }
    case 'span': {
      const result = buildSpanCharts(draws);
      return { queryType, ...result };
    }
    case 'trend': {
      const result = buildTrendCharts(draws);
      return { queryType, ...result };
    }
    case 'hot-cold': {
      const result = buildHotColdCharts(draws);
      return { queryType, ...result };
    }
    case 'pattern': {
      const result = buildPatternCharts(draws);
      return { queryType, ...result };
    }
    case 'group': {
      const result = buildGroupCharts(draws);
      return { queryType, ...result };
    }
    case '012road': {
      const result = build012RoadCharts(draws);
      return { queryType, ...result };
    }
    default: {
      const result = buildPredictionCharts(draws);
      return { queryType: 'prediction', ...result };
    }
  }
}
