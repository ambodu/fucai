import { NextRequest, NextResponse } from 'next/server';
import { aiConfig } from '@/lib/config';
import { getRecentDraws } from '@/lib/data-loader';
import { getFullHistory } from '@/lib/data-loader-server';

// --- Data context builder ---

function buildDataContext(): string {
  const recent = getRecentDraws(100);
  const full = getFullHistory();
  const latest = recent[0];

  if (!latest) return '暂无开奖数据。';

  const lines: string[] = [];
  lines.push(`数据范围: 共 ${full.length} 期历史数据`);
  lines.push(`最新一期: 第${latest.period}期 (${latest.drawDate}), 开奖号码: ${latest.digit1} ${latest.digit2} ${latest.digit3}`);
  lines.push(`和值=${latest.sum}, 跨度=${latest.span}, 大小=${latest.bigSmallPattern}, 奇偶=${latest.oddEvenPattern}`);
  lines.push('');

  // Recent 10 draws
  lines.push('最近10期开奖:');
  recent.slice(0, 10).forEach(d => {
    lines.push(`  ${d.period} (${d.drawDate}): ${d.digit1} ${d.digit2} ${d.digit3} | 和值=${d.sum} 跨度=${d.span} ${d.bigSmallPattern} ${d.oddEvenPattern} ${d.group === 'triplet' ? '[豹子]' : d.group === 'pair' ? '[对子]' : ''}`);
  });
  lines.push('');

  // Frequency stats (recent 50)
  const r50 = recent.slice(0, Math.min(50, recent.length));
  lines.push('最近50期各位置数字频率:');
  for (let pos = 1; pos <= 3; pos++) {
    const posLabel = pos === 1 ? '百位' : pos === 2 ? '十位' : '个位';
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    r50.forEach(draw => {
      const digit = pos === 1 ? draw.digit1 : pos === 2 ? draw.digit2 : draw.digit3;
      freq[digit]++;
    });
    const sorted = Object.entries(freq).sort(([, a], [, b]) => b - a);
    lines.push(`  ${posLabel}: ` + sorted.map(([d, c]) => `${d}(${c}次)`).join(' '));
  }
  lines.push('');

  // Missing values (current)
  lines.push('当前遗漏值 (百位/十位/个位各数字距上次出现的期数):');
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
    lines.push(`  ${posLabel}: ` + sorted.map(([d, m]) => `${d}(遗漏${m})`).join(' '));
  }
  lines.push('');

  // Sum stats
  const sums = r50.map(d => d.sum);
  const avgSum = (sums.reduce((a, b) => a + b, 0) / sums.length).toFixed(1);
  lines.push(`最近50期和值: 平均=${avgSum}, 最大=${Math.max(...sums)}, 最小=${Math.min(...sums)}`);

  // Span stats
  const spans = r50.map(d => d.span);
  const avgSpan = (spans.reduce((a, b) => a + b, 0) / spans.length).toFixed(1);
  lines.push(`最近50期跨度: 平均=${avgSpan}, 最大=${Math.max(...spans)}, 最小=${Math.min(...spans)}`);

  // Group stats
  const triplets = r50.filter(d => d.group === 'triplet').length;
  const pairs = r50.filter(d => d.group === 'pair').length;
  const sixes = r50.filter(d => d.group === 'six').length;
  lines.push(`最近50期组选形态: 组六=${sixes}次, 对子=${pairs}次, 豹子=${triplets}次`);
  lines.push('');

  // Full history stats for deep queries
  const fullTriplets = full.filter(d => d.group === 'triplet');
  lines.push(`全部历史豹子: ${fullTriplets.length}次`);
  if (fullTriplets.length > 0) {
    lines.push(`  最近一次: ${fullTriplets[0].period} (${fullTriplets[0].drawDate}) ${fullTriplets[0].digit1}${fullTriplets[0].digit2}${fullTriplets[0].digit3}`);
  }

  return lines.join('\n');
}

function buildSystemPrompt(dataContext: string, chartMode: boolean): string {
  const base = `你是"彩数通"平台的福彩3D智能分析助手。你的职责是基于提供的真实历史开奖数据，回答用户关于福彩3D的数据查询、统计分析和号码参考问题。

## 核心原则
1. 只基于提供的真实数据进行分析，不编造数据
2. 可以基于历史数据的统计规律给出下一期的号码参考建议
3. 给出号码建议时，必须说明分析依据（如频率、遗漏、趋势等）
4. 每次给出参考号码后，必须附带免责提醒
5. 回答简洁直观，善用数字和列表

## 号码参考建议的格式
当用户询问下期推荐时，按以下格式回答：
- 百位推荐：列出3-4个候选数字及理由
- 十位推荐：列出3-4个候选数字及理由
- 个位推荐：列出3-4个候选数字及理由
- 和值参考范围
- 跨度参考范围
- 形态参考（大小/奇偶）

## 当前数据
${dataContext}

## 回答风格
- 直接给出数据和统计结果
- 用数字说话，附带百分比
- 适当使用表格或列表排版
- 如果用户的问题超出数据范围，如实说明

## 免责提醒（每次给出号码建议时必须附加）
以上分析仅基于历史数据统计规律，仅供参考。彩票每期开奖均为独立随机事件，历史数据不能预测未来结果。请理性购彩，量力而行。`;

  if (!chartMode) return base;

  return base + `

## 图表数据模式（必须严格遵守）

你当前处于图表模式。当回答涉及数据分析时，你必须返回结构化 JSON，格式如下：

{
  "text": "你的文字分析内容（支持 Markdown）",
  "charts": [
    {
      "type": "bar",
      "title": "图表标题",
      "xAxis": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      "series": [{ "name": "出现次数", "data": [5, 8, 3, 7, 6, 9, 4, 2, 8, 6] }]
    }
  ]
}

### 图表类型选择规则：
- 频率/次数对比 → "bar"（柱状图）
- 趋势/走势/变化 → "line"（折线图）
- 占比/分布 → "pie"（饼图）
- 多维度对比 → "radar"（雷达图）

### 严格规则：
1. 必须返回纯 JSON，不加 markdown 代码块标记
2. charts 中每个图表的 data 数组长度必须与 xAxis 长度一致
3. 如果回答不涉及数据图表，charts 为空数组 []
4. text 字段支持 Markdown 格式
5. series 中 name 必须有意义（如"百位频率"而不是"数据"）`;
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

// --- Parse AI response for chart mode ---

interface AIResponse {
  content: string;
  charts?: Array<{
    type: 'bar' | 'line' | 'pie' | 'radar' | 'heatmap';
    title: string;
    xAxis?: string[];
    series: Array<{ name: string; data: number[]; color?: string }>;
  }>;
}

function parseChartResponse(raw: string): AIResponse {
  try {
    // Try parsing as JSON directly
    const parsed = JSON.parse(raw);
    if (parsed.text !== undefined) {
      return {
        content: parsed.text || '',
        charts: Array.isArray(parsed.charts) ? parsed.charts : [],
      };
    }
  } catch {
    // Not valid JSON
  }

  // Try extracting JSON from markdown code blocks
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (parsed.text !== undefined) {
        return {
          content: parsed.text || '',
          charts: Array.isArray(parsed.charts) ? parsed.charts : [],
        };
      }
    } catch {
      // Malformed JSON in code block
    }
  }

  // Fallback: treat entire response as plain text
  return { content: raw, charts: [] };
}

// --- Route handler ---

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  chartMode?: boolean;
}

export async function POST(request: NextRequest) {
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

  const chartMode = body.chartMode === true;

  try {
    const dataContext = buildDataContext();
    const systemPrompt = buildSystemPrompt(dataContext, chartMode);
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

        // Parse response based on chart mode
        if (chartMode) {
          const parsed = parseChartResponse(text);
          return NextResponse.json(parsed);
        }

        return NextResponse.json({ content: text });
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

    console.error(`AI API error [${aiConfig.provider}]:`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: message }, { status });
  }
}
