import React, { useState } from "react";
import { Wifi, Battery, Smartphone, Maximize2 } from "lucide-react";

interface IPhoneFrameProps {
  children: React.ReactNode;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({ children }) => {
  const [isFramed, setIsFramed] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-[#1F1E1B] flex flex-col items-center justify-center p-0 sm:p-6 select-none">
      {/* Top Floating Viewport Control Bar */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-4 py-2 rounded-2xl bg-[#2A2926]/80 backdrop-blur-md border border-white/5 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium tracking-wide">Sikka Mobile Terminal</span>
        </div>
        <button
          onClick={() => setIsFramed(!isFramed)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-white font-medium"
        >
          {isFramed ? <Maximize2 size={12} /> : <Smartphone size={12} />}
          <span>{isFramed ? "Fluid View" : "Device Frame"}</span>
        </button>
      </header>

      {/* Main Container */}
      <main
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden ${
          isFramed
            ? "max-w-[420px] h-[890px] rounded-[50px] border-[10px] border-[#242320] shadow-[0_25px_70px_rgba(0,0,0,0.85)] bg-[#F6F4EE]"
            : "max-w-md min-h-screen bg-[#F6F4EE] shadow-2xl"
        }`}
      >
        {/* iOS Dynamic Island Status Bar */}
        <section className="pt-3 px-7 pb-2 flex items-center justify-between z-50 shrink-0 select-none bg-transparent">
          {/* Time */}
          <span className="font-semibold text-[15px] tracking-tight text-[#141414]">9:41</span>

          {/* Dynamic Island Notch */}
          <div className="w-[122px] h-[32px] bg-black rounded-full flex items-center justify-between px-3 shadow-inner">
            <div className="w-3 h-3 rounded-full bg-[#111] border border-white/10" />
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#151515]" />
            </div>
          </div>

          {/* Icons: Signal, WiFi, Battery */}
          <div className="flex items-center gap-1.5 text-[#141414]">
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-0.5 h-1.5 bg-black rounded-xs" />
              <div className="w-0.5 h-2 bg-black rounded-xs" />
              <div className="w-0.5 h-2.5 bg-black rounded-xs" />
              <div className="w-0.5 h-3 bg-black rounded-xs" />
            </div>
            <Wifi size={14} strokeWidth={2.5} />
            <Battery size={18} strokeWidth={2.5} className="fill-black" />
          </div>
        </section>

        {/* Dynamic Screen Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative flex flex-col">
          {children}
        </div>

        {/* iOS Bottom Home Bar */}
        <footer className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-36 h-1 bg-[#141414]/40 rounded-full z-50 pointer-events-none" />
      </main>
    </div>
  );
};
