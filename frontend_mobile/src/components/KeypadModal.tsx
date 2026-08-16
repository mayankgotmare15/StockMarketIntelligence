import React, { useState } from "react";
import { X, Delete, Sparkles, Zap, ArrowRight } from "lucide-react";

interface KeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStock: string;
}

export const KeypadModal: React.FC<KeypadModalProps> = ({
  isOpen,
  onClose,
  selectedStock,
}) => {
  const [amountStr, setAmountStr] = useState("4320");
  const [selectedCategory, setSelectedCategory] = useState<string>("Normal");
  const [simulatedReturn, setSimulatedReturn] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (amountStr.length >= 7) return;
    if (digit === "." && amountStr.includes(".")) return;
    if (amountStr === "0" && digit !== ".") {
      setAmountStr(digit);
    } else {
      setAmountStr(amountStr + digit);
    }
  };

  const handleBackspace = () => {
    if (amountStr.length <= 1) {
      setAmountStr("0");
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  const handleSimulate = () => {
    const p = parseFloat(amountStr) || 1000;
    const mult = selectedCategory === "High Vol" ? 0.024 : selectedCategory === "RSI Low" ? 0.015 : 0.006;
    setSimulatedReturn(mult);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F6F4EE] flex flex-col justify-between p-5 animate-in fade-in duration-200">
      {/* Top Bar with Mode Selector & Close */}
      <div>
        <div className="flex items-center justify-between">
          {/* Pills matching Expense / Income / Transfer in screenshot 4 */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-[#EBE8DF] shadow-xs">
            {["Prediction", "Scenario", "Simulation"].map((mode, i) => (
              <button
                key={i}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition ${
                  i === 0 ? "bg-[#141414] text-white" : "text-[#8E8E93]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#EBE8DF] flex items-center justify-center text-[#141414]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Large Amount Display matching screenshot 4 */}
        <div className="text-center my-4 space-y-1">
          <div className="text-4xl font-extrabold tracking-tight text-[#141414]">
            ₹{amountStr}
          </div>
          <div className="text-xs text-[#8E8E93]">
            {selectedStock.replace(".NS", "")} Current Benchmark Base Price
          </div>

          {simulatedReturn !== null && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6F7F0] text-[#059669] text-xs font-bold rounded-full mt-2 animate-bounce">
              <Sparkles size={12} />
              <span>Adaptive Forecast: ₹{(parseFloat(amountStr) * (1 + simulatedReturn)).toFixed(2)} (+{(simulatedReturn * 100).toFixed(2)}%)</span>
            </div>
          )}
        </div>

        {/* Category Pills matching Dining, Groceries, Transport in screenshot 4 */}
        <div className="space-y-1.5 mt-2">
          <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
            MARKET REGIME SCENARIO
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Normal (Low Vol)", key: "Normal" },
              { label: "High Volatility", key: "High Vol" },
              { label: "RSI Oversold", key: "RSI Low" },
              { label: "MACD Bullish", key: "MACD" },
            ].map((cat) => {
              const isSel = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    isSel
                      ? "bg-[#141414] text-white shadow-xs"
                      : "bg-white text-[#555] border border-[#EBE8DF]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Numeric Keypad Grid matching screenshot 4 */}
      <div className="space-y-3 pb-4">
        <div className="grid grid-cols-3 gap-2.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((key) => (
            <button
              key={key}
              onClick={() => handleDigit(key)}
              className="h-12 rounded-2xl bg-white border border-[#EBE8DF] shadow-xs text-lg font-bold text-[#141414] active:bg-[#EFECE1] active:scale-95 transition flex items-center justify-center"
            >
              {key}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-white border border-[#EBE8DF] shadow-xs text-lg font-bold text-[#141414] active:bg-[#EFECE1] active:scale-95 transition flex items-center justify-center"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Bottom CTA Button */}
        <button
          onClick={handleSimulate}
          className="w-full py-3.5 rounded-2xl bg-[#141414] text-white font-bold text-xs tracking-wide shadow-lg hover:bg-black active:scale-98 transition flex items-center justify-center gap-2"
        >
          <span>Run Adaptive Ensemble Simulation</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
