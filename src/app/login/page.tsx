'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { ArrowLeft, Phone, Shield, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const handleSendCode = () => {
    if (!phone || phone.length !== 11 || countdown > 0) return;
    setCodeSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = () => {
    if (!phone || !code || !agreed) return;
    alert('登录功能即将上线');
  };

  return (
    <div className="min-h-screen pb-[52px] lg:pb-0 bg-[#f5f5f7]">
      <Navbar />

      <div className="max-w-[420px] mx-auto px-4 py-8 lg:py-12">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1 text-[#8e8e93] text-[13px] mb-6 hover:text-[#1d1d1f] transition-colors">
          <ArrowLeft size={14} />
          返回首页
        </Link>

        {/* Login Card */}
        <div className="rounded-2xl shadow-card bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-[#1d1d1f] px-6 py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl font-semibold">彩</span>
            </div>
            <h1 className="text-white text-lg font-semibold">登录 彩数通</h1>
            <p className="text-white/40 text-[13px] mt-1">手机验证码登录，新用户自动注册</p>
          </div>

          {/* Form */}
          <div className="p-6 lg:p-7">
            {/* Phone input */}
            <div className="mb-4">
              <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">手机号码</label>
              <div className="flex items-center bg-[#f5f5f7] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                <div className="px-3 py-3 flex items-center gap-1.5 shrink-0">
                  <Phone size={14} className="text-[#8e8e93]" />
                  <span className="text-[13px] text-[#8e8e93]">+86</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入手机号码"
                  className="flex-1 px-3 py-3 text-[14px] outline-none text-[#1d1d1f] placeholder:text-[#8e8e93]/50 bg-transparent"
                />
              </div>
            </div>

            {/* Verification code */}
            <div className="mb-4">
              <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">验证码</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-[#f5f5f7] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                  <div className="px-3 py-3 shrink-0">
                    <Shield size={14} className="text-[#8e8e93]" />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6位验证码"
                    maxLength={6}
                    className="flex-1 px-3 py-3 text-[14px] outline-none text-[#1d1d1f] placeholder:text-[#8e8e93]/50 bg-transparent"
                  />
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={!phone || phone.length !== 11 || countdown > 0}
                  className="px-4 py-3 rounded-xl text-[12px] font-medium border border-[#1d1d1f] text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                >
                  {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
                </button>
              </div>
            </div>

            {/* Agreement */}
            <div className="mb-5">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-[#007AFF]"
                />
                <span className="text-[11px] text-[#8e8e93] leading-relaxed">
                  我已阅读并同意
                  <Link href="#" className="text-[#007AFF] hover:underline mx-0.5">《用户协议》</Link>
                  和
                  <Link href="#" className="text-[#007AFF] hover:underline mx-0.5">《隐私政策》</Link>
                </span>
              </label>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={!phone || !code || !agreed}
              className="w-full py-3 rounded-xl bg-[#1d1d1f] text-white text-[14px] font-semibold hover:bg-[#424245] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              登录 / 注册
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#e5e5ea]" />
              <span className="text-[11px] text-[#8e8e93]/50">其他登录方式</span>
              <div className="flex-1 h-px bg-[#e5e5ea]" />
            </div>

            {/* Social login */}
            <div className="flex justify-center gap-4">
              <button className="w-11 h-11 rounded-full bg-[#07c160] flex items-center justify-center text-white text-[13px] font-semibold hover:opacity-90 transition-opacity" title="微信登录">
                微
              </button>
              <button className="w-11 h-11 rounded-full bg-[#1677ff] flex items-center justify-center text-white text-[13px] font-semibold opacity-50 cursor-not-allowed" title="支付宝登录（即将上线）">
                支
              </button>
            </div>

            <p className="text-[11px] text-[#8e8e93]/50 text-center mt-4 leading-relaxed">
              微信 / 支付宝快捷登录即将上线
            </p>
          </div>
        </div>

        {/* Bottom link */}
        <div className="text-center mt-5">
          <Link href="/" className="text-[13px] text-[#8e8e93] hover:text-[#1d1d1f] transition-colors inline-flex items-center gap-1">
            暂不登录，浏览首页
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
