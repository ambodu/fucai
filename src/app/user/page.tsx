'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';
import { Crown, ChevronRight, Sparkles } from 'lucide-react';

const MENU_SECTIONS = [
  {
    title: '数据服务',
    items: [
      { icon: '⭐', label: '我的收藏', desc: '收藏的号码和查询', badge: '3', href: '#' },
      { icon: '🕐', label: '查询历史', desc: 'AI 查询历史记录', badge: '12', href: '#' },
      { icon: '📊', label: '自定义看板', desc: '个性化数据看板', badge: null, href: '#' },
    ],
  },
  {
    title: '会员服务',
    items: [
      { icon: '👑', label: '会员中心', desc: '查看会员权益与套餐', badge: null, href: '/membership' },
      { icon: '📋', label: '订单记录', desc: '会员订阅与支付记录', badge: null, href: '#' },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: '🔔', label: '通知设置', desc: '开奖提醒、简报推送', badge: null, href: '#' },
      { icon: '🎨', label: '显示设置', desc: '主题、字体大小', badge: null, href: '#' },
      { icon: '❓', label: '帮助与反馈', desc: '常见问题、意见反馈', badge: null, href: '#' },
      { icon: 'ℹ️', label: '关于', desc: '版本信息、隐私政策', badge: null, href: '#' },
    ],
  },
];

const MEMBERSHIP_TIERS = [
  { label: '免费用户', color: 'bg-[#f5f5f7] text-[#8e8e93]' },
  { label: '基础会员', color: 'bg-[#1d1d1f] text-white' },
  { label: '专业会员', color: 'bg-[#1d1d1f] text-white' },
  { label: '至尊会员', color: 'bg-gradient-to-r from-[#c8a45c] to-[#f0d48a] text-[#7a5c1f]' },
];

export default function UserPage() {
  const currentTier = 0;

  return (
    <div className="min-h-screen pb-[52px] lg:pb-0 bg-[#f5f5f7]">
      <Navbar />

      {/* User Profile Header */}
      <div className="bg-[#1d1d1f] px-4 pt-6 pb-10 lg:py-10">
        <div className="max-w-[980px] mx-auto lg:px-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/10 flex items-center justify-center text-white text-xl lg:text-2xl font-semibold border-2 border-white/10">
              U
            </div>
            <div>
              <h2 className="text-white text-base lg:text-lg font-semibold">未登录</h2>
              <p className="text-white/40 text-[12px] lg:text-[13px] mt-0.5">登录后享受完整服务</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${MEMBERSHIP_TIERS[currentTier].color}`}>
                  {MEMBERSHIP_TIERS[currentTier].label}
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <Link
                href="/login"
                className="px-5 py-2.5 bg-white rounded-full text-[13px] font-semibold text-[#1d1d1f] hover:bg-white/90 transition-colors"
              >
                登录
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'AI 查询', value: '0/3', sub: '今日' },
              { label: '收藏号码', value: '0' },
              { label: '查看简报', value: '0' },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.06] rounded-xl py-3 text-center">
                <div className="text-white text-base lg:text-lg font-semibold">{item.value}</div>
                <div className="text-white/30 text-[11px] lg:text-[12px]">
                  {item.label}
                  {item.sub && <span className="ml-0.5">({item.sub})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIP Banner */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 -mt-5">
        <Link href="/membership" className="block">
          <div className="bg-gradient-to-r from-[#c8a45c] to-[#e8c878] rounded-2xl p-4 flex items-center justify-between shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown size={18} className="text-[#7a5c1f]" />
              </div>
              <div>
                <h4 className="text-[#5a3e0a] font-semibold text-[14px]">升级 VIP 会员</h4>
                <p className="text-[#7a5c1f]/70 text-[12px] mt-0.5">无限 AI 查询 · 深度分析 · 每日简报</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#5a3e0a]">
              <span className="text-[13px] font-semibold hidden sm:inline">了解详情</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </Link>
      </div>

      {/* Quota Info */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 mt-4">
        <div className="rounded-2xl shadow-card bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-[#1d1d1f]" />
            <h3 className="text-[13px] font-semibold text-[#1d1d1f]">今日 AI 查询额度</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
              <div className="h-full bg-[#007AFF] rounded-full" style={{ width: '0%' }} />
            </div>
            <span className="text-[12px] text-[#8e8e93] font-medium shrink-0">0 / 3</span>
          </div>
          <p className="text-[11px] text-[#8e8e93] mt-2">
            免费用户每日可查询 3 次 · <Link href="/membership" className="text-[#007AFF] hover:underline">升级会员</Link> 解锁更多额度
          </p>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {MENU_SECTIONS.map(section => (
          <div key={section.title} className="rounded-2xl shadow-card bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#e5e5ea] bg-[#f5f5f7]">
              <h3 className="text-[11px] text-[#8e8e93] font-semibold uppercase tracking-wider">{section.title}</h3>
            </div>
            {section.items.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e5e5ea] last:border-b-0 hover:bg-[#f5f5f7] transition-colors"
              >
                <span className="text-lg w-7 text-center">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#1d1d1f]">{item.label}</div>
                  <div className="text-[12px] text-[#8e8e93]">{item.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF3B30] text-white text-[10px] min-w-[20px] text-center font-medium">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-[#c7c7cc]" />
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 pb-6">
        <button className="w-full py-3 rounded-2xl shadow-card bg-white text-[14px] text-[#8e8e93] hover:text-[#FF3B30] transition-colors font-medium">
          退出登录
        </button>
      </div>

      <Footer />
      <MobileTabBar />
    </div>
  );
}
