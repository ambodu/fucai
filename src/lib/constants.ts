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
  { id: '2', label: '号码频率', question: '福彩3D最近50期各数字出现频率是多少？' },
  { id: '3', label: '遗漏排行', question: '目前遗漏最长的号码有哪些？分析下哪些可能要回补' },
  { id: '4', label: '和值分析', question: '最近30期的和值分布情况如何？下期和值大概在什么范围？' },
  { id: '5', label: '豹子统计', question: '历史上豹子号出现了多少次？最近一次是哪期？' },
  { id: '6', label: '冷热分析', question: '最近50期最热和最冷的号码分别是哪些？给我分析一下' },
  { id: '7', label: '跨度分析', question: '最近50期跨度分布情况如何？' },
  { id: '8', label: '奇偶分析', question: '最近100期的奇偶比分布情况？下期大概率什么形态？' },
] as const;

export const NAV_ITEMS = [
  { label: '首页', href: '/', icon: 'home' },
  { label: 'AI 分析', href: '/ai', icon: 'bot' },
  { label: '走势图表', href: '/trend', icon: 'chart' },
  { label: '统计分析', href: '/stats', icon: 'database' },
  { label: '数据中心', href: '/data', icon: 'list' },
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
  { min: 0, max: 2, color: '#27ae60', label: '0-2期' },
  { min: 3, max: 5, color: '#2ecc71', label: '3-5期' },
  { min: 6, max: 10, color: '#f59e0b', label: '6-10期' },
  { min: 11, max: 15, color: '#e67e22', label: '11-15期' },
  { min: 16, max: 20, color: '#e74c3c', label: '16-20期' },
  { min: 21, max: Infinity, color: '#c0392b', label: '20期以上' },
] as const;
