import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useStock } from '../../context/StockContext';

interface FeatureItem {
  name: string;
  category: 'Volatility' | 'Momentum' | 'Trend' | 'Volume' | 'Price Action';
  importance: number;
  direction: 'Expands Volatility' | 'Mean-Reverting' | 'Trend-Following' | 'Breakout Confirmation';
  formula: string;
  description: string;
}

const GLOBAL_SHAP_FEATURES: FeatureItem[] = [
  {
    name: 'ATR-20 (Average True Range)',
    category: 'Volatility',
    importance: 92,
    direction: 'Expands Volatility',
    formula: 'ATR_20 = (1/20) * sum(TR_t, t=1..20)',
    description: 'Measures structural variance across 20 trading sessions. Drives volatility tercile classification.',
  },
  {
    name: 'RSI-14 (Relative Strength Index)',
    category: 'Momentum',
    importance: 86,
    direction: 'Mean-Reverting',
    formula: 'RSI = 100 - (100 / (1 + RS))',
    description: 'Signals momentum exhaustion and extreme overbought/oversold levels on Indian equities.',
  },
  {
    name: 'MACD Signal Histogram',
    category: 'Trend',
    importance: 74,
    direction: 'Trend-Following',
    formula: 'MACD_line = EMA_12 - EMA_26; Signal = EMA_9(MACD)',
    description: 'Tracks acceleration and deceleration in medium-term directional price moves.',
  },
  {
    name: 'Bollinger Band Width (20d)',
    category: 'Volatility',
    importance: 68,
    direction: 'Expands Volatility',
    formula: '(UpperBand - LowerBand) / SMA_20',
    description: 'Captures volatility compression precedes sharp trend expansions on NSE equities.',
  },
  {
    name: '5-Day Volume Ratio',
    category: 'Volume',
    importance: 59,
    direction: 'Breakout Confirmation',
    formula: 'Volume_5D_Mean / Volume_20D_SMA',
    description: 'Validates institutional accumulation vs. retail liquidity drying up during regime breaks.',
  },
  {
    name: 'Lag-1 Daily Log Return',
    category: 'Price Action',
    importance: 51,
    direction: 'Mean-Reverting',
    formula: 'r_{t-1} = ln(P_{t-1} / P_{t-2})',
    description: 'Immediate preceding price return capturing short-term drift and serial autocorrelation.',
  },
];

export const ShapPage: React.FC = () => {
  const { selectedTicker } = useStock();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem>(GLOBAL_SHAP_FEATURES[0]);

  const filteredFeatures = activeCategory === 'ALL'
    ? GLOBAL_SHAP_FEATURES
    : GLOBAL_SHAP_FEATURES.filter((f) => f.category === activeCategory);

  const categories = ['ALL', 'Volatility', 'Momentum', 'Trend', 'Volume', 'Price Action'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-1">
            Explainable AI (XAI) Studio • {selectedTicker}.NS
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-black">
            Tree SHAP Feature Attribution
          </h1>
          <p className="text-sm text-black/60 mt-1 max-w-2xl">
            Shapley Additive Explanations calculated across XGBoost and Random Forest baselines to explain how features influence return predictions.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/5 rounded-full border border-black/10 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Attribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Feature List with Interactive Bars */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-black/10 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <h2 className="text-base font-medium text-black">Global Feature Importance (Mean |SHAP|)</h2>
            <span className="text-xs text-black/50 font-mono">30 NSE Stocks Aggregated</span>
          </div>

          <div className="space-y-4">
            {filteredFeatures.map((feat) => {
              const isSelected = selectedFeature.name === feat.name;
              return (
                <div
                  key={feat.name}
                  onClick={() => setSelectedFeature(feat)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-black/30 bg-black/[0.02] shadow-sm'
                      : 'border-black/5 hover:border-black/15 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-black">{feat.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/60 font-medium">
                        {feat.category}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-black">{feat.importance}% Impact</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-black' : 'bg-black/60'
                      }`}
                      style={{ width: `${feat.importance}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-black/50">
                    <span>{feat.direction}</span>
                    <span className="font-mono text-[11px]">{feat.formula}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Selected Feature Inspector & Local Waterfall */}
        <div className="lg:col-span-5 space-y-6">
          {/* Feature Deep Dive */}
          <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm space-y-4">
            <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block">
              Feature Deep-Dive
            </span>
            <h3 className="text-2xl font-medium text-black">{selectedFeature.name}</h3>

            <div className="space-y-3 text-xs text-black/70">
              <p className="leading-relaxed">{selectedFeature.description}</p>

              <div className="p-3 bg-black/5 rounded-xl border border-black/5 font-mono text-[11px] text-black">
                <span className="text-black/50 block mb-1 text-[10px] uppercase">Mathematical Formulation:</span>
                <code>{selectedFeature.formula}</code>
              </div>

              <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                <span>Category Domain:</span>
                <span className="font-semibold text-black">{selectedFeature.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Observed Market Effect:</span>
                <span className="font-semibold text-black">{selectedFeature.direction}</span>
              </div>
            </div>
          </div>

          {/* Local Sample Waterfall decomposition */}
          <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-black">Local Fold Prediction Decomposition</h4>
              <span className="text-[10px] font-mono text-black/50">Fold #142 (Sample)</span>
            </div>

            <p className="text-xs text-black/60">
              How features cumulatively shifted base expected return $E[y]$ to final output $f(x)$:
            </p>

            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-black/5">
                <span className="text-black/60">Base Prior Return E[y]</span>
                <span className="font-bold text-black">+0.02%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> ATR-20 Expansion (High Vol)
                </span>
                <span className="font-bold">+0.48%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> RSI-14 Oversold Bounce
                </span>
                <span className="font-bold">+0.25%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-100">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> MACD Bearish Divergence
                </span>
                <span className="font-bold">-0.19%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-black text-white font-bold">
                <span>Final Model Prediction f(x)</span>
                <span>+0.56% (₹1,852.80)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapPage;
