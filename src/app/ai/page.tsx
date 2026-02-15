'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import ChatChart from '@/components/chart/ChatChart';
import { QUICK_TEMPLATES, AI_DISCLAIMER_TEXT } from '@/lib/constants';
import { ChatMessage, ChartData } from '@/types/ai';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { Send, Loader2, Trash2, Sparkles, MessageSquare } from 'lucide-react';

const latestPeriod = mockDraws[0]?.period || '---';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '0',
    role: 'assistant',
    content: `您好！我是福彩3D智能分析助手。我可以帮您：

- **查询数据**：号码频率、遗漏统计、和值分布等
- **分析走势**：冷热号码、形态趋势、跨度规律等
- **参考建议**：基于历史数据统计给出下期号码参考

所有分析结果将以**图表+文字**的形式呈现，请问有什么想了解的？`,
    timestamp: Date.now(),
  },
];

function SimpleMarkdown({ content }: { content: string }) {
  const html = useMemo(() => {
    let result = content;
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
    result = result.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-white/10 rounded text-xs text-[#7434f3]">$1</code>');
    result = result.replace(/^### (.+)$/gm, '<div class="text-sm font-semibold text-gray-200 mt-3 mb-1">$1</div>');
    result = result.replace(/^## (.+)$/gm, '<div class="text-base font-semibold text-gray-200 mt-3 mb-1">$1</div>');
    result = result.replace(/^- (.+)$/gm, '<div class="flex gap-1.5 ml-1"><span class="text-gray-500 shrink-0">•</span><span>$1</span></div>');
    result = result.replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-1.5 ml-1"><span class="text-gray-500 shrink-0">$1.</span><span>$2</span></div>');
    result = result.replace(/^---$/gm, '<hr class="border-white/5 my-2">');
    result = result.replace(/\n\n/g, '</p><p class="mt-2">');
    result = result.replace(/\n/g, '<br>');
    return `<p>${result}</p>`;
  }, [content]);

  return <div className="prose-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const text = question || input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, chartMode: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        disclaimer: true,
        charts: data.charts || undefined,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `查询出错：${err instanceof Error ? err.message : '未知错误'}。请稍后重试。`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e11]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#13161b] border-b border-white/5">
        <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7434f3] to-[#9b59b6] flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AI 智能分析</h3>
              <div className="text-[11px] text-gray-500">数据更新至第{latestPeriod}期</div>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-[#e74c3c] hover:bg-[#e74c3c]/10 transition-colors"
          >
            <Trash2 size={14} />
            清空对话
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="max-w-[900px] mx-auto w-full px-4 lg:px-6 mt-3">
        <div className="p-3 bg-[#7434f3]/5 border border-[#7434f3]/10 rounded-xl">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {AI_DISCLAIMER_TEXT}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-[900px] mx-auto w-full lg:px-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-medium ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-[#7434f3] to-[#9b59b6] text-white'
                : 'bg-white/10 text-gray-400'
            }`}>
              {msg.role === 'assistant' ? 'AI' : 'Me'}
            </div>
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[82%] ${
              msg.role === 'assistant'
                ? 'bg-[#13161b] border border-white/5 text-gray-300 rounded-tl-sm'
                : 'bg-[#7434f3]/10 text-gray-300 rounded-tr-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <>
                  <SimpleMarkdown content={msg.content} />
                  {msg.charts && msg.charts.length > 0 && (
                    <div className="space-y-3">
                      {msg.charts.map((chart: ChartData, i: number) => (
                        <ChatChart key={i} chart={chart} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
              {msg.disclaimer && (
                <div className="text-[10px] text-gray-600 mt-2 pt-2 border-t border-white/5 leading-relaxed">
                  {AI_DISCLAIMER_TEXT}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs bg-gradient-to-br from-[#7434f3] to-[#9b59b6] text-white">
              AI
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#13161b] border border-white/5 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin inline mr-1.5" />
              正在分析数据...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Templates */}
      <div className="max-w-[900px] mx-auto w-full px-4 lg:px-6 py-2 flex gap-1.5 flex-wrap">
        {QUICK_TEMPLATES.slice(0, 6).map(t => (
          <button
            key={t.id}
            onClick={() => handleSend(t.question)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full text-[11px] text-gray-500 bg-white/5 border border-white/5 hover:bg-[#7434f3]/10 hover:text-[#7434f3] hover:border-[#7434f3]/20 transition-colors disabled:opacity-30"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="max-w-[900px] mx-auto w-full px-4 lg:px-6 py-3 flex gap-2.5 items-center mb-[70px] lg:mb-0">
        <div className="flex-1 flex items-center bg-[#13161b] border border-white/5 rounded-2xl px-4 py-3 gap-2 focus-within:border-[#7434f3]/30 transition-all">
          <MessageSquare size={16} className="text-gray-600 shrink-0" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-600 text-gray-200 disabled:opacity-50"
            placeholder="问问 AI 任何数据问题..."
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7434f3] to-[#9b59b6] flex items-center justify-center text-white shrink-0 hover:opacity-90 transition-opacity disabled:opacity-30"
        >
          <Send size={16} />
        </button>
      </div>

      <MobileTabBar />
    </div>
  );
}
