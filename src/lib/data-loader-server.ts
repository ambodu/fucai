/**
 * 服务端数据加载 - 全量历史数据（仅服务端可用）
 *
 * 使用 Node.js fs 读取 fc3d-history.json。
 * 仅在 API Route / Server Component 中使用。
 * 客户端代码不应引用此文件。
 */

import * as fs from 'fs';
import * as path from 'path';
import { FC3DDraw } from '@/types/fc3d';
import { transformData, getRecentDraws } from '@/lib/data-loader';

let fullCache: FC3DDraw[] | null = null;

/**
 * Get full history (all draws from 2004).
 * Server-side only. Falls back to latest data if file unavailable.
 */
export function getFullHistory(): FC3DDraw[] {
  if (!fullCache) {
    try {
      const fullPath = path.resolve(process.cwd(), 'data/fc3d-history.json');
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        fullCache = transformData(JSON.parse(content));
      }
    } catch {
      // fall through
    }

    if (!fullCache) {
      fullCache = getRecentDraws();
    }
  }
  return fullCache;
}

/**
 * Get the last sync timestamp.
 */
export function getLastSyncTime(): string | null {
  try {
    const logPath = path.resolve(process.cwd(), 'data/sync-log.json');
    if (!fs.existsSync(logPath)) return null;
    const content = fs.readFileSync(logPath, 'utf-8');
    const log = JSON.parse(content);
    return log.lastSync || null;
  } catch {
    return null;
  }
}

/**
 * Clear cached data (useful after sync).
 */
export function clearFullCache(): void {
  fullCache = null;
}
