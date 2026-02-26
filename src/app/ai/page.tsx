'use client';

import { useState, useRef, useEffect, useMemo, useCallback, Suspense } from 'react';
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
import { Send, Loader2, Trash2, Sparkles, MessageSquare, Menu } from 'lucide-react';

const latestPeriod = mockDraws[0]?.period || '---';

function SimpleMarkdown({ content }: { content: string }) {
  const html = useMemo(() => {
    // Escape HTML entities first to prevent XSS
    let result = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    // Then apply markdown formatting on the safe string
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1d1d1f]">$1</strong>');
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
    result = result.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-[#f5f5f7] rounded text-[12px] text-[#007AFF]">$1</code>');
    result = result.replace(/^### (.+)$/gm, '<div class="text-[14px] font-semibold text-[#1d1d1f] mt-3 mb-1.5">$1</div>');
    result = result.replace(/^## (.+)$/gm, '<div class="text-base font-semibold text-[#1d1d1f] mt-4 mb-2">$1</div>');
    result = result.replace(/^- (.+)$/gm, '<div class="flex gap-2 ml-1 my-0.5"><span class="text-[#8e8e93] shrink-0">•</span><span>$1</span></div>');
    result = result.replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 ml-1 my-0.5"><span class="text-[#8e8e93] shrink-0">$1.</span><span>$2</span></div>');
    result = result.replace(/^---$/gm, '<hr class="border-[#e5e5ea] my-3">');
    result = result.replace(/\n\n/g, '</p><p class="mt-2">');
    result = result.replace(/\n/g, '<br>');
    return `<p>${result}</p>`;
  }, [content]);

  return <div className="prose-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

function AIPageContent() {
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

  useEffect(() => {
    if (initialized && conversations.length === 0 && !activeConversationId) {
      createConversation();
    }
  }, [initialized, conversations.length, activeConversationId, createConversation]);

  const handleSend = useCallback(async (question?: string) => {
    const text = question || input.trim();
    if (!text || isLoading) return;

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
        content: data.content || '',
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

  useEffect(() => {
    if (autoAskFired.current) return;
    if (!initialized || !activeConversationId) return;

    const question = searchParams.get('q');
    if (!question || !question.trim()) return;

    autoAskFired.current = true;
    const text = question.trim();

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
          content: data.content || '',
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

  const allHotQuestions = useMemo(() => {
    return HOT_QUESTIONS.flatMap(cat => cat.questions);
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex min-h-0 relative">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={switchConversation}
          onCreate={createConversation}
          onDelete={deleteConversation}
        />

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Chat Header */}
          <div className="apple-nav sticky top-0 lg:top-11 z-30 shrink-0">
            <div className="max-w-[900px] mx-auto px-3 lg:px-6 py-2.5 lg:py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1.5 -ml-0.5 rounded-lg text-[#8e8e93] hover:bg-[#f5f5f7] transition-colors"
                >
                  <Menu size={18} />
                </button>
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[#1d1d1f] flex items-center justify-center">
                  <Sparkles size={14} className="text-white lg:hidden" />
                  <Sparkles size={16} className="text-white hidden lg:block" />
                </div>
                <div>
                  <h3 className="text-[13px] lg:text-[14px] font-semibold text-[#1d1d1f] leading-tight">AI 智能分析</h3>
                  <div className="text-[11px] lg:text-[12px] text-[#8e8e93] mt-0.5">数据已更新至第 {latestPeriod} 期</div>
                </div>
              </div>
              <button
                onClick={clearActiveConversation}
                className="flex items-center gap-1 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full text-[12px] lg:text-[13px] text-[#8e8e93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">清空</span>
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isEmpty ? (
              <div className="flex flex-col min-h-full">
                {/* Hero section */}
                <div className="flex flex-col items-center justify-center px-4 pt-8 pb-6 lg:pt-12 lg:pb-8">
                  <div className="text-center max-w-lg mx-auto">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[#1d1d1f] flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={24} className="text-white lg:hidden" />
                      <Sparkles size={28} className="text-white hidden lg:block" />
                    </div>
                    <h2 className="text-lg lg:text-xl font-semibold text-[#1d1d1f] mb-1.5">
                      AI 智能选号助手
                    </h2>
                    <p className="text-[13px] lg:text-[14px] text-[#8e8e93] leading-relaxed mb-5">
                      基于 {mockDraws.length.toLocaleString()}+ 期历史数据，为你提供专业的智能分析建议
                    </p>
                  </div>
                </div>

                {/* Hot Questions */}
                <div className="flex-1 px-3 pb-3 lg:px-6 lg:pb-4">
                  <HotQuestions onSelect={handleSend} disabled={isLoading} />
                </div>
              </div>
            ) : (
              <div className="px-3 py-4 max-w-[900px] mx-auto w-full lg:px-6 lg:py-5">
                {/* Disclaimer */}
                <div className="p-3 bg-[#f5f5f7] rounded-xl mb-4">
                  <p className="text-[11px] lg:text-[12px] text-[#8e8e93] leading-relaxed">
                    {AI_DISCLAIMER_TEXT}
                  </p>
                </div>

                {activeMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 lg:gap-3 mb-4 lg:mb-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] lg:text-[11px] font-semibold ${
                      msg.role === 'assistant'
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-[#f5f5f7] text-[#8e8e93]'
                    }`}>
                      {msg.role === 'assistant' ? 'AI' : 'Me'}
                    </div>
                    <div className={`px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-2xl text-[13px] lg:text-[14px] leading-relaxed max-w-[85%] lg:max-w-[82%] ${
                      msg.role === 'assistant'
                        ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                        : 'bg-[#1d1d1f] text-white'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <>
                          {msg.serverCharts?.prediction && (
                            <PredictionBalls prediction={msg.serverCharts.prediction} />
                          )}
                          {msg.serverCharts?.charts && msg.serverCharts.charts.length > 0 && (
                            <div className="space-y-2 lg:space-y-3 mb-2 lg:mb-3">
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
                        <div className="text-[10px] text-[#8e8e93]/60 mt-2.5 lg:mt-3 pt-2.5 lg:pt-3 border-t border-[#e5e5ea] leading-relaxed">
                          {AI_DISCLAIMER_TEXT}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2.5 lg:gap-3 mb-4 lg:mb-5">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] lg:text-[11px] bg-[#1d1d1f] text-white font-semibold">
                      AI
                    </div>
                    <div className="px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-2xl bg-[#f5f5f7] text-[13px] lg:text-[14px] text-[#8e8e93]">
                      <Loader2 size={14} className="animate-spin inline mr-1.5" />
                      正在分析数据...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom bar: hot questions + input
              移动端底部需要为 MobileTabBar(50px) 留出空间
              pb-[50px] 确保输入框不被导航栏遮挡 */}
          <div className="shrink-0 border-t border-[#e5e5ea] bg-white pb-[50px] lg:pb-0">
            {!isEmpty && (
              <div className="max-w-[900px] mx-auto w-full px-3 lg:px-6 pt-2 pb-0.5 overflow-x-auto scrollbar-hidden">
                <div className="flex gap-2 w-max">
                  {allHotQuestions.slice(0, 10).map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleSend(q.question)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-full text-[12px] text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-all disabled:opacity-30 whitespace-nowrap flex items-center gap-1"
                    >
                      <span>{q.icon}</span>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="max-w-[900px] mx-auto w-full px-3 lg:px-6 py-2 flex gap-2 items-end">
              <div className="flex-1 flex items-center bg-[#f5f5f7] rounded-full px-4 py-2.5 lg:px-5 lg:py-3 gap-2 focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                <MessageSquare size={14} className="text-[#8e8e93]/70 shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[13px] lg:text-[14px] outline-none placeholder:text-[#8e8e93]/50 text-[#1d1d1f] disabled:opacity-50"
                  placeholder="输入问题，如：下期推荐号码..."
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#1d1d1f] flex items-center justify-center text-white shrink-0 hover:bg-[#424245] transition-all disabled:opacity-30"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense>
      <AIPageContent />
    </Suspense>
  );
}
