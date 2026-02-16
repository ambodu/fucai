import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Disclaimer from '@/components/layout/Disclaimer';
import StatsNav from './StatsNav';

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-[52px] lg:pb-0 bg-white">
      <Navbar />
      <div className="max-w-[1120px] mx-auto px-4 lg:px-6 py-4 lg:flex lg:gap-5">
        <StatsNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <Disclaimer />
      <MobileTabBar />
    </div>
  );
}
