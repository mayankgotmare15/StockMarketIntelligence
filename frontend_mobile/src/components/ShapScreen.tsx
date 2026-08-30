import React, { useState } from "react";
import { Sparkles, ChevronLeft, Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ShapRankingItem } from "../types";

interface ShapScreenProps {
  shapData: ShapRankingItem[];
  selectedStock: string;
  onBack: () => void;
}

export const ShapScreen: React.FC<ShapScreenProps> = ({ shapData, selectedStock, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const allFeatures = [
    { feature_name: "ATR-20 (Volatility)", category: "Volatility", mean_abs_shap: 0.000412, pct: 92, sample_count: 147, formula: "ATR_20 = (1/20) * sum(TR_t)" },
    { feature_name: "RSI-14 (Momentum)", category: "Momentum", mean_abs_shap: 0.000378, pct: 86, sample_count: 147, formula: "RSI = 100 - (100 / (1 + RS))" },
    { feature_name: "MACD Signal Delta", category: "Trend", mean_abs_shap: 0.000315, pct: 74, sample_count: 147, formula: "EMA_12 - EMA_26" },
    { feature_name: "Bollinger Width (20d)", category: "Volatility", mean_abs_shap: 0.000289, pct: 68, sample_count: 147, formula: "(Upper - Lower) / SMA" },
    { feature_name: "5-Day Volume Ratio", category: "Volume", mean_abs_shap: 0.000244, pct: 59, sample_count: 147, formula: "Vol_5D / Vol_20D_SMA" },
    { feature_name: "Log Return Lag-1", category: "Price Action", mean_abs_shap: 0.000198, pct: 51, sample_count: 147, formula: "ln(P_{t-1} / P_{t-2})" },
  ];

  const categories = ["ALL", "Volatility", "Momentum", "Trend", "Volume", "Price Action"];

  const filteredFeatures = selectedCategory === "ALL"
    ? allFeatures
    : allFeatures.filter((f) => f.category === selectedCategory);

  return (
    <div className="px-5 space-y-4 pt-3 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between min-h-[44px]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-black hover:bg-black/5 active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-black">Tree SHAP</h1>
        </div>
        <span className="text-xs font-semibold text-black/60 bg-white px-2.5 py-1 rounded-full border border-black/10">
          {selectedStock.replace(".NS", "")}
        </span>
      </div>

      {/* Hero Explainer Card */}
      <div className="bg-white rounded-3xl p-5 border border-black/10 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-black">
          <Sparkles size={16} className="text-emerald-600" />
          <span>Global Feature Importance Attributions</span>
        </div>
        <p className="text-xs text-black/60 leading-relaxed">
          Mean absolute Shapley values explaining feature contributions for XGBoost and Random Forest tree baselines.
        </p>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-black/5 text-black/70 hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Ranking Bars */}
      <div className="space-y-2.5">
        {filteredFeatures.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-3.5 border border-black/10 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-[10px] text-black/60">
                  {idx + 1}
                </span>
                <span className="font-bold text-black">{item.feature_name}</span>
              </div>
              <span className="font-mono font-semibold text-[11px] text-black">
                {item.mean_abs_shap.toFixed(6)}
              </span>
            </div>

            {/* Bar */}
            <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden border border-black/5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-black/60">
              <span>Impact Weight: {item.pct}%</span>
              <span className="font-mono text-[9px] text-black/40">{item.formula}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Local Waterfall Card (#2B2644 Obsidian Plum) */}
      <div className="bg-[#2B2644] text-white rounded-3xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
          <span className="font-semibold text-white/80">Local Fold Waterfall Explainer</span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Sample Fold #142
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-white/70">
            <span>Base Model Prior (E[y]):</span>
            <span className="font-mono">+0.02%</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span className="flex items-center gap-1"><ArrowUpRight size={12} /> ATR-20 Volatility Expansion:</span>
            <span className="font-mono font-semibold">+0.48%</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span className="flex items-center gap-1"><ArrowUpRight size={12} /> RSI-14 Oversold Bounce:</span>
            <span className="font-mono font-semibold">+0.25%</span>
          </div>
          <div className="flex justify-between items-center text-rose-400">
            <span className="flex items-center gap-1"><ArrowDownRight size={12} /> MACD Bearish Divergence:</span>
            <span className="font-mono font-semibold">-0.19%</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-white">
            <span>Predicted Return f(x):</span>
            <span className="font-mono text-emerald-400">+0.56%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapScreen;
