import React, { useState } from 'react';
import { Award, Zap, Activity, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AblationSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'regimes' | 'shap'>('leaderboard');

  const modelsData = [
    {
      name: 'Regime-Adaptive Ridge (Ours)',
      type: 'Novel Ensemble',
      mae: '0.010680',
      rmse: '0.014184',
      r2: '-0.0782',
      dirAcc: '49.36%',
      rank: 1,
      highlight: true,
      badge: 'Best Model',
    },
    {
      name: 'PyTorch LSTM (2-Layer 100u)',
      type: 'Base Learner',
      mae: '0.010729',
      rmse: '0.014254',
      r2: '-0.0963',
      dirAcc: '50.05%',
      rank: 2,
    },
    {
      name: 'PyTorch ANN (100→50 ReLU)',
      type: 'Base Learner',
      mae: '0.011520',
      rmse: '0.015026',
      r2: '-0.2974',
      dirAcc: '49.64%',
      rank: 3,
    },
    {
      name: 'XGBoost Baseline',
      type: 'Tree Benchmark',
      mae: '0.011646',
      rmse: '0.015301',
      r2: '-0.3617',
      dirAcc: '49.95%',
      rank: 4,
    },
    {
      name: 'Liu et al. (Static Control)',
      type: 'Literature Baseline',
      mae: '0.011771',
      rmse: '0.015312',
      r2: '-0.3525',
      dirAcc: '49.52%',
      rank: 5,
    },
    {
      name: 'Random Forest Baseline',
      type: 'Tree Benchmark',
      mae: '0.011975',
      rmse: '0.015564',
      r2: '-0.4303',
      dirAcc: '49.75%',
      rank: 6,
    },
  ];

  const regimeData = [
    {
      regime: 'High Volatility',
      samples: '14,408 days',
      staticMae: '0.012741',
      adaptiveMae: '0.011507',
      improvement: '+9.69%',
      status: 'Critical Stress Test',
    },
    {
      regime: 'Medium Volatility',
      samples: '4,716 days',
      staticMae: '0.011465',
      adaptiveMae: '0.010314',
      improvement: '+10.04%',
      status: 'Trending Market',
    },
    {
      regime: 'Low Volatility',
      samples: '6,706 days',
      staticMae: '0.010227',
      adaptiveMae: '0.009415',
      improvement: '+7.94%',
      status: 'Mean-Reverting',
    },
  ];

  const shapFeatures = [
    { name: 'ATR-20 (Average True Range)', importance: 92, category: 'Volatility' },
    { name: 'RSI-14 (Relative Strength)', importance: 86, category: 'Momentum' },
    { name: 'MACD Signal Histogram', importance: 74, category: 'Trend' },
    { name: 'Bollinger Band Width (20d)', importance: 68, category: 'Volatility' },
    { name: '5-Day Volume Ratio', importance: 59, category: 'Volume' },
    { name: 'Lag-1 Daily Return', importance: 51, category: 'Price Action' },
  ];

  return (
    <section id="ablation" className="bg-[#F5F5F5] px-6 py-24 scroll-mt-12 border-t border-black/5">
      <div className="max-w-[88rem] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-black/60 text-sm mb-2 font-normal block">
              Empirical Research &amp; Validation
            </span>
            <h2
              className="text-4xl md:text-5xl font-medium leading-tight text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Walk-Forward Ablation Study
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-black/5 rounded-full border border-black/10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              Cross-Model Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('regimes')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'regimes'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              Regime Breakdown
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shap')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'shap'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              SHAP Attribution
            </button>
          </div>
        </div>

        {/* Tab 1: Leaderboard Table */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-black">
                  Out-of-Sample Performance Summary
                </h3>
                <p className="text-black/60 text-sm">
                  Evaluated across 2,296 rolling walk-forward test folds (252-day train, 21-day test steps) on 30 NSE stocks.
                </p>
              </div>
              <span className="text-xs uppercase font-semibold tracking-wider text-black/50 px-3 py-1 bg-black/5 rounded-full">
                Zero-Leakage Harness
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02] text-black/60 font-medium text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Rank &amp; Architecture</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6 text-right">Mean MAE (↓)</th>
                    <th className="py-4 px-6 text-right">Mean RMSE (↓)</th>
                    <th className="py-4 px-6 text-right">Mean R² (↑)</th>
                    <th className="py-4 px-6 text-right">Directional Acc.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-black">
                  {modelsData.map((m) => (
                    <tr
                      key={m.name}
                      className={`hover:bg-black/[0.02] transition-colors ${
                        m.highlight ? 'bg-black/[0.03]' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-medium flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            m.rank === 1
                              ? 'bg-black text-white'
                              : 'bg-black/10 text-black/70'
                          }`}
                        >
                          {m.rank}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{m.name}</span>
                          {m.badge && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {m.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-black/60">{m.type}</td>
                      <td
                        className={`py-4 px-6 text-right font-mono font-medium ${
                          m.highlight ? 'text-black font-bold' : 'text-black/80'
                        }`}
                      >
                        {m.mae}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-black/80">
                        {m.rmse}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-black/70">
                        {m.r2}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-black">
                        {m.dirAcc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Regime Breakdown */}
        {activeTab === 'regimes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regimeData.map((reg) => (
              <div
                key={reg.regime}
                className="bg-white rounded-2xl p-7 border border-black/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-semibold tracking-wider text-black/50">
                      {reg.status}
                    </span>
                    <span className="text-xs font-mono text-black/60">
                      {reg.samples}
                    </span>
                  </div>
                  <h3 className="text-2xl font-medium text-black mb-2">
                    {reg.regime}
                  </h3>
                  <p className="text-black/60 text-sm mb-6">
                    Error reduction achieved by dynamic Ridge coefficient re-fits upon detected drift.
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Liu et al. Static MAE</span>
                    <span className="font-mono text-black">{reg.staticMae}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Regime-Adaptive MAE</span>
                    <span className="font-mono font-bold text-black">{reg.adaptiveMae}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-black/5">
                    <span className="font-medium text-black">Error Reduction</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {reg.improvement}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: SHAP Feature Attribution */}
        {activeTab === 'shap' && (
          <div className="bg-white rounded-2xl p-8 border border-black/10 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xl font-medium text-black mb-1">
                Tree SHAP Global Feature Importance
              </h3>
              <p className="text-black/60 text-sm">
                Mean absolute SHAP value attribution across 30 NSE stocks computed on XGBoost and Random Forest baselines.
              </p>
            </div>

            <div className="space-y-5">
              {shapFeatures.map((feat) => (
                <div key={feat.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-black flex items-center gap-2">
                      <span>{feat.name}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-black/5 rounded-full text-black/60">
                        {feat.category}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-black/70">{feat.importance}% attribution</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${feat.importance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AblationSection;
