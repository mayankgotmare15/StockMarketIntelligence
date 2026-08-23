import React from "react";
import { Mail, Zap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AuthWelcomeScreen: React.FC = () => {
  const { startSignup, loginWithDemo, loginAsGuest, loginWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    await loginWithGoogle();
    setIsGoogleLoading(false);
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between p-6 overflow-hidden bg-gradient-to-b from-[#141414] via-[#1E1B18] to-[#2B1D12] text-white select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#F2A93B]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#E6931E]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-[#F43F5E]/10 blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <div className="relative z-10 pt-2">
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E6931E] to-[#F5B758] flex items-center justify-center text-white shadow-fab-glow font-bold text-sm">
            <Zap size={18} strokeWidth={2.5} className="fill-white" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 space-y-6 my-auto">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Log In or Create<br />an Account
          </h1>
          <p className="text-xs text-white/70 mt-2 leading-relaxed">
            Real-time Indian Stock Market Intelligence with regime-adaptive AI forecasting.
          </p>
        </div>

        {/* Glassmorphic Action Buttons matching Screenshot 1 */}
        <div className="space-y-3 pt-2">
          {/* Button 1: Create with Email */}
          <button
            onClick={startSignup}
            className="w-full py-3.5 px-5 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 active:scale-98 border border-white/25 text-white font-semibold text-xs tracking-wide shadow-lg backdrop-blur-xl flex items-center justify-center gap-2.5 transition group"
          >
            <Mail size={16} className="text-white/80 group-hover:text-white" />
            <span>Create with Email</span>
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 py-0.5">
            <div className="h-[1px] flex-1 bg-white/15" />
            <span className="text-[11px] text-white/50 font-medium">or</span>
            <div className="h-[1px] flex-1 bg-white/15" />
          </div>

          {/* Button 2: Continue with Google */}
          <button
            onClick={handleGoogleClick}
            disabled={isGoogleLoading}
            className="w-full py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 active:scale-98 disabled:opacity-70 border border-white/20 text-white font-semibold text-xs tracking-wide shadow-md backdrop-blur-xl flex items-center justify-center gap-2.5 transition"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {/* Button 3: Continue with Apple */}
          <button
            onClick={loginWithDemo}
            className="w-full py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 active:scale-98 border border-white/20 text-white font-semibold text-xs tracking-wide shadow-md backdrop-blur-xl flex items-center justify-center gap-2.5 transition"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.64-.78 1.08-1.86.96-2.95-1 .04-2.14.67-2.8 1.44-.58.68-1.1 1.77-.96 2.83 1.12.09 2.19-.57 2.8-1.32" />
            </svg>
            <span>Continue with Apple</span>
          </button>

          {/* Button 4: 1-Tap Demo Trader (Bypass) */}
          <button
            onClick={loginAsGuest}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#F2A93B]/20 to-[#E6931E]/20 hover:from-[#F2A93B]/30 hover:to-[#E6931E]/30 active:scale-98 border border-[#F2A93B]/40 text-[#F2A93B] font-bold text-xs tracking-wide shadow-md backdrop-blur-xl flex items-center justify-center gap-2 transition"
          >
            <Sparkles size={14} className="text-[#F2A93B]" />
            <span>Explore as Guest / Demo Trader</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Footer Legal Disclaimer matching Screenshot 1 */}
      <div className="relative z-10 text-center pt-3">
        <p className="text-[10px] text-white/50 leading-relaxed max-w-xs mx-auto">
          By continuing, you agree to StockAI's{" "}
          <span className="text-white/80 underline cursor-pointer">Terms of Service</span> and
          acknowledge you've read our{" "}
          <span className="text-white/80 underline cursor-pointer">Privacy policy</span>.
        </p>
      </div>
    </div>
  );
};
