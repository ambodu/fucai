/**
 * FC3D 数据入口
 *
 * 从 data-loader 加载真实开奖数据（通过 JSON import，build 时嵌入 bundle）。
 * 导出名保持 `mockDraws` 以兼容所有现有页面引用。
 */

import { getRecentDraws } from '@/lib/data-loader';

/**
 * 开奖数据（最新在前，200 期）
 */
export const mockDraws = getRecentDraws();
