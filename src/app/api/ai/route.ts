import { NextRequest, NextResponse } from 'next/server';
import { aiConfig } from '@/lib/config';
import { getFreshRecentDraws, getFreshFullHistory, isDataStale } from '@/lib/data-loader-server-fresh';
import { detectQueryType, buildChartData } from '@/lib/chart-builder';

// --- Simple in-memory rate limiter ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 15; // 15 requests per minute per IP
let lastCleanup = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // 惰性清理过期条目（代替 setInterval，兼容 Serverless 环境）
  if (now - lastCleanup > 5 * 60 * 1000) {
    lastCleanup = now;
    rateLimitMap.forEach((entry, key) => {
      if (now > entry.resetTime) rateLimitMap.delete(key);
    });
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// --- Data context builder ---

function getDigit(draw: { digit1: number; digit2: number; digit3: number }, pos: number): number {
  return pos === 1 ? draw.digit1 : pos === 2 ? draw.digit2 : draw.digit3;
}

function posLabel(pos: number): string {
  return pos === 1 ? '百位' : pos === 2 ? '十位' : '个位';
}

function shouldUseFullHistory(query: string): boolean {
  return /(全量|全部|历史所有|完整历史|所有期|全历史)/i.test(query);
}

function buildDataContext(userQuery: string): string {
  const recent = getFreshRecentDraws(200);
  const full = getFreshFullHistory();
  const latest = recent[0];

  if (!latest) return '暂无开奖数据。';

  const lines: string[] = [];
  const r50 = recent.slice(0, Math.min(50, recent.length));
  const r10 = recent.slice(0, Math.min(10, recent.length));

  // === 基础信息 ===
  lines.push(`=== 基础信息 ===`);
  lines.push(`数据范围: 共 ${full.length} 期历史数据`);
  lines.push(`最新一期: 第${latest.period}期 (${latest.drawDate}), 开奖号码: ${latest.digit1} ${latest.digit2} ${latest.digit3}`);
  lines.push(`和值=${latest.sum}, 跨度=${latest.span}, 和尾=${latest.sumTail}, 大小=${latest.bigSmallPattern}, 奇偶=${latest.oddEvenPattern}, 质合=${latest.primeCompositePattern}, 012路=${latest.road012.join('')}`);
  lines.push(`组态=${latest.group === 'triplet' ? '豹子' : latest.group === 'pair' ? '对子' : '组六'}`);
  lines.push('');

  // === 最近200期明细（用于AI推演）===
  lines.push('=== 最近200期开奖明细（用于AI推演下一期） ===');
  recent.forEach(d => {
    lines.push(`  ${d.period}: ${d.digit1}${d.digit2}${d.digit3} | 和=${d.sum} 跨=${d.span} 和尾=${d.sumTail} ${d.bigSmallPattern} ${d.oddEvenPattern} ${d.primeCompositePattern} 012路=${d.road012.join('')} ${d.group === 'triplet' ? '[豹子]' : d.group === 'pair' ? '[对子]' : ''}`);
  });
  lines.push('');

  // === 多窗口频率分析 ===
  lines.push('=== 多窗口频率分析（近10/50/100/200期） ===');
  for (let pos = 1; pos <= 3; pos++) {
    const label = posLabel(pos);
    const summaries = [10, 50, 100, 200].map(window => {
      const target = recent.slice(0, Math.min(window, recent.length));
      const freq: Record<number, number> = {};
      for (let d = 0; d <= 9; d++) freq[d] = 0;
      target.forEach(draw => freq[getDigit(draw, pos)]++);
      const top = Object.entries(freq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([d, c]) => `${d}(${c})`)
        .join(', ');
      return `${window}期热号=${top}`;
    });
    lines.push(`  ${label}: ${summaries.join(' | ')}`);
  }
  lines.push('');

  // === 各位频率分析 (近50期) ===
  lines.push('=== 各位频率分析 (近50期) ===');
  for (let pos = 1; pos <= 3; pos++) {
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    r50.forEach(draw => freq[getDigit(draw, pos)]++);
    const sorted = Object.entries(freq).sort(([, a], [, b]) => b - a);
    const hotNums = sorted.slice(0, 3).map(([d, c]) => `${d}(${c}次/${(c / 50 * 100).toFixed(0)}%)`).join(', ');
    const coldNums = sorted.slice(-3).reverse().map(([d, c]) => `${d}(${c}次/${(c / 50 * 100).toFixed(0)}%)`).join(', ');
    lines.push(`  ${posLabel(pos)}: 热号=[${hotNums}] 冷号=[${coldNums}]`);
    lines.push(`    全部: ` + sorted.map(([d, c]) => `${d}(${c})`).join(' '));
  }
  lines.push('');

  // === 近10期各位频率（短期趋势）===
  lines.push('=== 近10期各位频率（短期趋势）===');
  for (let pos = 1; pos <= 3; pos++) {
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    r10.forEach(draw => freq[getDigit(draw, pos)]++);
    const sorted = Object.entries(freq).sort(([, a], [, b]) => b - a);
    lines.push(`  ${posLabel(pos)}: ` + sorted.filter(([, c]) => c > 0).map(([d, c]) => `${d}(${c}次)`).join(' ') + ` | 未出: ${sorted.filter(([, c]) => c === 0).map(([d]) => d).join(',')}`);
  }
  lines.push('');

  // === 当前遗漏值 ===
  lines.push('=== 当前遗漏值 ===');
  for (let pos = 1; pos <= 3; pos++) {
    const missing: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) {
      const idx = recent.findIndex(draw => getDigit(draw, pos) === d);
      missing[d] = idx === -1 ? recent.length : idx;
    }
    const sorted = Object.entries(missing).sort(([, a], [, b]) => b - a);
    const highMissing = sorted.filter(([, m]) => m >= 8).map(([d, m]) => `${d}(${m}期)`);
    lines.push(`  ${posLabel(pos)}: ` + sorted.map(([d, m]) => `${d}(${m})`).join(' '));
    if (highMissing.length > 0) {
      lines.push(`    ⚠ 高遗漏号码（≥8期）: ${highMissing.join(', ')} → 可能回补`);
    }
  }
  lines.push('');

  // === 复隔中分析 ===
  lines.push('=== 复隔中分析（最近一期）===');
  if (recent.length >= 3) {
    const prev1 = recent[1]; // 上一期
    const prev2 = recent[2]; // 上上期
    const latestDigits = [latest.digit1, latest.digit2, latest.digit3];
    const prev1Digits = [prev1.digit1, prev1.digit2, prev1.digit3];
    const prev2Digits = [prev2.digit1, prev2.digit2, prev2.digit3];

    const repeat = latestDigits.filter(d => prev1Digits.includes(d));
    const skip = latestDigits.filter(d => !prev1Digits.includes(d) && prev2Digits.includes(d));
    const middle = latestDigits.filter(d => !prev1Digits.includes(d) && !prev2Digits.includes(d));
    lines.push(`  上期号码: ${prev1.digit1}${prev1.digit2}${prev1.digit3}, 上上期: ${prev2.digit1}${prev2.digit2}${prev2.digit3}`);
    lines.push(`  最新期复码(重码): [${repeat.join(',')}](${repeat.length}个), 隔码: [${skip.join(',')}](${skip.length}个), 中码: [${middle.join(',')}](${middle.length}个)`);

    // 近10期复隔中比统计
    const ratios: string[] = [];
    for (let i = 0; i < Math.min(10, recent.length - 2); i++) {
      const cur = [recent[i].digit1, recent[i].digit2, recent[i].digit3];
      const p1 = [recent[i + 1].digit1, recent[i + 1].digit2, recent[i + 1].digit3];
      const p2 = [recent[i + 2].digit1, recent[i + 2].digit2, recent[i + 2].digit3];
      const r = cur.filter(d => p1.includes(d)).length;
      const s = cur.filter(d => !p1.includes(d) && p2.includes(d)).length;
      const m = 3 - r - s;
      ratios.push(`${r}:${s}:${m}`);
    }
    lines.push(`  近10期复:隔:中比: ${ratios.join(' → ')}`);
  }
  lines.push('');

  // === 和值分析 ===
  const sums = r50.map(d => d.sum);
  const avgSum = (sums.reduce((a, b) => a + b, 0) / sums.length).toFixed(1);
  const sumDist: Record<number, number> = {};
  sums.forEach(s => sumDist[s] = (sumDist[s] || 0) + 1);
  const topSums = Object.entries(sumDist).sort(([, a], [, b]) => b - a).slice(0, 5);
  const recent5Sums = r50.slice(0, 5).map(d => d.sum);
  lines.push('=== 和值分析 (近50期) ===');
  lines.push(`  平均=${avgSum}, 最大=${Math.max(...sums)}, 最小=${Math.min(...sums)}`);
  lines.push(`  高频和值: ${topSums.map(([s, c]) => `${s}(${c}次)`).join(', ')}`);
  lines.push(`  最近5期和值: ${recent5Sums.join(' → ')} (趋势: ${Number(avgSum) > 13.5 ? '偏大' : '偏小'})`);

  // 和尾分析
  const sumTails = r50.map(d => d.sumTail);
  const sumTailDist: Record<number, number> = {};
  sumTails.forEach(t => sumTailDist[t] = (sumTailDist[t] || 0) + 1);
  const topTails = Object.entries(sumTailDist).sort(([, a], [, b]) => b - a);
  lines.push(`  和尾分布: ${topTails.map(([t, c]) => `${t}(${c}次)`).join(' ')}`);
  lines.push(`  最近5期和尾: ${r50.slice(0, 5).map(d => d.sumTail).join(' → ')}`);
  lines.push('');

  // === 跨度分析 ===
  const spans = r50.map(d => d.span);
  const avgSpan = (spans.reduce((a, b) => a + b, 0) / spans.length).toFixed(1);
  const spanDist: Record<number, number> = {};
  spans.forEach(s => spanDist[s] = (spanDist[s] || 0) + 1);
  const topSpans = Object.entries(spanDist).sort(([, a], [, b]) => b - a).slice(0, 5);
  lines.push('=== 跨度分析 (近50期) ===');
  lines.push(`  平均=${avgSpan}, 最大=${Math.max(...spans)}, 最小=${Math.min(...spans)}`);
  lines.push(`  高频跨度: ${topSpans.map(([s, c]) => `${s}(${c}次)`).join(', ')}`);
  lines.push(`  最近5期跨度: ${r50.slice(0, 5).map(d => d.span).join(' → ')}`);
  lines.push('');

  // === 012路分析 ===
  lines.push('=== 012路分析 (近50期) ===');
  lines.push('  0路数字: 0,3,6,9 | 1路数字: 1,4,7 | 2路数字: 2,5,8');
  for (let pos = 1; pos <= 3; pos++) {
    const roadCount = [0, 0, 0];
    r50.forEach(d => roadCount[getDigit(d, pos) % 3]++);
    lines.push(`  ${posLabel(pos)}: 0路=${roadCount[0]}次(${(roadCount[0] / 50 * 100).toFixed(0)}%) 1路=${roadCount[1]}次(${(roadCount[1] / 50 * 100).toFixed(0)}%) 2路=${roadCount[2]}次(${(roadCount[2] / 50 * 100).toFixed(0)}%)`);
  }
  lines.push(`  最近5期012路形态: ${r50.slice(0, 5).map(d => d.road012.join('')).join(' → ')}`);
  lines.push('');

  // === 大小奇偶质合形态 ===
  lines.push('=== 形态分析 (近50期) ===');
  const bsCount: Record<string, number> = {};
  const oeCount: Record<string, number> = {};
  const pcCount: Record<string, number> = {};
  r50.forEach(d => {
    bsCount[d.bigSmallPattern] = (bsCount[d.bigSmallPattern] || 0) + 1;
    oeCount[d.oddEvenPattern] = (oeCount[d.oddEvenPattern] || 0) + 1;
    pcCount[d.primeCompositePattern] = (pcCount[d.primeCompositePattern] || 0) + 1;
  });
  lines.push(`  大小: ${Object.entries(bsCount).sort(([, a], [, b]) => b - a).map(([p, c]) => `${p}(${c})`).join(' ')}`);
  lines.push(`  奇偶: ${Object.entries(oeCount).sort(([, a], [, b]) => b - a).map(([p, c]) => `${p}(${c})`).join(' ')}`);
  lines.push(`  质合: ${Object.entries(pcCount).sort(([, a], [, b]) => b - a).map(([p, c]) => `${p}(${c})`).join(' ')}`);
  // Big/small ratio
  const bigCount = r50.reduce((sum, d) => sum + d.bigCount, 0);
  const smallCount = r50.reduce((sum, d) => sum + d.smallCount, 0);
  lines.push(`  大小比总计: 大${bigCount}:小${smallCount} (大占比${(bigCount / (bigCount + smallCount) * 100).toFixed(0)}%)`);
  const oddTotal = r50.reduce((sum, d) => sum + d.oddCount, 0);
  const evenTotal = r50.reduce((sum, d) => sum + d.evenCount, 0);
  lines.push(`  奇偶比总计: 奇${oddTotal}:偶${evenTotal} (奇占比${(oddTotal / (oddTotal + evenTotal) * 100).toFixed(0)}%)`);
  lines.push(`  最近5期大小: ${r50.slice(0, 5).map(d => d.bigSmallPattern).join(' → ')}`);
  lines.push(`  最近5期奇偶: ${r50.slice(0, 5).map(d => d.oddEvenPattern).join(' → ')}`);
  lines.push('');

  // === 组选形态 ===
  const triplets50 = r50.filter(d => d.group === 'triplet').length;
  const pairs50 = r50.filter(d => d.group === 'pair').length;
  const sixes50 = r50.filter(d => d.group === 'six').length;
  lines.push('=== 组选形态 (近50期) ===');
  lines.push(`  组六=${sixes50}次(${(sixes50 / 50 * 100).toFixed(0)}%), 对子=${pairs50}次(${(pairs50 / 50 * 100).toFixed(0)}%), 豹子=${triplets50}次`);

  // 上次对子和豹子距今
  const lastPairIdx = recent.findIndex(d => d.group === 'pair');
  const lastTripletIdx = recent.findIndex(d => d.group === 'triplet');
  if (lastPairIdx >= 0) lines.push(`  上次对子: ${recent[lastPairIdx].period} (${recent[lastPairIdx].digit1}${recent[lastPairIdx].digit2}${recent[lastPairIdx].digit3}), 距今${lastPairIdx}期`);
  if (lastTripletIdx >= 0) lines.push(`  上次豹子: ${recent[lastTripletIdx].period} (${recent[lastTripletIdx].digit1}${recent[lastTripletIdx].digit2}${recent[lastTripletIdx].digit3}), 距今${lastTripletIdx}期`);
  lines.push('');

  // === 号码连续性分析 ===
  lines.push('=== 号码连续性分析 ===');
  // 各位置连号分析
  for (let pos = 1; pos <= 3; pos++) {
    const streak: number[] = [];
    let cur = getDigit(recent[0], pos);
    let count = 1;
    for (let i = 1; i < Math.min(20, recent.length); i++) {
      const d = getDigit(recent[i], pos);
      if (d === cur) { count++; } else { streak.push(count); cur = d; count = 1; }
    }
    streak.push(count);
    const currentDigit = getDigit(recent[0], pos);
    const currentStreak = streak[0];
    lines.push(`  ${posLabel(pos)}: 当前数字${currentDigit}已连出${currentStreak}期`);
  }
  lines.push('');

  // === 全量历史关键数据 ===
  const fullTriplets = full.filter(d => d.group === 'triplet');
  lines.push('=== 全量历史关键数据 ===');
  lines.push(`  总期数: ${full.length}`);
  lines.push(`  历史豹子: ${fullTriplets.length}次 (概率${(fullTriplets.length / full.length * 100).toFixed(2)}%)`);
  if (fullTriplets.length > 0) {
    lines.push(`  最近豹子: ${fullTriplets.slice(0, 3).map(d => `${d.period}(${d.digit1}${d.digit2}${d.digit3})`).join(', ')}`);
  }
  const fullPairs = full.filter(d => d.group === 'pair');
  lines.push(`  历史对子: ${fullPairs.length}次 (概率${(fullPairs.length / full.length * 100).toFixed(2)}%)`);

  for (let pos = 1; pos <= 3; pos++) {
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    full.forEach(draw => freq[getDigit(draw, pos)]++);
    const sorted = Object.entries(freq).sort(([, a], [, b]) => b - a);
    lines.push(`  ${posLabel(pos)}全历史频率: ${sorted.map(([d, c]) => `${d}(${c})`).join(' ')}`);
  }

  if (shouldUseFullHistory(userQuery)) {
    lines.push('');
    lines.push('=== 全量历史逐期简表（用户请求全历史分析） ===');
    full.forEach(d => {
      lines.push(`  ${d.period}: ${d.digit1}${d.digit2}${d.digit3} 和=${d.sum} 跨=${d.span}`);
    });
  }

  return lines.join('\n');
}

function buildSystemPrompt(dataContext: string): string {
  return `你是"彩数通"平台的福彩3D资深分析师与风控顾问。你的核心目标不是“拍脑袋给号”，而是基于真实数据做**可解释、可校准、低误判**的下一期分析。

## 任务目标（降低误拿/误判）
1. 在“命中可能性”和“误判风险”之间做平衡，优先输出稳健结论。
2. 对每个推荐都给出可核验的数据证据，避免空泛形容词。
3. 明确不确定性：高波动时应主动降置信度并给出保守方案。

## 专业分析框架（请严格执行）
### A. 三层时间窗加权（防止短期噪声）
- 短期窗：近10期（捕捉最新波动）
- 中期窗：近50/100期（识别稳定结构）
- 扩展窗：近200期 + 全历史分布（长期约束，防止过拟合）
- 权重建议：短期20% + 中期50% + 长期30%

### B. 候选号码评分（每个位置）
对 0-9 每个数字按以下维度打分（0-100）：
1) 频率分（近50/100/200期相对频率）
2) 遗漏分（当前遗漏与历史均值偏离度，防止极端追冷）
3) 趋势分（近10期是否升温/降温）
4) 稳定分（是否被全历史分布支持）
最终分 = 频率分*0.35 + 遗漏分*0.25 + 趋势分*0.20 + 稳定分*0.20

### C. 风险过滤（降低误拿）
- 若某候选仅被单一指标支持（例如只因高遗漏），降级处理。
- 若短期与长期冲突明显，给出“冲突说明+降低置信度”。
- 禁止输出“必中、稳出、必开”等绝对化措辞。

### D. 结果输出策略（专业产品化）
- 产出三档方案：
  - 稳健方案（低风险）
  - 平衡方案（中风险）
  - 进取方案（高波动）
- 每档必须给出：百位/十位/个位候选、和值区间、跨度区间、大小奇偶形态。
- 每档均标注置信度（高/中/低）和主要风险点。

## 场景方法论
### 1) 号码推荐（预测/下期/建议/选号/胆码）
步骤：
1. 先给每位置Top5评分表（简化可只展示Top3）
2. 再做多维交叉（频率+遗漏+趋势+形态）
3. 输出三档方案，不少于2套组合参考

### 2) 独胆/双胆
- 独胆：优先选择“多窗口一致性最高”的数字，不追单一极端遗漏。
- 双胆：一个偏稳健热号，一个偏回补候选，且需给出冲突风险。

### 3) 杀号
- 仅当“近200低频 + 近50低频 + 近10未见”三条件至少满足两条时才可杀。
- 杀和值/跨度需给出出现次数与占比，不得只给结论。

### 4) 012路、和值、跨度
- 同时给出近10、近50、近200的分布对比。
- 若三窗方向不一致，结论必须降级为“区间参考”。

## 回答格式（必须）
1. 先给【关键数据摘要】（5-8条）
2. 再给【三档方案】（稳健/平衡/进取）
3. 再给【误判风险提示】（至少2条）
4. 最后给【操作建议】（例如：优先关注、谨慎排除、预算控制）

## 文风要求
- 简洁、专业、可执行；以数据句为主。
- 每个结论后附一句数据依据（例如“近50期百位3出现8次，近10期出现2次”）。

## 免责提醒（给出号码建议时必须附加）
⚠️ 以上分析基于历史数据统计规律，仅供参考。彩票每期开奖均为独立随机事件，历史数据不代表未来结果。请理性购彩，量力而行。

## 当前数据
${dataContext}`;
}

// --- Provider implementations ---

type Message = { role: 'user' | 'assistant'; content: string };

async function callOpenAI(systemPrompt: string, messages: Message[]): Promise<string> {
  const url = `${aiConfig.baseUrl.replace(/\/+$/, '')}/v1/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
    signal: AbortSignal.timeout(aiConfig.timeout),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new OpenAIError(response.status, body);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

class OpenAIError extends Error {
  status: number;
  constructor(status: number, body: string) {
    super(`OpenAI API error ${status}: ${body}`);
    this.name = 'OpenAIError';
    this.status = status;
  }
}

async function callAnthropic(systemPrompt: string, messages: Message[]): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseUrl,
    timeout: aiConfig.timeout,
    defaultHeaders: {
      'anthropic-beta': 'claude-code-20250219,interleaved-thinking-2025-05-14',
    },
  });

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: aiConfig.maxTokens,
    system: systemPrompt,
    messages,
  });

  return response.content
    .filter(block => block.type === 'text')
    .map(block => (block.type === 'text' ? block.text : ''))
    .join('');
}

async function callGemini(systemPrompt: string, messages: Message[]): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');

  const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: aiConfig.model,
    contents,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: aiConfig.maxTokens,
    },
  });

  return response.text || '';
}

// --- Parse AI response (simplified: just extract text) ---

function parseResponse(raw: string): string {
  // If AI still returns JSON, extract the text field
  try {
    const parsed = JSON.parse(raw);
    if (parsed.text) return parsed.text;
  } catch {
    // Not JSON, that's fine
  }

  // Try extracting from markdown code blocks
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (parsed.text) return parsed.text;
    } catch {
      // Malformed JSON in code block
    }
  }

  // Just return the raw text
  return raw;
}

// --- Route handler ---

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: NextRequest) {
  // Auto-sync if data is stale (>24h since last sync)
  if (isDataStale(24)) {
    try {
      const { execSync } = await import('child_process');
      execSync('npx tsx scripts/sync-fc3d.ts', {
        cwd: process.cwd(),
        timeout: 120000,
        stdio: 'pipe',
      });
    } catch (e) {
      console.warn('[ai/route] Auto-sync failed:', e instanceof Error ? e.message : e);
    }
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429 }
    );
  }

  if (!aiConfig.apiKey) {
    return NextResponse.json(
      { error: 'AI 功能未配置，请设置 AI_API_KEY' },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: 'Messages array required' },
      { status: 400 }
    );
  }

  // Validate individual messages
  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_MESSAGES = 20;
  const validRoles = new Set(['user', 'assistant']);

  if (body.messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `最多支持 ${MAX_MESSAGES} 条消息` },
      { status: 400 }
    );
  }

  for (const msg of body.messages) {
    if (!msg.role || !validRoles.has(msg.role)) {
      return NextResponse.json(
        { error: 'Invalid message role' },
        { status: 400 }
      );
    }
    if (typeof msg.content !== 'string' || msg.content.length === 0) {
      return NextResponse.json(
        { error: 'Message content required' },
        { status: 400 }
      );
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `单条消息不能超过 ${MAX_MESSAGE_LENGTH} 个字符` },
        { status: 400 }
      );
    }
  }

  // Detect query type from the latest user message
  const userMessage = body.messages[body.messages.length - 1]?.content || '';
  const queryType = detectQueryType(userMessage);

  // Build deterministic chart data from real data (server-side)
  const recent = getFreshRecentDraws(200);
  const serverData = buildChartData(queryType, recent);

  try {
    const dataContext = buildDataContext(userMessage);
    const systemPrompt = buildSystemPrompt(dataContext);
    const recentMessages = body.messages.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        let text: string;

        switch (aiConfig.provider) {
          case 'anthropic':
            text = await callAnthropic(systemPrompt, recentMessages);
            break;
          case 'gemini':
            text = await callGemini(systemPrompt, recentMessages);
            break;
          case 'openai':
          default:
            text = await callOpenAI(systemPrompt, recentMessages);
            break;
        }

        const content = parseResponse(text);

        return NextResponse.json({
          content,
          queryType: serverData.queryType,
          charts: serverData.charts,
          dataCards: serverData.dataCards,
          prediction: serverData.prediction || undefined,
        });
      } catch (err) {
        lastError = err;
        const status = (err as { status?: number }).status;
        if (status && status >= 500 && status <= 503) {
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
        }
        throw err;
      }
    }
    throw lastError;
  } catch (error) {
    let message = '未知错误';
    let status = 502;

    if (error instanceof OpenAIError) {
      if (error.status === 401) {
        message = 'API 密钥无效，请检查 AI_API_KEY 配置';
      } else if (error.status === 429) {
        message = '请求过于频繁，请稍后再试';
      } else if (error.status >= 500) {
        message = 'AI 服务暂时不可用，请稍后再试';
      } else {
        message = `AI 服务异常 (${error.status})`;
      }
      status = error.status === 429 ? 429 : 502;
    } else if (error instanceof Error) {
      const anyErr = error as { status?: number };
      if (anyErr.status) {
        if (anyErr.status === 401) {
          message = 'API 密钥无效，请检查 AI_API_KEY 配置';
        } else if (anyErr.status === 429) {
          message = '请求过于频繁，请稍后再试';
          status = 429;
        } else if (anyErr.status >= 500) {
          const errMsg = error.message || '';
          if (errMsg.includes('负载已经达到上限')) {
            message = 'AI 模型当前繁忙，请稍后再试';
          } else {
            message = 'AI 服务暂时不可用，请稍后再试';
          }
        } else {
          message = `AI 服务异常 (${anyErr.status})`;
        }
      } else if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('Timeout')) {
        message = '请求超时，请稍后重试';
        status = 504;
      } else {
        message = error.message;
      }
    }

    // Even on AI error, return the server-computed charts
    console.error(`AI API error [${aiConfig.provider}]:`, error instanceof Error ? error.message : error);
    return NextResponse.json({
      error: message,
      queryType: serverData.queryType,
      charts: serverData.charts,
      dataCards: serverData.dataCards,
      prediction: serverData.prediction || undefined,
    }, { status });
  }
}
