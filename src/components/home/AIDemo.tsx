'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Send, ArrowRight, Loader2, MessageSquare, Zap, Database, ShieldCheck } from 'lucide-react';
import { HOT_QUESTIONS, QUICK_TEMPLATES } from '@/lib/constants';

const STORAGE_KEY = 'cst-chat-history';

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

      setPreview(prev => {
        const updated = [...prev, aiMsg].slice(-3);

        try {
          const existing = localStorage.getItem(STORAGE_KEY);
          const history = existing ? JSON.parse(existing) : [];
          history.push(userMsg, aiMsg);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-100)));
        } catch {
          // ignore
        }

        return updated;
      });
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
    <section className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8 lg:py-10">
      {/* Section header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0071e3]/8 to-[#8b5cf6]/8 mb-4">
          <Sparkles size={14} className="text-[#0071e3]" />
          <span className="text-xs font-semibold text-[#0071e3]">核心功能</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1d1d1f] mb-3">AI 智能选号助手</h2>
        <p className="text-sm lg:text-base text-[#6e6e73] max-w-xl mx-auto">
          基于海量历史数据，结合多维统计分析，为您提供专业的号码推荐、杀号参考与趋势洞察
        </p>
        <div className="flex items-center justify-center gap-4 lg:gap-6 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
            <Zap size={13} className="text-[#0071e3]" />
            <span>秒级响应</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
            <Database size={13} className="text-[#0071e3]" />
            <span>官方数据</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
            <ShieldCheck size={13} className="text-[#0071e3]" />
            <span>多维分析</span>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left: AI Chat Preview */}
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-bold text-[#1d1d1f]">在线体验</h3>
            <Link href="/ai" className="text-xs text-[#0071e3] hover:text-[#0077ed] transition-colors font-medium">
              进入完整对话 ›
            </Link>
          </div>
          <div className="bg-white shadow-apple rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#ebebed] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] flex items-center justify-center">
                  <Sparkles size={15} className="text-white" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1d1d1f]">AI 智能分析</h4>
                  <p className="text-[10px] text-[#6e6e73]">基于历史数据的智能问答</p>
                </div>
              </div>
              <Link
                href="/ai"
                className="flex items-center gap-1 text-[11px] text-[#0071e3] hover:text-[#0077ed] transition-colors font-medium"
              >
                完整对话 <ArrowRight size={11} />
              </Link>
            </div>

            {/* Message area */}
            <div className="px-4 py-3 min-h-[140px] max-h-[220px] overflow-y-auto">
              {preview.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare size={28} className="text-[#ebebed] mx-auto mb-2" />
                  <p className="text-xs text-[#6e6e73]">试试向 AI 提问，或点击右侧热门问题</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {preview.map(msg => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${
                        msg.role === 'assistant'
                          ? 'bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] text-white'
                          : 'bg-[#f5f5f7] text-[#6e6e73]'
                      }`}>
                        {msg.role === 'assistant' ? 'AI' : 'Me'}
                      </div>
                      <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                        msg.role === 'assistant'
                          ? 'bg-[#f5f5f7] text-[#1d1d1f] rounded-tl-sm'
                          : 'bg-[#0071e3] text-white rounded-tr-sm'
                      }`}>
                        <div className="line-clamp-4">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] flex items-center justify-center text-[10px] text-white font-bold">AI</div>
                      <div className="px-3 py-2 rounded-xl rounded-tl-sm bg-[#f5f5f7] text-xs text-[#6e6e73]">
                        <Loader2 size={12} className="animate-spin inline mr-1" />分析中...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick templates */}
            <div className="px-4 py-2.5 flex gap-2 flex-wrap border-t border-[#f5f5f7]">
              {QUICK_TEMPLATES.slice(0, 4).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSend(t.question)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full text-[11px] text-[#6e6e73] border border-[#ebebed] hover:bg-[#0071e3]/8 hover:text-[#0071e3] hover:border-[#0071e3]/20 active:scale-95 transition-all disabled:opacity-30"
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#ebebed] flex gap-2 items-center">
              <div className="flex-1 flex items-center bg-[#f5f5f7] border border-[#ebebed] rounded-xl px-3 py-2.5 gap-1.5 focus-within:border-[#0071e3]/30 transition-all">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#6e6e73]/60 text-[#1d1d1f] disabled:opacity-50"
                  placeholder="问问AI..."
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-[#0071e3] flex items-center justify-center text-white shrink-0 hover:bg-[#0077ed] active:scale-95 transition-all disabled:opacity-30"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Hot Questions → click to go to AI page and auto-ask */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-bold text-[#1d1d1f]">热门问题</h3>
            <Link href="/ai" className="text-xs text-[#0071e3] hover:text-[#0077ed] transition-colors font-medium">
              查看全部 ›
            </Link>
          </div>
          <div className="bg-white shadow-apple rounded-2xl p-5">
            <div className="space-y-4">
              {HOT_QUESTIONS.map(cat => (
                <div key={cat.id}>
                  <div className="text-[11px] text-[#6e6e73] font-semibold mb-2 flex items-center gap-1.5">
                    <span>{CATEGORY_ICONS[cat.id]}</span>
                    {cat.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.questions.slice(0, 3).map(q => (
                      <Link
                        key={q.id}
                        href={`/ai?q=${encodeURIComponent(q.question)}`}
                        className="px-3 py-2 bg-[#f5f5f7] hover:bg-[#0071e3]/8 hover:text-[#0071e3] rounded-xl text-xs text-[#6e6e73] transition-all active:scale-95"
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
