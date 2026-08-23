import React, { useState } from "react";
import { ChevronLeft, ArrowRight, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { VirtualKeyboard } from "./VirtualKeyboard";

export const AuthStepNameScreen: React.FC = () => {
  const { signupName, setSignupName, goToCredentialsStep, navigateBackAuth } = useAuth();
  const [isFocused, setIsFocused] = useState<boolean>(true);

  const handleKeyPress = (char: string) => {
    if (signupName.length >= 25) return;
    setSignupName(signupName + char);
  };

  const handleBackspace = () => {
    if (signupName.length > 0) {
      setSignupName(signupName.slice(0, -1));
    }
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between pt-4 sm:pt-4 px-5 pb-5 overflow-hidden bg-gradient-to-b from-[#141414] via-[#1E1B18] to-[#2B1D12] text-white select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#F2A93B]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-64 h-64 rounded-full bg-[#E6931E]/15 blur-3xl pointer-events-none" />

      {/* 1. Top Header with Back Button and Step Progress Bar matching Screenshot 2 */}
      <div className="relative z-10 flex items-center justify-between pt-1 pb-2 min-h-[44px]">
        {/* Circular Back Button */}
        <button
          onClick={navigateBackAuth}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/15 backdrop-blur-xl flex items-center justify-center text-white shadow-md transition"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Progress Bar (Step 1 of 2: 50% filled) */}
        <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden flex">
          <div className="w-1/2 h-full bg-white rounded-full shadow-xs transition-all duration-300" />
          <div className="w-1/2 h-full bg-transparent" />
        </div>

        {/* Placeholder spacer for symmetry */}
        <div className="w-10" />
      </div>

      {/* 2. Headline & Subtitle matching Screenshot 2 */}
      <div className="relative z-10 space-y-4 my-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Let's Get Started
          </h1>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">
            Set up your investor profile and start forecasting NSE equities instantly.
          </p>
        </div>

        {/* Glassmorphic Input Field matching Screenshot 2 */}
        <div
          onClick={() => setIsFocused(true)}
          className={`w-full py-3.5 px-4 rounded-2xl bg-white/10 backdrop-blur-2xl border transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg ${
            isFocused ? "border-white/40 ring-2 ring-white/10" : "border-white/15"
          }`}
        >
          <User size={16} className="text-white/60 shrink-0" />
          <div className="flex-1 flex items-center text-sm font-medium text-white tracking-wide">
            <span>{signupName || <span className="text-white/40">Enter your full name</span>}</span>
            {isFocused && (
              <span className="w-0.5 h-4 bg-[#F2A93B] ml-0.5 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        {/* Native physical input fallback for typing */}
        <input
          type="text"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          placeholder="Ariana B"
          className="opacity-0 absolute -top-96 pointer-events-none"
          autoFocus
        />
      </div>

      {/* 3. Floating Action Pill & Virtual Keyboard matching Screenshot 2 */}
      <div className="relative z-10 space-y-3 pb-1">
        {/* Floating Glass Pill Button [ Continue ] */}
        <div className="flex justify-center">
          <button
            onClick={goToCredentialsStep}
            disabled={!signupName.trim()}
            className={`px-8 py-2.5 rounded-full backdrop-blur-2xl border font-bold text-xs tracking-wide shadow-xl flex items-center gap-2 transition-all duration-200 ${
              signupName.trim()
                ? "bg-white/25 hover:bg-white/35 active:scale-95 border-white/40 text-white shadow-white/10"
                : "bg-white/10 border-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <span>Continue</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Interactive Virtual Mobile Keyboard */}
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSubmit={goToCredentialsStep}
        />
      </div>
    </div>
  );
};
