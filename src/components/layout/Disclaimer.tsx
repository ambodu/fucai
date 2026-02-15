import { DISCLAIMER_TEXT } from '@/lib/constants';
import { Info } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="mx-4 mb-4 lg:max-w-[1200px] lg:mx-auto lg:px-6">
      <div className="bg-[#f5f5f7] rounded-2xl p-4 flex gap-3">
        <Info size={16} className="text-[#6e6e73] shrink-0 mt-0.5" />
        <p className="text-[11px] lg:text-xs text-[#6e6e73] leading-relaxed">
          {DISCLAIMER_TEXT}
        </p>
      </div>
    </div>
  );
}
