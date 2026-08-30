import React from "react";
import { Award, TrendingUp, CheckCircle, ChevronLeft, BarChart2, ShieldCheck, Zap } from "lucide-react";
import { ModelMetricSummary } from "../types";

interface LeaderboardScreenProps {
  metrics: {
    model_summary: ModelMetricSummary[];
    regime_breakdown: any[];
  };
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ metrics, onBack }) => {
  const models = metrics.model_summary.length > 0
    ? metrics.model_summary
    : [
        { model_name: "Regime-Adaptive Ridge (Ours)", mean_mae: 0.010680, mean_rmse: 0.014184, mean_r2: -0.0782, mean_directional_accuracy: 51.33, total_evaluated_folds: 2296 },
        { model_name: "PyTorch LSTM (2-Layer 100u)", mean_mae: 0.010729, mean_rmse: 0.014254, mean_r2: -0.0963, mean_directional_accuracy: 50.05, total_evaluated_folds: 2296 },
        { model_name: "PyTorch ANN (100->50 ReLU)", mean_mae: 0.011520, mean_rmse: 0.015026, mean_r2: -0.2974, mean_directional_accuracy: 49.64, total_evaluated_folds: 2296 },
        { model_name: "XGBoost Tree Benchmark", mean_mae: 0.011646, mean_rmse: 0.015301, mean_r2: -0.3617, mean_directional_accuracy: 49.95, total_evaluated_folds: 2296 },
        { model_name: "Liu et al. (Static Control)", mean_mae: 0.011771, mean_rmse: 0.015312, mean_r2: -0.3525, mean_directional_accuracy: 49.52, total_evaluated_folds: 2296 },
        { model_name: "Random Forest Baseline", mean_mae: 0.011975, mean_rmse: 0.015564, mean_r2: -0.4303, mean_directional_accuracy: 49.75, total_evaluated_folds: 2296 }
      ];

  const minMae = Math.min(...models.map((m) => m.mean_mae));

  return (
    <div className="px-5 space-y-4 pt-3 pb-4">
      {/* 1. Header with back chevron */}
      <div className="flex items-center justify-between min-h-[44px]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-[#EBE8DF] flex items-center justify-center text-[#141414] hover:bg-[#FAF9F5] active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414]">Model Ablation</h1>
        </div>
        <span className="text-xs font-semibold text-black/60 bg-white px-2.5 py-1 rounded-full border border-black/10">
          N=2,296 Folds
        </span>
      </div>

      {/* 2. Hero Card */}
      <div className="bg-white rounded-3xl p-5 border border-black/10 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-black/50 uppercase">
              LOWEST ABLATION ERROR
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-black mt-1 font-mono">
              0.010680 <span className="text-xs font-semibold text-black/40">MAE</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
              +9.22% Mean Gain
            </span>
          </div>
        </div>

        <div className="text-xs text-black/60 mt-2">
          Strictly out-of-sample walk-forward test folds across 30 NSE stocks (252D train / 21D step).
        </div>

        {/* Small Highlight Tag */}
        <div className="bg-[#2B2644] text-white rounded-xl p-3 mt-3 flex items-center gap-2 text-xs">
          <Zap size={14} className="shrink-0 text-emerald-400" />
          <span>Regime-Adaptive Ridge outperforms Liu et al. static control across 28/30 stocks.</span>
        </div>
      </div>

      {/* 3. Model Progress Bars List */}
      <div className="space-y-3">
        {models.map((model, idx) => {
          const isWinner = idx === 0;
          const scorePercent = Math.max(30, Math.min(100, Math.round((minMae / model.mean_mae) * 100)));
          const isAdaptive = model.model_name.includes("Adaptive");

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-black/10 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isAdaptive
                        ? "bg-emerald-500"
                        : model.model_name.includes("LSTM")
                        ? "bg-sky-500"
                        : "bg-black/30"
                    }`}
                  />
                  <span className="text-xs font-bold text-black">
                    {model.model_name.replace("_", " ")}
                  </span>
                  {isWinner && (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                      BEST
                    </span>
                  )}
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-black font-mono">{model.mean_mae.toFixed(6)}</span>
                  <span className="text-black/40 text-[10px]"> MAE</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-black/5 border border-black/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isAdaptive
                      ? "bg-emerald-500"
                      : model.model_name.includes("LSTM")
                      ? "bg-sky-500"
                      : model.model_name.includes("Static")
                      ? "bg-rose-500"
                      : "bg-black/40"
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-black/60 font-mono">
                <span>RMSE: {model.mean_rmse.toFixed(6)}</span>
                <span>Hit Rate: {model.mean_directional_accuracy.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Volatility Tercile Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-black/10 shadow-sm space-y-3">
        <div className="text-xs font-bold text-black uppercase tracking-wider">
          Regime Stress Performance
        </div>

        <div className="space-y-2">
          {[
            { regime: "High Volatility", staticMae: "0.012741", adaptMae: "0.011507", gain: "+9.69%" },
            { regime: "Medium Volatility", staticMae: "0.011465", adaptMae: "0.010314", gain: "+10.04%" },
            { regime: "Low Volatility", staticMae: "0.010227", adaptMae: "0.009415", gain: "+7.94%" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-black/5 p-2.5 rounded-xl text-xs">
              <span className="font-semibold text-black">{r.regime}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-black/40 line-through font-mono">{r.staticMae}</span>
                <span className="font-bold text-black font-mono">{r.adaptMae}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                  {r.gain}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
