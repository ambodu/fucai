import { NextResponse } from 'next/server';
import { aiConfig } from '@/lib/config';
import { getRecentDraws } from '@/lib/data-loader';
import { getFullHistory } from '@/lib/data-loader-server';

// In-memory cache
let cachedPrediction: { data: PredictionData; period: string; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface PredictionData {
  nextPeriod: string;
  hundreds: number[];
  tens: number[];
  ones: number[];
  sumRange: [number, number];
  spanRange: [number, number];
  confidence: string;
  analysis: string;
}

function buildPredictionContext(): string {
  const recent = getRecentDraws(100);
  const full = getFullHistory();
  const latest = recent[0];
  if (!latest) return '';

  const lines: string[] = [];
  lines.push(`最新一期: 第${latest.period}期, 开奖号码: ${latest.digit1} ${latest.digit2} ${latest.digit3}`);
  lines.push(`和值=${latest.sum}, 跨度=${latest.span}`);
  lines.push('');

  lines.push('最近20期开奖:');
  recent.slice(0, 20).forEach(d => {
    lines.push(`${d.period}: ${d.digit1} ${d.digit2} ${d.digit3} | 和值=${d.sum} 跨度=${d.span} ${d.bigSmallPattern} ${d.oddEvenPattern}`);
  });
  lines.push('');

  const r50 = recent.slice(0, 50);
  for (let pos = 1; pos <= 3; pos++) {
    const posLabel = pos === 1 ? '百位' : pos === 2 ? '十位' : '个位';
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    r50.forEach(draw => {
      const digit = pos === 1 ? draw.digit1 : pos === 2 ? draw.digit2 : draw.digit3;
      freq[digit]++;
    });
    const sorted = Object.entries(freq).sort(([, a], [, b]) => b - a);
    lines.push(`${posLabel}频率(近50期): ` + sorted.map(([d, c]) => `${d}(${c})`).join(' '));
  }
  lines.push('');

  for (let pos = 1; pos <= 3; pos++) {
    const posLabel = pos === 1 ? '百位' : pos === 2 ? '十位' : '个位';
    const missing: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) {
      const idx = recent.findIndex(draw => {
        const digit = pos === 1 ? draw.digit1 : pos === 2 ? draw.digit2 : draw.digit3;
        return digit === d;
      });
      missing[d] = idx === -1 ? recent.length : idx;
    }
    const sorted = Object.entries(missing).sort(([, a], [, b]) => b - a);
    lines.push(`${posLabel}遗漏: ` + sorted.map(([d, m]) => `${d}(${m}期)`).join(' '));
  }

  lines.push('');
  lines.push(`全部历史共 ${full.length} 期数据`);

  return lines.join('\n');
}

const PREDICT_PROMPT = `基于以下福彩3D历史数据，分析下一期的号码参考。

你必须返回严格的JSON格式（不要加markdown代码块标记），格式如下：
{
  "hundreds": [最可能的3个百位数字],
  "tens": [最可能的3个十位数字],
  "ones": [最可能的3个个位数字],
  "sumRange": [和值下限, 和值上限],
  "spanRange": [跨度下限, 跨度上限],
  "confidence": "基于数据质量的置信度描述",
  "analysis": "简要分析理由(100字以内)"
}

分析方法：结合频率分析、遗漏值分析、趋势分析、和值/跨度的均值回归。

数据：
`;

async function callAI(prompt: string): Promise<string> {
  const systemPrompt = '你是一个数据分析专家，只返回纯JSON格式数据，不要加任何markdown标记或额外文字。';

  if (aiConfig.provider === 'gemini') {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
    const response = await ai.models.generateContent({
      model: aiConfig.model,
      contents: [{ role: 'user' as const, parts: [{ text: prompt }] }],
      config: { systemInstruction: systemPrompt, maxOutputTokens: aiConfig.maxTokens },
    });
    return response.text || '';
  } else if (aiConfig.provider === 'anthropic') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.baseUrl,
      timeout: aiConfig.timeout,
      defaultHeaders: { 'anthropic-beta': 'claude-code-20250219,interleaved-thinking-2025-05-14' },
    });
    const response = await client.messages.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('');
  } else {
    const url = `${aiConfig.baseUrl.replace(/\/+$/, '')}/v1/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiConfig.apiKey}` },
      body: JSON.stringify({
        model: aiConfig.model,
        max_tokens: aiConfig.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(aiConfig.timeout),
    });
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

function generateFallbackPrediction(currentPeriod: string): PredictionData {
  const draws = getRecentDraws(50);
  const result: { hundreds: number[]; tens: number[]; ones: number[] } = { hundreds: [], tens: [], ones: [] };

  for (let pos = 1; pos <= 3; pos++) {
    const freq: Record<number, number> = {};
    const missing: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) { freq[d] = 0; missing[d] = -1; }

    draws.forEach((draw, idx) => {
      const digit = pos === 1 ? draw.digit1 : pos === 2 ? draw.digit2 : draw.digit3;
      freq[digit]++;
      if (missing[digit] === -1) missing[digit] = idx;
    });
    for (let d = 0; d <= 9; d++) { if (missing[d] === -1) missing[d] = draws.length; }

    const byFreq = Object.entries(freq).sort(([, a], [, b]) => b - a);
    const byMissing = Object.entries(missing).sort(([, a], [, b]) => b - a);

    const candidates = new Set<number>();
    candidates.add(Number(byFreq[0][0]));
    candidates.add(Number(byFreq[1][0]));
    candidates.add(Number(byMissing[0][0]));

    const key = pos === 1 ? 'hundreds' : pos === 2 ? 'tens' : 'ones';
    result[key] = Array.from(candidates);
  }

  const sums = draws.map(d => d.sum);
  const spans = draws.map(d => d.span);
  const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
  const avgSpan = spans.reduce((a, b) => a + b, 0) / spans.length;

  return {
    nextPeriod: String(parseInt(currentPeriod) + 1),
    ...result,
    sumRange: [Math.max(0, Math.round(avgSum - 4)), Math.min(27, Math.round(avgSum + 4))],
    spanRange: [Math.max(0, Math.round(avgSpan - 2)), Math.min(9, Math.round(avgSpan + 2))],
    confidence: '基于近50期统计数据',
    analysis: '综合频率分析和遗漏回补分析',
  };
}

export async function GET() {
  if (!aiConfig.apiKey) {
    return NextResponse.json({ error: 'AI 功能未配置' }, { status: 500 });
  }

  const recent = getRecentDraws(1);
  const currentPeriod = recent[0]?.period || 'unknown';

  // Check cache
  if (cachedPrediction && cachedPrediction.period === currentPeriod && Date.now() - cachedPrediction.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedPrediction.data);
  }

  try {
    const context = buildPredictionContext();
    const fullPrompt = PREDICT_PROMPT + context;
    const raw = await callAI(fullPrompt);

    const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    const nextPeriodNum = parseInt(currentPeriod) + 1;
    const prediction: PredictionData = {
      nextPeriod: String(nextPeriodNum),
      hundreds: (parsed.hundreds || []).slice(0, 4),
      tens: (parsed.tens || []).slice(0, 4),
      ones: (parsed.ones || []).slice(0, 4),
      sumRange: parsed.sumRange || [8, 20],
      spanRange: parsed.spanRange || [3, 7],
      confidence: parsed.confidence || '基于近50期数据分析',
      analysis: parsed.analysis || '综合频率和遗漏分析',
    };

    cachedPrediction = { data: prediction, period: currentPeriod, timestamp: Date.now() };
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Prediction API error:', error);
    const fallback = generateFallbackPrediction(currentPeriod);
    return NextResponse.json(fallback);
  }
}
