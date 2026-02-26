export const APP_NAME = '彩数通';
export const APP_DESCRIPTION = 'AI 智能福彩3D数据分析平台';

export const FC3D = {
  name: '福彩3D',
  digits: 3,
  digitMin: 0,
  digitMax: 9,
  drawTime: '21:15',
  drawDays: '每日',
  positions: ['百位', '十位', '个位'] as const,
  startYear: 2004,
} as const;

export const QUICK_TEMPLATES = [
  { id: '1', label: '下期推荐', question: '请基于最近的数据，给我下一期的号码参考建议' },
  { id: '2', label: '杀号参考', question: '帮我分析下哪些号码下期出现概率较低，可以考虑排除？' },
  { id: '3', label: '遗漏排行', question: '目前遗漏最长的号码有哪些？分析下哪些可能要回补' },
  { id: '4', label: '和值分析', question: '最近30期的和值分布情况如何？下期和值大概在什么范围？' },
  { id: '5', label: '号码频率', question: '福彩3D最近50期各数字出现频率是多少？' },
  { id: '6', label: '冷热分析', question: '最近50期最热和最冷的号码分别是哪些？给我分析一下' },
  { id: '7', label: '豹子统计', question: '历史上豹子号出现了多少次？最近一次是哪期？' },
  { id: '8', label: '奇偶分析', question: '最近100期的奇偶比分布情况？下期大概率什么形态？' },
] as const;

export interface HotQuestionItem {
  id: string;
  label: string;
  question: string;
  icon: string;
}

export interface HotQuestionCategory {
  id: string;
  label: string;
  questions: HotQuestionItem[];
}

export const HOT_QUESTIONS: HotQuestionCategory[] = [
  {
    id: 'recommend',
    label: '选号推荐',
    questions: [
      { id: 'r1', label: '下期推荐', question: '请基于最近数据，给我下一期各位的号码推荐', icon: '💡' },
      { id: 'r2', label: '独胆推荐', question: '帮我分析一个独胆，最看好哪个号码？说明理由', icon: '🎯' },
      { id: 'r3', label: '双胆推荐', question: '帮我推荐两个胆码，下期最可能出现的两个数字', icon: '🎲' },
      { id: 'r4', label: '定位推荐', question: '请给出百位、十位、个位各3-4码的定位参考', icon: '📍' },
    ],
  },
  {
    id: 'kill',
    label: '杀号排除',
    questions: [
      { id: 'k1', label: '杀号参考', question: '帮我分析下哪些号码下期出现概率较低，可以考虑排除？', icon: '✂️' },
      { id: 'k2', label: '杀和值', question: '下期哪些和值出现概率最低？帮我排除几个和值', icon: '🚫' },
      { id: 'k3', label: '杀跨度', question: '下期哪些跨度值可以排除？帮我分析一下', icon: '📉' },
    ],
  },
  {
    id: 'number',
    label: '号码分析',
    questions: [
      { id: 'n1', label: '号码频率', question: '最近50期各位数字出现频率如何？哪些数字最活跃？', icon: '📊' },
      { id: 'n2', label: '遗漏排行', question: '目前遗漏最长的号码有哪些？分析下哪些可能要回补', icon: '⏳' },
      { id: 'n3', label: '冷热分析', question: '最近50期最热和最冷的号码分别是哪些？给我分析一下', icon: '🔥' },
      { id: 'n4', label: '复隔中分析', question: '请分析最近的复码（重码）、隔码和中码分布情况', icon: '🔄' },
    ],
  },
  {
    id: 'indicator',
    label: '指标分析',
    questions: [
      { id: 'i1', label: '和值走势', question: '最近30期的和值分布情况如何？下期和值大概在什么范围？', icon: '📈' },
      { id: 'i2', label: '跨度分析', question: '最近50期跨度分布情况如何？下期跨度参考范围？', icon: '↔️' },
      { id: 'i3', label: '012路形态', question: '最近20期各位的012路走势如何？下期012路形态参考？', icon: '🛤️' },
      { id: 'i4', label: '奇偶大小', question: '最近50期奇偶和大小形态分布如何？下期最可能什么形态？', icon: '⚖️' },
    ],
  },
  {
    id: 'special',
    label: '特殊形态',
    questions: [
      { id: 's1', label: '组三组六', question: '最近50期组三和组六比例如何？下期出组三还是组六概率大？', icon: '🔢' },
      { id: 's2', label: '豹子统计', question: '历史上豹子号出现了多少次？最近一次是哪期？距今多少期？', icon: '🐆' },
      { id: 's3', label: '对子分析', question: '最近50期对子号出现了多少次？有什么规律？', icon: '👯' },
    ],
  },
];

export const NAV_ITEMS = [
  { label: '首页', href: '/', icon: 'home' },
  { label: 'AI 分析', href: '/ai', icon: 'bot' },
  { label: '走势图表', href: '/trend', icon: 'chart' },
  { label: '统计分析', href: '/stats', icon: 'database' },
  { label: '数据中心', href: '/data', icon: 'list' },
  { label: '我的', href: '/user', icon: 'user' },
] as const;

export const TREND_NAV_ITEMS = [
  {
    category: '号码走势',
    items: [
      { label: '综合分布图', href: '/trend/comprehensive' },
      { label: '百位走势图', href: '/trend/position/hundreds' },
      { label: '十位走势图', href: '/trend/position/tens' },
      { label: '个位走势图', href: '/trend/position/ones' },
      { label: '组选分布', href: '/trend/group' },
    ],
  },
  {
    category: '形态走势',
    items: [
      { label: '大小形态', href: '/trend/pattern/big-small' },
      { label: '奇偶形态', href: '/trend/pattern/odd-even' },
      { label: '质合形态', href: '/trend/pattern/prime-composite' },
      { label: '012路走势', href: '/trend/pattern/012-road' },
    ],
  },
  {
    category: '常用指标',
    items: [
      { label: '和值分布图', href: '/trend/indicator/sum' },
      { label: '和值尾走势', href: '/trend/indicator/sum-tail' },
      { label: '跨度分布图', href: '/trend/indicator/span' },
    ],
  },
] as const;

export const STATS_NAV_ITEMS = [
  { label: '遗漏统计', href: '/stats/missing' },
  { label: '智能预测', href: '/stats/prediction' },
  { label: '号码频率', href: '/stats/frequency' },
  { label: '冷热分析', href: '/stats/hot-cold' },
] as const;

export const DISCLAIMER_TEXT = '免责声明：本平台仅提供福彩3D历史开奖数据查询与统计分析服务，不销售彩票。数据分析结果仅供参考，不构成投注建议。彩票每期开奖均为独立随机事件，历史数据不代表未来结果。请理性购彩，量力而行。';

export const AI_DISCLAIMER_TEXT = '以上分析基于官方历史开奖数据统计，仅供参考。彩票开奖为独立随机事件，历史数据不代表未来结果，请理性购彩。';

export const HEAT_COLORS = [
  { min: 0, max: 2, color: '#34C759', label: '0-2期' },
  { min: 3, max: 5, color: '#30D158', label: '3-5期' },
  { min: 6, max: 10, color: '#FF9500', label: '6-10期' },
  { min: 11, max: 15, color: '#FF6B00', label: '11-15期' },
  { min: 16, max: 20, color: '#FF3B30', label: '16-20期' },
  { min: 21, max: Infinity, color: '#D70015', label: '20期以上' },
] as const;
