import { NextRequest, NextResponse } from 'next/server';
import { aiConfig } from '@/lib/config';
import { getRecentDraws } from '@/lib/data-loader';
import { getFullHistory } from '@/lib/data-loader-server';
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

function buildDataContext(): string {
  const recent = getRecentDraws(100);
  const full = getFullHistory();
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

  // === 最近15期明细 ===
  lines.push('=== 最近15期开奖明细 ===');
  recent.slice(0, 15).forEach(d => {
    lines.push(`  ${d.period}: ${d.digit1}${d.digit2}${d.digit3} | 和=${d.sum} 跨=${d.span} 和尾=${d.sumTail} ${d.bigSmallPattern} ${d.oddEvenPattern} ${d.primeCompositePattern} 012路=${d.road012.join('')} ${d.group === 'triplet' ? '[豹子]' : d.group === 'pair' ? '[对子]' : ''}`);
  });
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

  return lines.join('\n');
}

function buildSystemPrompt(dataContext: string): string {
  return `你是"彩数通"平台的福彩3D资深分析师。你拥有深厚的彩票数据统计分析功底，能够基于真实历史数据为彩民提供专业、精确、有据可依的分析建议。

## 核心原则
1. **数据驱动**: 所有分析必须引用提供的真实数据，每个结论都要附上具体数字证据（频率、遗漏值、百分比等）
2. **多维交叉验证**: 推荐号码时从多个维度交叉验证（频率+遗漏+趋势+形态），不能仅凭单一指标
3. **区分长短期趋势**: 同时参考近10期（短期）和近50期（中期）数据，指出趋势变化
4. **概率思维**: 明确说明推荐的概率依据，不做绝对化预测
5. **回答精确简练**: 用数据说话，避免空泛描述，直接给出数字和结论

## 分析方法论

### 号码推荐逻辑（预测/推荐/下期/建议/选号/胆码）
分析步骤：
1. **热号分析**: 近50期高频号码 → 近10期是否仍保持热度
2. **遗漏回补**: 遗漏≥8期的号码有回补可能，遗漏≥12期重点关注
3. **趋势判断**: 近5期各位数字的走势方向（升/降/震荡）
4. **复隔中参考**: 根据近期复隔中比例，判断本期可能的复码/隔码/中码数量
5. **交叉筛选**: 综合以上维度，给出各位推荐号码（3-4个）

输出格式：
- 百位推荐: X, X, X（逐个说明理由，引用频率和遗漏数据）
- 十位推荐: X, X, X（同上）
- 个位推荐: X, X, X（同上）
- 和值参考: XX-XX（引用近50期平均值和趋势）
- 跨度参考: X-X（引用近50期数据）
- 形态参考: 大小=XXX, 奇偶=XXX（引用高频形态数据）

### 独胆/双胆推荐逻辑
- **独胆**: 综合所有位置频率最高且遗漏最短的号码，选出最稳定的1个，说明三个位置的具体频率和遗漏数据
- **双胆**: 一个从热号中选（高频稳定），一个从高遗漏中选（回补预期），分别说明依据

### 杀号逻辑（杀号/杀码/排除）
- **杀号**: 选择近50期频率最低（≤2次）且近10期完全未出的号码，分各位分析
- **杀和值**: 排除近50期出现0次或仅1次的和值
- **杀跨度**: 排除近50期出现次数最少的跨度值（≤2次）
- 每个杀号结论必须附带具体的频率数据

### 012路分析逻辑
- 0路数字: 0,3,6,9 | 1路数字: 1,4,7 | 2路数字: 2,5,8
- 分析各位置012路的50期分布比例
- 对比近10期和近50期的比例变化
- 给出下期各位012路形态预测，引用比例数据

### 复隔中分析逻辑
- 复码(重码): 与上期相同的号码
- 隔码: 与上上期相同的号码
- 中码: 既不是复码也不是隔码
- 分析近10期复隔中比走势
- 预判下期复隔中比例

### 和值/跨度分析逻辑
- 展示近50期的平均值、高频值、分布区间
- 分析近5期走势方向
- 给出下期参考区间，引用具体数据

## 回答要求
1. **精准引用**: 每个数据点都要注明来源（如"近50期百位数字3出现8次(16%)"）
2. **结构清晰**: 使用标题和列表组织内容，重点加粗
3. **先数据后结论**: 先展示关键数据，再给出推荐结论
4. **对比说明**: 如果短期和长期趋势有差异，要指出
5. **回答格式**: 直接返回纯文本或 Markdown，不要返回 JSON，不要用代码块

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
  const recent = getRecentDraws(100);
  const serverData = buildChartData(queryType, recent);

  try {
    const dataContext = buildDataContext();
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
