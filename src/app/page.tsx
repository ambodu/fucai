import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';
import Disclaimer from '@/components/layout/Disclaimer';
import HeroSection from '@/components/home/HeroSection';
import DataTicker from '@/components/home/DataTicker';
import FeatureCards from '@/components/home/FeatureCards';
import AIDemo from '@/components/home/AIDemo';
import StatsOverview from '@/components/home/StatsOverview';
import Link from 'next/link';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { TREND_NAV_ITEMS } from '@/lib/constants';
import FC3DBall from '@/components/lottery/FC3DBall';
import { formatPeriod } from '@/utils/format';

export default function Home() {
  const recentDraws = mockDraws.slice(1, 6);

  return (
    <div className="min-h-screen pb-[52px] lg:pb-0 bg-white">
      <Navbar />
      <HeroSection />

      {/* Navigation cards */}
      <div className="py-8 lg:py-12 bg-[#f5f5f7]">
        <DataTicker />
      </div>

      {/* Stats */}
      <div className="pt-8 lg:pt-12">
        <FeatureCards />
      </div>

      <AIDemo />

      {/* Two Column: Recent Draws + Trend Nav */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-5">
          {/* Recent Draws */}
          <div className="mb-5 lg:mb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="apple-section-title">近期开奖</h2>
              <Link href="/data" className="text-[13px] text-[#E13C39] hover:underline font-medium">
                查看全部 &rsaquo;
              </Link>
            </div>
            <div className="apple-card overflow-hidden">
              {recentDraws.map(draw => (
                <div
                  key={draw.period}
                  className="flex items-center justify-between px-4 py-3 border-b border-[#f2f2f7] last:border-b-0 hover:bg-[#f5f5f7] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-[#8e8e93] w-20 shrink-0">{formatPeriod(draw.period)}</span>
                    <div className="flex gap-1.5">
                      <FC3DBall digit={draw.digit1} size="sm" />
                      <FC3DBall digit={draw.digit2} size="sm" />
                      <FC3DBall digit={draw.digit3} size="sm" />
                    </div>
                  </div>
                  <div className="flex gap-4 text-[13px] text-[#8e8e93]">
                    <span>和值<strong className="text-[#1d1d1f] ml-0.5">{draw.sum}</strong></span>
                    <span>跨度<strong className="text-[#1d1d1f] ml-0.5">{draw.span}</strong></span>
                    <span className="hidden sm:inline">{draw.bigSmallPattern}</span>
                    <span className="hidden sm:inline">{draw.oddEvenPattern}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Navigation */}
          <div className="mb-5 lg:mb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="apple-section-title">走势分析</h2>
              <Link href="/trend" className="text-[13px] text-[#E13C39] hover:underline font-medium">
                全部图表 &rsaquo;
              </Link>
            </div>
            <div className="apple-card p-4 lg:p-5">
              <div className="space-y-4">
                {TREND_NAV_ITEMS.map(group => (
                  <div key={group.category}>
                    <div className="text-[12px] text-[#8e8e93] font-semibold mb-2 uppercase tracking-wider">
                      {group.category}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="px-3 py-1.5 bg-[#f5f5f7] hover:bg-[#e5e5ea] rounded-full text-[13px] text-[#1d1d1f] transition-all"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatsOverview />
      <Disclaimer />
      <Footer />
      <MobileTabBar />
    </div>
  );
}
