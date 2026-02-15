'use client';

import { DataCard } from '@/types/ai';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DataCardGridProps {
  cards: DataCard[];
}

export default function DataCardGrid({ cards }: DataCardGridProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white shadow-apple-sm rounded-2xl p-4"
        >
          <div className="text-xs text-[#6e6e73] mb-1">{card.label}</div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{card.value}</div>
          {(card.sub || card.trend) && (
            <div className="flex items-center gap-1 mt-1.5">
              {card.trend === 'up' && <TrendingUp size={12} className="text-[#10b981]" />}
              {card.trend === 'down' && <TrendingDown size={12} className="text-[#ef4444]" />}
              {card.trend === 'neutral' && <Minus size={12} className="text-[#6e6e73]" />}
              {card.sub && (
                <span className={`text-[11px] ${
                  card.trend === 'up' ? 'text-[#10b981]' :
                  card.trend === 'down' ? 'text-[#ef4444]' :
                  'text-[#6e6e73]'
                }`}>
                  {card.sub}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
