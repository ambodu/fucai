'use client';

import { useState } from 'react';
import { HOT_QUESTIONS } from '@/lib/constants';

interface HotQuestionsProps {
  onSelect: (question: string) => void;
  disabled: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  recommend: '🎯',
  kill: '✂️',
  number: '#️⃣',
  indicator: '📊',
  special: '⭐',
};

export default function HotQuestions({ onSelect, disabled }: HotQuestionsProps) {
  const [activeCategory, setActiveCategory] = useState(HOT_QUESTIONS[0].id);

  const currentCategory = HOT_QUESTIONS.find(c => c.id === activeCategory) || HOT_QUESTIONS[0];

  return (
    <div className="w-full max-w-[700px] mx-auto">
      {/* Section title */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f]">热门问题</h3>
        <span className="text-[11px] text-[#6e6e73]">点击即可提问</span>
      </div>

      {/* Category tabs - horizontal scroll on mobile */}
      <div className="overflow-x-auto scrollbar-hidden mb-4 -mx-1 px-1">
        <div className="flex gap-2 w-max">
          {HOT_QUESTIONS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              disabled={disabled}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-30 whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-[#0071e3] text-white shadow-sm shadow-[#0071e3]/20'
                  : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#ebebed] active:scale-95'
              }`}
            >
              <span>{CATEGORY_ICONS[cat.id]}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions grid - responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentCategory.questions.map(q => (
          <button
            key={q.id}
            onClick={() => onSelect(q.question)}
            disabled={disabled}
            className="flex items-center gap-3 px-4 py-3.5 bg-[#f5f5f7] rounded-2xl text-left hover:bg-[#0071e3]/[0.06] border border-transparent hover:border-[#0071e3]/15 active:scale-[0.98] transition-all disabled:opacity-30 group"
          >
            <div className="w-9 h-9 rounded-xl bg-white shadow-apple-sm flex items-center justify-center shrink-0">
              <span className="text-base">{q.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors block">{q.label}</span>
              <span className="text-[11px] text-[#6e6e73] line-clamp-1 mt-0.5 block">{q.question}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
