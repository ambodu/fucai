'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ChatChart from '@/components/chart/ChatChart';
import ChatSidebar from '@/components/ai/ChatSidebar';
import DataCardGrid from '@/components/ai/DataCardGrid';
import { useConversations } from '@/hooks/useConversations';
import { QUICK_TEMPLATES, AI_DISCLAIMER_TEXT } from '@/lib/constants';
import { ChatMessage, ChartData } from '@/types/ai';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { Send, Loader2, Trash2, Sparkles, MessageSquare, Menu } from 'lucide-react';

const latestPeriod = mockDraws[0]?.period || '---';

function SimpleMarkdown({ content }: { content: string }) {
  const html = useMemo(() => {
    let result = content;
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1d1d1f]">$1</strong>');
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
    result = result.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-[#f5f5f7] rounded text-xs text-[#0071e3]">$1</code>');
    result = result.replace(/^### (.+)$/gm, '<div class="text-sm font-semibold text-[#1d1d1f] mt-3 mb-1">$1</div>');
    result = result.replace(/^## (.+)$/gm, '<div class="text-base font-semibold text-[#1d1d1f] mt-3 mb-1">$1</div>');
    result = result.replace(/^- (.+)$/gm, '<div class="flex gap-1.5 ml-1"><span class="text-[#6e6e73] shrink-0">•</span><span>$1</span></div>');
    result = result.replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-1.5 ml-1"><span class="text-[#6e6e73] shrink-0">$1.</span><span>$2</span></div>');
    result = result.replace(/^---$/gm, '<hr class="border-[#ebebed] my-2">');
    result = result.replace(/\n\n/g, '</p><p class="mt-2">');
    result = result.replace(/\n/g, '<br>');
    return `<p>${result}</p>`;
  }, [content]);

  return <div className="prose-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function AIPage() {
  const {
    conversations,
    activeConversationId,
    activeMessages,
    initialized,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    clearActiveConversation,
  } = useConversations();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Auto-create first conversation
  useEffect(() => {
    if (initialized && conversations.length === 0 && !activeConversationId) {
      createConversation();
    }
  }, [initialized, conversations.length, activeConversationId, createConversation]);

  const handleSend = useCallback(async (question?: string) => {
    const text = question || input.trim();
    if (!text || isLoading) return;

    // Ensure we have an active conversation
    if (!activeConversationId) {
      createConversation();
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = activeMessages
        .filter(m => m.id !== '0')
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
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
        dataCards: data.dataCards || undefined,
      };
      addMessage(aiMsg);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `查询出错：${err instanceof Error ? err.message : '未知错误'}。请稍后重试。`,
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeMessages, activeConversationId, addMessage, createConversation]);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={switchConversation}
        onCreate={createConversation}
        onDelete={deleteConversation}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="glass border-b border-[#ebebed] sticky top-0 z-40">
          <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1d1d1f]">AI 智能分析</h3>
                <div className="text-[11px] text-[#6e6e73]">数据更新至第{latestPeriod}期</div>
              </div>
            </div>
            <button
              onClick={clearActiveConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#6e6e73] hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              清空
            </button>
          </div>
        </div>

        {/* Notice */}
        <div className="max-w-[900px] mx-auto w-full px-4 lg:px-6 mt-3">
          <div className="p-3 bg-[#f5f5f7] rounded-xl">
            <p className="text-[11px] text-[#6e6e73] leading-relaxed">
              {AI_DISCLAIMER_TEXT}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-[900px] mx-auto w-full lg:px-6">
          {activeMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-medium ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] text-white'
                  : 'bg-[#f5f5f7] text-[#6e6e73]'
              }`}>
                {msg.role === 'assistant' ? 'AI' : 'Me'}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[82%] ${
                msg.role === 'assistant'
                  ? 'bg-[#f5f5f7] text-[#1d1d1f] rounded-tl-sm'
                  : 'bg-[#0071e3] text-white rounded-tr-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <>
                    <SimpleMarkdown content={msg.content} />
                    {msg.dataCards && msg.dataCards.length > 0 && (
                      <DataCardGrid cards={msg.dataCards} />
                    )}
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
                  <div className="text-[10px] text-[#6e6e73]/60 mt-2 pt-2 border-t border-[#ebebed] leading-relaxed">
                    {AI_DISCLAIMER_TEXT}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] text-white">
                AI
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#f5f5f7] text-sm text-[#6e6e73]">
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
              className="px-3 py-1.5 rounded-full text-[11px] text-[#6e6e73] bg-[#f5f5f7] border border-[#ebebed] hover:bg-[#0071e3]/8 hover:text-[#0071e3] hover:border-[#0071e3]/20 transition-colors disabled:opacity-30"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="max-w-[900px] mx-auto w-full px-4 lg:px-6 py-3 flex gap-2.5 items-center mb-[70px] lg:mb-0">
          <div className="flex-1 flex items-center bg-[#f5f5f7] border border-[#ebebed] rounded-2xl px-4 py-3 gap-2 focus-within:border-[#0071e3]/30 transition-all">
            <MessageSquare size={16} className="text-[#6e6e73] shrink-0" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#6e6e73]/60 text-[#1d1d1f] disabled:opacity-50"
              placeholder="问问 AI 任何数据问题..."
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-2xl bg-[#0071e3] flex items-center justify-center text-white shrink-0 hover:bg-[#0077ed] transition-colors disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
