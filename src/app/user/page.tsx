'use client';

import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';

const MENU_SECTIONS = [
  {
    title: '数据服务',
    items: [
      { icon: '⭐', label: '我的收藏', desc: '收藏的号码和查询', badge: '3' },
      { icon: '🕐', label: '查询历史', desc: 'AI 查询历史记录', badge: '12' },
      { icon: '📊', label: '自定义看板', desc: '个性化数据看板', badge: null },
    ],
  },
  {
    title: '会员服务',
    items: [
      { icon: '👑', label: '会员中心', desc: '查看会员权益', badge: null },
      { icon: '📋', label: '订单记录', desc: '会员订阅记录', badge: null },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: '🔔', label: '通知设置', desc: '开奖提醒、简报推送', badge: null },
      { icon: '🎨', label: '显示设置', desc: '主题、字体大小', badge: null },
      { icon: '❓', label: '帮助与反馈', desc: '常见问题、意见反馈', badge: null },
      { icon: 'ℹ️', label: '关于', desc: '版本信息、隐私政策', badge: null },
    ],
  },
];

export default function UserPage() {
  return (
    <div className="min-h-screen pb-[70px] lg:pb-0 bg-[#f5f5f7]">
      <Navbar />

      {/* User Profile Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] px-4 pt-5 pb-8 lg:py-10">
        <div className="max-w-[1200px] mx-auto lg:px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20">
              张
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">张先生</h2>
              <p className="text-white/40 text-xs mt-0.5">ID: CST20250001</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-[#0071e3] to-[#8b5cf6] text-white">
                  免费用户
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'AI 查询', value: '12' },
              { label: '收藏号码', value: '3' },
              { label: '查看简报', value: '8' },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.08] rounded-xl py-3 text-center">
                <div className="text-white text-lg font-bold">{item.value}</div>
                <div className="text-white/35 text-[11px]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIP Banner */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 -mt-4">
        <div className="bg-gradient-to-r from-[#f39c12] to-[#e67e22] rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <h4 className="text-white font-bold text-sm">升级 VIP 会员</h4>
            <p className="text-white/70 text-xs mt-0.5">解锁无限 AI 查询 · 深度数据分析 · 每日简报推送</p>
          </div>
          <button className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-[#e67e22] shrink-0 hover:bg-white/90 transition-colors">
            了解详情
          </button>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {MENU_SECTIONS.map(section => (
          <div key={section.title} className="bg-white rounded-2xl shadow-apple-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#f5f5f7]">
              <h3 className="text-xs text-[#6e6e73] font-medium">{section.title}</h3>
            </div>
            {section.items.map(item => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#f5f5f7] last:border-b-0 hover:bg-[#f5f5f7] transition-colors text-left"
              >
                <span className="text-xl w-8 text-center">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-[#6e6e73]">{item.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#0071e3] text-white text-[10px] min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                  <span className="text-[#ebebed] text-sm">›</span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 pb-6">
        <button className="w-full py-3 bg-white rounded-2xl shadow-apple-sm text-sm text-[#6e6e73] hover:text-[#ef4444] transition-colors">
          退出登录
        </button>
      </div>

      <Footer />
      <MobileTabBar />
    </div>
  );
}
