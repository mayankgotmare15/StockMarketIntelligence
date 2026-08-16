import React from "react";
import { Sparkles, HelpCircle, ChevronLeft, Layers } from "lucide-react";
import { ShapRankingItem } from "../types";

interface ShapScreenProps {
  shapData: ShapRankingItem[];
  selectedStock: string;
  onBack: () => void;
}

export const ShapScreen: React.FC<ShapScreenProps> = ({ shapData, selectedStock, onBack }) => {
  const items = shapData.length > 0 ? shapData : [
    { feature_name: "ATR-20 (Volatility)", mean_abs_shap: 0.000412, sample_count: 147 },
    { feature_name: "RSI-14 (Momentum)", mean_abs_shap: 0.000378, sample_count: 147 },
    { feature_name: "MACD Signal Delta", mean_abs_shap: 0.000315, sample_count: 147 },
    { feature_name: "Bollinger Width", mean_abs_shap: 0.000289, sample_count: 147 },
    { feature_name: "5-Day Volume Ratio", mean_abs_shap: 0.000244, sample_count: 147 },
    { feature_name: "Log Return Lag-1", mean_abs_shap: 0.000198, sample_count: 147 },
    { feature_name: "Rolling Volatility 20d", mean_abs_shap: 0.000162, sample_count: 147 }
  ];

  const maxVal = Math.max(...items.map((i) => i.mean_abs_shap)) || 1;

  return (
    <div className="px-5 space-y-4 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-[#EBE8DF] flex items-center justify-center text-[#141414]"
          >
            <ChevronLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414]">Tree SHAP</h1>
        </div>
        <span className="text-xs font-semibold text-[#8E8E93] bg-white px-2.5 py-1 rounded-full border border-[#EBE8DF]">
          {selectedStock.replace(".NS", "")}
        </span>
      </div>

      {/* Hero Explainer Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 shadow-card space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#141414]">
          <Sparkles size={16} className="text-[#F2A93B]" />
          <span>Global Feature Importance Attributions</span>
        </div>
        <p className="text-xs text-[#787670] leading-relaxed">
          Mean absolute Shapley values ($E[|\phi_j|]$) explaining the predictive contribution of each engineered indicator for Random Forest and XGBoost baselines.
        </p>
      </div>

      {/* Feature Ranking Bars */}
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const pct = Math.round((item.mean_abs_shap / maxVal) * 100);

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-3.5 border border-[#EBE8DF]/80 shadow-card space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FAF9F5] border border-[#EBE8DF] flex items-center justify-center font-bold text-[10px] text-[#8E8E93]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-[#141414]">{item.feature_name}</span>
                </div>
                <span className="font-mono font-semibold text-[11px] text-[#141414]">
                  {item.mean_abs_shap.toFixed(6)}
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-2 bg-[#FAF9F5] rounded-full overflow-hidden border border-[#EBE8DF]/60">
                <div
                  className="h-full bg-gradient-to-r from-[#F2A93B] to-[#F59E0B] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8E8E93]">
                <span>Impact Weight: {pct}%</span>
                <span>{item.sample_count} Samples Evaluated</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
