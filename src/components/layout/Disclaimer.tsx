import { DISCLAIMER_TEXT } from '@/lib/constants';

export default function Disclaimer() {
  return (
    <div className="mx-4 mb-6 lg:max-w-[980px] lg:mx-auto lg:px-6">
      <p className="text-[13px] text-[#8e8e93] leading-relaxed text-center">
        {DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
