import { FC3DDraw } from '@/types/fc3d';
import { TrendCellData, TrendStatRow, PredictionResult, PredictionSummary } from '@/types/trend';
import { getDigitAtPosition } from '@/utils/fc3d-calc';

/**
 * Calculate missing values for a position's digits (0-9).
 * Input draws should be newest-first (as in mockDraws).
 * Output: rows[periodIndex][digitColumn] where periodIndex 0 = newest.
 */
export function calculatePositionMissing(
  draws: FC3DDraw[],
  position: 1 | 2 | 3
): TrendCellData[][] {
  // Reverse to oldest-first for calculation
  const reversed = [...draws].reverse();
  const lastSeen: Record<number, number> = {};
  const result: TrendCellData[][] = [];

  for (let i = 0; i < reversed.length; i++) {
    const currentDigit = getDigitAtPosition(reversed[i], position);
    const row: TrendCellData[] = [];

    for (let d = 0; d <= 9; d++) {
      if (d === currentDigit) {
        row.push({ isHit: true, missingCount: 0 });
        lastSeen[d] = i;
      } else {
        const missing = lastSeen[d] !== undefined ? i - lastSeen[d] : i + 1;
        row.push({ isHit: false, missingCount: missing });
      }
    }
    result.push(row);
  }

  // Reverse back to newest-first for display
  return result.reverse();
}

/**
 * Calculate missing values for sum (0-27 columns).
 */
export function calculateSumMissing(draws: FC3DDraw[]): TrendCellData[][] {
  const reversed = [...draws].reverse();
  const lastSeen: Record<number, number> = {};
  const result: TrendCellData[][] = [];

  for (let i = 0; i < reversed.length; i++) {
    const sum = reversed[i].sum;
    const row: TrendCellData[] = [];

    for (let s = 0; s <= 27; s++) {
      if (s === sum) {
        row.push({ isHit: true, missingCount: 0 });
        lastSeen[s] = i;
      } else {
        const missing = lastSeen[s] !== undefined ? i - lastSeen[s] : i + 1;
        row.push({ isHit: false, missingCount: missing });
      }
    }
    result.push(row);
  }

  return result.reverse();
}

/**
 * Calculate missing values for sum tail (0-9 columns).
 */
export function calculateSumTailMissing(draws: FC3DDraw[]): TrendCellData[][] {
  const reversed = [...draws].reverse();
  const lastSeen: Record<number, number> = {};
  const result: TrendCellData[][] = [];

  for (let i = 0; i < reversed.length; i++) {
    const sumTail = reversed[i].sumTail;
    const row: TrendCellData[] = [];

    for (let d = 0; d <= 9; d++) {
      if (d === sumTail) {
        row.push({ isHit: true, missingCount: 0 });
        lastSeen[d] = i;
      } else {
        const missing = lastSeen[d] !== undefined ? i - lastSeen[d] : i + 1;
        row.push({ isHit: false, missingCount: missing });
      }
    }
    result.push(row);
  }

  return result.reverse();
}

/**
 * Calculate missing values for span (0-9 columns).
 */
export function calculateSpanMissing(draws: FC3DDraw[]): TrendCellData[][] {
  const reversed = [...draws].reverse();
  const lastSeen: Record<number, number> = {};
  const result: TrendCellData[][] = [];

  for (let i = 0; i < reversed.length; i++) {
    const span = reversed[i].span;
    const row: TrendCellData[] = [];

    for (let d = 0; d <= 9; d++) {
      if (d === span) {
        row.push({ isHit: true, missingCount: 0 });
        lastSeen[d] = i;
      } else {
        const missing = lastSeen[d] !== undefined ? i - lastSeen[d] : i + 1;
        row.push({ isHit: false, missingCount: missing });
      }
    }
    result.push(row);
  }

  return result.reverse();
}

/**
 * Calculate missing values for pattern-type columns.
 * patterns: array of pattern strings (e.g. ['大大大', '大大小', ...])
 * getPattern: function to extract pattern from a draw
 */
export function calculatePatternMissing(
  draws: FC3DDraw[],
  patterns: string[],
  getPattern: (draw: FC3DDraw) => string
): TrendCellData[][] {
  const reversed = [...draws].reverse();
  const lastSeen: Record<string, number> = {};
  const result: TrendCellData[][] = [];

  for (let i = 0; i < reversed.length; i++) {
    const currentPattern = getPattern(reversed[i]);
    const row: TrendCellData[] = [];

    for (const pattern of patterns) {
      if (pattern === currentPattern) {
        row.push({ isHit: true, missingCount: 0 });
        lastSeen[pattern] = i;
      } else {
        const missing = lastSeen[pattern] !== undefined ? i - lastSeen[pattern] : i + 1;
        row.push({ isHit: false, missingCount: missing });
      }
    }
    result.push(row);
  }

  return result.reverse();
}

/**
 * Calculate 012 road missing values.
 * For each position, tracks road values 0, 1, 2.
 * Returns: rows[periodIndex][roadColumn] where columns = pos1_r0, pos1_r1, pos1_r2, pos2_r0, ...
 */
export function calculate012RoadMissing(draws: FC3DDraw[]): TrendCellData[][] {
  const reversed = [...draws].reverse();
  // 9 columns: 3 positions × 3 roads
  const lastSeen: Record<string, number> = {};
  const result: TrendCellData[][] = [];

  for (let i = 0; i < reversed.length; i++) {
    const draw = reversed[i];
    const roads = draw.road012;
    const row: TrendCellData[] = [];

    for (let pos = 0; pos < 3; pos++) {
      for (let road = 0; road <= 2; road++) {
        const key = `${pos}_${road}`;
        if (roads[pos] === road) {
          row.push({ isHit: true, missingCount: 0 });
          lastSeen[key] = i;
        } else {
          const missing = lastSeen[key] !== undefined ? i - lastSeen[key] : i + 1;
          row.push({ isHit: false, missingCount: missing });
        }
      }
    }
    result.push(row);
  }

  return result.reverse();
}

/**
 * Calculate statistics footer rows from cell data.
 * Returns: [出现次数, 平均遗漏, 最大遗漏, 最大连出]
 */
export function calculateTrendStats(cellData: TrendCellData[][]): TrendStatRow[] {
  if (cellData.length === 0) return [];

  const colCount = cellData[0].length;
  const totalRows = cellData.length;

  const counts = new Array(colCount).fill(0);
  const maxMissing = new Array(colCount).fill(0);
  const maxConsecutive = new Array(colCount).fill(0);
  const currentConsecutive = new Array(colCount).fill(0);

  // Process oldest to newest (reverse for correct missing tracking)
  const reversed = [...cellData].reverse();
  for (let i = 0; i < reversed.length; i++) {
    for (let c = 0; c < colCount; c++) {
      const cell = reversed[i][c];
      if (cell.isHit) {
        counts[c]++;
        currentConsecutive[c]++;
        if (currentConsecutive[c] > maxConsecutive[c]) {
          maxConsecutive[c] = currentConsecutive[c];
        }
      } else {
        currentConsecutive[c] = 0;
        if (cell.missingCount > maxMissing[c]) {
          maxMissing[c] = cell.missingCount;
        }
      }
    }
  }

  const avgMissing = counts.map(c => c > 0 ? Math.round(totalRows / c) : totalRows);

  return [
    { label: '出现次数', values: counts },
    { label: '平均遗漏', values: avgMissing },
    { label: '最大遗漏', values: maxMissing },
    { label: '最大连出', values: maxConsecutive },
  ];
}

/**
 * Generate prediction based on statistical analysis of draws.
 */
export function generatePrediction(draws: FC3DDraw[]): PredictionSummary {
  const recent = draws.slice(0, 50);
  const labels = ['百位', '十位', '个位'] as const;
  const positions: PredictionResult[] = [];

  for (let pos = 1; pos <= 3; pos++) {
    const p = pos as 1 | 2 | 3;
    // Count frequency
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    recent.forEach(draw => {
      freq[getDigitAtPosition(draw, p)]++;
    });

    // Calculate current missing
    const missing: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) {
      const idx = recent.findIndex(draw => getDigitAtPosition(draw, p) === d);
      missing[d] = idx === -1 ? recent.length : idx;
    }

    // Hot: highest frequency in recent
    const sortedByFreq = Object.entries(freq).sort(([, a], [, b]) => b - a);
    const hotDigits = sortedByFreq.slice(0, 3).map(([digit, count]) => ({
      digit: Number(digit),
      count,
      reason: `近50期出现${count}次`,
    }));

    // Cold: longest missing
    const sortedByMissing = Object.entries(missing).sort(([, a], [, b]) => b - a);
    const coldDigits = sortedByMissing.slice(0, 3).map(([digit, m]) => ({
      digit: Number(digit),
      missingPeriods: m,
      reason: `已遗漏${m}期`,
    }));

    // Recommended: top 2 hot + top 1 cold
    const recommended = [
      ...hotDigits.slice(0, 2).map(h => h.digit),
      coldDigits[0].digit,
    ];

    positions.push({
      position: pos,
      positionLabel: labels[pos - 1],
      hotDigits,
      coldDigits,
      recommendedDigits: Array.from(new Set(recommended)),
    });
  }

  // Sum/span analysis
  const sums = recent.map(d => d.sum);
  const spans = recent.map(d => d.span);
  const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
  const avgSpan = spans.reduce((a, b) => a + b, 0) / spans.length;

  // Pattern analysis
  const bsCount: Record<string, number> = {};
  const oeCount: Record<string, number> = {};
  recent.forEach(d => {
    bsCount[d.bigSmallPattern] = (bsCount[d.bigSmallPattern] || 0) + 1;
    oeCount[d.oddEvenPattern] = (oeCount[d.oddEvenPattern] || 0) + 1;
  });
  const topBS = Object.entries(bsCount).sort(([, a], [, b]) => b - a).slice(0, 3).map(([p]) => p);
  const topOE = Object.entries(oeCount).sort(([, a], [, b]) => b - a).slice(0, 3).map(([p]) => p);

  return {
    positions,
    sumRange: { min: Math.min(...sums), max: Math.max(...sums), avg: Math.round(avgSum * 10) / 10 },
    spanRange: { min: Math.min(...spans), max: Math.max(...spans), avg: Math.round(avgSpan * 10) / 10 },
    likelyPatterns: {
      bigSmall: topBS,
      oddEven: topOE,
    },
  };
}
