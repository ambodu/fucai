'use client';

interface PeriodSelectorProps {
  value: number;
  onChange: (v: number) => void;
  options?: number[];
}

export default function PeriodSelector({ value, onChange, options = [30, 50, 100] }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-[#f5f5f7] rounded-full p-1">
      <span className="text-[12px] text-[#8e8e93] px-2">期数</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
            value === opt
              ? 'bg-[#E13C39] text-white shadow-sm'
              : 'text-[#8e8e93] hover:text-[#1d1d1f]'
          }`}
        >
          {opt}期
        </button>
      ))}
    </div>
  );
}
