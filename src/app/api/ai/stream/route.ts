import { NextRequest } from 'next/server';
import { aiConfig } from '@/lib/config';
import { getFreshRecentDraws, getFreshFullHistory, isDataStale } from '@/lib/data-loader-server-fresh';
import { detectQueryType, buildChartData } from '@/lib/chart-builder';

// --- Reuse rate limiter from parent route ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 15;
let lastCleanup = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
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

// --- Data context (same as route.ts) ---

function getDigit(draw: { digit1: number; digit2: number; digit3: number }, pos: number): number {
  return pos === 1 ? draw.digit1 : pos === 2 ? draw.digit2 : draw.digit3;
}

function posLabel(pos: number): string {
  return pos === 1 ? '百位' : pos === 2 ? '十位' : '个位';
}

function buildDataContext(): string {
  const recent = getFreshRecentDraws(100);
  const full = getFreshFullHistory();
  const latest = recent[0];

  if (!latest) return '暂无开奖数据。';

  const lines: string[] = [];
  const r50 = recent.slice(0, Math.min(50, recent.length));
  const r10 = recent.slice(0, Math.min(10, recent.length));

  lines.push(`=== 基础信息 ===`);
  lines.push(`数据范围: 共 ${full.length} 期历史数据`);
  lines.push(`最新一期: 第${latest.period}期 (${latest.drawDate}), 开奖号码: ${latest.digit1} ${latest.digit2} ${latest.digit3}`);
  lines.push(`和值=${latest.sum}, 跨度=${latest.span}, 和尾=${latest.sumTail}, 大小=${latest.bigSmallPattern}, 奇偶=${latest.oddEvenPattern}, 质合=${latest.primeCompositePattern}, 012路=${latest.road012.join('')}`);
  lines.push(`组态=${latest.group === 'triplet' ? '豹子' : latest.group === 'pair' ? '对子' : '组六'}`);
  lines.push('');

  lines.push('=== 最近15期开奖明细 ===');
  recent.slice(0, 15).forEach(d => {
    lines.push(`  ${d.period}: ${d.digit1}${d.digit2}${d.digit3} | 和=${d.sum} 跨=${d.span} 和尾=${d.sumTail} ${d.bigSmallPattern} ${d.oddEvenPattern} ${d.primeCompositePattern} 012路=${d.road012.join('')} ${d.group === 'triplet' ? '[豹子]' : d.group === 'pair' ? '[对子]' : ''}`);
  });
  lines.push('');

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

  lines.push('=== 近10期各位频率（短期趋势）===');
  for (let pos = 1; pos <= 3; pos++) {
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    r10.forEach(draw => freq[getDigit(draw, pos)]++);
    const sorted = Object.entries(freq).sort(([, a], [, b]) => b - a);
    lines.push(`  ${posLabel(pos)}: ` + sorted.filter(([, c]) => c > 0).map(([d, c]) => `${d}(${c}次)`).join(' ') + ` | 未出: ${sorted.filter(([, c]) => c === 0).map(([d]) => d).join(',')}`);
  }
  lines.push('');

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

  lines.push('=== 复隔中分析（最近一期）===');
  if (recent.length >= 3) {
    const prev1 = recent[1];
    const prev2 = recent[2];
    const latestDigits = [latest.digit1, latest.digit2, latest.digit3];
    const prev1Digits = [prev1.digit1, prev1.digit2, prev1.digit3];
    const prev2Digits = [prev2.digit1, prev2.digit2, prev2.digit3];
    const repeat = latestDigits.filter(d => prev1Digits.includes(d));
    const skip = latestDigits.filter(d => !prev1Digits.includes(d) && prev2Digits.includes(d));
    const middle = latestDigits.filter(d => !prev1Digits.includes(d) && !prev2Digits.includes(d));
    lines.push(`  上期号码: ${prev1.digit1}${prev1.digit2}${prev1.digit3}, 上上期: ${prev2.digit1}${prev2.digit2}${prev2.digit3}`);
    lines.push(`  最新期复码(重码): [${repeat.join(',')}](${repeat.length}个), 隔码: [${skip.join(',')}](${skip.length}个), 中码: [${middle.join(',')}](${middle.length}个)`);
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
  const sumTails = r50.map(d => d.sumTail);
  const sumTailDist: Record<number, number> = {};
  sumTails.forEach(t => sumTailDist[t] = (sumTailDist[t] || 0) + 1);
  const topTails = Object.entries(sumTailDist).sort(([, a], [, b]) => b - a);
  lines.push(`  和尾分布: ${topTails.map(([t, c]) => `${t}(${c}次)`).join(' ')}`);
  lines.push(`  最近5期和尾: ${r50.slice(0, 5).map(d => d.sumTail).join(' → ')}`);
  lines.push('');

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

  lines.push('=== 012路分析 (近50期) ===');
  lines.push('  0路数字: 0,3,6,9 | 1路数字: 1,4,7 | 2路数字: 2,5,8');
  for (let pos = 1; pos <= 3; pos++) {
    const roadCount = [0, 0, 0];
    r50.forEach(d => roadCount[getDigit(d, pos) % 3]++);
    lines.push(`  ${posLabel(pos)}: 0路=${roadCount[0]}次(${(roadCount[0] / 50 * 100).toFixed(0)}%) 1路=${roadCount[1]}次(${(roadCount[1] / 50 * 100).toFixed(0)}%) 2路=${roadCount[2]}次(${(roadCount[2] / 50 * 100).toFixed(0)}%)`);
  }
  lines.push(`  最近5期012路形态: ${r50.slice(0, 5).map(d => d.road012.join('')).join(' → ')}`);
  lines.push('');

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
  const bigCount = r50.reduce((sum, d) => sum + d.bigCount, 0);
  const smallCount = r50.reduce((sum, d) => sum + d.smallCount, 0);
  lines.push(`  大小比总计: 大${bigCount}:小${smallCount} (大占比${(bigCount / (bigCount + smallCount) * 100).toFixed(0)}%)`);
  const oddTotal = r50.reduce((sum, d) => sum + d.oddCount, 0);
  const evenTotal = r50.reduce((sum, d) => sum + d.evenCount, 0);
  lines.push(`  奇偶比总计: 奇${oddTotal}:偶${evenTotal} (奇占比${(oddTotal / (oddTotal + evenTotal) * 100).toFixed(0)}%)`);
  lines.push(`  最近5期大小: ${r50.slice(0, 5).map(d => d.bigSmallPattern).join(' → ')}`);
  lines.push(`  最近5期奇偶: ${r50.slice(0, 5).map(d => d.oddEvenPattern).join(' → ')}`);
  lines.push('');

  const triplets50 = r50.filter(d => d.group === 'triplet').length;
  const pairs50 = r50.filter(d => d.group === 'pair').length;
  const sixes50 = r50.filter(d => d.group === 'six').length;
  lines.push('=== 组选形态 (近50期) ===');
  lines.push(`  组六=${sixes50}次(${(sixes50 / 50 * 100).toFixed(0)}%), 对子=${pairs50}次(${(pairs50 / 50 * 100).toFixed(0)}%), 豹子=${triplets50}次`);
  const lastPairIdx = recent.findIndex(d => d.group === 'pair');
  const lastTripletIdx = recent.findIndex(d => d.group === 'triplet');
  if (lastPairIdx >= 0) lines.push(`  上次对子: ${recent[lastPairIdx].period} (${recent[lastPairIdx].digit1}${recent[lastPairIdx].digit2}${recent[lastPairIdx].digit3}), 距今${lastPairIdx}期`);
  if (lastTripletIdx >= 0) lines.push(`  上次豹子: ${recent[lastTripletIdx].period} (${recent[lastTripletIdx].digit1}${recent[lastTripletIdx].digit2}${recent[lastTripletIdx].digit3}), 距今${lastTripletIdx}期`);
  lines.push('');

  lines.push('=== 号码连续性分析 ===');
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

## 回答要求
1. **精准引用**: 每个数据点都要注明来源
2. **结构清晰**: 使用标题和列表组织内容，重点加粗
3. **先数据后结论**: 先展示关键数据，再给出推荐结论
4. **回答格式**: 直接返回纯文本或 Markdown，不要返回 JSON，不要用代码块

## 免责提醒（给出号码建议时必须附加）
⚠️ 以上分析基于历史数据统计规律，仅供参考。彩票每期开奖均为独立随机事件，历史数据不代表未来结果。请理性购彩，量力而行。

## 当前数据
${dataContext}`;
}

// --- Validation ---

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 20;
const validRoles = new Set(['user', 'assistant']);

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function validateRequest(body: ChatRequestBody): string | null {
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return 'Messages array required';
  }
  if (body.messages.length > MAX_MESSAGES) {
    return `最多支持 ${MAX_MESSAGES} 条消息`;
  }
  for (const msg of body.messages) {
    if (!msg.role || !validRoles.has(msg.role)) return 'Invalid message role';
    if (typeof msg.content !== 'string' || msg.content.length === 0) return 'Message content required';
    if (msg.content.length > MAX_MESSAGE_LENGTH) return `单条消息不能超过 ${MAX_MESSAGE_LENGTH} 个字符`;
  }
  return null;
}

// --- SSE helpers ---

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// --- Route handler ---

export async function POST(request: NextRequest) {
  // Auto-sync
  if (isDataStale(24)) {
    try {
      const { execSync } = await import('child_process');
      execSync('npx tsx scripts/sync-fc3d.ts', { cwd: process.cwd(), timeout: 120000, stdio: 'pipe' });
    } catch (e) {
      console.warn('[ai/stream] Auto-sync failed:', e instanceof Error ? e.message : e);
    }
  }

  // Rate limit
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(sseEvent('error', { error: '请求过于频繁，请稍后再试' }), {
      status: 429,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  if (!aiConfig.apiKey) {
    return new Response(sseEvent('error', { error: 'AI 功能未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response(sseEvent('error', { error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  const validationError = validateRequest(body);
  if (validationError) {
    return new Response(sseEvent('error', { error: validationError }), {
      status: 400,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  // Build chart data (deterministic, server-side)
  const userMessage = body.messages[body.messages.length - 1]?.content || '';
  const queryType = detectQueryType(userMessage);
  const recent = getFreshRecentDraws(100);
  const serverData = buildChartData(queryType, recent);

  const dataContext = buildDataContext();
  const systemPrompt = buildSystemPrompt(dataContext);
  const recentMessages = body.messages.slice(-10).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send meta event with charts/dataCards/prediction immediately
      controller.enqueue(encoder.encode(sseEvent('meta', {
        queryType: serverData.queryType,
        charts: serverData.charts,
        dataCards: serverData.dataCards,
        prediction: serverData.prediction || undefined,
      })));

      try {
        // 2. Stream AI text
        if (aiConfig.provider === 'openai') {
          await streamOpenAI(systemPrompt, recentMessages, controller, encoder);
        } else if (aiConfig.provider === 'anthropic') {
          await streamAnthropic(systemPrompt, recentMessages, controller, encoder);
        } else if (aiConfig.provider === 'gemini') {
          await streamGemini(systemPrompt, recentMessages, controller, encoder);
        }

        // 3. Done
        controller.enqueue(encoder.encode(sseEvent('done', {})));
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知错误';
        console.error(`[ai/stream] Error [${aiConfig.provider}]:`, message);
        controller.enqueue(encoder.encode(sseEvent('error', { error: getErrorMessage(err) })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function getErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return '未知错误';
  const status = (err as { status?: number }).status;
  if (status === 401) return 'API 密钥无效';
  if (status === 429) return '请求过于频繁，请稍后再试';
  if (status && status >= 500) {
    if (err.message.includes('负载已经达到上限')) return 'AI 模型当前繁忙，请稍后再试';
    return 'AI 服务暂时不可用，请稍后再试';
  }
  if (err.name === 'AbortError' || err.message.includes('timeout') || err.message.includes('Timeout')) {
    return '请求超时，请稍后重试';
  }
  return err.message;
}

type Message = { role: 'user' | 'assistant'; content: string };

async function streamOpenAI(
  systemPrompt: string,
  messages: Message[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) {
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
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
    signal: AbortSignal.timeout(aiConfig.timeout),
  });

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`OpenAI API error ${response.status}: ${body}`);
    (err as { status?: number }).status = response.status;
    throw err;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          controller.enqueue(encoder.encode(sseEvent('text', { text: delta })));
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
}

async function streamAnthropic(
  systemPrompt: string,
  messages: Message[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseUrl,
    timeout: aiConfig.timeout,
    defaultHeaders: {
      'anthropic-beta': 'claude-code-20250219,interleaved-thinking-2025-05-14',
    },
  });

  const stream = client.messages.stream({
    model: aiConfig.model,
    max_tokens: aiConfig.maxTokens,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      controller.enqueue(encoder.encode(sseEvent('text', { text: event.delta.text })));
    }
  }
}

async function streamGemini(
  systemPrompt: string,
  messages: Message[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContentStream({
    model: aiConfig.model,
    contents,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: aiConfig.maxTokens,
    },
  });

  for await (const chunk of response) {
    const text = chunk.text;
    if (text) {
      controller.enqueue(encoder.encode(sseEvent('text', { text })));
    }
  }
}
