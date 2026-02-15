import { DISCLAIMER_TEXT } from '@/lib/constants';

export default function Disclaimer() {
  return (
    <div className="mx-4 mb-4 lg:max-w-[1200px] lg:mx-auto lg:px-6">
      <div className="bg-[#13161b] rounded-xl p-4 border-l-[3px] border-[#7434f3]">
        <p className="text-[11px] lg:text-xs text-gray-500 leading-relaxed">
          {DISCLAIMER_TEXT}
        </p>
      </div>
    </div>
  );
}
