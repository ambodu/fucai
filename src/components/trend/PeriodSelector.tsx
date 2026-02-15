'use client';

interface PeriodSelectorProps {
  value: number;
  onChange: (v: number) => void;
  options?: number[];
}

export default function PeriodSelector({ value, onChange, options = [30, 50, 100] }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500 mr-1">期数:</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            value === opt
              ? 'bg-[#7434f3] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          {opt}期
        </button>
      ))}
    </div>
  );
}
