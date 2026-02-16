'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';
import { Check, Crown, Sparkles, Zap, Star, ArrowLeft } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    priceLabel: '免费',
    period: '',
    icon: Star,
    headerBg: 'bg-[#f5f5f7]',
    headerText: 'text-[#1d1d1f]',
    btnClass: 'bg-[#f5f5f7] text-[#8e8e93] cursor-default',
    btnLabel: '当前方案',
    popular: false,
    features: [
      { text: '每日 3 次 AI 查询', included: true },
      { text: '基础开奖数据查看', included: true },
      { text: '近 30 期走势图', included: true },
      { text: '基础数据简报', included: true },
      { text: '深度数据分析', included: false },
      { text: '高级走势图表', included: false },
      { text: '专属客服支持', included: false },
    ],
  },
  {
    id: 'basic',
    name: '基础会员',
    price: 19.9,
    priceLabel: '19.9',
    period: '/月',
    icon: Zap,
    headerBg: 'bg-[#1d1d1f]',
    headerText: 'text-white',
    btnClass: 'bg-[#1d1d1f] text-white hover:bg-[#424245]',
    btnLabel: '立即开通',
    popular: false,
    features: [
      { text: '每月 100 次 AI 查询', included: true },
      { text: '全部开奖数据查看', included: true },
      { text: '近 100 期走势图', included: true },
      { text: '完整数据简报', included: true },
      { text: '基础数据分析', included: true },
      { text: '高级走势图表', included: false },
      { text: '专属客服支持', included: false },
    ],
  },
  {
    id: 'pro',
    name: '专业会员',
    price: 49.9,
    priceLabel: '49.9',
    period: '/月',
    icon: Sparkles,
    headerBg: 'bg-[#1d1d1f]',
    headerText: 'text-white',
    btnClass: 'bg-[#1d1d1f] text-white hover:bg-[#424245]',
    btnLabel: '立即开通',
    popular: true,
    features: [
      { text: '每月 500 次 AI 查询', included: true },
      { text: '全部开奖数据查看', included: true },
      { text: '全部走势图（不限期数）', included: true },
      { text: '完整数据简报', included: true },
      { text: '深度数据分析', included: true },
      { text: '高级走势图表', included: true },
      { text: '专属客服支持', included: false },
    ],
  },
  {
    id: 'ultimate',
    name: '至尊会员',
    price: 99.9,
    priceLabel: '99.9',
    period: '/月',
    icon: Crown,
    headerBg: 'bg-gradient-to-r from-[#c8a45c] to-[#e8c878]',
    headerText: 'text-[#5a3e0a]',
    btnClass: 'bg-gradient-to-r from-[#c8a45c] to-[#e8c878] text-[#5a3e0a] font-semibold hover:opacity-90',
    btnLabel: '立即开通',
    popular: false,
    features: [
      { text: '无限 AI 查询', included: true },
      { text: '全部开奖数据查看', included: true },
      { text: '全部走势图（不限期数）', included: true },
      { text: '完整数据简报 + 每日推送', included: true },
      { text: '深度数据分析', included: true },
      { text: '高级走势图表', included: true },
      { text: '专属客服支持', included: true },
    ],
  },
];

const FAQ = [
  {
    q: '支付方式是什么？',
    a: '目前支持支付宝手机网站支付，打开即可完成付款，无需下载额外 APP。',
  },
  {
    q: 'AI 查询次数是如何计算的？',
    a: '每向 AI 提交一次问题计为一次查询。查看历史对话不消耗次数。免费用户每日额度会在次日零点重置，会员查询次数按月计算。',
  },
  {
    q: '可以随时取消订阅吗？',
    a: '可以。取消后当前订阅期内仍可正常使用，到期后自动恢复为免费用户。',
  },
  {
    q: '数据来源是否可靠？',
    a: '所有开奖数据均来自中国福利彩票官方渠道，AI 分析基于历史数据统计，仅供参考，不构成任何投注建议。',
  },
];

export default function MembershipPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen pb-[52px] lg:pb-0 bg-[#f5f5f7]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1d1d1f] px-4 pt-6 pb-8 lg:py-10">
        <div className="max-w-[980px] mx-auto lg:px-6">
          <Link href="/user" className="inline-flex items-center gap-1 text-white/40 text-[13px] mb-4 hover:text-white/60 transition-colors">
            <ArrowLeft size={14} />
            返回用户中心
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl lg:text-2xl font-semibold">会员中心</h1>
              <p className="text-white/40 text-[13px] mt-0.5">选择适合你的方案，解锁更多数据分析能力</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 -mt-4">
        <div className="flex items-center justify-center">
          <div className="inline-flex bg-white rounded-full p-1 shadow-card">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all ${
                billingCycle === 'monthly' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-[#8e8e93] hover:text-[#1d1d1f]'
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all ${
                billingCycle === 'yearly' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-[#8e8e93] hover:text-[#1d1d1f]'
              }`}
            >
              年付 <span className="text-[11px] opacity-80">省20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            const displayPrice = billingCycle === 'yearly' && plan.price > 0
              ? (plan.price * 12 * 0.8).toFixed(0)
              : plan.priceLabel;
            const displayPeriod = billingCycle === 'yearly' && plan.price > 0
              ? '/年'
              : plan.period;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl overflow-hidden flex flex-col ${
                  plan.popular ? 'shadow-card-hover ring-2 ring-[#1d1d1f]' : 'shadow-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-3 right-3 bg-[#1d1d1f] text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                    推荐
                  </div>
                )}

                {/* Plan header */}
                <div className={`px-5 py-5 ${plan.headerBg} ${plan.headerText}`}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Icon size={18} />
                    <span className="font-semibold text-[14px]">{plan.name}</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    {plan.price > 0 && <span className="text-[14px]">¥</span>}
                    <span className="text-3xl font-semibold">{displayPrice}</span>
                    {displayPeriod && <span className="text-[13px] opacity-60">{displayPeriod}</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 px-5 py-5">
                  <ul className="space-y-3">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px]">
                        <Check
                          size={14}
                          className={`shrink-0 mt-0.5 ${feat.included ? 'text-[#34C759]' : 'text-[#e5e5ea]'}`}
                        />
                        <span className={feat.included ? 'text-[#1d1d1f]' : 'text-[#c7c7cc] line-through'}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <button
                    className={`w-full py-2.5 rounded-full text-[14px] font-medium transition-all ${plan.btnClass}`}
                    disabled={plan.id === 'free'}
                  >
                    {plan.btnLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison note */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 pb-4">
        <div className="p-4 bg-[#f5f5f7] rounded-2xl">
          <p className="text-[12px] text-[#8e8e93] leading-relaxed">
            所有会员方案均包含基础数据服务。AI 查询每次消耗约 ¥0.1 成本，会员价格已包含平台服务费。
            付款后即时生效，支持支付宝手机支付。如有疑问请联系客服。
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 pb-8">
        <h2 className="text-[16px] font-semibold text-[#1d1d1f] mb-4">常见问题</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl shadow-card bg-white p-5">
              <h4 className="text-[14px] font-semibold text-[#1d1d1f] mb-1.5">{item.q}</h4>
              <p className="text-[13px] text-[#8e8e93] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <MobileTabBar />
    </div>
  );
}
