import React from "react";
import { AlertCircle, RefreshCw, Layers, ArrowRight } from "lucide-react";

interface EmptyStateCardProps {
  symbol: string;
  onSelectAlternativeStock?: (symbol: string) => void;
  onRetrySync?: () => void;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  symbol,
  onSelectAlternativeStock,
  onRetrySync,
}) => {
  const cleanSymbol = symbol.replace(".NS", "");

  const recommendedStocks = [
    { symbol: "APOLLOHOSP.NS", name: "Apollo Hospitals", sector: "Pharma" },
    { symbol: "TCS.NS", name: "TCS", sector: "IT" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Banking" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EBE8DF]/80 shadow-card text-center space-y-4 my-3">
      <div className="w-14 h-14 rounded-full bg-[#FFF4E3] border border-[#F2A93B]/40 flex items-center justify-center mx-auto text-[#B45309]">
        <AlertCircle size={26} strokeWidth={2.2} />
      </div>

      <div>
        <h3 className="text-base font-bold text-[#141414]">
          Backtest results not available for this stock
        </h3>
        <p className="text-xs text-[#787670] mt-1.5 leading-relaxed max-w-xs mx-auto">
          The walk-forward ablation pipeline has not completed evaluation folds for <span className="font-semibold text-[#141414]">{cleanSymbol}</span> or the ticker did not meet the 400 trading days precondition.
        </p>
      </div>

      {/* Recommended Alternative Active Stocks */}
      <div className="pt-2 text-left space-y-2">
        <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
          SWITCH TO STOCKS WITH COMPLETED BACKTEST
        </span>
        <div className="space-y-1.5">
          {recommendedStocks.map((rec) => (
            <button
              key={rec.symbol}
              onClick={() => onSelectAlternativeStock && onSelectAlternativeStock(rec.symbol)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#FAF9F5] border border-[#EBE8DF] hover:border-[#141414] transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#EBE8DF] flex items-center justify-center font-bold text-[11px] text-[#141414]">
                  {rec.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#141414]">{rec.name}</div>
                  <div className="text-[10px] text-[#8E8E93]">{rec.sector} Sector • 1,144 Days</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#8E8E93]" />
            </button>
          ))}
        </div>
      </div>

      {onRetrySync && (
        <button
          onClick={onRetrySync}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF9F5] border border-[#EBE8DF] rounded-xl text-xs font-semibold text-[#141414] hover:bg-[#EBE8DF] transition mt-2"
        >
          <RefreshCw size={12} />
          <span>Retry Data Fetch</span>
        </button>
      )}
    </div>
  );
};
