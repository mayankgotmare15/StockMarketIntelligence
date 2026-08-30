import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import BackedBySection from '../components/BackedBySection';
import UseCasesSection from '../components/UseCasesSection';
import AblationSection from '../components/AblationSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#F5F5F5] min-h-screen text-black antialiased selection:bg-black selection:text-white">
      {/* 1. Hero Container: Navbar (absolute) + HeroSection in h-screen overflow-hidden */}
      <div className="relative h-screen flex flex-col overflow-hidden bg-[#F5F5F5]">
        <Navbar />
        <HeroSection />
      </div>

      {/* 2. Info Section: Architecture Highlights */}
      <InfoSection />

      {/* 3. Universe & Sectors Section: Continuous Marquee */}
      <BackedBySection />

      {/* 4. Research Modes & Volatility Regimes */}
      <UseCasesSection />

      {/* 5. Empirical Validation: Walk-Forward Ablation Study & SHAP */}
      <AblationSection />

      {/* 6. Minimalist Footer */}
      <footer className="border-t border-black/10 py-12 px-6 bg-[#F5F5F5]">
        <div className="max-w-[88rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-black/60">
          <div className="flex items-center gap-3">
            <span className="font-medium text-black">StockMarketIntelligence</span>
            <span className="text-black/30">|</span>
            <span>Real-Time Indian NSE Forecasting &amp; Drift-Aware Stacking Ensemble</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#architecture" className="hover:text-black transition-colors">
              Architecture
            </a>
            <a href="#ablation" className="hover:text-black transition-colors">
              Ablation Study
            </a>
            <a href="#regimes" className="hover:text-black transition-colors">
              Regimes
            </a>
            <a href="#universe" className="hover:text-black transition-colors">
              NSE Universe
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
