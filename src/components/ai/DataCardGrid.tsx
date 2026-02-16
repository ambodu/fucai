'use client';

import { DataCard } from '@/types/ai';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DataCardGridProps {
  cards: DataCard[];
}

export default function DataCardGrid({ cards }: DataCardGridProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 mt-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-[#f5f5f7] rounded-xl p-3.5"
        >
          <div className="text-[12px] text-[#8e8e93] mb-1">{card.label}</div>
          <div className="text-xl font-semibold text-[#1d1d1f]">{card.value}</div>
          {(card.sub || card.trend) && (
            <div className="flex items-center gap-1 mt-1.5">
              {card.trend === 'up' && <TrendingUp size={12} className="text-[#34C759]" />}
              {card.trend === 'down' && <TrendingDown size={12} className="text-[#FF3B30]" />}
              {card.trend === 'neutral' && <Minus size={12} className="text-[#8e8e93]" />}
              {card.sub && (
                <span className={`text-[11px] ${
                  card.trend === 'up' ? 'text-[#34C759]' :
                  card.trend === 'down' ? 'text-[#FF3B30]' :
                  'text-[#8e8e93]'
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
