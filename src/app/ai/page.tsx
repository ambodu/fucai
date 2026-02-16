'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import ChatChart from '@/components/chart/ChatChart';
import ChatSidebar from '@/components/ai/ChatSidebar';
import DataCardGrid from '@/components/ai/DataCardGrid';
import PredictionBalls from '@/components/ai/PredictionBalls';
import HotQuestions from '@/components/ai/HotQuestions';
import { useConversations } from '@/hooks/useConversations';
import { HOT_QUESTIONS, AI_DISCLAIMER_TEXT } from '@/lib/constants';
import { ChatMessage, ChartData } from '@/types/ai';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { Send, Loader2, Trash2, Sparkles, MessageSquare, Menu, Zap, ShieldCheck, Database } from 'lucide-react';

const latestPeriod = mockDraws[0]?.period || '---';

function SimpleMarkdown({ content }: { content: string }) {
  const html = useMemo(() => {
    let result = content;
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1d1d1f]">$1</strong>');
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
    result = result.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[#f5f5f7] rounded text-xs text-[#0071e3]">$1</code>');
    result = result.replace(/^### (.+)$/gm, '<div class="text-sm font-semibold text-[#1d1d1f] mt-3 mb-1.5">$1</div>');
    result = result.replace(/^## (.+)$/gm, '<div class="text-base font-semibold text-[#1d1d1f] mt-4 mb-2">$1</div>');
    result = result.replace(/^- (.+)$/gm, '<div class="flex gap-2 ml-1 my-0.5"><span class="text-[#6e6e73] shrink-0">•</span><span>$1</span></div>');
    result = result.replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 ml-1 my-0.5"><span class="text-[#6e6e73] shrink-0">$1.</span><span>$2</span></div>');
    result = result.replace(/^---$/gm, '<hr class="border-[#ebebed] my-3">');
    result = result.replace(/\n\n/g, '</p><p class="mt-2.5">');
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
  const inputRef = useRef<HTMLInputElement>(null);
  const autoAskFired = useRef(false);
  const searchParams = useSearchParams();

  const isEmpty = activeMessages.length === 0 && !isLoading;

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
        content: data.content || data.error || '',
        timestamp: Date.now(),
        disclaimer: true,
        serverCharts: {
          queryType: data.queryType || 'prediction',
          charts: data.charts || [],
          dataCards: data.dataCards || [],
          prediction: data.prediction,
        },
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

  // Auto-ask from URL query parameter (e.g., /ai?q=xxx)
  // Uses a ref to fire only once, and directly performs the send logic
  // to avoid stale closure issues with handleSend
  useEffect(() => {
    if (autoAskFired.current) return;
    if (!initialized || !activeConversationId) return;

    const question = searchParams.get('q');
    if (!question || !question.trim()) return;

    autoAskFired.current = true;
    const text = question.trim();

    // Perform the send directly to avoid closure issues
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setIsLoading(true);

    (async () => {
      try {
        const apiMessages = [{ role: 'user' as const, content: text }];
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
          content: data.content || data.error || '',
          timestamp: Date.now(),
          disclaimer: true,
          serverCharts: {
            queryType: data.queryType || 'prediction',
            charts: data.charts || [],
            dataCards: data.dataCards || [],
            prediction: data.prediction,
          },
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
    })();
  }, [initialized, activeConversationId, searchParams, addMessage]);

  // Flatten all hot questions for the bottom bar quick access
  const allHotQuestions = useMemo(() => {
    return HOT_QUESTIONS.flatMap(cat => cat.questions);
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      {/* Desktop Navbar */}
      <Navbar />

      <div className="flex-1 flex min-h-0">
        {/* Conversation Sidebar */}
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
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Chat Header */}
          <div className="glass border-b border-[#ebebed] sticky top-0 lg:top-12 z-30 shrink-0">
            <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-1 rounded-xl text-[#6e6e73] hover:bg-[#f5f5f7] active:bg-[#ebebed] transition-colors"
                >
                  <Menu size={20} />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] flex items-center justify-center shadow-sm">
                  <Sparkles size={17} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f] leading-tight">AI 智能分析</h3>
                  <div className="text-[11px] text-[#6e6e73] mt-0.5">数据已更新至第 {latestPeriod} 期</div>
                </div>
              </div>
              <button
                onClick={clearActiveConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#6e6e73] hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">清空</span>
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isEmpty ? (
              /* Empty state: immersive full-screen hero + hot questions */
              <div className="flex flex-col min-h-full">
                {/* Hero section */}
                <div className="relative flex flex-col items-center justify-center px-5 pt-8 pb-6 lg:pt-14 lg:pb-10">
                  {/* Background gradient */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-30%] left-[-20%] w-[400px] h-[400px] rounded-full bg-[#0071e3]/[0.04] blur-3xl" />
                    <div className="absolute top-[10%] right-[-15%] w-[350px] h-[350px] rounded-full bg-[#8b5cf6]/[0.04] blur-3xl" />
                  </div>

                  <div className="relative z-10 text-center max-w-lg mx-auto">
                    {/* AI Icon */}
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[22px] bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#0071e3]/20">
                      <Sparkles size={30} className="text-white lg:hidden" />
                      <Sparkles size={36} className="text-white hidden lg:block" />
                    </div>

                    <h2 className="text-xl lg:text-2xl font-bold text-[#1d1d1f] mb-2 tracking-tight">
                      AI 智能选号助手
                    </h2>
                    <p className="text-sm lg:text-[15px] text-[#6e6e73] leading-relaxed mb-6">
                      基于 {mockDraws.length.toLocaleString()}+ 期历史数据，为你提供专业的智能分析建议
                    </p>

                    {/* Trust indicators */}
                    <div className="flex items-center justify-center gap-4 lg:gap-6 mb-6">
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
                </div>

                {/* Hot Questions - full width with scroll */}
                <div className="flex-1 px-4 pb-4 lg:px-6">
                  <HotQuestions onSelect={handleSend} disabled={isLoading} />
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="px-4 py-4 max-w-[900px] mx-auto w-full lg:px-6">
                {/* Disclaimer */}
                <div className="p-3 bg-[#f5f5f7] rounded-xl mb-4">
                  <p className="text-[11px] text-[#6e6e73] leading-relaxed">
                    {AI_DISCLAIMER_TEXT}
                  </p>
                </div>

                {activeMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 mb-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-[11px] font-bold ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] text-white'
                        : 'bg-[#f5f5f7] text-[#6e6e73]'
                    }`}>
                      {msg.role === 'assistant' ? 'AI' : 'Me'}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[82%] ${
                      msg.role === 'assistant'
                        ? 'bg-[#f5f5f7] text-[#1d1d1f] rounded-tl-md'
                        : 'bg-[#0071e3] text-white rounded-tr-md'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <>
                          {msg.serverCharts?.prediction && (
                            <PredictionBalls prediction={msg.serverCharts.prediction} />
                          )}
                          {msg.serverCharts?.charts && msg.serverCharts.charts.length > 0 && (
                            <div className="space-y-3 mb-3">
                              {msg.serverCharts.charts.map((chart: ChartData, i: number) => (
                                <ChatChart key={i} chart={chart} />
                              ))}
                            </div>
                          )}
                          {msg.serverCharts?.dataCards && msg.serverCharts.dataCards.length > 0 && (
                            <DataCardGrid cards={msg.serverCharts.dataCards} />
                          )}
                          {msg.content && <SimpleMarkdown content={msg.content} />}
                        </>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                      {msg.disclaimer && (
                        <div className="text-[10px] text-[#6e6e73]/60 mt-3 pt-2.5 border-t border-[#ebebed] leading-relaxed">
                          {AI_DISCLAIMER_TEXT}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-[11px] bg-gradient-to-br from-[#0071e3] to-[#8b5cf6] text-white font-bold">
                      AI
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-[#f5f5f7] text-sm text-[#6e6e73]">
                      <Loader2 size={15} className="animate-spin inline mr-2" />
                      正在分析数据...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom bar: hot questions + input */}
          <div className="shrink-0 border-t border-[#ebebed] bg-white/95 backdrop-blur-sm pb-[calc(env(safe-area-inset-bottom)+60px)] lg:pb-2">
            {/* Hot questions quick access (when in conversation) */}
            {!isEmpty && (
              <div className="max-w-[900px] mx-auto w-full px-4 lg:px-6 pt-2.5 pb-1 overflow-x-auto scrollbar-hidden">
                <div className="flex gap-2 w-max">
                  {allHotQuestions.slice(0, 10).map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleSend(q.question)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-full text-xs text-[#6e6e73] bg-[#f5f5f7] border border-[#ebebed] hover:bg-[#0071e3]/8 hover:text-[#0071e3] hover:border-[#0071e3]/20 active:scale-95 transition-all disabled:opacity-30 whitespace-nowrap flex items-center gap-1"
                    >
                      <span>{q.icon}</span>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="max-w-[900px] mx-auto w-full px-4 lg:px-6 py-2.5 flex gap-2.5 items-end">
              <div className="flex-1 flex items-center bg-[#f5f5f7] border border-[#ebebed] rounded-2xl px-4 py-3 gap-2.5 focus-within:border-[#0071e3]/40 focus-within:shadow-sm focus-within:shadow-[#0071e3]/5 transition-all">
                <MessageSquare size={16} className="text-[#6e6e73]/70 shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#6e6e73]/50 text-[#1d1d1f] disabled:opacity-50"
                  placeholder="输入问题，如：下期推荐号码..."
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 rounded-2xl bg-[#0071e3] flex items-center justify-center text-white shrink-0 hover:bg-[#0077ed] active:scale-95 transition-all disabled:opacity-30 shadow-sm shadow-[#0071e3]/20"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar />
    </div>
  );
}
