'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Send, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { HOT_QUESTIONS, QUICK_TEMPLATES } from '@/lib/constants';

const CATEGORY_ICONS: Record<string, string> = {
  recommend: '🎯',
  kill: '✂️',
  number: '#️⃣',
  indicator: '📊',
  special: '⭐',
};

interface SimpleChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIDemo() {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<SimpleChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async (question?: string) => {
    const text = question || input.trim();
    if (!text || isLoading) return;

    const userMsg: SimpleChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setPreview(prev => [...prev.slice(-2), userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '请求失败');

      const aiMsg: SimpleChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };

      setPreview(prev => [...prev, aiMsg].slice(-3));
    } catch {
      const errorMsg: SimpleChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: '查询出错，请稍后重试。',
        timestamp: Date.now(),
      };
      setPreview(prev => [...prev, errorMsg].slice(-3));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <section className="max-w-[980px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="apple-section-title">AI 智能分析</h2>
        <Link href="/ai" className="text-[13px] text-[#E13C39] hover:underline font-medium">
          进入完整对话 &rsaquo;
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-5">
        {/* Left: AI Chat Preview */}
        <div className="mb-5 lg:mb-0">
          <div className="apple-card overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#f2f2f7] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1d1d1f] flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[#1d1d1f]">AI 智能分析</h4>
                  <p className="text-[11px] text-[#8e8e93]">基于历史数据的智能问答</p>
                </div>
              </div>
              <Link
                href="/ai"
                className="flex items-center gap-1 text-[12px] text-[#E13C39] font-medium hover:underline"
              >
                完整对话 <ArrowRight size={11} />
              </Link>
            </div>

            {/* Message area */}
            <div className="px-4 py-4 min-h-[140px] max-h-[220px] overflow-y-auto">
              {preview.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare size={24} className="text-[#e5e5ea] mx-auto mb-2" />
                  <p className="text-[13px] text-[#8e8e93]">试试向 AI 提问，或点击右侧热门问题</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {preview.map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-semibold ${
                        msg.role === 'assistant'
                          ? 'bg-[#1d1d1f] text-white'
                          : 'bg-[#f5f5f7] text-[#8e8e93]'
                      }`}>
                        {msg.role === 'assistant' ? 'AI' : 'Me'}
                      </div>
                      <div className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed max-w-[85%] ${
                        msg.role === 'assistant'
                          ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                          : 'bg-[#1d1d1f] text-white'
                      }`}>
                        <div className="line-clamp-4">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#1d1d1f] flex items-center justify-center text-[10px] text-white font-semibold">AI</div>
                      <div className="px-3 py-2 rounded-2xl bg-[#f5f5f7] text-[13px] text-[#8e8e93]">
                        <Loader2 size={12} className="animate-spin inline mr-1" />分析中...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick templates */}
            <div className="px-4 py-2.5 flex gap-2 flex-wrap border-t border-[#f2f2f7]">
              {QUICK_TEMPLATES.slice(0, 4).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSend(t.question)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full text-[12px] text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-all disabled:opacity-30"
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#f2f2f7] flex gap-2 items-center">
              <div className="flex-1 flex items-center bg-[#f5f5f7] rounded-full px-4 py-2 gap-1.5 focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#8e8e93]/60 text-[#1d1d1f] disabled:opacity-50"
                  placeholder="问问AI..."
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-white shrink-0 hover:bg-[#424245] transition-all disabled:opacity-30"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Hot Questions */}
        <div>
          <div className="apple-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f2f2f7]">
              <h3 className="text-[13px] font-semibold text-[#1d1d1f]">热门问题</h3>
            </div>
            <div className="p-4 space-y-4">
              {HOT_QUESTIONS.map(cat => (
                <div key={cat.id}>
                  <div className="text-[12px] text-[#8e8e93] font-semibold mb-2 flex items-center gap-1">
                    <span>{CATEGORY_ICONS[cat.id]}</span>
                    {cat.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.questions.slice(0, 3).map(q => (
                      <Link
                        key={q.id}
                        href={`/ai?q=${encodeURIComponent(q.question)}`}
                        className="px-3 py-1.5 bg-[#f5f5f7] hover:bg-[#e5e5ea] rounded-full text-[12px] text-[#1d1d1f] transition-all"
                      >
                        {q.icon} {q.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
