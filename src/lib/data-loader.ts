/**
 * 数据加载层 - FC3D 数据的唯一入口
 *
 * 直接 import JSON 文件（webpack 自动处理，无需 fs 模块）。
 * 通过 fc3d-calc 计算衍生字段，返回完整的 FC3DDraw[] 对象。
 *
 * 此文件可安全在客户端和服务端使用。
 * 如需全量历史数据（服务端），使用 data-loader-server.ts。
 */

import { FC3DDraw } from '@/types/fc3d';
import {
  calcSum,
  calcSpan,
  getGroupType,
  isSequence,
  getBigSmallPattern,
  getOddEvenPattern,
  getPrimeCompositePattern,
  getRoad012Pattern,
} from '@/utils/fc3d-calc';

// Direct JSON import — webpack bundles it, works in both server and client
import latestRaw from '../../data/fc3d-latest.json';

// --- Types ---

interface RawDraw {
  period: string;
  date: string;
  digit1: number;
  digit2: number;
  digit3: number;
}

interface DataFile {
  lastUpdated: string;
  totalCount: number;
  draws: RawDraw[];
}

// --- Transform ---

export function rawToFC3DDraw(raw: RawDraw, index: number): FC3DDraw {
  const { digit1: d1, digit2: d2, digit3: d3 } = raw;
  const digits = [d1, d2, d3];
  const sum = calcSum(d1, d2, d3);
  const group = getGroupType(d1, d2, d3);

  return {
    id: index,
    period: raw.period,
    drawDate: raw.date,
    digit1: d1,
    digit2: d2,
    digit3: d3,
    sum,
    span: calcSpan(d1, d2, d3),
    sumTail: sum % 10,
    oddCount: digits.filter(d => d % 2 === 1).length,
    evenCount: digits.filter(d => d % 2 === 0).length,
    bigCount: digits.filter(d => d >= 5).length,
    smallCount: digits.filter(d => d < 5).length,
    isTriplet: group === 'triplet',
    isPair: group === 'triplet' || group === 'pair',
    isSequence: isSequence(d1, d2, d3),
    group,
    bigSmallPattern: getBigSmallPattern(d1, d2, d3),
    oddEvenPattern: getOddEvenPattern(d1, d2, d3),
    primeCompositePattern: getPrimeCompositePattern(d1, d2, d3),
    road012: getRoad012Pattern(d1, d2, d3),
  };
}

export function transformData(data: DataFile): FC3DDraw[] {
  if (!data.draws || data.draws.length === 0) return [];
  return data.draws.map((raw, i) => rawToFC3DDraw(raw, data.draws.length - i));
}

// --- Data Loading ---

let latestCache: FC3DDraw[] | null = null;

/**
 * Get recent draws (default 200 periods).
 * Data is bundled at build time from fc3d-latest.json.
 */
export function getRecentDraws(count?: number): FC3DDraw[] {
  if (!latestCache) {
    latestCache = transformData(latestRaw as DataFile);
  }

  if (count && count < latestCache.length) {
    return latestCache.slice(0, count);
  }

  return latestCache;
}
