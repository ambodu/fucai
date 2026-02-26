'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';
import {
  Crown,
  ChevronRight,
  Sparkles,
  Star,
  Clock,
  BarChart3,
  Bell,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  Edit2,
  ClipboardList,
} from 'lucide-react';

/* ============================================================
   Menu Sections — 分段卡片数据
   MD3 推荐使用 leading icon + headline + supporting text 的列表项
   ============================================================ */
const MENU_SECTIONS = [
  {
    title: '数据服务',
    items: [
      { icon: Star, label: '我的收藏', desc: '收藏的号码和查询', badge: '3', href: '#' },
      { icon: Clock, label: '查询历史', desc: 'AI 查询历史记录', badge: '12', href: '#' },
      { icon: BarChart3, label: '自定义看板', desc: '个性化数据看板', badge: null, href: '#' },
    ],
  },
  {
    title: '会员服务',
    items: [
      { icon: Crown, label: '会员中心', desc: '查看会员权益与套餐', badge: null, href: '/membership' },
      { icon: ClipboardList, label: '订单记录', desc: '会员订阅与支付记录', badge: null, href: '#' },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: Bell, label: '通知设置', desc: '开奖提醒、简报推送', badge: null, href: '#' },
      { icon: Palette, label: '显示设置', desc: '主题、字体大小', badge: null, href: '#' },
      { icon: HelpCircle, label: '帮助与反馈', desc: '常见问题、意见反馈', badge: null, href: '#' },
      { icon: Info, label: '关于', desc: '版本信息、隐私政策', badge: null, href: '#' },
    ],
  },
];

/* ============================================================
   会员等级标签 — 使用 MD3 色彩映射
   ============================================================ */
const MEMBERSHIP_TIERS = [
  {
    label: '免费用户',
    containerClass: 'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]',
  },
  {
    label: '基础会员',
    containerClass: 'bg-[var(--md-inverse-surface)] text-[var(--md-inverse-on-surface)]',
  },
  {
    label: '专业会员',
    containerClass: 'bg-[var(--md-inverse-surface)] text-[var(--md-inverse-on-surface)]',
  },
  {
    label: '至尊会员',
    containerClass: 'bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]',
  },
];

/* ============================================================
   UserPage — Material Design 3 风格用户个人资料页
   ============================================================ */
export default function UserPage() {
  const currentTier = 0;

  return (
    <div
      className="min-h-screen pb-20 lg:pb-0"
      style={{ background: 'var(--md-surface)' }}
    >
      <Navbar />

      {/* ====================================================
          Profile Header — MD3 Large Top App Bar 风格
          使用 primary-container 色做头部背景，保持视觉层次
          ==================================================== */}
      <header
        className="px-4 pt-8 pb-12 lg:pt-10 lg:pb-14"
        style={{ background: 'var(--md-primary-container)' }}
      >
        <div className="max-w-[840px] mx-auto lg:px-6">
          {/* 用户信息行 */}
          <div className="flex items-center gap-4">
            {/* MD3 Avatar: 圆形, 56/64px, 使用 primary 色 */}
            <div
              className="w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'var(--md-primary)',
                color: 'var(--md-on-primary)',
              }}
            >
              <span className="text-xl lg:text-2xl font-medium">U</span>
            </div>

            {/* 名称 + 会员标签 */}
            <div className="flex-1 min-w-0">
              <h2
                className="md3-headline-small font-medium truncate"
                style={{ color: 'var(--md-on-primary-container)' }}
              >
                未登录
              </h2>
              <p
                className="md3-body-medium mt-0.5"
                style={{ color: 'var(--md-on-primary-container)', opacity: 0.7 }}
              >
                登录后享受完整服务
              </p>
              {/* 会员等级 Badge — MD3 pill shape */}
              <span
                className={`inline-block mt-2 px-3 py-0.5 rounded-full md3-label-small ${MEMBERSHIP_TIERS[currentTier].containerClass}`}
              >
                {MEMBERSHIP_TIERS[currentTier].label}
              </span>
            </div>

            {/* 编辑/登录按钮 — MD3 Filled Tonal Button */}
            <Link
              href="/login"
              className="md3-btn-filled shrink-0"
            >
              登录
            </Link>
          </div>

          {/* ====================================================
              Stats Row — MD3 使用 surface-container 卡片风格
              遵循 8pt 网格：间距 12px (gap-3), 内边距 16px (p-4)
              ==================================================== */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { label: 'AI 查询', value: '0/3', sub: '今日' },
              { label: '收藏号码', value: '0' },
              { label: '查看简报', value: '0' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 text-center"
                style={{ background: 'var(--md-surface-container-lowest)' }}
              >
                <div
                  className="md3-title-large font-medium"
                  style={{ color: 'var(--md-on-surface)' }}
                >
                  {item.value}
                </div>
                <div
                  className="md3-label-small mt-1"
                  style={{ color: 'var(--md-on-surface-variant)' }}
                >
                  {item.label}
                  {item.sub && <span className="ml-0.5">({item.sub})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ====================================================
          VIP 升级横幅 — MD3 Tertiary Container (金色调)
          ==================================================== */}
      <div className="max-w-[840px] mx-auto px-4 lg:px-6 -mt-6">
        <Link href="/membership" className="block">
          <div
            className="md3-card-filled rounded-2xl p-4 flex items-center justify-between"
            style={{
              background: 'var(--md-tertiary-container)',
              color: 'var(--md-on-tertiary-container)',
              boxShadow: 'var(--md-elevation-2)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Icon container — 圆角方形, 40×40 */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
              >
                <Crown size={18} />
              </div>
              <div>
                <h4 className="md3-title-small">升级 VIP 会员</h4>
                <p className="md3-body-small mt-0.5 opacity-80">
                  无限 AI 查询 · 深度分析 · 每日简报
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="md3-label-medium hidden sm:inline">了解详情</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </Link>
      </div>

      {/* ====================================================
          今日 AI 额度卡片 — MD3 Elevated Card
          ==================================================== */}
      <div className="max-w-[840px] mx-auto px-4 lg:px-6 mt-4">
        <div
          className="md3-card-elevated rounded-2xl p-5"
        >
          {/* Card header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: 'var(--md-primary)' }} />
            <h3
              className="md3-title-small"
              style={{ color: 'var(--md-on-surface)' }}
            >
              今日 AI 查询额度
            </h3>
          </div>
          {/* Progress bar — MD3 Linear Progress Indicator */}
          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--md-surface-container-highest)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: '0%', background: 'var(--md-primary)' }}
              />
            </div>
            <span
              className="md3-label-medium shrink-0"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              0 / 3
            </span>
          </div>
          <p
            className="md3-body-small mt-3"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            免费用户每日可查询 3 次 ·{' '}
            <Link
              href="/membership"
              className="font-medium"
              style={{ color: 'var(--md-primary)' }}
            >
              升级会员
            </Link>{' '}
            解锁更多额度
          </p>
        </div>
      </div>

      {/* ====================================================
          Menu Sections — MD3 Card + List 组合
          每个 section 用 Outlined Card 包裹
          列表项遵循 MD3 List Item 规范:
            - leading icon (40px area)
            - headline + supporting text
            - trailing badge + chevron
          ==================================================== */}
      <div className="max-w-[840px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="md3-card-outlined rounded-2xl overflow-hidden">
            {/* Section title — MD3 Label Medium */}
            <div
              className="px-4 py-3"
              style={{ background: 'var(--md-surface-container)' }}
            >
              <h3
                className="md3-label-medium uppercase tracking-wider"
                style={{ color: 'var(--md-on-surface-variant)' }}
              >
                {section.title}
              </h3>
            </div>

            {/* List items */}
            {section.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--md-surface-container-low)]"
                  style={{
                    borderBottom:
                      idx < section.items.length - 1
                        ? '1px solid var(--md-outline-variant)'
                        : 'none',
                  }}
                >
                  {/* Leading icon — MD3 使用 on-surface-variant 色 */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: 'var(--md-surface-container-highest)',
                      color: 'var(--md-on-surface-variant)',
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="md3-body-large"
                      style={{ color: 'var(--md-on-surface)' }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="md3-body-small mt-0.5"
                      style={{ color: 'var(--md-on-surface-variant)' }}
                    >
                      {item.desc}
                    </div>
                  </div>

                  {/* Trailing: badge + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="md3-badge-large">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={16}
                      style={{ color: 'var(--md-outline)' }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* ====================================================
          退出登录按钮 — MD3 Text Button (destructive variant)
          ==================================================== */}
      <div className="max-w-[840px] mx-auto px-4 lg:px-6 pb-8">
        <button
          className="w-full h-12 rounded-full md3-label-large transition-colors"
          style={{
            background: 'var(--md-surface-container-low)',
            color: 'var(--md-error)',
            boxShadow: 'var(--md-elevation-1)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut size={16} />
            退出登录
          </span>
        </button>
      </div>

      <Footer />
      <MobileTabBar />
    </div>
  );
}
