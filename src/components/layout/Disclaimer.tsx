import { DISCLAIMER_TEXT } from '@/lib/constants';

/**
 * Disclaimer — Material Design 3 风格
 *
 * 使用 on-surface-variant 色替代硬编码灰色
 * 使用 MD3 body-small 字体规范
 */
export default function Disclaimer() {
  return (
    <div className="mx-4 mb-6 lg:max-w-[980px] lg:mx-auto lg:px-6">
      <p
        className="md3-body-small leading-relaxed text-center"
        style={{ color: 'var(--md-on-surface-variant)' }}
      >
        {DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
