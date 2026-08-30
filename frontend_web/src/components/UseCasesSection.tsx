import React from 'react';
import { ArrowRight } from 'lucide-react';

interface UseCasesSectionProps {
  onExploreMetrics?: () => void;
}

export const UseCasesSection: React.FC<UseCasesSectionProps> = ({ onExploreMetrics }) => {
  return (
    <section id="regimes" className="bg-[#F5F5F5] px-6 py-24 scroll-mt-12">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="md:pr-12 md:pt-2 flex flex-col items-start">
          <span className="text-black/60 text-sm mb-2 font-normal">
            Intelligence in Practice
          </span>
          <h2
            className="text-5xl md:text-6xl font-medium leading-none mb-6 text-black"
            style={{ letterSpacing: '-0.04em' }}
          >
            Research Modes
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm font-normal">
            Discretizing market dynamics into Low, Medium, and High volatility
            regimes (ATR-20 terciles) to dynamically stabilize neural stacking
            weights during sudden NSE regime breaks.
          </p>
        </div>

        {/* Right Column: Video Card with Content Overlay */}
        <div className="relative rounded-3xl overflow-hidden min-h-[720px] w-full shadow-sm">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
          />

          {/* Overlay Content */}
          <div className="relative z-10 p-10 md:p-12 flex flex-col justify-start h-full">
            <h3
              className="text-4xl md:text-5xl font-medium leading-tight mb-5 text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Ablation Results
            </h3>
            <p className="text-black/70 text-base max-w-md mb-8 leading-relaxed font-normal">
              Across 2,296 evaluated walk-forward folds on 30 Indian equities,
              the Regime-Adaptive model achieves up to a +10.04% MAE reduction
              in volatile periods compared to the static Liu et al. control.
            </p>
            <a
              href="#ablation"
              onClick={onExploreMetrics}
              className="group inline-flex items-center gap-3 text-black font-medium text-base hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
              <span>View Leaderboard</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
