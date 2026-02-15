import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import TrendSidebar from '@/components/trend/TrendSidebar';
import TrendMobileNav from '@/components/trend/TrendMobileNav';
import Disclaimer from '@/components/layout/Disclaimer';

export default function TrendLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-[70px] lg:pb-0">
      <Navbar />
      <TrendMobileNav />
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4 lg:flex lg:gap-5">
        <TrendSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <Disclaimer />
      <MobileTabBar />
    </div>
  );
}
