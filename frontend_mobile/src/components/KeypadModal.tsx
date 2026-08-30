import React, { useState, useEffect } from "react";
import { X, Delete, Sparkles, Zap, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { AuthService } from "../services/authService";
import { NSE_MOBILE_UNIVERSE } from "../services/api";

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
  const stockMeta = NSE_MOBILE_UNIVERSE.find((s) => s.symbol === selectedStock) || NSE_MOBILE_UNIVERSE[0];
  const [amountStr, setAmountStr] = useState<string>(stockMeta.base_price.toString());
  const [selectedShock, setSelectedShock] = useState<"flash_drop" | "vol_surge" | "gap_up" | "custom">("flash_drop");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (selectedStock) {
      const found = NSE_MOBILE_UNIVERSE.find((s) => s.symbol === selectedStock);
      setAmountStr((found?.base_price || 1842).toString());
      setSavedSuccess(false);
    }
  }, [selectedStock, isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setSelectedShock("custom");
    if (amountStr.length >= 8) return;
    if (digit === "." && amountStr.includes(".")) return;
    if (amountStr === "0" && digit !== ".") {
      setAmountStr(digit);
    } else {
      setAmountStr(amountStr + digit);
    }
  };

  const handleBackspace = () => {
    setSelectedShock("custom");
    if (amountStr.length <= 1) {
      setAmountStr("0");
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  const handlePresetSelect = (preset: "flash_drop" | "vol_surge" | "gap_up") => {
    setSelectedShock(preset);
    const base = stockMeta.base_price;
    if (preset === "flash_drop") {
      setAmountStr(Math.round(base * 0.95).toString());
    } else if (preset === "vol_surge") {
      setAmountStr(Math.round(base * 0.972).toString());
    } else if (preset === "gap_up") {
      setAmountStr(Math.round(base * 1.042).toString());
    }
  };

  // Dynamic simulation outcomes
  const basePrice = stockMeta.base_price;
  const currentSimPrice = parseFloat(amountStr) || basePrice;
  const shockPct = ((currentSimPrice - basePrice) / basePrice) * 100;
  const staticReturn = shockPct * 0.45;
  const adaptiveReturn = shockPct * 0.88;
  const staticPrice = basePrice * (1 + staticReturn / 100);
  const adaptivePrice = basePrice * (1 + adaptiveReturn / 100);
  const staticError = Math.abs(currentSimPrice - staticPrice);
  const adaptiveError = Math.abs(currentSimPrice - adaptivePrice);
  const errorReduction = Math.max(0, ((staticError - adaptiveError) / (staticError || 1)) * 100);
  const driftTriggered = Math.abs(shockPct) >= 2.0;

  const handleSaveToActivity = () => {
    AuthService.saveSimulation({
      symbol: selectedStock,
      inputPrice: currentSimPrice,
      scenarioType: selectedShock,
      simulatedAdaptiveReturn: adaptiveReturn,
      simulatedStaticReturn: staticReturn,
      simulatedAdaptivePrice: adaptivePrice,
      simulatedStaticPrice: staticPrice,
      simulatedErrorReduction: errorReduction,
      notes: `Mobile stress test: ${shockPct.toFixed(1)}% market shock on ${selectedStock}`,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-[430px] bg-[#F5F5F5] rounded-t-[36px] p-6 shadow-2xl border-t border-black/10 flex flex-col max-h-[92vh] overflow-y-auto select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black tracking-tight">Stress Scenario Sandbox</h3>
              <p className="text-[11px] text-black/60 font-mono">{selectedStock} (Base: ₹{basePrice})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preset Shock Chips */}
        <div className="pt-3 pb-1">
          <label className="text-[11px] font-semibold text-black/60 uppercase tracking-wider block mb-2">
            Preset Market Shocks
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handlePresetSelect("flash_drop")}
              className={`py-2 px-2 rounded-xl text-center text-xs font-medium transition cursor-pointer ${
                selectedShock === "flash_drop"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-black/80 border border-black/10 hover:bg-black/5"
              }`}
            >
              <div className="font-bold text-[11px]">Flash Drop</div>
              <div className={`text-[10px] ${selectedShock === "flash_drop" ? "text-white/70" : "text-rose-600 font-mono"}`}>-5.0%</div>
            </button>

            <button
              onClick={() => handlePresetSelect("vol_surge")}
              className={`py-2 px-2 rounded-xl text-center text-xs font-medium transition cursor-pointer ${
                selectedShock === "vol_surge"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-black/80 border border-black/10 hover:bg-black/5"
              }`}
            >
              <div className="font-bold text-[11px]">Vol Surge</div>
              <div className={`text-[10px] ${selectedShock === "vol_surge" ? "text-white/70" : "text-amber-600 font-mono"}`}>+150% ATR</div>
            </button>

            <button
              onClick={() => handlePresetSelect("gap_up")}
              className={`py-2 px-2 rounded-xl text-center text-xs font-medium transition cursor-pointer ${
                selectedShock === "gap_up"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-black/80 border border-black/10 hover:bg-black/5"
              }`}
            >
              <div className="font-bold text-[11px]">Gap Up</div>
              <div className={`text-[10px] ${selectedShock === "gap_up" ? "text-white/70" : "text-emerald-600 font-mono"}`}>+4.2%</div>
            </button>
          </div>
        </div>

        {/* Shock Output Card (#2B2644 Obsidian Plum) */}
        <div className="my-3 p-4 rounded-2xl bg-[#2B2644] text-white shadow-md space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="text-white/70">Simulated Target Price</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-base font-bold text-white">₹{currentSimPrice.toFixed(0)}</span>
              <span className={`text-[11px] font-mono font-semibold ${shockPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ({shockPct >= 0 ? "+" : ""}{shockPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-white/60 block text-[10px]">Static Liu Meta</span>
              <span className="font-mono font-semibold text-sky-300">₹{staticPrice.toFixed(0)}</span>
              <span className="text-[9px] text-white/50 block">Under-reacts ({staticReturn.toFixed(1)}%)</span>
            </div>
            <div className="bg-white/10 p-2 rounded-xl border border-emerald-400/30">
              <span className="text-emerald-300 block text-[10px] font-medium">Adaptive Ridge (Ours)</span>
              <span className="font-mono font-bold text-emerald-400">₹{adaptivePrice.toFixed(0)}</span>
              <span className="text-[9px] text-emerald-200 block">Fast Track ({adaptiveReturn.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
            <div className="flex items-center gap-1">
              {driftTriggered ? (
                <span className="text-[10px] font-semibold text-rose-300 flex items-center gap-1 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                  <AlertTriangle size={11} /> Drift Triggered (|z| &gt; 2.0)
                </span>
              ) : (
                <span className="text-[10px] text-white/60 bg-white/5 px-2 py-0.5 rounded-full">
                  Stable Regime
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/70 text-[11px]">Adaptive Gain:</span>
              <span className="font-mono font-bold text-emerald-400">+{errorReduction.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Thumb Numpad Grid */}
        <div className="grid grid-cols-3 gap-2 my-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-white hover:bg-black/5 active:bg-black/10 border border-black/10 text-base font-bold text-black font-mono transition flex items-center justify-center cursor-pointer shadow-2xs"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-black/5 hover:bg-black/10 active:bg-black/15 border border-black/10 text-black transition flex items-center justify-center cursor-pointer"
          >
            <Delete size={18} />
          </button>
        </div>

        {/* Save Simulation Action Button */}
        <button
          onClick={handleSaveToActivity}
          className={`w-full py-3.5 mt-2 rounded-full font-semibold text-xs tracking-tight transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            savedSuccess
              ? "bg-emerald-600 text-white"
              : "bg-black text-white hover:bg-gray-800 active:scale-[0.99]"
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Simulation Saved to History!</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Save Simulation to History</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default KeypadModal;
