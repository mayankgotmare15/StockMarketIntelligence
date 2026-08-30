import React from "react";
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { NSE_MOBILE_UNIVERSE } from "../services/api";

interface MobileLandingScreenProps {
  onLaunchApp: () => void;
  onDemoLogin: () => void;
}

export const MobileLandingScreen: React.FC<MobileLandingScreenProps> = ({
  onLaunchApp,
  onDemoLogin,
}) => {
  return (
    <div className="flex flex-col bg-[#F5F5F5] min-h-full text-black select-none">
      {/* 1. Mobile Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#F5F5F5]/90 backdrop-blur-md border-b border-black/10 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
            Ψ
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-black">StockIntelligence</span>
            <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 bg-black/5 text-black/60 rounded-full border border-black/10">
              NSE v4
            </span>
          </div>
        </div>

        <button
          onClick={onLaunchApp}
          className="bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-gray-800 active:scale-95 transition shadow-xs cursor-pointer"
        >
          Launch Terminal
        </button>
      </header>

      {/* Main Scrollable Content */}
      <div className="space-y-6 px-5 pt-5 pb-24">
        {/* 2. Hero Section */}
        <section className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-semibold tracking-wider text-black/70 uppercase">
            <Sparkles size={11} className="text-emerald-600" />
            <span>Research Specification v4</span>
          </div>

          <h1 className="text-3xl font-medium tracking-tight text-black leading-[1.15]">
            A Quantitative Leap Beyond Static Stacking
          </h1>

          <p className="text-xs text-black/60 leading-relaxed max-w-sm mx-auto">
            Extending Liu et al. (2024) with online concept-drift detection and regime-adaptive Ridge regularization for Indian National Stock Exchange (NSE) equities.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 space-y-2 max-w-xs mx-auto">
            <button
              onClick={onLaunchApp}
              className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-xs tracking-tight shadow-md hover:bg-gray-800 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Quantitative Terminal</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={onDemoLogin}
              className="w-full py-2.5 px-5 rounded-full bg-white text-black font-medium text-xs border border-black/10 hover:bg-black/5 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap size={13} className="text-emerald-600" />
              <span>One-Click Demo Session</span>
            </button>
          </div>

          {/* 3 Core Highlight KPI Cards */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-left">
            <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-xs">
              <div className="text-[10px] font-semibold text-black/50 uppercase tracking-wider">UNIVERSE</div>
              <div className="text-sm font-bold text-black font-mono mt-0.5">30 Stocks</div>
              <div className="text-[9px] text-black/50 mt-0.5 leading-tight">5 Core Sectors</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-xs">
              <div className="text-[10px] font-semibold text-black/50 uppercase tracking-wider">EVALUATION</div>
              <div className="text-sm font-bold text-black font-mono mt-0.5">2,296 Folds</div>
              <div className="text-[9px] text-black/50 mt-0.5 leading-tight">Walk-Forward</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-xs">
              <div className="text-[10px] font-semibold text-black/50 uppercase tracking-wider">ERROR GAIN</div>
              <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">+9.22%</div>
              <div className="text-[9px] text-black/50 mt-0.5 leading-tight">Outperformance</div>
            </div>
          </div>
        </section>

        {/* 3. Continuous Ticker Marquee Strip */}
        <section className="bg-white rounded-2xl p-3 border border-black/10 shadow-xs overflow-hidden">
          <div className="text-[10px] font-bold text-black/50 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>30 NSE MONITORED EQUITIES</span>
            <span className="text-emerald-600 font-mono">LIVE COVERAGE</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {NSE_MOBILE_UNIVERSE.map((stock) => (
              <div
                key={stock.symbol}
                className="px-3 py-1.5 rounded-xl bg-black/5 border border-black/5 shrink-0 flex items-center gap-2"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-black">{stock.symbol.replace(".NS", "")}</span>
                  <span className="text-[9px] text-black/50">{stock.sector}</span>
                </div>
                <span className="font-mono text-[11px] text-black/70">₹{stock.base_price}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Architecture Highlights Section */}
        <section className="bg-white rounded-3xl p-5 border border-black/10 shadow-xs space-y-3">
          <div className="text-xs uppercase font-semibold tracking-wider text-black/50">
            SYSTEM ARCHITECTURE
          </div>
          <h2 className="text-xl font-medium tracking-tight text-black">
            Regime-Adaptive Stacking Topology
          </h2>
          <p className="text-xs text-black/60 leading-relaxed">
            Unlike static ensembles whose weights remain frozen after training, our architecture continuously tracks residual forecast error and recalibrates weights dynamically upon regime shifts.
          </p>

          {/* Architecture Step Cards */}
          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-2xl bg-black/5 border border-black/5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <div className="text-xs font-bold text-black">Independently Trained Base Learners</div>
                <div className="text-[11px] text-black/60 mt-0.5">
                  PyTorch 2-Layer LSTM (100 units) + Feed-Forward ANN (100→50 ReLU units) fit per-stock with out-of-sample scaling.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 border border-black/5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <div className="text-xs font-bold text-black">Online Residual Drift Detector</div>
                <div className="text-[11px] text-black/60 mt-0.5">
                  Rolling 30-day z-score monitor flagging concept drift whenever |z| &gt; 2.0, identifying market structural regime changes.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#2B2644] text-white flex items-start gap-3 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300">Regime-Adaptive Ridge Meta-Model</div>
                <div className="text-[11px] text-white/80 mt-0.5">
                  Solves OLS singular matrix explosions using L₂ regularization (λ = 1.0), refitting over 60-day rolling windows.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Volatility Regimes Section */}
        <section className="space-y-3">
          <div className="text-xs uppercase font-semibold tracking-wider text-black/50">
            MARKET DYNAMICS
          </div>
          <h2 className="text-xl font-medium tracking-tight text-black">
            Three Volatility Regimes
          </h2>
          <p className="text-xs text-black/60 leading-relaxed">
            Market states discretized via 20-day rolling Average True Range (ATR) terciles:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-black">Low Volatility Regime</span>
                </div>
                <div className="text-[11px] text-black/60 mt-0.5">ATR Tercile 1 • Mean-Reverting Consolidations</div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                +7.94% Gain
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-black">Medium Volatility Regime</span>
                </div>
                <div className="text-[11px] text-black/60 mt-0.5">ATR Tercile 2 • Sectoral Rotation Cycles</div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                +10.04% Gain
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-black">High Volatility Regime</span>
                </div>
                <div className="text-[11px] text-black/60 mt-0.5">ATR Tercile 3 • Geopolitical Shocks &amp; Selloffs</div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                +9.69% Gain
              </span>
            </div>
          </div>
        </section>

        {/* 6. Empirical Validation Ablation Study */}
        <section className="bg-white rounded-3xl p-5 border border-black/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase font-semibold tracking-wider text-black/50">
              EMPIRICAL VALIDATION
            </div>
            <span className="text-[10px] font-mono text-black/50 bg-black/5 px-2 py-0.5 rounded-full">
              N=2,296 Folds
            </span>
          </div>

          <h2 className="text-xl font-medium tracking-tight text-black">
            Walk-Forward Ablation Leaderboard
          </h2>

          <div className="space-y-2 pt-1">
            {[
              { rank: 1, name: "Regime-Adaptive Ridge (Ours)", mae: "0.010680", hit: "51.33%", badge: "BEST" },
              { rank: 2, name: "PyTorch LSTM (2-Layer)", mae: "0.010729", hit: "50.05%" },
              { rank: 3, name: "PyTorch ANN (100->50)", mae: "0.011520", hit: "49.64%" },
              { rank: 4, name: "XGBoost Baseline", mae: "0.011646", hit: "49.95%" },
              { rank: 5, name: "Liu et al. Static Stacking", mae: "0.011771", hit: "49.52%", control: true },
            ].map((m) => (
              <div
                key={m.name}
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                  m.badge
                    ? "bg-black/[0.03] border-black/20"
                    : "bg-white border-black/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${m.badge ? "bg-black text-white" : "bg-black/10 text-black/70"}`}>
                    {m.rank}
                  </span>
                  <div>
                    <div className="font-semibold text-black flex items-center gap-1.5">
                      <span>{m.name}</span>
                      {m.badge && <span className="text-[8px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">PROPOSED</span>}
                      {m.control && <span className="text-[8px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">CONTROL</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-black">{m.mae}</div>
                  <div className="text-[9px] text-black/50">{m.hit} Hit Rate</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Tree SHAP Feature Importance */}
        <section className="bg-white rounded-3xl p-5 border border-black/10 shadow-xs space-y-3">
          <div className="text-xs uppercase font-semibold tracking-wider text-black/50">
            EXPLAINABILITY (XAI)
          </div>
          <h2 className="text-xl font-medium tracking-tight text-black">
            Tree SHAP Feature Attributions
          </h2>

          <div className="space-y-2">
            {[
              { name: "ATR-20 (Average True Range)", pct: 92, domain: "Volatility" },
              { name: "RSI-14 (Relative Strength)", pct: 86, domain: "Momentum" },
              { name: "MACD Signal Histogram", pct: 74, domain: "Trend" },
              { name: "Bollinger Band Width", pct: 68, domain: "Volatility" },
            ].map((f) => (
              <div key={f.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-black">{f.name}</span>
                  <span className="font-mono font-semibold text-emerald-600">{f.pct}%</span>
                </div>
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Minimalist Mobile Footer */}
        <footer className="pt-4 pb-2 border-t border-black/10 text-center space-y-2">
          <div className="font-medium text-xs text-black">StockMarketIntelligence (NSE v4)</div>
          <p className="text-[10px] text-black/50">
            Real-Time Indian Stock Market Forecasting &amp; Regime-Adaptive Stacking Platform.
          </p>
        </footer>
      </div>

      {/* Sticky Bottom Launch Button */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#F5F5F5]/90 backdrop-blur-md border-t border-black/10 z-40">
        <button
          onClick={onLaunchApp}
          className="w-full py-3.5 rounded-full bg-black text-white font-semibold text-xs tracking-tight shadow-lg hover:bg-gray-800 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Launch Quantitative Terminal</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default MobileLandingScreen;
