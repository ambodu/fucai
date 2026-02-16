/**
 * 彩数通 - 统一配置文件
 */

// --- AI 配置（多 provider 支持）---
// AI_PROVIDER: openai | anthropic | gemini
//   openai    — 兼容所有 OpenAI 格式 API（通义千问、DeepSeek、OpenRouter 等）
//   anthropic — Anthropic Messages API（anyrouter.top / api.anthropic.com）
//   gemini    — Google Gemini API

export type AIProvider = 'openai' | 'anthropic' | 'gemini';

const VALID_PROVIDERS = new Set<AIProvider>(['openai', 'anthropic', 'gemini']);

function getAIProvider(): AIProvider {
  const raw = process.env.AI_PROVIDER || 'openai';
  if (VALID_PROVIDERS.has(raw as AIProvider)) return raw as AIProvider;
  console.warn(`[config] Invalid AI_PROVIDER "${raw}", falling back to "openai"`);
  return 'openai';
}

export const aiConfig = {
  provider: getAIProvider(),
  baseUrl: process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'qwen-plus',
  maxTokens: 8192,
  timeout: 60000,
};

if (!aiConfig.apiKey && typeof window === 'undefined') {
  console.warn('[config] AI_API_KEY is not set. AI features will be disabled.');
}

// --- 数据同步配置 ---

export const syncConfig = {
  secret: process.env.SYNC_SECRET || '',
  cwlApiBase: 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice',
  requestDelay: 1500,
  latestCount: 200,
  incrementalDays: 30,
};
