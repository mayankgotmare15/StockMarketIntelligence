import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { BacktestRow } from "../types";

interface ActivityScreenProps {
  backtestData: BacktestRow[];
  selectedStock: string;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ backtestData, selectedStock }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Adaptive" | "Static" | "Drift" | "HighVol">("All");

  // Filter items
  const filteredItems = useMemo(() => {
    return backtestData.filter((item) => {
      // Search text match
      const matchesSearch =
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm) ||
        item.regime_flag.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter pills
      if (filterType === "Adaptive") return Math.abs(item.adaptive_residual) < Math.abs(item.static_residual);
      if (filterType === "Static") return Math.abs(item.static_residual) <= Math.abs(item.adaptive_residual);
      if (filterType === "Drift") return item.drift_detected || Math.abs(item.z_score) > 1.8;
      if (filterType === "HighVol") return item.regime_flag === "High";

      return true;
    });
  }, [backtestData, searchTerm, filterType]);

  // Group by relative date (TODAY, YESTERDAY, EARLIER)
  const groupedData = useMemo(() => {
    const today = filteredItems.slice(0, 3);
    const yesterday = filteredItems.slice(3, 8);
    const earlier = filteredItems.slice(8, 25);

    return [
      { label: "RECENT OUT-OF-SAMPLE", items: today },
      { label: "PREVIOUS FOLDS", items: yesterday },
      { label: "HISTORICAL WALK-FORWARD", items: earlier },
    ].filter((g) => g.items.length > 0);
  }, [filteredItems]);

  const brandColors = [
    { bg: "#EBF5FF", text: "#2563EB", border: "#BFDBFE" },
    { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
    { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
    { bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
    { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  ];

  return (
    <div className="px-5 space-y-4 pt-1">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#141414]">Activity</h1>
        <span className="text-xs font-semibold text-[#8E8E93] bg-white px-2.5 py-1 rounded-full border border-[#EBE8DF]">
          {filteredItems.length} Predictions
        </span>
      </div>

      {/* 2. Search Bar matching design */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={16} />
        <input
          type="text"
          placeholder="Search predictions, dates, regimes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-[#EBE8DF] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#141414] placeholder-[#8E8E93] focus:outline-none focus:border-[#141414] transition shadow-xs"
        />
      </div>

      {/* 3. Filter Pills matching design (All, Expenses, Income, Recurring) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-5 px-5">
        {[
          { key: "All", label: "All" },
          { key: "Adaptive", label: "Adaptive Wins" },
          { key: "Static", label: "Static Control" },
          { key: "Drift", label: "Drift Events" },
          { key: "HighVol", label: "High Volatility" },
        ].map((tab) => {
          const isActive = filterType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#141414] text-white shadow-xs"
                  : "bg-white text-[#555] border border-[#EBE8DF] hover:border-[#141414]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Date Grouped Transactions List */}
      <div className="space-y-4">
        {groupedData.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8E8E93] tracking-wider uppercase px-1">
              <span>{group.label}</span>
              <span>{group.items.length} items</span>
            </div>

            <div className="space-y-2">
              {group.items.map((item, idx) => {
                const color = brandColors[idx % brandColors.length];
                const isPositive = item.actual_return >= 0;
                const isDrift = item.drift_detected || Math.abs(item.z_score) > 2.0;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-3.5 border border-[#EBE8DF]/80 shadow-card flex items-center justify-between hover:border-[#141414] transition"
                  >
                    {/* Left: Custom Brand Style Icon & Title */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border"
                        style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
                      >
                        {item.symbol.slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#141414]">
                            {item.symbol.replace(".NS", "")}
                          </span>
                          {isDrift && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold bg-[#FEE2E2] text-[#DC2626] px-1.5 py-0.2 rounded-md">
                              <Zap size={8} /> DRIFT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8E8E93] mt-0.5">
                          {item.date} • {item.regime_flag} Volatility
                        </div>
                      </div>
                    </div>

                    {/* Right: Return & Price Prediction */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-0.5 text-xs font-bold text-[#141414]">
                        {isPositive ? (
                          <span className="text-[#059669]">+{Math.abs(item.actual_return * 100).toFixed(2)}%</span>
                        ) : (
                          <span className="text-[#141414]">-{Math.abs(item.actual_return * 100).toFixed(2)}%</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8E8E93] font-medium">
                        ₹{Math.round(item.actual_price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
