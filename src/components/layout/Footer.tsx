import Link from 'next/link';
import { APP_NAME, DISCLAIMER_TEXT } from '@/lib/constants';

/**
 * Footer — Material Design 3 风格
 *
 * MD3 规范:
 * - 使用 surface-container 背景替代硬编码灰色
 * - 文字使用 on-surface / on-surface-variant 语义色
 * - 分割线使用 outline-variant
 * - 链接 hover 使用 on-surface 色
 * - 间距遵循 8pt 网格
 */
export default function Footer() {
  return (
    <footer
      className="hidden lg:block mt-8"
      style={{ background: 'var(--md-surface-container)' }}
    >
      <div className="max-w-[980px] mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="md3-title-medium"
                style={{ color: 'var(--md-on-surface)' }}
              >
                {APP_NAME}
              </span>
            </div>
            <p
              className="md3-body-small max-w-md"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              福彩3D历史数据查询与AI智能分析平台
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4
                className="md3-label-large mb-3"
                style={{ color: 'var(--md-on-surface)' }}
              >
                功能导航
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/ai"
                    className="md3-body-small transition-colors hover:opacity-100"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    AI 智能分析
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trend"
                    className="md3-body-small transition-colors hover:opacity-100"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    走势图表
                  </Link>
                </li>
                <li>
                  <Link
                    href="/data"
                    className="md3-body-small transition-colors hover:opacity-100"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    数据查询
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className="md3-label-large mb-3"
                style={{ color: 'var(--md-on-surface)' }}
              >
                更多服务
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/stats"
                    className="md3-body-small transition-colors hover:opacity-100"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    统计分析
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stats/frequency"
                    className="md3-body-small transition-colors hover:opacity-100"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    号码频率
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* MD3 Divider */}
        <div className="md3-divider mb-5" />
        <p
          className="md3-body-small leading-relaxed"
          style={{ color: 'var(--md-on-surface-variant)' }}
        >
          {DISCLAIMER_TEXT}
        </p>
        <p
          className="md3-body-small mt-3 opacity-60"
          style={{ color: 'var(--md-on-surface-variant)' }}
        >
          &copy; 2025 {APP_NAME}. 数据来源于中国福利彩票官方网站。
        </p>
      </div>
    </footer>
  );
}
