import React, { useState } from "react";
import {
  ChevronLeft,
  User,
  Shield,
  Sliders,
  Bell,
  Trash2,
  LogOut,
  Sparkles,
  Zap,
  Check,
  Smartphone,
  Database,
  Layers,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthService } from "../services/authService";

export const ProfileScreen: React.FC = () => {
  const { user, preferences, closeProfile, updatePreferences, updateProfile, logout } = useAuth();
  const [cacheSize, setCacheSize] = useState<number>(() => AuthService.getCacheSizeKB());
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleClearCache = () => {
    AuthService.clearAllCache();
    setCacheSize(12);
    triggerToast("Local storage cache cleared successfully");
  };

  const availableStocks = [
    { symbol: "APOLLOHOSP.NS", name: "Apollo Hospitals", sector: "Pharma" },
    { symbol: "TCS.NS", name: "TCS", sector: "IT" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Banking" },
    { symbol: "INFY.NS", name: "Infosys", sector: "IT" },
    { symbol: "BAJAJ-AUTO.NS", name: "Bajaj Auto", sector: "Auto" },
  ];

  return (
    <div className="px-5 space-y-4 pt-3 pb-8 text-[#141414]">
      {/* 1. Header with back button */}
      <div className="flex items-center justify-between min-h-[44px]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={closeProfile}
            className="w-9 h-9 rounded-full bg-white border border-[#EBE8DF] flex items-center justify-center text-[#141414] hover:bg-[#FAF9F5] active:scale-95 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414]">Investor Profile</h1>
        </div>
        <span className="text-xs font-semibold text-[#8E8E93] bg-white px-2.5 py-1 rounded-full border border-[#EBE8DF]">
          Settings
        </span>
      </div>

      {/* Toast feedback banner */}
      {showToast && (
        <div className="bg-[#141414] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-[#059669]" />
            <span>{showToast}</span>
          </div>
        </div>
      )}

      {/* 2. User Hero Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 shadow-card relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#141414] to-[#383734] text-white font-bold text-lg flex items-center justify-center shadow-md border-2 border-white">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "AI"}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#059669] border-2 border-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#141414] leading-tight">
                {user?.fullName || "Guest Trader"}
              </h2>
              <span className="text-[9px] font-bold bg-[#FFF4E3] text-[#B45309] px-2 py-0.5 rounded-full border border-[#F2A93B]/40">
                PRO TRADER
              </span>
            </div>
            <p className="text-xs text-[#8E8E93] mt-0.5">{user?.email || "guest@stockai.internal"}</p>
            <div className="text-[10px] text-[#787670] mt-1">
              Sector Focus: <span className="font-semibold text-[#141414]">{user?.investorProfile?.primarySector || "Pharma"}</span> • Horizon: <span className="font-semibold text-[#141414] capitalize">{user?.investorProfile?.tradingHorizon || "Swing"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section: Market & ML Model Preferences */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 shadow-card space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#141414] uppercase tracking-wider">
          <Sliders size={14} className="text-[#F2A93B]" />
          <span>Market & ML Model Settings</span>
        </div>

        {/* Drift Threshold Sensitivity Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#141414]">Drift Detector Sensitivity (|z|-Score)</span>
            <span className="font-mono font-bold text-[#F2A93B]">|z| &gt; {preferences.driftZScoreThreshold}</span>
          </div>
          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            Z-score threshold on rolling 30-day residuals to trigger dynamic Ridge meta-model re-estimation.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { val: 1.5, label: "High (|z|>1.5)" },
              { val: 2.0, label: "Standard (|z|>2.0)" },
              { val: 2.5, label: "Low (|z|>2.5)" },
            ].map((th) => {
              const isSel = preferences.driftZScoreThreshold === th.val;
              return (
                <button
                  key={th.val}
                  onClick={() => {
                    updatePreferences({ driftZScoreThreshold: th.val as any });
                    triggerToast(`Drift threshold updated to |z| > ${th.val}`);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold transition ${
                    isSel
                      ? "bg-[#141414] text-white shadow-xs"
                      : "bg-[#FAF9F5] text-[#555] border border-[#EBE8DF] hover:border-[#141414]"
                  }`}
                >
                  {th.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Benchmark Stock */}
        <div className="space-y-1.5 pt-2 border-t border-[#EBE8DF]/60">
          <span className="text-xs font-semibold text-[#141414] block">Default App Launch Stock</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {availableStocks.map((stk) => {
              const isSel = preferences.defaultStock === stk.symbol;
              return (
                <button
                  key={stk.symbol}
                  onClick={() => {
                    updatePreferences({ defaultStock: stk.symbol });
                    triggerToast(`Default stock set to ${stk.symbol.replace(".NS", "")}`);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    isSel
                      ? "bg-[#F2A93B] text-[#141414] font-bold shadow-xs"
                      : "bg-[#FAF9F5] text-[#555] border border-[#EBE8DF]"
                  }`}
                >
                  {stk.symbol.replace(".NS", "")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Comparison Baseline */}
        <div className="space-y-1.5 pt-2 border-t border-[#EBE8DF]/60">
          <span className="text-xs font-semibold text-[#141414] block">Primary Baseline Comparison</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "Liu_Static", label: "Liu Static OLS (Control)" },
              { key: "LSTM", label: "PyTorch LSTM Base" },
              { key: "ANN", label: "Multi-Layer ANN Base" },
              { key: "XGBoost", label: "XGBoost (SHAP Tree)" },
            ].map((model) => {
              const isSel = preferences.primaryBaselineModel === model.key;
              return (
                <button
                  key={model.key}
                  onClick={() => {
                    updatePreferences({ primaryBaselineModel: model.key as any });
                    triggerToast(`Primary comparison model set to ${model.label}`);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold text-left transition ${
                    isSel
                      ? "bg-[#141414] text-white shadow-xs"
                      : "bg-[#FAF9F5] text-[#555] border border-[#EBE8DF]"
                  }`}
                >
                  {model.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Section: App Alerts & Security */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 shadow-card space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#141414] uppercase tracking-wider">
          <Shield size={14} className="text-[#059669]" />
          <span>Alerts & Security</span>
        </div>

        {/* Regime Alert Toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-semibold text-[#141414]">Volatility Regime Spike Alerts</div>
            <div className="text-[11px] text-[#8E8E93]">Push notifications on high volatility transitions</div>
          </div>
          <button
            onClick={() => updatePreferences({ enableRegimeAlerts: !preferences.enableRegimeAlerts })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              preferences.enableRegimeAlerts ? "bg-[#059669]" : "bg-[#EBE8DF]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                preferences.enableRegimeAlerts ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Biometric Lock Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-[#EBE8DF]/60">
          <div>
            <div className="text-xs font-semibold text-[#141414]">Biometric FaceID / PIN Lock</div>
            <div className="text-[11px] text-[#8E8E93]">Require biometrics on opening StockAI</div>
          </div>
          <button
            onClick={() => updatePreferences({ enableBiometrics: !preferences.enableBiometrics })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              preferences.enableBiometrics ? "bg-[#059669]" : "bg-[#EBE8DF]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                preferences.enableBiometrics ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Section: Data Engine & System Diagnostics */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE8DF]/80 shadow-card space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#141414] uppercase tracking-wider">
          <Database size={14} className="text-[#3B82F6]" />
          <span>System & Storage Diagnostics</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#787670]">Offline Storage Cache:</span>
          <span className="font-mono font-bold text-[#141414]">{cacheSize} KB</span>
        </div>

        <button
          onClick={handleClearCache}
          className="w-full py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EBE8DF] text-xs font-semibold text-[#141414] hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#DC2626]/30 transition flex items-center justify-center gap-2"
        >
          <Trash2 size={13} />
          <span>Flush Local Offline Cache</span>
        </button>
      </div>

      {/* 6. Sign Out Action Button */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-2xl bg-[#FEE2E2] border border-[#DC2626]/30 text-[#DC2626] font-bold text-xs shadow-xs hover:bg-[#DC2626] hover:text-white transition flex items-center justify-center gap-2"
      >
        <LogOut size={15} />
        <span>Sign Out of StockAI Account</span>
      </button>

      <div className="text-center pt-1 text-[10px] text-[#8E8E93]">
        StockMarketIntelligence v4.0 • Academic Ablation Edition
      </div>
    </div>
  );
};
