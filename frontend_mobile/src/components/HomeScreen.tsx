import React, { useState, useMemo } from "react";
import {
  Bell,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  PieChart,
  Award,
} from "lucide-react";
import { StockMetadata, BacktestRow, RegimeDistributionItem } from "../types";

interface HomeScreenProps {
  stocks: StockMetadata[];
  selectedStock: string;
  onSelectStock: (symbol: string) => void;
  backtestData: BacktestRow[];
  regimeData: { distribution: RegimeDistributionItem[]; drift_events_count: number };
  onSync: () => void;
  isLoading: boolean;
  onNavigateTab: (tab: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  backtestData,
  onSync,
  isLoading,
  onNavigateTab,
}) => {
  const [timeframe, setTimeframe] = useState<"Week" | "Month" | "Year">("Month");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Latest stock details
  const activeStockInfo = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedStock) || stocks[0] || {
      symbol: selectedStock,
      name: "Indian Stock",
      sector: "NSE",
    };
  }, [stocks, selectedStock]);

  const latestRow = backtestData[backtestData.length - 1] || {
    actual_price: 4320.70,
    actual_return: 0.0085,
    y_hat_adaptive_price: 4345.20,
    y_hat_static_price: 4290.10,
    y_hat_adaptive: 0.0055,
    y_hat_static: 0.0035,
    regime_flag: "Low",
    drift_detected: false,
    z_score: 0.42,
    date: "2026-08-14"
  };

  // Generate SVG points for smooth golden area chart
  const chartPoints = useMemo(() => {
    const dataSlice = backtestData.length > 0 ? backtestData.slice(-25) : [];
    if (dataSlice.length === 0) return { path: "", area: "", points: [] };

    const prices = dataSlice.map((d) => d.actual_price);
    const minP = Math.min(...prices) * 0.99;
    const maxP = Math.max(...prices) * 1.01;
    const range = maxP - minP || 1;

    const width = 340;
    const height = 110;

    const coords = dataSlice.map((d, i) => {
      const x = (i / (dataSlice.length - 1)) * width;
      const y = height - ((d.actual_price - minP) / range) * height;
      return { x, y, price: d.actual_price, date: d.date, adaptivePrice: d.y_hat_adaptive_price };
    });

    // Build SVG Path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const cur = coords[i];
      const cx = (prev.x + cur.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return { path: pathD, area: areaD, points: coords };
  }, [backtestData]);

  const activeHoverPoint = hoveredIndex !== null && chartPoints.points[hoveredIndex]
    ? chartPoints.points[hoveredIndex]
    : chartPoints.points[chartPoints.points.length - 1];

  return (
    <div className="px-5 space-y-4 pt-1">
      {/* 1. Header: StockAI, Sync Info, Bell, Avatar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414] font-sans flex items-center gap-1.5">
            <span>StockAI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]" />
          </h1>
          <button
            onClick={onSync}
            className="flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-[#141414] transition mt-0.5"
          >
            <RefreshCw size={11} className={isLoading ? "animate-spin text-[#F2A93B]" : ""} />
            <span>Updated 2 min ago • Tap to sync</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative w-9 h-9 rounded-full bg-white border border-[#EBE8DF] flex items-center justify-center text-[#141414] shadow-xs hover:bg-[#FAF9F5] transition">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F2A93B]" />
          </button>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#141414] to-[#454545] p-0.5 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
            <span>AI</span>
          </div>
        </div>
      </div>

      {/* 2. Stock Universe Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
        {stocks.map((s) => {
          const isSelected = s.symbol === selectedStock;
          return (
            <button
              key={s.symbol}
              onClick={() => onSelectStock(s.symbol)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#141414] text-white shadow-md scale-102"
                  : "bg-white text-[#555] border border-[#EBE8DF] hover:border-[#141414]"
              }`}
            >
              <span>{s.symbol.replace(".NS", "")}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-[#F6F4EE] text-[#8E8E93]"}`}>
                {s.sector}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Hero Metric & Golden Chart Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 shadow-card relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase">
              {activeStockInfo.name} • FORECAST
            </div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-3xl font-extrabold tracking-tight text-[#141414]">
                ₹{latestRow.actual_price ? latestRow.actual_price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "4,320.18"}
              </span>
              <div className="flex items-center gap-0.5 text-xs font-semibold text-[#059669] bg-[#E6F7F0] px-2 py-0.5 rounded-full">
                <TrendingUp size={12} />
                <span>+9% vs Static</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Tooltip display */}
        {activeHoverPoint && (
          <div className="absolute top-4 right-5 bg-[#141414] text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
            <span className="text-[#F2A93B]">●</span>
            <span>{activeHoverPoint.date}</span>
            <span>•</span>
            <span className="font-semibold">₹{Math.round(activeHoverPoint.price)}</span>
          </div>
        )}

        {/* Interactive Golden Gradient SVG Chart */}
        <div className="mt-4 relative h-[120px] w-full">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 340 110"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2A93B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F2A93B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            {chartPoints.area && (
              <path d={chartPoints.area} fill="url(#goldGrad)" />
            )}

            {/* Golden Line */}
            {chartPoints.path && (
              <path
                d={chartPoints.path}
                fill="none"
                stroke="#E6931E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive hover points */}
            {chartPoints.points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 5 : 2}
                className={`transition-all cursor-pointer ${
                  hoveredIndex === idx ? "fill-[#141414] stroke-white stroke-2" : "fill-transparent hover:fill-[#E6931E]"
                }`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onTouchStart={() => setHoveredIndex(idx)}
              />
            ))}
          </svg>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center justify-between bg-[#FAF9F5] p-1 rounded-2xl border border-[#EBE8DF]/60 mt-2">
          {(["Week", "Month", "Year"] as const).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#141414] text-white shadow-xs"
                    : "text-[#8E8E93] hover:text-[#141414]"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Comparison Summary Split Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Static Control */}
        <div className="bg-white rounded-3xl p-4 border border-[#EBE8DF]/80 shadow-card">
          <div className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
            STATIC CONTROL (LIU)
          </div>
          <div className="text-xl font-bold text-[#141414] mt-1">
            0.01168
          </div>
          <div className="w-full h-1 bg-[#EBE8DF] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#F2A93B] w-[75%]" />
          </div>
          <div className="text-[10px] text-[#8E8E93] mt-1.5">
            OLS Linear Stacking
          </div>
        </div>

        {/* Card 2: Regime-Adaptive */}
        <div className="bg-white rounded-3xl p-4 border border-[#EBE8DF]/80 shadow-card">
          <div className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
            REGIME-ADAPTIVE
          </div>
          <div className="text-xl font-bold text-[#059669] mt-1">
            0.01060
          </div>
          <div className="w-full h-1 bg-[#EBE8DF] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#059669] w-[92%]" />
          </div>
          <div className="text-[10px] text-[#059669] font-medium mt-1.5">
            ▲ -9.2% Lower Error
          </div>
        </div>
      </div>

      {/* 5. Circular Regime Donut Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* SVG Donut Ring */}
            <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#EBE8DF"
                  strokeWidth="3.5"
                />
                {/* Low Volatility segment (48%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F2A93B"
                  strokeWidth="3.8"
                  strokeDasharray="48, 100"
                />
                {/* Medium Volatility segment (36%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="3.8"
                  strokeDasharray="36, 100"
                  strokeDashoffset="-48"
                />
                {/* High Volatility segment (16%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.8"
                  strokeDasharray="16, 100"
                  strokeDashoffset="-84"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[9px] font-semibold text-[#8E8E93] uppercase">REGIME</span>
                <span className="text-xs font-extrabold text-[#141414]">{latestRow.regime_flag}</span>
              </div>
            </div>

            {/* Legend breakdown */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-[#555]">
                  <span className="w-2 h-2 rounded-full bg-[#F2A93B]" /> Low Volatility
                </span>
                <span className="font-semibold text-[#141414]">48%</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-[#555]">
                  <span className="w-2 h-2 rounded-full bg-[#F43F5E]" /> Medium Volatility
                </span>
                <span className="font-semibold text-[#141414]">36%</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-[#555]">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" /> High Volatility
                </span>
                <span className="font-semibold text-[#141414]">16%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Health Score Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#EBE8DF]/80 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E6F7F0] border-2 border-[#059669] flex items-center justify-center font-bold text-sm text-[#059669]">
            88
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              MODEL ROBUSTNESS SCORE
            </div>
            <div className="text-sm font-bold text-[#141414]">
              Strong Stability
            </div>
            <div className="text-[11px] font-medium text-[#059669] flex items-center gap-0.5">
              <span>▲ +4 this walk-forward fold</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab("insights")}
          className="w-8 h-8 rounded-full bg-[#FAF9F5] flex items-center justify-center text-[#141414] hover:bg-[#EBE8DF]"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 7. AI Drift Alert Banner */}
      <div className="bg-[#141414] rounded-3xl p-4 text-white shadow-xl flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={13} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Adaptive Ridge Re-fit Active</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] mt-0.5 leading-relaxed">
              Residual drift detected (|z| = 2.14). Re-estimated beta on trailing 60 days (+13.4% error reduction).
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab("insights")}
          className="bg-[#2A2A2A] hover:bg-[#3A3A3A] px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#F2A93B] shrink-0"
        >
          Inspect
        </button>
      </div>

      {/* 8. Quick Action Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Ablation", icon: Layers, tab: "activity" },
          { label: "Regimes", icon: PieChart, tab: "insights" },
          { label: "Tree SHAP", icon: Sparkles, tab: "shap" },
          { label: "Leaderboard", icon: Award, tab: "shap" },
          { label: "Signals", icon: Activity, tab: "activity" },
          { label: "Security", icon: ShieldCheck, tab: "home" },
        ].map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={() => onNavigateTab(act.tab)}
              className="bg-white rounded-2xl p-3 border border-[#EBE8DF]/80 shadow-xs hover:border-[#141414] transition flex flex-col items-center gap-1.5 text-center"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] text-[#141414] flex items-center justify-center">
                <Icon size={16} />
              </div>
              <span className="text-[11px] font-semibold text-[#141414] tracking-tight">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* 9. Recent Predictions Feed */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#141414] uppercase tracking-wider">Recent Predictions</span>
          <button onClick={() => onNavigateTab("activity")} className="text-xs font-semibold text-[#8E8E93] hover:text-[#141414]">
            See all
          </button>
        </div>

        <div className="space-y-2">
          {backtestData.slice(-3).reverse().map((row, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-3.5 border border-[#EBE8DF]/80 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#EBE8DF] flex items-center justify-center font-bold text-xs text-[#141414]">
                  {row.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#141414]">{row.symbol.replace(".NS", "")}</div>
                  <div className="text-[10px] text-[#8E8E93]">
                    {row.date} • {row.regime_flag} Vol
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#141414]">
                  ₹{Math.round(row.actual_price)}
                </div>
                <div className={`text-[10px] font-semibold ${row.actual_return >= 0 ? "text-[#059669]" : "text-[#DC2626]"}`}>
                  {row.actual_return >= 0 ? "+" : ""}{(row.actual_return * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
