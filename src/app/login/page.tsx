'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { ArrowLeft, Phone, Shield, ChevronRight } from 'lucide-react';

/**
 * LoginPage — Material Design 3 风格登录页
 *
 * MD3 规范:
 * - 使用 surface 作为页面背景
 * - 卡片使用 md3-card-elevated
 * - 输入框使用 MD3 Filled TextField 风格 (surface-container-highest 背景)
 * - 按钮使用 md3-btn-filled / md3-btn-outlined
 * - 色彩全部使用 MD3 语义 token
 * - 间距遵循 8pt 网格
 */
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
      setCountdown((prev) => {
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
    <div
      className="min-h-screen pb-20 lg:pb-0"
      style={{ background: 'var(--md-surface)' }}
    >
      <Navbar />

      <div className="max-w-[420px] mx-auto px-4 py-8 lg:py-12">
        {/* 返回链接 — MD3 Text Button 风格 */}
        <Link
          href="/"
          className="md3-btn-text inline-flex items-center gap-1 mb-6 h-auto px-2 py-1"
        >
          <ArrowLeft size={16} />
          <span className="md3-label-medium">返回首页</span>
        </Link>

        {/* Login Card — MD3 Elevated Card */}
        <div className="md3-card-elevated rounded-2xl overflow-hidden">
          {/* Header — 使用 primary-container 替代纯黑 */}
          <div
            className="px-6 py-8 text-center"
            style={{ background: 'var(--md-primary-container)' }}
          >
            {/* Logo — MD3 Avatar/Icon 风格 */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{
                background: 'var(--md-primary)',
                color: 'var(--md-on-primary)',
              }}
            >
              <span className="text-2xl font-medium">彩</span>
            </div>
            <h1
              className="md3-headline-small font-medium"
              style={{ color: 'var(--md-on-primary-container)' }}
            >
              登录 彩数通
            </h1>
            <p
              className="md3-body-small mt-2"
              style={{ color: 'var(--md-on-primary-container)', opacity: 0.7 }}
            >
              手机验证码登录，新用户自动注册
            </p>
          </div>

          {/* Form */}
          <div
            className="p-6 lg:p-8"
            style={{ background: 'var(--md-surface-container-low)' }}
          >
            {/* Phone input — MD3 Filled TextField */}
            <div className="mb-5">
              <label
                className="md3-label-medium mb-2 block"
                style={{ color: 'var(--md-on-surface)' }}
              >
                手机号码
              </label>
              <div
                className="flex items-center rounded-t-[4px] rounded-b-none overflow-hidden transition-all"
                style={{
                  background: 'var(--md-surface-container-highest)',
                  borderBottom: '2px solid var(--md-on-surface-variant)',
                }}
              >
                <div className="px-3 py-3 flex items-center gap-1.5 shrink-0">
                  <Phone
                    size={16}
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  />
                  <span
                    className="md3-body-medium"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    +86
                  </span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                  }
                  placeholder="请输入手机号码"
                  className="flex-1 px-3 py-3.5 md3-body-large outline-none bg-transparent"
                  style={{
                    color: 'var(--md-on-surface)',
                  }}
                />
              </div>
            </div>

            {/* Verification code — MD3 Filled TextField + Outlined Button */}
            <div className="mb-5">
              <label
                className="md3-label-medium mb-2 block"
                style={{ color: 'var(--md-on-surface)' }}
              >
                验证码
              </label>
              <div className="flex gap-3">
                <div
                  className="flex-1 flex items-center rounded-t-[4px] rounded-b-none overflow-hidden transition-all"
                  style={{
                    background: 'var(--md-surface-container-highest)',
                    borderBottom: '2px solid var(--md-on-surface-variant)',
                  }}
                >
                  <div className="px-3 py-3 shrink-0">
                    <Shield
                      size={16}
                      style={{ color: 'var(--md-on-surface-variant)' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="6位验证码"
                    maxLength={6}
                    className="flex-1 px-3 py-3.5 md3-body-large outline-none bg-transparent"
                    style={{
                      color: 'var(--md-on-surface)',
                    }}
                  />
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={!phone || phone.length !== 11 || countdown > 0}
                  className="md3-btn-outlined shrink-0 whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {countdown > 0
                    ? `${countdown}s`
                    : codeSent
                      ? '重新发送'
                      : '获取验证码'}
                </button>
              </div>
            </div>

            {/* Agreement */}
            <div className="mb-6">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5"
                  style={{ accentColor: 'var(--md-primary)' }}
                />
                <span
                  className="md3-body-small leading-relaxed"
                  style={{ color: 'var(--md-on-surface-variant)' }}
                >
                  我已阅读并同意
                  <Link
                    href="#"
                    className="font-medium mx-0.5"
                    style={{ color: 'var(--md-primary)' }}
                  >
                    《用户协议》
                  </Link>
                  和
                  <Link
                    href="#"
                    className="font-medium mx-0.5"
                    style={{ color: 'var(--md-primary)' }}
                  >
                    《隐私政策》
                  </Link>
                </span>
              </label>
            </div>

            {/* Login button — MD3 Filled Button (full width) */}
            <button
              onClick={handleLogin}
              disabled={!phone || !code || !agreed}
              className="md3-btn-filled w-full h-12 rounded-full md3-label-large disabled:opacity-30 disabled:cursor-not-allowed"
            >
              登录 / 注册
            </button>

            {/* Divider — MD3 style */}
            <div className="flex items-center gap-4 my-8">
              <div className="md3-divider flex-1" />
              <span
                className="md3-label-small"
                style={{ color: 'var(--md-on-surface-variant)', opacity: 0.6 }}
              >
                其他登录方式
              </span>
              <div className="md3-divider flex-1" />
            </div>

            {/* Social login — MD3 Tonal Icon Button 风格 */}
            <div className="flex justify-center gap-4">
              <button
                className="w-12 h-12 rounded-full flex items-center justify-center md3-label-large transition-all hover:shadow-md-1"
                style={{
                  background: '#07c160',
                  color: '#FFFFFF',
                }}
                title="微信登录"
              >
                微
              </button>
              <button
                className="w-12 h-12 rounded-full flex items-center justify-center md3-label-large opacity-40 cursor-not-allowed"
                style={{
                  background: 'var(--md-surface-container-highest)',
                  color: 'var(--md-on-surface-variant)',
                }}
                title="支付宝登录（即将上线）"
              >
                支
              </button>
            </div>

            <p
              className="md3-body-small text-center mt-4 opacity-60"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              微信 / 支付宝快捷登录即将上线
            </p>
          </div>
        </div>

        {/* Bottom link — MD3 Text Button */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="md3-btn-text inline-flex items-center gap-1"
          >
            暂不登录，浏览首页
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
