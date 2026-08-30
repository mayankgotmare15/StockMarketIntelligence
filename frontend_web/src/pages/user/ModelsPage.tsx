import React, { useState } from 'react';
import { CheckCircle2, Sliders, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStock } from '../../context/StockContext';

export const ModelsPage: React.FC = () => {
  const { selectedTicker } = useStock();
  const [selectedModel, setSelectedModel] = useState<string>('Regime-Adaptive Ridge (Ours)');

  const leaderboard = [
    {
      name: 'Regime-Adaptive Ridge (Ours)',
      classType: 'Novel Ensemble',
      mae: '0.010680',
      rmse: '0.014184',
      r2: '-0.0782',
      dirAcc: '51.33%',
      rank: 1,
      highlight: true,
      badge: 'Best Performer',
      details: 'Dynamic 60-day Ridge re-fit upon detected residual drift (|z| > 2.0). Solves OLS multicollinearity.',
    },
    {
      name: 'PyTorch LSTM (2-Layer 100u)',
      classType: 'Base Learner',
      mae: '0.010729',
      rmse: '0.014254',
      r2: '-0.0963',
      dirAcc: '50.05%',
      rank: 2,
      details: 'Recurrent sequential base learner capturing temporal dependencies across OHLCV indicators.',
    },
    {
      name: 'PyTorch ANN (100→50 ReLU)',
      classType: 'Base Learner',
      mae: '0.011520',
      rmse: '0.015026',
      r2: '-0.2974',
      dirAcc: '49.64%',
      rank: 3,
      details: 'Dense feed-forward network capturing non-linear static interactions between technical features.',
    },
    {
      name: 'XGBoost Baseline',
      classType: 'Tree Benchmark',
      mae: '0.011646',
      rmse: '0.015301',
      r2: '-0.3617',
      dirAcc: '49.95%',
      rank: 4,
      details: 'Gradient boosted decision trees providing benchmark performance and Tree SHAP attributions.',
    },
    {
      name: 'Liu et al. (Static Control)',
      classType: 'Literature Baseline',
      mae: '0.011771',
      rmse: '0.015312',
      r2: '-0.3525',
      dirAcc: '49.52%',
      rank: 5,
      details: 'Original published stacking architecture with frozen linear coefficients. Degrades under regime shifts.',
    },
    {
      name: 'Random Forest Baseline',
      classType: 'Tree Benchmark',
      mae: '0.011975',
      rmse: '0.015564',
      r2: '-0.4303',
      dirAcc: '49.75%',
      rank: 6,
      details: 'Bagged ensemble baseline providing stable variance reduction against noisy price signals.',
    },
  ];

  const regimeStress = [
    {
      regime: 'High Volatility Regime',
      samples: '14,408 days (55%)',
      staticMae: '0.012741',
      adaptiveMae: '0.011507',
      improvement: '+9.69%',
      tag: 'Critical Stress Test',
      description: 'Triggered during geopolitical shocks, RBI rate events, and global contagion selloffs.',
    },
    {
      regime: 'Medium Volatility Regime',
      samples: '4,716 days (18%)',
      staticMae: '0.011465',
      adaptiveMae: '0.010314',
      improvement: '+10.04%',
      tag: 'Trending Markets',
      description: 'Standard sectoral rotation cycles across banking, energy, and IT equities.',
    },
    {
      regime: 'Low Volatility Regime',
      samples: '6,706 days (27%)',
      staticMae: '0.010227',
      adaptiveMae: '0.009415',
      improvement: '+7.94%',
      tag: 'Mean-Reverting',
      description: 'Range-bound consolidation periods with compressed ATR-20 bands.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-1">
            Empirical Validation • {selectedTicker}.NS Focus
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-black">
            Walk-Forward Ablation Leaderboard
          </h1>
          <p className="text-sm text-black/60 mt-1 max-w-2xl">
            Strictly out-of-sample evaluation across 2,296 rolling folds (252-day training window, 21-day test window) with zero lookahead bias.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> +9.22% Mean Improvement
          </span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-black">Cross-Architecture Comparison</h2>
            <p className="text-xs text-black/60">
              Evaluated on daily log returns r_t = ln(P_t / P_t-1). Lower MAE/RMSE is better; higher Hit Rate is better.
            </p>
          </div>
          <span className="text-[11px] font-mono text-black/50 px-2.5 py-1 bg-black/5 rounded-full">
            N=2,296 Folds
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02] text-black/60 font-medium text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Rank & Model</th>
                <th className="py-4 px-6">Architecture Class</th>
                <th className="py-4 px-6 text-right">Mean MAE (↓)</th>
                <th className="py-4 px-6 text-right">Mean RMSE (↓)</th>
                <th className="py-4 px-6 text-right">Mean R² (↑)</th>
                <th className="py-4 px-6 text-right">Hit Rate</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-black">
              {leaderboard.map((m) => (
                <tr
                  key={m.name}
                  onClick={() => setSelectedModel(m.name)}
                  className={`hover:bg-black/[0.02] transition-colors cursor-pointer ${
                    m.highlight ? 'bg-black/[0.025]' : ''
                  } ${selectedModel === m.name ? 'ring-1 ring-inset ring-black/20' : ''}`}
                >
                  <td className="py-4 px-6 font-medium flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        m.rank === 1 ? 'bg-black text-white' : 'bg-black/10 text-black/70'
                      }`}
                    >
                      {m.rank}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{m.name}</span>
                        {m.badge && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-black/50 block font-normal mt-0.5">
                        {m.details}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-black/60">{m.classType}</td>
                  <td
                    className={`py-4 px-6 text-right font-mono font-medium ${
                      m.highlight ? 'text-black font-bold' : 'text-black/80'
                    }`}
                  >
                    {m.mae}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-black/80">{m.rmse}</td>
                  <td className="py-4 px-6 text-right font-mono text-black/70">{m.r2}</td>
                  <td className="py-4 px-6 text-right font-medium text-black">{m.dirAcc}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        m.rank === 1
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.rank === 5
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-black/5 text-black/60'
                      }`}
                    >
                      {m.rank === 1 ? 'Proposed' : m.rank === 5 ? 'Control' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Column Regime Stress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {regimeStress.map((reg) => (
          <div
            key={reg.regime}
            className="bg-white rounded-2xl p-7 border border-black/10 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-semibold tracking-wider text-black/50">
                  {reg.tag}
                </span>
                <span className="text-xs font-mono text-black/60">{reg.samples}</span>
              </div>
              <h3 className="text-2xl font-medium text-black mb-2">{reg.regime}</h3>
              <p className="text-xs text-black/60 mb-6 leading-relaxed">{reg.description}</p>
            </div>

            <div className="pt-4 border-t border-black/5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-black/60">Liu et al. Static MAE</span>
                <span className="font-mono text-black">{reg.staticMae}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Adaptive Ridge MAE</span>
                <span className="font-mono font-bold text-black">{reg.adaptiveMae}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/5 text-sm">
                <span className="font-medium text-black">Error Reduction</span>
                <span className="font-bold text-emerald-600 font-mono">{reg.improvement}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Architecture & Mathematical Foundation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-7 border border-black/10 shadow-sm space-y-4">
          <h3 className="text-lg font-medium text-black">Why Static Liu et al. Degrades</h3>
          <p className="text-xs text-black/70 leading-relaxed">
            The published Liu et al. (2024) control model stacks LSTM and ANN base learners using an unregularized ordinary least squares (OLS) linear regression:
          </p>
          <div className="bg-black/5 p-4 rounded-xl font-mono text-xs text-black space-y-1">
            <code>ŷ_meta = β₀ + β₁·ŷ_LSTM + β₂·ŷ_ANN + ε</code>
          </div>
          <p className="text-xs text-black/70 leading-relaxed">
            Because two neural networks trained on overlapping features generate highly collinear predictions, OLS matrix inversion (Xᵀ X)⁻¹ becomes severely unstable during Indian market volatility spikes, leading to erratic out-of-sample error inflation.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-black/10 shadow-sm space-y-4">
          <h3 className="text-lg font-medium text-black">The Regime-Adaptive Ridge Solution</h3>
          <p className="text-xs text-black/70 leading-relaxed">
            Our architecture continuously monitors residuals using rolling z-scores. When concept drift is signaled (|z| &gt; 2.0), an L₂-penalized Ridge regression immediately refits the ensemble weights over a 60-day window:
          </p>
          <div className="bg-black/5 p-4 rounded-xl font-mono text-xs text-black space-y-1">
            <code>β̂(r_t) = (Xᵀ X + λ I)⁻¹ Xᵀ y,  where λ = 1.0</code>
          </div>
          <p className="text-xs text-black/70 leading-relaxed">
            Ridge shrinkage guarantees numerical stability, preventing singular matrix explosions while swiftly adapting to sudden volatility regimes across all 30 NSE stocks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;
