# Software Development Lifecycle (SDL) Specification
## End-to-End Mobile Platform: Real-Time Indian Stock Market Intelligence (v4)

**Document Version:** 4.0.0  
**Author / Lead:** Mobile Systems & Quantitative UI Engineering  
**System Target:** `frontend_mobile` (React Native, Expo SDK 54, React 19, TypeScript, Tailwind CSS / NativeWind)  
**Parent Specification:** `Implementation_plan/implementation_plan.md`, `Project/prd.md` & `Implementation_plan/frontend_web_sdl_plan.md`  
**Status:** Build-Ready Master Document  

---

## 1. Executive Summary & Document Control

This **Software Development Lifecycle (SDL) Plan** establishes the comprehensive technical architecture, mobile UI/UX design specifications, data contracts, component hierarchy, touch-optimized wireframes, and verification protocols for the **`frontend_mobile`** application of the *Real-Time Indian Stock Market Intelligence* platform.

The mobile platform delivers a native-feeling, high-density quantitative intelligence companion for iOS and Android (as well as responsive web viewport simulation). It brings the core empirical contribution of the research project—**online concept drift detection ($|z| > 2.0$)** and **regime-adaptive Ridge regularization ($L_2$)** extending the **Liu et al. (2024)** static baseline—directly to mobile investors with dedicated single-hand touch ergonomics, rapid shock sandboxes, and push-style volatility regime alerts.

---

## 2. Phase 1 — Requirements & Domain Analysis

### 2.1 Mobile Product & Research Objectives
1. **On-the-Go Regime Monitoring**: Deliver real-time volatility regime badges (Low / Med / High ATR-20 terciles) and instant drift alert flags across 30 NSE stocks in a high-density, pocketable form factor.
2. **Thumb-Driven Scenario Sandbox**: Provide a bottom-sheet virtual keypad sandbox (`KeypadModal`) enabling rapid stress-testing of market shocks (-5% flash drops, +150% ATR surges) with single-handed thumb inputs.
3. **Micro-Visualizations & Tactile Feedback**: Display lightweight mobile trajectory charts, regime distribution donuts, and Tree SHAP feature bars with smooth micro-animations and simulated haptics.
4. **Offline Resilience & Fast Startup**: Deliver sub-second cold start and zero-network fallback data generation for uninterrupted demonstrations and field use.
5. **Investor Onboarding & Personalization**: Provide a multi-step mobile auth flow (Name, Risk tolerance, Sector specialization) and granular alert switches.

### 2.2 Mobile User Personas

```
+--------------------------+--------------------------+--------------------------+
|      MOBILE TRADER       |    INVESTMENT ANALYST    |    RESEARCH REVIEWER     |
|--------------------------|--------------------------|--------------------------|
| Inspects live regime     | Stress-tests portfolio   | Validates mobile visual- |
| shifts and drift flags   | positions on the train   | ization fidelity and     |
| during market hours via  | using the virtual keypad | mathematical consistency |
| bottom-tab navigation.   | sandbox modal.           | against the web portal.  |
+--------------------------+--------------------------+--------------------------+
```

### 2.3 Mobile Functional Requirements Matrix (MOB-FR)

| Req ID | Screen / Component | Description | Mobile Acceptance Criteria |
|---|---|---|---|
| **MOB-01** | Splash & Auth Onboarding | 3-step native onboarding (`AuthWelcomeScreen`, `AuthStepNameScreen`, `AuthStepAccountScreen`) with 1-click Demo bypass. | Fluid transitions, animated progress indicators, instant session initialization. |
| **MOB-02** | Home Dashboard (`HomeScreen`) | Ticker context header, 4 compact KPI tiles, mobile dual-line forecast chart, and regime timeline bar. | Fast stock switching dropdown, pull-to-refresh gesture, clean rendering within 390pt viewport. |
| **MOB-03** | Model Leaderboard (`LeaderboardScreen`) | Scrollable ranking cards for 6 candidate architectures with rank badges and 3-column regime stress cards. | Touch-friendly cards, expandable mathematical explanation for OLS vs. Ridge. |
| **MOB-04** | SHAP Studio (`ShapScreen`) | Mobile feature importance ranking with category filter chips and local observation waterfall breakdown. | Horizontal chip scroll, animated progress bars, tap to inspect feature formula. |
| **MOB-05** | Activity & History (`ActivityScreen`) | Saved simulation cards, watchlist quick monitors, and chronological backend audit stream. | Categorized tab segments (`All`, `Simulations`, `Watchlist`), swipe-to-delete. |
| **MOB-06** | Interactive Keypad Sandbox (`KeypadModal`) | Bottom-sheet modal with custom numerical keypad and shock presets (-5%, +150% ATR, +4.2%). | Smooth slide-up animation, instant calculation of Static vs. Adaptive price and % gain. |
| **MOB-07** | Investor Profile (`ProfileScreen`) | Mobile investor persona editor, residual drift sensitivity slider ($|z| \in [1.0, 3.5]$), and notification switches. | Native slider ergonomics, switch toggles, persistent AsyncStorage / Context state. |
| **MOB-08** | Bottom Navigation (`BottomNavBar`) | Fixed 5-tab bottom navigation with center action trigger for fast simulator access. | iOS Home Indicator safe area padding, active indicator pill with subtle bounce. |

### 2.4 Mobile Non-Functional Requirements (MOB-NFR)
- **Touch Targets**: Minimum interactive touch target of $44 \times 44\text{pt}$ according to Apple Human Interface Guidelines (HIG) and Google Material Design.
- **Viewport Ergonomics**: Optimized for 390x844 screen dimensions (iPhone 14/15/16) with responsive scaling for Android viewports and desktop simulator frame (`DeviceFrame`).
- **Cold Start Time**: Initial interactive render in $< 800\text{ms}$.
- **Theme Integrity**: Matching the mathematical aesthetic of the landing page: `#F5F5F5` surface, `#FFFFFF` rounded-3xl cards with razor-thin `border-black/10`, `#2B2644` obsidian plum highlight cards, emerald `#10B981`, sky `#0284C7`, and rose `#E11D48`.

---

## 3. Phase 2 — Mobile System Architecture & Data Interface

### 3.1 Mobile Architecture Diagram

```mermaid
graph TD
    subgraph MobileClient [Frontend Mobile App (Expo 54 + React Native + React 19)]
        AppRoot[App.tsx Root Shell]
        
        subgraph ViewportContainer [Viewport Container Layer]
            SimulatorFrame[DeviceFrame: iPhone 15 Bezel & Dynamic Island]
        end
        
        subgraph MobileState [Mobile Context Providers]
            AuthCtx[AuthContext: Session Token, Profile, Onboarding Step]
            StockCtx[StockContext / State: Selected Ticker, 30 NSE Stocks]
        end
        
        subgraph NavigationLayer [Mobile Navigation]
            AuthFlow[Auth Screens Flow: Welcome -> Name -> Account]
            TabNav[BottomNavBar: 5 Core Tabs + Floating Center Trigger]
            KeypadSheet[KeypadModal: Slide-Up Bottom Sheet Sandbox]
        end
        
        subgraph MobileScreens [Screen Components]
            S_Home[HomeScreen: KPIs + Chart + Regime Timeline]
            S_Lead[LeaderboardScreen: Cross-Model Ablation Study]
            S_Shap[ShapScreen: Tree SHAP Attribution Studio]
            S_Act[ActivityScreen: History & Watchlist Monitor]
            S_Prof[ProfileScreen: Investor Calibration & Alerts]
        end
        
        subgraph MobileService [Service & Storage Layer]
            ApiSvc[api.ts: Typed Mobile REST Client + Offline Mock Engine]
            Storage[AsyncStorage / Local State Cache]
        end
    end
    
    subgraph BackendAPI [Node.js / Express Backend (Port 5000)]
        Endpoints[REST Endpoints: /api/backtest, /api/metrics, /api/shap, /api/user/*]
    end

    AppRoot --> ViewportContainer
    ViewportContainer --> MobileState
    MobileState --> NavigationLayer
    NavigationLayer --> MobileScreens
    NavigationLayer --> KeypadSheet
    MobileScreens --> MobileService
    MobileService -->|JSON REST / Fallback| Endpoints
    MobileService --> Storage
```

### 3.2 Mobile Data Models & TypeScript Contracts

```typescript
// Core Backtest Record for Mobile Trajectory Rendering
export interface BacktestRow {
  date: string;
  actual_price: number;
  actual_return: number;
  y_hat_static_price: number;
  y_hat_adaptive_price: number;
  regime_flag: 'Low' | 'Medium' | 'High';
  drift_detected: boolean;
  z_score: number;
}

// 30 NSE Equities Mobile Metadata
export interface StockMetadata {
  symbol: string;                  // e.g. INFY.NS
  name: string;                    // Infosys Limited
  sector: 'Banking' | 'IT' | 'FMCG' | 'Auto' | 'Pharma' | 'Diversified';
  base_price: number;              // Current market reference price
  volatility_tercile: 'Low' | 'Medium' | 'High';
}

// Mobile Model Leaderboard Metric
export interface ModelMetricSummary {
  model_name: string;
  class_type: string;
  mean_mae: number;
  mean_rmse: number;
  mean_r2: number;
  hit_rate: string;
  rank: number;
}

// Interactive Scenario Simulation
export interface MobileSimulation {
  id: string;
  symbol: string;
  base_price: number;
  shock_pct: number;
  scenario_type: 'flash_drop' | 'vol_surge' | 'gap_up' | 'custom';
  simulated_price: number;
  static_price: number;
  adaptive_price: number;
  error_reduction: number;
  drift_triggered: boolean;
  created_at: string;
}
```

---

## 4. Phase 3 — Mobile UI/UX Design System & Touch Wireframes

### 4.1 Mobile Design System Tokens

```
+-------------------------------------------------------------------------------------------------------------------+
|                                             MOBILE DESIGN SYSTEM TOKENS                                           |
+-------------------------------------------------------------------------------------------------------------------+
|  Device Canvas    : #F5F5F5 (Light Gray Mathematical Surface)                                                    |
|  Mobile Cards     : #FFFFFF (Pure White, rounded-3xl, border border-black/10, shadow-sm active:scale-[0.99])     |
|  Obsidian Card    : #2B2644 (Deep Obsidian Plum with White Text for Primary Highlights & Sandboxes)              |
|  Typography       : Inter / System Font, tight tracking (-0.02em to -0.04em), mono numerals for price levels     |
|  Primary Button   : bg-black text-white py-3.5 px-6 rounded-full font-semibold shadow-md active:bg-gray-800     |
|  Bottom Tab Bar   : bg-white/95 backdrop-blur-lg border-t border-black/10 h-16 pb-safe pt-2                      |
|  Active Tab Pill  : bg-black text-white px-3 py-1 rounded-full text-xs font-semibold                             |
|  Adaptive Accent  : #10B981 (Emerald 600) — Badge: bg-emerald-50 text-emerald-800 border-emerald-200             |
|  Static Accent    : #0284C7 (Sky 700) — Badge: bg-sky-50 text-sky-800 border-sky-200                             |
|  Drift Accent     : #E11D48 (Rose 600) — Badge: bg-rose-50 text-rose-800 border-rose-200                         |
+-------------------------------------------------------------------------------------------------------------------+
```

---

### 4.2 Comprehensive Mobile Screen Wireframes (390x844pt)

#### Mobile Screen 1: Market Intelligence Dashboard (`HomeScreen`)
```
+------------------------------------------+
|  [9:41]                [ 5G  100% ]      | (Dynamic Island & Status Bar)
+------------------------------------------+
|  StockMarketIntelligence      [API: ●]   | Top Header
|  NSE Adaptive v4               [Avatar]  |
+------------------------------------------+
|  [ INFY.NS ▾ Infosys Limited ]   [Scan ⟳]| Stock Switcher Pill
|  Sector: IT Services | Nifty 50          |
+------------------------------------------+
|  +------------------------------------+  |
|  | CURRENT REGIME: LOW VOLATILITY     |  | Obsidian Card (#2B2644)
|  | 20-Day ATR: 1.42% | |z| = 0.84     |  |
|  | Price: ₹1,842.50 (+1.45% Today)    |  |
|  +------------------------------------+  |
+------------------------------------------+
|  KEY PERFORMANCE TILES (2x2 Grid)        |
|  +------------------+ +------------------+|
|  | STATIC LIU META  | | ADAPTIVE RIDGE   ||
|  | ₹1,828.10        | | ₹1,840.20        ||
|  | Base Stacking    | | +0.66% Gain      ||
|  +------------------+ +------------------+|
|  +------------------+ +------------------+|
|  | RESIDUAL DRIFT   | | ERROR ADVANTAGE  ||
|  | |z| = 0.84       | | +9.69% in HighVol||
|  | Status: Stable   | | Regularized (L2) ||
|  +------------------+ +------------------+|
+------------------------------------------+
|  PRICE FORECAST TRAJECTORY CHART         |
|  [ 30D ] [ 90D ] [ 6M ] [ 1Y ] [ ALL ]   | Time Range Chips
|  +------------------------------------+  |
|  |  ~~~---..____ Actual (Black)       |  |
|  |  - - - - - - Static Liu (Sky Blue) |  | Recharts / SVG Micro-plot
|  |  ============ Adaptive (Emerald)   |  |
|  +------------------------------------+  |
+------------------------------------------+
|  REGIME TIMELINE & DRIFT TRIGGERS        |
|  [|||||||||||||||||||||||||||||||||||||] | Chronological Bar
|  Emerald (Low) • Amber (Med) • Rose (Drift)|
+------------------------------------------+
|  [ 🏠 Home ] [ 🏆 Models ] [ (⚡) ] [ ★ SHAP ] [ ⚙ Profile ] | (BottomNavBar)
+------------------------------------------+
```

#### Mobile Screen 2: Model Leaderboard & Ablation (`LeaderboardScreen`)
```
+------------------------------------------+
|  [9:41]                [ 5G  100% ]      |
+------------------------------------------+
|  < Back     Model Leaderboard    N=2,296 |
+------------------------------------------+
|  WALK-FORWARD EMPIRICAL STUDY            |
|  252-day train / 21-day test rolling step|
+------------------------------------------+
|  #1 REGIME-ADAPTIVE RIDGE [BEST]         |
|  Novel Stacking | Mean MAE: 0.010680     |
|  Hit Rate: 51.33% | Gain: +9.22% Mean    |
+------------------------------------------+
|  #2 PYTORCH LSTM (2-Layer 100u)          |
|  Base Learner | Mean MAE: 0.010729       |
+------------------------------------------+
|  #3 PYTORCH ANN (100->50 ReLU)           |
|  Base Learner | Mean MAE: 0.011520       |
+------------------------------------------+
|  #4 XGBOOST TREE BENCHMARK               |
|  Baseline | Mean MAE: 0.011646           |
+------------------------------------------+
|  #5 LIU ET AL. STATIC CONTROL (OLS)      |
|  Control Baseline | Mean MAE: 0.011771   |
+------------------------------------------+
|  REGIME STRESS TEST BREAKDOWN            |
|  - High Volatility:  +9.69% Error Red.   |
|  - Medium Volatility:+10.04% Error Red.  |
|  - Low Volatility:   +7.94% Error Red.   |
+------------------------------------------+
|  [ 🏠 Home ] [ 🏆 Models ] [ (⚡) ] [ ★ SHAP ] [ ⚙ Profile ] |
+------------------------------------------+
```

#### Mobile Screen 3: Tree SHAP Studio (`ShapScreen`)
```
+------------------------------------------+
|  [9:41]                [ 5G  100% ]      |
+------------------------------------------+
|  Explainable AI Studio      INFY.NS Focus|
+------------------------------------------+
|  DOMAIN FILTER CHIPS (Horizontal Scroll) |
|  [ (•) All ] [ Volatility ] [ Momentum ] [ Trend ]|
+------------------------------------------+
|  GLOBAL FEATURE ATTRIBUTIONS             |
|                                          |
|  ATR-20 (Average True Range)             |
|  [████████████████████] 92% (Vol. Expand)|
|                                          |
|  RSI-14 (Relative Strength Index)        |
|  [████████████████░░░░] 86% (Mean Revert)|
|                                          |
|  MACD Signal Histogram                   |
|  [████████████░░░░░░░░] 74% (Trend Track)|
|                                          |
|  Bollinger Band Width (20d)              |
|  [██████████░░░░░░░░░░] 68% (Volatility) |
+------------------------------------------+
|  LOCAL WATERFALL BREAKDOWN (Fold #142)   |
|  Base Expectation E[y]:        +0.02%    |
|  + ATR Volatility Expansion:   +0.48%    |
|  + RSI Oversold Bounce:        +0.25%    |
|  - MACD Bearish Resistance:    -0.19%    |
|  = Predicted Return f(x):      +0.56%    |
+------------------------------------------+
|  [ 🏠 Home ] [ 🏆 Models ] [ (⚡) ] [ ★ SHAP ] [ ⚙ Profile ] |
+------------------------------------------+
```

#### Mobile Screen 4: Virtual Keypad Sandbox Modal (`KeypadModal`)
```
+------------------------------------------+
|                  ( X Close )             |
|  SCENARIO STRESS SANDBOX                 |
|  Simulate real-time regime shock for     |
|  [ INFY.NS (Base: ₹1,842.50) ]           |
+------------------------------------------+
|  PRESET SHOCK CHIPS                      |
|  [ -5.0% Flash Drop ] [ +150% ATR Surge ]|
|  [ +4.2% Gap Up ]     [ Custom Value ]   |
+------------------------------------------+
|  +------------------------------------+  |
|  | SIMULATED SHOCK RESULTS            |  | Obsidian Box
|  | Target Market Price:   ₹1,750.37   |  | (#2B2644)
|  | Static Predicted:      ₹1,801.04   |  |
|  | Adaptive Predicted:    ₹1,761.43   |  |
|  | ---------------------------------- |  |
|  | Dynamic Error Gain:    +41.3%      |  |
|  | Drift Status: DRIFT TRIGGERED!     |  |
|  +------------------------------------+  |
+------------------------------------------+
|  CUSTOM THUMB NUMPAD                     |
|  +-------------+-------------+----------+|
|  |      1      |      2      |    3     ||
|  +-------------+-------------+----------+|
|  |      4      |      5      |    6     ||
|  +-------------+-------------+----------+|
|  |      7      |      8      |    9     ||
|  +-------------+-------------+----------+|
|  |      .      |      0      |    ⌫     ||
|  +-------------+-------------+----------+|
|  [ Save Simulation to History ]          | Primary Black Button
+------------------------------------------+
```

#### Mobile Screen 5: Investor Profile & Calibration (`ProfileScreen`)
```
+------------------------------------------+
|  [9:41]                [ 5G  100% ]      |
+------------------------------------------+
|  Investor Profile & Calibration          |
+------------------------------------------+
|  INVESTOR PERSONA                        |
|  Name: [ Dr. Vikram Sethi              ] |
|  Role: [ Quantitative Portfolio Manager] |
|  Risk: [ Moderate ▾ ]  Horizon: [ Swing ]|
+------------------------------------------+
|  ML DRIFT CALIBRATION                    |
|  Residual Drift Threshold (|z| score)    |
|  [───────●──────────────────] |z| > 2.0  |
|  (Default 2.0 for 30-day rolling window) |
+------------------------------------------+
|  MOBILE NOTIFICATIONS & ALERTS           |
|  [x] Alert on High Volatility Tercile    |
|  [x] Alert on Concept Drift (|z| > 2.0)  |
|  [ ] Daily Pre-Market ML Summary         |
+------------------------------------------+
|  [ Save Changes ]      [ Switch to Demo ]|
+------------------------------------------+
|  RECENT ACTIVITY FEED                    |
|  • 11:20 AM: Scenario Run (-5% Shock)   |
|  • 10:15 AM: Added INFY to Watchlist     |
+------------------------------------------+
|  [ 🏠 Home ] [ 🏆 Models ] [ (⚡) ] [ ★ SHAP ] [ ⚙ Profile ] |
+------------------------------------------+
```

---

## 5. Phase 4 — Mobile Implementation Roadmap & Task Matrix

```
+-------------------------------------------------------------------------------------------------------------------+
|  TASK ID | TASK DESCRIPTION                                  | DEPENDENCIES | TARGET ARTIFACTS                    |
|----------+---------------------------------------------------+--------------+-------------------------------------|
|  MOB-001 | Expo 54 / React Native Navigation & Shell Setup   | None         | App.tsx, index.html, index.css      |
|  MOB-002 | Mobile Auth Context & Demo Session Engine         | MOB-001      | src/context/AuthContext.tsx         |
|  MOB-003 | Mobile 30 NSE Equities API Service & Fallback     | MOB-002      | src/services/api.ts                 |
|  MOB-004 | DeviceFrame & Responsive Viewport Simulator       | MOB-001      | src/components/DeviceFrame.tsx      |
|  MOB-005 | Fixed BottomNavBar with Floating Action Trigger   | MOB-001      | src/components/BottomNavBar.tsx     |
|  MOB-006 | Mobile HomeScreen (KPIs, Trajectory, Timeline)    | MOB-003-005  | src/components/HomeScreen.tsx       |
|  MOB-007 | Model Leaderboard & Regime Stress Cards           | MOB-003-005  | src/components/LeaderboardScreen.tsx|
|  MOB-008 | Tree SHAP Studio & Waterfall Decomposition        | MOB-003-005  | src/components/ShapScreen.tsx       |
|  MOB-009 | Activity History & Watchlist Portfolio Screen     | MOB-003-005  | src/components/ActivityScreen.tsx   |
|  MOB-010 | Interactive KeypadModal & Real-Time Shock Engine  | MOB-003-006  | src/components/KeypadModal.tsx      |
|  MOB-011 | ProfileScreen, Drift Slider & Notification Toggles| MOB-002-005  | src/components/ProfileScreen.tsx    |
|  MOB-012 | Multi-Step Auth Onboarding Flow Screens           | MOB-002      | src/components/Auth*.tsx            |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 6. Phase 5 — Quality Assurance & Mobile Testing Protocols

### 6.1 Mobile Test Case Matrix (MTC)

| Test ID | Category | Mobile Test Procedure | Expected Result | Pass Criteria |
|---|---|---|---|---|
| **MTC-01** | Splash & Auth | Launch app from fresh state; click "Quick Demo Login". | Bypasses onboarding, sets active session, transitions to Home. | User authenticated in $< 500\text{ms}$. |
| **MTC-02** | Stock Selector | Tap Ticker Pill in TopNav, select `TCS.NS`. | Ticker updates, price and trajectory re-render for TCS. | Correct price and regime rendered. |
| **MTC-03** | Time Filtering | Tap `30D`, `90D`, `6M`, `1Y`, `ALL` filter chips on Home. | SVG/Recharts trajectory slices data without full-page redraw. | Fluid chart update in $< 100\text{ms}$. |
| **MTC-04** | Bottom Navigation | Tap each of the 5 tabs in `BottomNavBar`. | Seamless screen switching with active tab indicator animation. | Correct view renders for each tab. |
| **MTC-05** | Keypad Sandbox | Tap floating center lightning icon `(⚡)` to open KeypadModal. | Slide-up modal opens, tap "-5% Flash Drop" or type custom price. | Dynamic error reduction % calculates live. |
| **MTC-06** | Save Simulation | In KeypadModal, tap "Save Simulation". | Record logs to simulation history, shows checkmark badge. | Appears immediately in Activity tab. |
| **MTC-07** | Drift Sensitivity | In Profile, drag slider to `|z| > 2.5` and save. | Value saves to preferences, reflected in alerts. | Success toast displays for 3s. |
| **MTC-08** | Offline Resilience | Disconnect network / backend server. | Full mock engine provides 30 NSE stocks, backtests, and SHAP. | Zero crashes, zero white screens. |

---

## 7. Phase 6 — Deployment, Operations & Release Guide

### 7.1 Build Targets
1. **Expo Web Simulator / Responsive Web App**:
   ```bash
   cd frontend_mobile
   npm run build
   npm run preview
   ```
2. **Native iOS Simulator (EAS / Expo)**:
   ```bash
   npx expo start --ios
   ```
3. **Native Android Emulator (EAS / Expo)**:
   ```bash
   npx expo start --android
   ```

### 7.2 Mobile Environment Variables
```env
# Mobile Backend API Endpoint
EXPO_PUBLIC_API_URL=http://localhost:5000

# Mobile Environment Mode
EXPO_PUBLIC_ENV=development
```
