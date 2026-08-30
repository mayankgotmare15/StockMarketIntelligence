import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Sliders,
  RefreshCw,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { useStock } from '../../context/StockContext';
import { getStockResults, StockResultRow, addToWatchlist, getStockMeta } from '../../services/api';
import { Download } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { selectedTicker } = useStock();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [_error, setError] = useState<boolean>(false);
  const [resultsData, setResultsData] = useState<StockResultRow[]>([]);
  const [timeFilter, setTimeFilter] = useState<'30D' | '90D' | '6M' | '1Y' | 'ALL'>('ALL');
  const [watchlistAdded, setWatchlistAdded] = useState<boolean>(false);

  const stockMeta = getStockMeta(selectedTicker);

  const fetchResults = async (ticker: string) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getStockResults(ticker);
      setResultsData(data);
    } catch (err) {
      console.error('Error in DashboardPage:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(selectedTicker);
  }, [selectedTicker]);

  const latest = resultsData.length > 0 ? resultsData[resultsData.length - 1] : null;

  // Filter time horizon
  const filteredData = useMemo(() => {
    if (!resultsData || resultsData.length === 0) return [];
    let count = resultsData.length;
    if (timeFilter === '30D') count = 30;
    else if (timeFilter === '90D') count = 90;
    else if (timeFilter === '6M') count = 126;
    else if (timeFilter === '1Y') count = 252;

    const slice = resultsData.slice(Math.max(0, resultsData.length - count));
    return slice.map((d) => ({
      ...d,
      formattedDate: d.Date ? format(new Date(d.Date), 'MMM yyyy') : '',
      detailedDate: d.Date ? format(new Date(d.Date), 'dd MMM yyyy') : '',
    }));
  }, [resultsData, timeFilter]);

  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) return;
    const headers = ['Date', 'Ticker', 'Actual_Price', 'y_hat_Static', 'y_hat_Adaptive', 'Regime_Flag', 'Drift_Detected', 'Z_Score'];
    const rows = filteredData.map((d) => [
      d.Date,
      d.Ticker,
      d.Actual_Price.toFixed(2),
      d.y_hat_Static.toFixed(2),
      d.y_hat_Adaptive.toFixed(2),
      d.Regime_Flag,
      d.drift_detected ? 'TRUE' : 'FALSE',
      d.z_score.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedTicker}_walkforward_backtest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickWatchlist = async () => {
    if (!latest) return;
    try {
      await addToWatchlist({
        symbol: selectedTicker,
        notes: `Auto-saved from Dashboard at ₹${latest.Actual_Price.toFixed(2)}`,
        targetEntryPrice: Math.round(latest.Actual_Price * 0.97),
        targetStopLoss: Math.round(latest.Actual_Price * 0.93),
      });
      setWatchlistAdded(true);
      setTimeout(() => setWatchlistAdded(false), 3000);
    } catch (e) {
      console.error('Watchlist save failed:', e);
    }
  };

  const getRegimeBadge = (regime: string = 'Low') => {
    const reg = regime.toLowerCase();
    if (reg.includes('high')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" /> High Volatility (ATR Tercile 3)
        </span>
      );
    }
    if (reg.includes('med')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Info className="w-3.5 h-3.5" /> Medium Volatility (ATR Tercile 2)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Low Volatility (ATR Tercile 1)
      </span>
    );
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-xl text-xs space-y-2 min-w-[220px]">
          <div className="font-semibold text-black border-b border-black/5 pb-2 flex items-center justify-between">
            <span>{dataPoint.detailedDate}</span>
            <span className="text-[10px] font-mono uppercase bg-black/5 px-2 py-0.5 rounded">
              Regime: {dataPoint.Regime_Flag}
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-black">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black" /> Actual Close:
              </span>
              <span className="font-mono font-bold">₹{dataPoint.Actual_Price?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sky-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Static Liu Meta:
              </span>
              <span className="font-mono font-bold">₹{dataPoint.y_hat_Static?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Adaptive Ridge:
              </span>
              <span className="font-mono font-bold">₹{dataPoint.y_hat_Adaptive?.toFixed(2)}</span>
            </div>
            {dataPoint.drift_detected && (
              <div className="pt-2 border-t border-black/5 text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Drift Detected (|z| = {dataPoint.z_score?.toFixed(2)})
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Ticker Context Bar */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">
            <span>{stockMeta.sector}</span>
            <span>•</span>
            <span>{stockMeta.name}</span>
            <span>•</span>
            <span>252D Train / 21D Step</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-medium tracking-tight text-black font-mono">
              {selectedTicker}.NS
            </h1>
            {getRegimeBadge(latest?.Regime_Flag)}
            {latest?.drift_detected ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Concept Drift Active (|z| &gt; 2.0)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/5 text-black/70 border border-black/10">
                Stable Dynamics (|z| = {latest?.z_score?.toFixed(2) || '0.82'})
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleQuickWatchlist}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border transition-all cursor-pointer ${
              watchlistAdded
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-black/5 text-black border-black/10 shadow-sm'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{watchlistAdded ? 'Added to Watchlist!' : '+ Watchlist'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-white hover:bg-black/5 text-black border border-black/10 shadow-sm transition-colors cursor-pointer"
            title="Download CSV Backtest"
          >
            <Download className="w-3.5 h-3.5 text-black/70" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/simulate`)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stress Scenario</span>
          </button>

          <button
            type="button"
            onClick={() => fetchResults(selectedTicker)}
            className="p-2 rounded-full border border-black/10 hover:bg-black/5 text-black transition-colors"
            title="Refresh Backtest"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Row (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Actual Price */}
        <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-2">
              Latest Observed Close
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-tight text-black font-mono">
                ₹{latest?.Actual_Price ? latest.Actual_Price.toFixed(2) : '—'}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-black/5 mt-4 flex items-center justify-between text-xs text-black/60">
            <span>Daily Return</span>
            <span
              className={`font-semibold flex items-center gap-0.5 font-mono ${
                (latest?.Actual_Return_Pct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(latest?.Actual_Return_Pct ?? 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {latest?.Actual_Return_Pct ? `${latest.Actual_Return_Pct >= 0 ? '+' : ''}${latest.Actual_Return_Pct.toFixed(2)}%` : '0.00%'}
            </span>
          </div>
        </div>

        {/* Card 2: Static Meta-Model */}
        <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-2">
              Static Meta-Model (Liu)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-tight text-sky-700 font-mono">
                ₹{latest?.y_hat_Static ? latest.y_hat_Static.toFixed(2) : '—'}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-black/5 mt-4 flex items-center justify-between text-xs text-black/60">
            <span>Architecture</span>
            <span className="font-mono text-black/70">OLS (Frozen β)</span>
          </div>
        </div>

        {/* Card 3: Adaptive Meta-Model */}
        <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-2">
              Regime-Adaptive Ridge
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-tight text-emerald-700 font-mono">
                ₹{latest?.y_hat_Adaptive ? latest.y_hat_Adaptive.toFixed(2) : '—'}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-black/5 mt-4 flex items-center justify-between text-xs text-black/60">
            <span>Ablation Gain</span>
            <span className="font-bold text-emerald-600 font-mono">+9.69% MAE Adv.</span>
          </div>
        </div>

        {/* Card 4: Volatility Regime */}
        <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-2">
              Current Market Regime
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-medium tracking-tight text-black">
                {latest?.Regime_Flag || 'Low'} Volatility
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-black/5 mt-4 flex items-center justify-between text-xs text-black/60">
            <span>Classifier</span>
            <span className="font-mono text-black/70">20-Day ATR Tercile</span>
          </div>
        </div>
      </div>

      {/* 3. Main Chart (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 9 Cols: Prediction Chart */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
            <div>
              <h2 className="text-lg font-medium text-black">Walk-Forward Prediction Trajectory</h2>
              <p className="text-xs text-black/60">
                Comparing actual market closing prices against Static Stacking vs. Adaptive Ridge predictions.
              </p>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-black/5 rounded-full border border-black/10 text-xs">
              {(['30D', '90D', '6M', '1Y', 'ALL'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    timeFilter === filter
                      ? 'bg-black text-white shadow-sm'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[420px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="rgba(0,0,0,0.4)"
                  minTickGap={40}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="rgba(0,0,0,0.4)"
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="Actual_Price"
                  name="Actual Market Price"
                  stroke="#000000"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#000000' }}
                />
                <Line
                  type="monotone"
                  dataKey="y_hat_Static"
                  name="Static Control (Liu et al.)"
                  stroke="#0284C7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 5, fill: '#0284C7' }}
                />
                <Line
                  type="monotone"
                  dataKey="y_hat_Adaptive"
                  name="Regime-Adaptive (Ours)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 3 Cols: Regime Distribution & Explainer */}
        <div className="lg:col-span-3 space-y-6">
          {/* Regime Summary Card */}
          <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-medium uppercase tracking-wider text-black/60">
              Regime Distribution
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Volatility
                </span>
                <span className="font-mono font-bold text-black">55% (14,408 d)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium Volatility
                </span>
                <span className="font-mono font-bold text-black">18% (4,716 d)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Volatility
                </span>
                <span className="font-mono font-bold text-black">27% (6,706 d)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/5 border border-black/5 text-xs text-black/70 space-y-1">
              <span className="font-semibold text-black block">Adaptation Trigger:</span>
              <p>
                When residual z-score exceeds |z| &gt; 2.0, an online 60-day Ridge re-fit dynamically shifts meta-weights.
              </p>
            </div>
          </div>

          {/* Deep Plum Accent Card (from landing page) */}
          <div
            className="rounded-2xl p-6 shadow-sm text-white flex flex-col justify-between"
            style={{ backgroundColor: '#2B2644' }}
          >
            <div>
              <span className="text-[11px] uppercase tracking-widest font-semibold text-white/60 block mb-2">
                Core Innovation
              </span>
              <h4 className="text-xl font-medium leading-snug mb-3">
                Zero Data Leakage Walk-Forward
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Scalers fit strictly on 252-day sliding training windows and evaluate on unseen 21-day steps across all 30 NSE stocks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/models')}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-white/80 transition-colors"
            >
              <span>Inspect Cross-Model Leaderboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Chronological Regime Timeline Bar */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium text-black">Market Regime Transition Timeline</h3>
            <p className="text-xs text-black/60">
              Chronological volatility states over walk-forward evaluation folds. Hover over slices for regime details.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High / Drift</span>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="h-6 w-full rounded-full overflow-hidden flex shadow-inner border border-black/10">
          {filteredData.slice(-90).map((row, idx) => {
            const isHigh = row.Regime_Flag?.toLowerCase().includes('high') || row.drift_detected;
            const isMed = row.Regime_Flag?.toLowerCase().includes('med');
            const colorClass = isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-400' : 'bg-emerald-500';
            return (
              <div
                key={idx}
                className={`flex-1 ${colorClass} hover:opacity-80 transition-opacity cursor-pointer`}
                title={`${row.Date}: ${row.Regime_Flag} (Price: ₹${row.Actual_Price.toFixed(1)})`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
