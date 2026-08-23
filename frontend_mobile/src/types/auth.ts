export type UserRole = "pro_trader" | "researcher" | "standard" | "guest";

export type TradingHorizon = "intraday" | "swing" | "long_term";
export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export interface InvestorProfile {
  tradingHorizon: TradingHorizon;
  riskTolerance: RiskTolerance;
  primarySector: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  authProvider?: "local" | "google" | "apple" | "demo";
  googleId?: string;
  createdAt: string;
  investorProfile: InvestorProfile;
}

export interface UserPreferences {
  defaultStock: string;
  driftZScoreThreshold: 1.5 | 2.0 | 2.5;
  primaryBaselineModel: "Liu_Static" | "LSTM" | "ANN" | "XGBoost" | "RandomForest";
  enableRegimeAlerts: boolean;
  enableDriftAlerts: boolean;
  theme: "cream" | "dark" | "system";
  defaultTimeframe: "Week" | "Month" | "Year";
  enableHaptics: boolean;
  enableBiometrics: boolean;
  dataSource: "supabase" | "duckdb" | "synthetic";
}

export type AuthStep = "welcome" | "name" | "credentials" | "login" | "authenticated";
