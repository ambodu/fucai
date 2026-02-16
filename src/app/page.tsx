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
    <div className="min-h-screen pb-[68px] lg:pb-0 bg-white">
      <Navbar />
      <HeroSection />
      <DataTicker />
      <AIDemo />
      <FeatureCards />

      {/* Two Column: Recent Draws + Trend Nav */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8 lg:py-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Recent Draws */}
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1d1d1f]">近期开奖</h2>
              <Link href="/data" className="text-xs text-[#0071e3] hover:text-[#0077ed] transition-colors font-medium">
                查看全部 ›
              </Link>
            </div>
            <div className="bg-white shadow-apple rounded-2xl overflow-hidden">
              {recentDraws.map(draw => (
                <div
                  key={draw.period}
                  className="flex items-center justify-between px-4 py-3.5 border-b border-[#f5f5f7] last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#6e6e73] w-20 shrink-0">{formatPeriod(draw.period)}</span>
                    <div className="flex gap-1.5">
                      <FC3DBall digit={draw.digit1} size="sm" />
                      <FC3DBall digit={draw.digit2} size="sm" />
                      <FC3DBall digit={draw.digit3} size="sm" />
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-[#6e6e73]">
                    <span>和值<strong className="text-[#0071e3] ml-0.5">{draw.sum}</strong></span>
                    <span>跨度<strong className="text-[#0071e3] ml-0.5">{draw.span}</strong></span>
                    <span className="hidden sm:inline">{draw.bigSmallPattern}</span>
                    <span className="hidden sm:inline">{draw.oddEvenPattern}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Navigation */}
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1d1d1f]">走势分析</h2>
              <Link href="/trend" className="text-xs text-[#0071e3] hover:text-[#0077ed] transition-colors font-medium">
                全部图表 ›
              </Link>
            </div>
            <div className="bg-white shadow-apple rounded-2xl p-5">
              <div className="space-y-5">
                {TREND_NAV_ITEMS.map(group => (
                  <div key={group.category}>
                    <div className="text-[11px] text-[#6e6e73] font-semibold mb-2.5 uppercase tracking-wider">
                      {group.category}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#0071e3]/8 hover:text-[#0071e3] rounded-xl text-xs text-[#6e6e73] transition-all active:scale-95"
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
