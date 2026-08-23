import React, { useState } from "react";
import { ChevronLeft, ArrowRight, Mail, Lock, Eye, EyeOff, Sparkles, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { TradingHorizon, RiskTolerance } from "../types/auth";

export const AuthStepAccountScreen: React.FC = () => {
  const {
    signupEmail,
    signupPassword,
    signupSector,
    signupHorizon,
    signupRisk,
    setSignupEmail,
    setSignupPassword,
    setSignupSector,
    setSignupHorizon,
    setSignupRisk,
    completeSignup,
    navigateBackAuth,
  } = useAuth();

  const [activeField, setActiveField] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleKeyPress = (char: string) => {
    if (activeField === "email") {
      setSignupEmail(signupEmail + char);
    } else {
      setSignupPassword(signupPassword + char);
    }
  };

  const handleBackspace = () => {
    if (activeField === "email") {
      if (signupEmail.length > 0) setSignupEmail(signupEmail.slice(0, -1));
    } else {
      if (signupPassword.length > 0) setSignupPassword(signupPassword.slice(0, -1));
    }
  };

  const isValid = signupEmail.includes("@") && signupPassword.length >= 4;

  return (
    <div className="relative flex-1 flex flex-col justify-between pt-4 sm:pt-4 px-5 pb-5 overflow-hidden bg-gradient-to-b from-[#141414] via-[#1E1B18] to-[#2B1D12] text-white select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#F2A93B]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-64 h-64 rounded-full bg-[#E6931E]/15 blur-3xl pointer-events-none" />

      {/* 1. Top Header with Back Button and 100% Progress Bar matching Screenshot 3 */}
      <div className="relative z-10 flex items-center justify-between pt-1 pb-2 min-h-[44px]">
        <button
          onClick={navigateBackAuth}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/15 backdrop-blur-xl flex items-center justify-center text-white shadow-md transition"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Progress Bar (Step 2 of 2: 100% filled) */}
        <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden flex">
          <div className="w-full h-full bg-white rounded-full shadow-xs transition-all duration-300" />
        </div>

        {/* Placeholder spacer */}
        <div className="w-10" />
      </div>

      {/* 2. Headline & Inputs matching Screenshot 3 */}
      <div className="relative z-10 space-y-3 my-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Set Up Your Account
          </h1>
          <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
            Set up your credentials and risk profile to begin.
          </p>
        </div>

        {/* Stacked Glassmorphic Inputs matching Screenshot 3 */}
        <div className="space-y-2.5">
          {/* Email Input */}
          <div
            onClick={() => setActiveField("email")}
            className={`w-full py-3 px-4 rounded-2xl bg-white/10 backdrop-blur-2xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer shadow-lg ${
              activeField === "email" ? "border-white/40 ring-2 ring-white/10" : "border-white/15"
            }`}
          >
            <Mail size={15} className="text-white/60 shrink-0" />
            <div className="flex-1 flex items-center text-xs font-medium text-white tracking-wide">
              <span>{signupEmail || <span className="text-white/40">hello@example.com</span>}</span>
              {activeField === "email" && (
                <span className="w-0.5 h-3.5 bg-[#F2A93B] ml-0.5 animate-pulse rounded-full" />
              )}
            </div>
          </div>

          {/* Password Input */}
          <div
            onClick={() => setActiveField("password")}
            className={`w-full py-3 px-4 rounded-2xl bg-white/10 backdrop-blur-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer shadow-lg ${
              activeField === "password" ? "border-white/40 ring-2 ring-white/10" : "border-white/15"
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1">
              <Lock size={15} className="text-white/60 shrink-0" />
              <div className="flex-1 flex items-center text-xs font-medium text-white tracking-wide">
                <span>
                  {signupPassword ? (
                    showPassword ? signupPassword : "•".repeat(signupPassword.length)
                  ) : (
                    <span className="text-white/40">Password</span>
                  )}
                </span>
                {activeField === "password" && (
                  <span className="w-0.5 h-3.5 bg-[#F2A93B] ml-0.5 animate-pulse rounded-full" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
              className="text-white/60 hover:text-white p-1"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Primary Sector Selection Pills */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
            PRIMARY SECTOR WATCHLIST
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {["Pharma", "IT", "Banking", "Auto", "FMCG"].map((sec) => {
              const isSel = signupSector === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSignupSector(sec)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all duration-200 whitespace-nowrap ${
                    isSel
                      ? "bg-[#F2A93B] text-[#141414] font-bold shadow-md"
                      : "bg-white/10 border border-white/15 text-white/80 hover:text-white"
                  }`}
                >
                  {sec}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Floating Action Pill & Virtual Keyboard matching Screenshot 3 */}
      <div className="relative z-10 space-y-2 pb-1">
        {/* Floating Glass Pill Button [ Create an Account ] */}
        <div className="flex justify-center">
          <button
            onClick={completeSignup}
            disabled={!isValid}
            className={`px-7 py-2.5 rounded-full backdrop-blur-2xl border font-bold text-xs tracking-wide shadow-xl flex items-center gap-2 transition-all duration-200 ${
              isValid
                ? "bg-white/25 hover:bg-white/35 active:scale-95 border-white/40 text-white shadow-white/10"
                : "bg-white/10 border-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <Sparkles size={13} className="text-[#F2A93B]" />
            <span>Create an Account</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Interactive Virtual Mobile Keyboard */}
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSubmit={isValid ? completeSignup : () => setActiveField("password")}
        />
      </div>
    </div>
  );
};
