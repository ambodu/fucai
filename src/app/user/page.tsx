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
  ClipboardList,
  User,
} from 'lucide-react';

/**
 * 用户中心页面
 *
 * 设计原则:
 * - 简洁清爽，白底为主
 * - 信息层次清晰：头像区 → 统计 → 功能菜单
 * - 移动端优先，紧凑排列
 * - 使用项目已有的 apple-card 风格保持一致性
 */

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

export default function UserPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-[70px] lg:pb-0">
      <Navbar />

      <div className="max-w-[640px] mx-auto px-4 lg:px-6 py-6 lg:py-10">

        {/* === 用户信息卡片 === */}
        <div className="apple-card p-5 lg:p-6 mb-4">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#E13C39] flex items-center justify-center shrink-0">
              <User size={24} className="text-white" />
            </div>

            {/* 名称 + 状态 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[#1d1d1f] truncate">未登录</h2>
              <p className="text-[13px] text-[#8e8e93] mt-0.5">登录后享受完整服务</p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5f5f7] text-[#8e8e93]">
                免费用户
              </span>
            </div>

            {/* 登录按钮 */}
            <Link
              href="/login"
              className="apple-btn-sm shrink-0"
            >
              登录
            </Link>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#f2f2f7]">
            {[
              { label: 'AI 查询', value: '0/3', sub: '今日' },
              { label: '收藏号码', value: '0' },
              { label: '查看简报', value: '0' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl font-semibold text-[#1d1d1f]">{item.value}</div>
                <div className="text-[11px] text-[#8e8e93] mt-0.5">
                  {item.label}
                  {item.sub && <span className="ml-0.5">({item.sub})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === VIP 升级横幅 === */}
        <Link href="/membership" className="block mb-4">
          <div className="apple-card-hover p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #fff8e1, #fff3cd)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ad6800] flex items-center justify-center">
                <Crown size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#1d1d1f]">升级 VIP 会员</h4>
                <p className="text-[12px] text-[#8e8e93] mt-0.5">无限 AI 查询 · 深度分析 · 每日简报</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#8e8e93] shrink-0" />
          </div>
        </Link>

        {/* === AI 额度卡片 === */}
        <div className="apple-card p-4 lg:p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#E13C39]" />
            <h3 className="text-[14px] font-semibold text-[#1d1d1f]">今日 AI 查询额度</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[#f5f5f7] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#E13C39] transition-all duration-300"
                style={{ width: '0%' }}
              />
            </div>
            <span className="text-[13px] font-medium text-[#8e8e93] shrink-0">0 / 3</span>
          </div>
          <p className="text-[12px] text-[#8e8e93] mt-2">
            免费用户每日可查询 3 次 ·{' '}
            <Link href="/membership" className="text-[#E13C39] font-medium">升级会员</Link>
            {' '}解锁更多额度
          </p>
        </div>

        {/* === 功能菜单 === */}
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-wider px-1 mb-2">
              {section.title}
            </h3>
            <div className="apple-card overflow-hidden">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] transition-colors ${
                      idx < section.items.length - 1 ? 'border-b border-[#f2f2f7]' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[#8e8e93]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-[#1d1d1f]">{item.label}</div>
                      <div className="text-[12px] text-[#8e8e93] mt-0.5">{item.desc}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#E13C39] text-white text-[11px] font-medium flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-[#c7c7cc]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* === 退出登录 === */}
        <button
          className="w-full py-3 rounded-xl text-[15px] font-medium text-[#FF3B30] bg-white hover:bg-[#f5f5f7] transition-colors mt-2"
          style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}
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
