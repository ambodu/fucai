'use client';

import { useState, useRef, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import ChatSidebar from '@/components/ai/ChatSidebar';
import HotQuestions from '@/components/ai/HotQuestions';
import MarkdownRenderer from '@/components/ai/MarkdownRenderer';
import { useConversations } from '@/hooks/useConversations';
import { HOT_QUESTIONS, AI_DISCLAIMER_TEXT } from '@/lib/constants';
import { ChatMessage } from '@/types/ai';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { Send, Loader2, Trash2, Sparkles, MessageSquare, Menu, Square } from 'lucide-react';

const latestPeriod = mockDraws[0]?.period || '---';

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
    updateMessage,
    clearActiveConversation,
  } = useConversations();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoAskFired = useRef(false);
  const streamControllerRef = useRef<AbortController | null>(null);
  const searchParams = useSearchParams();

  const isEmpty = activeMessages.length === 0 && !isLoading;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom(streamingText ? 'auto' : 'smooth');
    }
  }, [activeMessages, streamingText, scrollToBottom]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceToBottom < 100;
  }, []);

  useEffect(() => {
    if (initialized && conversations.length === 0 && !activeConversationId) {
      createConversation();
    }
  }, [initialized, conversations.length, activeConversationId, createConversation]);

  const stopStreaming = useCallback(() => {
    streamControllerRef.current?.abort();
    streamControllerRef.current = null;
    setIsLoading(false);
    setStreamingMessageId(null);
    setStreamingText('');
  }, []);

  // Shared streaming function
  const streamAIResponse = useCallback(async (
    apiMessages: Array<{ role: string; content: string }>,
    aiMsgId: string,
  ) => {
    const controller = new AbortController();
    streamControllerRef.current = controller;

    const res = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      let errorMsg = `请求失败 (${res.status})`;
      try {
        const dataMatch = text.match(/data:\s*({.*})/);
        if (dataMatch) {
          const parsed = JSON.parse(dataMatch[1]);
          if (parsed.error) errorMsg = parsed.error;
        }
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    if (!res.body) {
      throw new Error('AI 流式响应不可用，请稍后重试');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedText = '';

    const processEvent = (chunk: string) => {
      const lines = chunk.split('\n');
      let eventType = '';
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('event: ')) eventType = line.slice(7);
        else if (line.startsWith('data: ')) dataLines.push(line.slice(6));
      }

      if (!eventType || dataLines.length === 0) return;

      const eventData = dataLines.join('\n');
      const data = JSON.parse(eventData);

      if (eventType === 'text') {
        accumulatedText += data.text || '';
        setStreamingText(accumulatedText);
        updateMessage(aiMsgId, { content: accumulatedText });
      } else if (eventType === 'done') {
        updateMessage(aiMsgId, {
          content: accumulatedText,
          disclaimer: true,
        }, true);
      } else if (eventType === 'error') {
        throw new Error(data.error || '未知错误');
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        if (!part.trim()) continue;
        processEvent(part);
      }
    }

    const flush = decoder.decode();
    if (flush) {
      buffer += flush;
    }
    if (buffer.trim()) {
      processEvent(buffer);
    }

    if (accumulatedText) {
      updateMessage(aiMsgId, { content: accumulatedText, disclaimer: true }, true);
    }
  }, [updateMessage]);

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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    const aiMsgId = String(Date.now() + 1);
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(aiMsg);
    setStreamingMessageId(aiMsgId);
    setStreamingText('');
    shouldAutoScrollRef.current = true;

    try {
      const apiMessages = activeMessages
        .filter(m => m.id !== '0')
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }));

      await streamAIResponse(apiMessages, aiMsgId);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        updateMessage(aiMsgId, {
          content: streamingText || '已停止生成，你可以继续追问。',
          disclaimer: !!streamingText,
        }, true);
      } else {
        updateMessage(aiMsgId, {
          content: `查询出错：${err instanceof Error ? err.message : '未知错误'}。请稍后重试。`,
        }, true);
      }
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      setStreamingText('');
      streamControllerRef.current = null;
    }
  }, [input, isLoading, activeConversationId, createConversation, addMessage, activeMessages, streamAIResponse, updateMessage, streamingText]);

  const autoResizeInput = useCallback((value: string) => {
    setInput(value);
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  useEffect(() => {
    if (!initialized || autoAskFired.current || isLoading) return;

    const q = searchParams.get('q')?.trim();
    if (!q) return;

    autoAskFired.current = true;
    (async () => {
      try {
        await handleSend(q);
      } catch (err) {
        const aiMsgId = String(Date.now() + 1);
        addMessage({
          id: aiMsgId,
          role: 'assistant',
          content: `查询出错：${err instanceof Error ? err.message : '未知错误'}。请稍后重试。`,
          timestamp: Date.now(),
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [initialized, isLoading, searchParams, handleSend, addMessage]);

  const allHotQuestions = useMemo(() => {
    return HOT_QUESTIONS.flatMap(cat => cat.questions);
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-b from-[#fffaf9] via-white to-white pb-[50px] lg:pb-0">
      <Navbar />

      <div className="flex-1 flex min-h-0">
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
          <div className="apple-nav sticky top-0 lg:top-11 z-30 shrink-0 border-b border-[#ffe4e2]">
            <div className="max-w-[900px] mx-auto px-3 lg:px-6 py-2.5 lg:py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1.5 -ml-0.5 rounded-lg text-[#8e8e93] hover:bg-[#f5f5f7] transition-colors"
                >
                  <Menu size={18} />
                </button>
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-[#FF5C57] to-[#E13C39] shadow-[0_6px_20px_rgba(225,60,57,0.35)] flex items-center justify-center">
                  <Sparkles size={14} className="text-white lg:hidden" />
                  <Sparkles size={16} className="text-white hidden lg:block" />
                </div>
                <div>
                  <h3 className="text-[13px] lg:text-[14px] font-semibold text-[#1d1d1f] leading-tight">AI 智能分析引擎</h3>
                  <div className="text-[11px] lg:text-[12px] text-[#8e8e93] mt-0.5">实时流式输出 · 数据已更新至第 {latestPeriod} 期</div>
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

          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto overscroll-contain"
          >
            {isEmpty ? (
              <div className="flex flex-col min-h-full">
                <div className="flex flex-col items-center justify-center px-4 pt-8 pb-6 lg:pt-12 lg:pb-8">
                  <div className="text-center max-w-lg mx-auto">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-[#FF5C57] to-[#E13C39] shadow-[0_10px_30px_rgba(225,60,57,0.32)] flex items-center justify-center mx-auto mb-4">
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

                <div className="flex-1 px-3 pb-3 lg:px-6 lg:pb-4">
                  <HotQuestions onSelect={handleSend} disabled={isLoading} />
                </div>
              </div>
            ) : (
              <div className="px-3 py-4 max-w-[900px] mx-auto w-full lg:px-6 lg:py-5">
                <div className="p-3 bg-gradient-to-r from-[#fff5f4] to-[#fff] border border-[#ffe4e2] rounded-xl mb-4">
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
                        ? 'bg-gradient-to-br from-[#FF5C57] to-[#E13C39] text-white shadow-[0_4px_14px_rgba(225,60,57,0.28)]'
                        : 'bg-[#f5f5f7] text-[#8e8e93]'
                    }`}>
                      {msg.role === 'assistant' ? 'AI' : 'Me'}
                    </div>
                    <div className={`px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-2xl text-[13px] lg:text-[14px] leading-relaxed max-w-[90%] lg:max-w-[85%] border ${
                      msg.role === 'assistant'
                        ? 'bg-white text-[#1d1d1f] border-[#f0d7d5] shadow-[0_8px_30px_rgba(225,60,57,0.08)]'
                        : 'bg-[#E13C39] text-white border-transparent'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <>
                          {msg.content && <MarkdownRenderer content={msg.content} />}
                          {isLoading && streamingMessageId === msg.id && (
                            <span className="inline-block w-1.5 h-4 ml-1 bg-[#E13C39]/80 animate-pulse align-middle rounded-sm" />
                          )}
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
                {isLoading && !activeMessages.some(m => m.role === 'assistant' && m.content === '') && (
                  <div className="flex gap-2.5 lg:gap-3 mb-4 lg:mb-5">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] lg:text-[11px] bg-gradient-to-br from-[#FF5C57] to-[#E13C39] text-white font-semibold">
                      AI
                    </div>
                    <div className="px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-2xl bg-white border border-[#f0d7d5] shadow-[0_8px_30px_rgba(225,60,57,0.08)] text-[13px] lg:text-[14px] text-[#8e8e93]">
                      <Loader2 size={14} className="animate-spin inline mr-1.5" />
                      正在分析数据...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[#f1dfdd] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            {!isEmpty && (
              <div className="max-w-[900px] mx-auto w-full px-3 lg:px-6 pt-2 pb-0.5 overflow-x-auto scrollbar-hidden">
                <div className="flex gap-2 w-max">
                  {allHotQuestions.slice(0, 10).map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleSend(q.question)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-full text-[12px] text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ececef] transition-all disabled:opacity-30 whitespace-nowrap flex items-center gap-1"
                    >
                      <span>{q.icon}</span>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-[900px] mx-auto w-full px-3 lg:px-6 py-2 flex gap-2 items-end">
              <div className="flex-1 flex items-end bg-[#f5f5f7] rounded-2xl px-3.5 py-2.5 lg:px-4 lg:py-3 gap-2.5 focus-within:ring-2 focus-within:ring-[#E13C39]/20 transition-all border border-transparent focus-within:border-[#f0d7d5]">
                <MessageSquare size={15} className="text-[#8e8e93]/70 shrink-0 mb-1" />
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={e => autoResizeInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent text-[13px] lg:text-[14px] outline-none placeholder:text-[#8e8e93]/50 text-[#1d1d1f] resize-none max-h-[140px]"
                  placeholder="输入问题（Enter 发送，Shift+Enter 换行）..."
                />
              </div>
              {isLoading ? (
                <button
                  onClick={stopStreaming}
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#1d1d1f] flex items-center justify-center text-white shrink-0 hover:bg-black transition-all"
                  title="停止生成"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-br from-[#FF5C57] to-[#E13C39] flex items-center justify-center text-white shrink-0 hover:brightness-95 transition-all disabled:opacity-30"
                >
                  <Send size={15} />
                </button>
              )}
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
