import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  UserPreferences,
  AuthStep,
  TradingHorizon,
  RiskTolerance,
} from "../types/auth";
import {
  AuthService,
  DEMO_USER,
  GUEST_USER,
  DEFAULT_PREFERENCES,
} from "../services/authService";

interface AuthContextType {
  user: UserProfile | null;
  preferences: UserPreferences;
  authStep: AuthStep;
  isProfileOpen: boolean;
  signupName: string;
  signupEmail: string;
  signupPassword: string;
  signupSector: string;
  signupHorizon: TradingHorizon;
  signupRisk: RiskTolerance;
  setSignupName: (name: string) => void;
  setSignupEmail: (email: string) => void;
  setSignupPassword: (pwd: string) => void;
  setSignupSector: (sector: string) => void;
  setSignupHorizon: (horizon: TradingHorizon) => void;
  setSignupRisk: (risk: RiskTolerance) => void;
  startSignup: () => void;
  goToCredentialsStep: () => void;
  completeSignup: () => void;
  loginWithGoogle: (profile?: any) => Promise<void>;
  loginWithDemo: () => void;
  loginAsGuest: () => void;
  loginWithCredentials: (email: string, pass: string) => boolean;
  logout: () => void;
  navigateBackAuth: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => AuthService.getStoredUser() || DEMO_USER);
  const [preferences, setPreferences] = useState<UserPreferences>(() => AuthService.getStoredPreferences());
  const [authStep, setAuthStep] = useState<AuthStep>("authenticated");
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Form states during multi-step registration
  const [signupName, setSignupName] = useState<string>("Ariana B");
  const [signupEmail, setSignupEmail] = useState<string>("hello@example.com");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupSector, setSignupSector] = useState<string>("Pharma");
  const [signupHorizon, setSignupHorizon] = useState<TradingHorizon>("swing");
  const [signupRisk, setSignupRisk] = useState<RiskTolerance>("moderate");

  const startSignup = () => {
    setAuthStep("name");
  };

  const goToCredentialsStep = () => {
    if (!signupName.trim()) return;
    setAuthStep("credentials");
  };

  const completeSignup = () => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: signupEmail.trim() || "trader@stockmarket.ai",
      fullName: signupName.trim() || "Ariana B",
      role: "pro_trader",
      createdAt: new Date().toISOString(),
      investorProfile: {
        tradingHorizon: signupHorizon,
        riskTolerance: signupRisk,
        primarySector: signupSector,
      },
    };
    setUser(newUser);
    AuthService.saveUser(newUser);
    setAuthStep("authenticated");
    setIsProfileOpen(false);
  };

  const loginWithGoogle = async (googleProfile?: any) => {
    try {
      const googleUser = await AuthService.loginWithGoogle(googleProfile);
      setUser(googleUser);
      setAuthStep("authenticated");
      setIsProfileOpen(false);
    } catch (err) {
      console.warn("Google authentication error:", err);
    }
  };

  const loginWithDemo = () => {
    setUser(DEMO_USER);
    AuthService.saveUser(DEMO_USER);
    setAuthStep("authenticated");
  };

  const loginAsGuest = () => {
    setUser(GUEST_USER);
    AuthService.saveUser(GUEST_USER);
    setAuthStep("authenticated");
  };

  const loginWithCredentials = (email: string, pass: string): boolean => {
    if (!email || !pass) return false;
    const returningUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      fullName: email.split("@")[0].replace(".", " "),
      role: "pro_trader",
      createdAt: new Date().toISOString(),
      investorProfile: {
        tradingHorizon: "swing",
        riskTolerance: "moderate",
        primarySector: "Pharma",
      },
    };
    setUser(returningUser);
    AuthService.saveUser(returningUser);
    setAuthStep("authenticated");
    return true;
  };

  const logout = () => {
    AuthService.clearSession();
    setUser(null);
    setIsProfileOpen(false);
    setAuthStep("welcome");
  };

  const navigateBackAuth = () => {
    if (authStep === "credentials") {
      setAuthStep("name");
    } else if (authStep === "name" || authStep === "login") {
      setAuthStep("welcome");
    }
  };

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  const updatePreferences = (partial: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...partial };
      AuthService.savePreferences(next);
      return next;
    });
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      AuthService.saveUser(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        authStep,
        isProfileOpen,
        signupName,
        signupEmail,
        signupPassword,
        signupSector,
        signupHorizon,
        signupRisk,
        setSignupName,
        setSignupEmail,
        setSignupPassword,
        setSignupSector,
        setSignupHorizon,
        setSignupRisk,
        startSignup,
        goToCredentialsStep,
        completeSignup,
        loginWithGoogle,
        loginWithDemo,
        loginAsGuest,
        loginWithCredentials,
        logout,
        navigateBackAuth,
        openProfile,
        closeProfile,
        updatePreferences,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
