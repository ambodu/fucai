/**
 * 服务端"每次读文件"数据加载 — 用于 AI API 路由
 *
 * 与 data-loader.ts（webpack 打包）和 data-loader-server.ts（内存缓存）不同，
 * 此模块每次调用都从文件系统读取最新 JSON，确保 sync 之后 AI 立即使用新数据。
 *
 * 仅在 API Route / Server Component 中使用。
 */

import * as fs from 'fs';
import * as path from 'path';
import { FC3DDraw } from '@/types/fc3d';
import { rawToFC3DDraw } from '@/lib/data-loader';

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

function readAndTransform(filePath: string): FC3DDraw[] {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) return [];
  const content = fs.readFileSync(abs, 'utf-8');
  const data: DataFile = JSON.parse(content);
  if (!data.draws || data.draws.length === 0) return [];
  return data.draws.map((raw, i) => rawToFC3DDraw(raw, data.draws.length - i));
}

/**
 * 每次从文件系统读取 fc3d-latest.json，返回最新数据。
 */
export function getFreshRecentDraws(count?: number): FC3DDraw[] {
  const draws = readAndTransform('data/fc3d-latest.json');
  if (count && count < draws.length) return draws.slice(0, count);
  return draws;
}

/**
 * 每次从文件系统读取 fc3d-history.json，返回全量数据。
 * 如果文件不存在，回退到 latest。
 */
export function getFreshFullHistory(): FC3DDraw[] {
  const full = readAndTransform('data/fc3d-history.json');
  if (full.length > 0) return full;
  return getFreshRecentDraws();
}

/**
 * 检查数据是否过期。
 * @param maxAgeHours 最大允许的小时数（默认 24）
 */
export function isDataStale(maxAgeHours = 24): boolean {
  try {
    const logPath = path.resolve(process.cwd(), 'data/sync-log.json');
    if (!fs.existsSync(logPath)) return true;
    const content = fs.readFileSync(logPath, 'utf-8');
    const log = JSON.parse(content);
    if (!log.lastSync) return true;
    const lastSync = new Date(log.lastSync).getTime();
    return Date.now() - lastSync > maxAgeHours * 60 * 60 * 1000;
  } catch {
    return true;
  }
}
