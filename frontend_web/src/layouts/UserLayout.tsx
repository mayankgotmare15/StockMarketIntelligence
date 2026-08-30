import React from 'react';
import { Outlet } from 'react-router-dom';
import UserTopNav from '../components/user/UserTopNav';
import UserPillTabs from '../components/user/UserPillTabs';

export const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black antialiased selection:bg-black selection:text-white flex flex-col">
      <UserTopNav />
      <main className="flex-1 max-w-[88rem] w-full mx-auto px-6 py-6 flex flex-col">
        <UserPillTabs />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-black/10 py-8 px-6 bg-[#F5F5F5] mt-auto">
        <div className="max-w-[88rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-black">StockMarketIntelligence v4</span>
            <span>•</span>
            <span>Drift-Aware Adaptive Stacking Ensemble (Walk-Forward Zero Leakage)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>30 NSE Universe</span>
            <span>•</span>
            <span>2,296 Folds Validated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
