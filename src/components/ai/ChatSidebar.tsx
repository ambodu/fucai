'use client';

import { ConversationMeta } from '@/types/ai';
import { Plus, Trash2, MessageSquare, X } from 'lucide-react';

interface ChatSidebarProps {
  conversations: ConversationMeta[];
  activeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

function SidebarContent({ conversations, activeId, onSelect, onCreate, onDelete }: Omit<ChatSidebarProps, 'isOpen' | 'onClose'>) {
  return (
    <div className="flex flex-col h-full">
      {/* New conversation button */}
      <div className="p-3">
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] text-white rounded-full py-2.5 text-[13px] font-medium hover:bg-[#424245] transition-colors"
        >
          <Plus size={16} />
          新对话
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={24} className="text-[#e5e5ea] mx-auto mb-2" />
            <p className="text-[13px] text-[#8e8e93]">暂无对话</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  activeId === conv.id
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] truncate ${
                      activeId === conv.id ? 'font-semibold text-[#1d1d1f]' : 'text-[#1d1d1f]'
                    }`}>
                      {conv.title}
                    </div>
                    <div className="text-[11px] text-[#8e8e93] mt-0.5">
                      {formatRelativeTime(conv.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#8e8e93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-all shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {conv.preview && (
                  <p className="text-[11px] text-[#8e8e93]/70 mt-1 line-clamp-1">{conv.preview}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatSidebar({ conversations, activeId, isOpen, onClose, onSelect, onCreate, onDelete }: ChatSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[280px] bg-[#f5f5f7] border-r border-[#e5e5ea] shrink-0 h-[calc(100dvh-44px)] sticky top-11">
        <SidebarContent
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
          onCreate={onCreate}
          onDelete={onDelete}
        />
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
          {/* Drawer */}
          <div className="relative w-[280px] bg-[#f5f5f7] h-full animate-slide-in-left">
            <div className="flex items-center justify-between px-3 pt-3">
              <span className="text-[14px] font-semibold text-[#1d1d1f]">对话历史</span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8e8e93] hover:bg-white/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent
              conversations={conversations}
              activeId={activeId}
              onSelect={(id) => { onSelect(id); onClose(); }}
              onCreate={() => { onCreate(); onClose(); }}
              onDelete={onDelete}
            />
          </div>
        </div>
      )}
    </>
  );
}
