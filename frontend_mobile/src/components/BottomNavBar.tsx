import React from "react";
import { Home, ListOrdered, Plus, BarChart3, Sparkles } from "lucide-react";
import { ActiveTab } from "../types";

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenKeypad: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenKeypad,
}) => {
  return (
    <>
      {/* Soft gradient bottom fade so scrolling page content smoothly fades under the floating bar */}
      <div className="fixed sm:absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F6F4EE] via-[#F6F4EE]/90 to-transparent z-30 pointer-events-none" />

      {/* Floating Docked Navigation Bar */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed sm:absolute bottom-3.5 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none"
      >
        <div className="w-full max-w-[370px] bg-white/95 backdrop-blur-2xl border border-[#EBE8DF] shadow-floating-nav rounded-full px-5 py-2 flex items-center justify-between pointer-events-auto">
          {/* Tab 1: Home */}
          <button
            onClick={() => onTabChange("home")}
            className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
              activeTab === "home"
                ? "text-[#141414] font-bold scale-105"
                : "text-[#8E8E93] hover:text-[#141414]"
            }`}
          >
            <div className="p-1">
              <Home size={19} strokeWidth={activeTab === "home" ? 2.6 : 1.8} />
            </div>
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          {/* Tab 2: Activity / Ablation */}
          <button
            onClick={() => onTabChange("activity")}
            className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
              activeTab === "activity"
                ? "text-[#141414] font-bold scale-105"
                : "text-[#8E8E93] hover:text-[#141414]"
            }`}
          >
            <div className="p-1">
              <ListOrdered size={19} strokeWidth={activeTab === "activity" ? 2.6 : 1.8} />
            </div>
            <span className="text-[10px] tracking-tight">Activity</span>
          </button>

          {/* Center Floating Amber Action Button (+) */}
          <div className="relative -top-3.5">
            <button
              onClick={onOpenKeypad}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#E6931E] to-[#F5B758] text-white flex items-center justify-center shadow-fab-glow hover:scale-108 active:scale-95 transition-all duration-200"
              title="Quick Predict / Simulation Keypad"
            >
              <Plus size={22} strokeWidth={2.6} />
            </button>
          </div>

          {/* Tab 3: Insights / Regimes */}
          <button
            onClick={() => onTabChange("insights")}
            className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
              activeTab === "insights"
                ? "text-[#141414] font-bold scale-105"
                : "text-[#8E8E93] hover:text-[#141414]"
            }`}
          >
            <div className="p-1">
              <BarChart3 size={19} strokeWidth={activeTab === "insights" ? 2.6 : 1.8} />
            </div>
            <span className="text-[10px] tracking-tight">Insights</span>
          </button>

          {/* Tab 4: SHAP / Leaderboard */}
          <button
            onClick={() => onTabChange("shap")}
            className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
              activeTab === "shap"
                ? "text-[#141414] font-bold scale-105"
                : "text-[#8E8E93] hover:text-[#141414]"
            }`}
          >
            <div className="p-1">
              <Sparkles size={19} strokeWidth={activeTab === "shap" ? 2.6 : 1.8} />
            </div>
            <span className="text-[10px] tracking-tight">SHAP</span>
          </button>
        </div>
      </nav>
    </>
  );
};
