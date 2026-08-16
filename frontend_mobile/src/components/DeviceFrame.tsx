import React, { useState } from "react";
import {
  Wifi,
  Battery,
  Maximize2,
} from "lucide-react";

export type DeviceMode = "iphone" | "android" | "fluid";

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("iphone");

  return (
    <div className="min-h-screen bg-[#1A1916] flex flex-col items-center justify-center p-0 sm:p-6 select-none overflow-x-hidden">
      {/* Top Device Selector Switcher */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-3.5 py-2 rounded-2xl bg-[#282724]/90 backdrop-blur-md border border-white/10 text-xs text-white shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F2A93B] animate-pulse" />
          <span className="font-semibold text-white/90 tracking-wide text-[11px]">StockAI Terminal</span>
        </div>

        {/* Device Switcher Pills */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10">
          <button
            onClick={() => setDeviceMode("iphone")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
              deviceMode === "iphone"
                ? "bg-[#F2A93B] text-[#141414] font-bold shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span>iPhone 16</span>
          </button>
          <button
            onClick={() => setDeviceMode("android")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
              deviceMode === "android"
                ? "bg-[#F2A93B] text-[#141414] font-bold shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span>Android</span>
          </button>
          <button
            onClick={() => setDeviceMode("fluid")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
              deviceMode === "fluid"
                ? "bg-[#F2A93B] text-[#141414] font-bold shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Maximize2 size={11} />
            <span>Fluid</span>
          </button>
        </div>
      </header>

      {/* Main Device Chassis */}
      <main
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden bg-[#F6F4EE] ${
          deviceMode === "iphone"
            ? "max-w-[414px] h-[880px] rounded-[52px] border-[10px] border-[#252422] shadow-[0_30px_90px_rgba(0,0,0,0.85)]"
            : deviceMode === "android"
            ? "max-w-[412px] h-[870px] rounded-[44px] border-[9px] border-[#2A2926] shadow-[0_30px_90px_rgba(0,0,0,0.85)]"
            : "max-w-md min-h-screen shadow-2xl"
        }`}
      >
        {/* ================= iPhone Top Status Bar ================= */}
        {deviceMode === "iphone" && (
          <section className="pt-3 px-7 pb-1.5 flex items-center justify-between z-40 shrink-0 select-none bg-transparent">
            {/* iOS Clock */}
            <span className="font-semibold text-[15px] tracking-tight text-[#141414]">9:41</span>

            {/* Dynamic Island Notch */}
            <div className="w-[124px] h-[31px] bg-black rounded-full flex items-center justify-between px-3 shadow-inner">
              <div className="w-3 h-3 rounded-full bg-[#151515] border border-white/10" />
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#181818]" />
              </div>
            </div>

            {/* iOS Status Icons */}
            <div className="flex items-center gap-1.5 text-[#141414]">
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 h-1 bg-black rounded-xs" />
                <div className="w-0.5 h-1.5 bg-black rounded-xs" />
                <div className="w-0.5 h-2 bg-black rounded-xs" />
                <div className="w-0.5 h-3 bg-black rounded-xs" />
              </div>
              <Wifi size={14} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="fill-black" />
            </div>
          </section>
        )}

        {/* ================= Android Top Status Bar ================= */}
        {deviceMode === "android" && (
          <section className="relative pt-2.5 px-6 pb-2.5 flex items-center justify-between z-40 shrink-0 select-none bg-transparent border-b border-black/5">
            {/* Android Clock */}
            <span className="font-medium text-[13px] tracking-normal text-[#141414]">09:41</span>

            {/* Android Centered Punch-Hole Camera (Perfect Absolute Center) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border-[1.5px] border-[#383734] flex items-center justify-center shadow-xs pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#111] ring-1 ring-blue-900/40" />
            </div>

            {/* Android Status Icons (5G, Wifi, Battery) */}
            <div className="flex items-center gap-2 text-[#141414]">
              <span className="text-[10px] font-bold tracking-tight">5G</span>
              <Wifi size={13} strokeWidth={2.2} />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-semibold">100%</span>
                <Battery size={15} strokeWidth={2.2} className="fill-black" />
              </div>
            </div>
          </section>
        )}

        {/* ================= Fluid Mobile Top Bar ================= */}
        {deviceMode === "fluid" && (
          <section className="pt-2 px-5 pb-1 flex items-center justify-between z-40 shrink-0 select-none text-xs text-[#8E8E93]">
            <span className="font-semibold text-[#141414]">Fluid Viewport</span>
            <div className="flex items-center gap-1.5">
              <Wifi size={13} />
              <Battery size={16} />
            </div>
          </section>
        )}

        {/* Main Content Layout Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </div>

        {/* Bottom Hardware Navigation Bar Indicator */}
        {deviceMode === "iphone" && (
          <footer className="w-full pb-2 pt-1 flex justify-center shrink-0 pointer-events-none bg-transparent">
            <div className="w-34 h-1 bg-[#141414]/50 rounded-full" />
          </footer>
        )}

        {deviceMode === "android" && (
          <footer className="w-full pb-2 pt-1 flex justify-center shrink-0 pointer-events-none bg-transparent">
            <div className="w-20 h-1 bg-[#141414]/40 rounded-full" />
          </footer>
        )}
      </main>
    </div>
  );
};
