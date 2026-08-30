import React from 'react';
import { ArrowRight } from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <section id="architecture" className="bg-[#F5F5F5] px-6 py-24 scroll-mt-12">
      <div className="max-w-[88rem] mx-auto">
        {/* Row 1: 2-Column Headline & Discover CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          {/* Left Column: Heading + Discover CTA */}
          <div>
            <h2
              className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8"
              style={{ letterSpacing: '-0.03em' }}
            >
              Meet Adaptive Stacking.
            </h2>
            <a
              href="#ablation"
              className="group inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-7 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer shadow-sm"
            >
              <span>Discover Architecture</span>
              <span className="bg-white rounded-full p-2 group-hover:bg-white transition-colors">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
            </a>
          </div>

          {/* Right Column: Statement */}
          <div>
            <p className="text-black/70 text-2xl md:text-3xl leading-relaxed font-normal">
              While static ensembles degrade during market regime shifts, our
              drift-aware meta-model dynamically re-weights LSTM and ANN base
              learners using Ridge regularization.
            </p>
          </div>
        </div>

        {/* Row 2: 4-Column Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 (Spans 2 columns on lg): Background Image Card */}
          <div
            className="lg:col-span-2 rounded-2xl p-7 min-h-80 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            style={{
              backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <h3
              className="text-black text-2xl font-medium leading-snug"
              style={{ letterSpacing: '-0.02em' }}
            >
              Zero-Leakage Walk-Forward
            </h3>
            <p className="text-black/70 text-base max-w-xs leading-relaxed">
              252-day sliding training windows and 21-day rolling test folds
              across 30 NSE stocks with strictly out-of-sample normalization.
            </p>
          </div>

          {/* Card 2: Solid #2B2644 */}
          <div
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
            style={{ backgroundColor: '#2B2644' }}
          >
            <h3
              className="text-white text-2xl font-medium leading-snug whitespace-pre-line"
              style={{ letterSpacing: '-0.02em' }}
            >
              Residual Drift{"\n"}Detector
            </h3>
            <p className="text-white/60 text-base leading-relaxed">
              Tracks rolling z-scores (|z| &gt; 2.0) on prediction residuals to
              detect structural volatility shifts and trigger dynamic re-fits.
            </p>
          </div>

          {/* Card 3: Solid #2B2644 */}
          <div
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
            style={{ backgroundColor: '#2B2644' }}
          >
            <h3
              className="text-white text-2xl font-medium leading-snug whitespace-pre-line"
              style={{ letterSpacing: '-0.02em' }}
            >
              Tree SHAP{"\n"}Explainability
            </h3>
            <p className="text-white/60 text-base leading-relaxed">
              Tree baselines (XGBoost &amp; Random Forest) yield global feature
              attributions across ATR-20, RSI, MACD, and Bollinger Bands.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
