# Software Development Lifecycle (SDL) Specification
## End-to-End Frontend Web Platform: Real-Time Indian Stock Market Intelligence (v4)

**Document Version:** 4.0.0  
**Author / Lead:** Quantitative Systems Engineering  
**System Target:** `frontend_web` (React 19, TypeScript, Vite, Tailwind CSS)  
**Parent Specification:** `Implementation_plan/implementation_plan.md` & `Project/prd.md`  
**Status:** Build-Ready Master Document  

---

## 1. Executive Summary & Document Control

This **Software Development Lifecycle (SDL) Plan** establishes the complete end-to-end specification, architectural design, data contracts, component hierarchy, user interface wireframes, and verification procedures for the **`frontend_web`** platform of the *Real-Time Indian Stock Market Intelligence* project.

The platform provides a research-grade web dashboard and investor workspace that showcases the core empirical novelty of the project: extending the **Liu et al. (2024)** static LSTM+ANN stacking ensemble with **online concept-drift detection ($|z| > 2.0$)** and **regime-conditioned Ridge regularization ($L_2$)** evaluated over **2,296 rolling walk-forward test folds** across **30 National Stock Exchange (NSE)** Indian equities.

---

## 2. Phase 1 — Requirements & Domain Analysis

### 2.1 Research & Business Objectives
1. **Empirical Validation Showcase**: Present a clear, mathematically defensible ablation study comparing the Static Liu et al. control against the proposed Regime-Adaptive Ridge model.
2. **Interactive Market Intelligence**: Enable users to inspect historical price forecasts, volatility regimes (Low, Medium, High ATR-20 terciles), and concept-drift triggers on 30 Indian equities with zero data leakage.
3. **Model Interpretability (XAI)**: Render global and local Tree SHAP (Shapley Additive Explanations) attributions across technical indicators (ATR-20, RSI-14, MACD, Bollinger Bands, Volume).
4. **Interactive Risk Sandbox**: Provide a quantitative scenario simulator allowing investors to model price shocks (-5% flash crash, +150% ATR volatility surge) and observe adaptive model recalibration in real time.
5. **Investor Customization & Tracking**: Deliver user watchlist management, personalized drift sensitivity thresholds ($|z| \in [1.0, 3.5]$), and automated volatility alerts.

### 2.2 User Personas

```
+--------------------------+--------------------------+--------------------------+
|  QUANTITATIVE RESEARCHER |    PORTFOLIO MANAGER     |    ACADEMIC REVIEWER     |
|--------------------------|--------------------------|--------------------------|
| Inspects cross-model MAE,| Monitors multi-asset     | Validates zero-leakage   |
| RMSE, R², and residual   | watchlists, volatility   | walk-forward CV, out-of- |
| drift triggers across    | regime shifts, and stress| sample scaling, and      |
| walk-forward folds.      | test scenarios.          | mathematical soundness.  |
+--------------------------+--------------------------+--------------------------+
```

### 2.3 Functional Requirements Matrix (FR)

| Req ID | Module / Screen | Description | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | Landing Page (`/`) | Public research showcase with architecture overview, universe marquee, and ablation highlights. | Loads within 1.5s, features working "Launch Platform" and "Explore Research" CTAs. |
| **FR-02** | Dashboard (`/dashboard`) | Live NSE ticker context, 4 KPI cards, dual-line prediction chart, regime badges, and chronological timeline. | Smooth ticker switching, Recharts rendering of Actual, Static, and Adaptive lines with custom tooltip. |
| **FR-03** | Model Ablation (`/models`) | 6-model leaderboard table (LSTM, ANN, RF, XGBoost, Static, Adaptive) across 2,296 test folds, and 3-column regime stress grid. | Displays verified outperformance (+9.69% in High Vol, +10.04% in Med Vol, +7.94% in Low Vol). |
| **FR-04** | SHAP Studio (`/shap`) | Global feature attribution bar chart with category filtering, mathematical formulations, and local waterfall decomposition. | Interactive filtering across Volatility, Momentum, Trend, Liquidity, and Price Action domains. |
| **FR-05** | Watchlist (`/watchlist`) | Multi-asset monitoring table with target entry/stop-loss, drift flags, and modal to add/remove equities. | Connected to `/api/user/watchlist`, supports immediate navigation into active stock dashboard. |
| **FR-06** | Sandbox (`/simulate`) | Quantitative what-if simulator with market shock presets (-5% drop, +150% ATR surge) and real-time comparative error reduction. | Computes dynamic error reduction % and persists records to `/api/user/simulations`. |
| **FR-07** | Profile (`/profile`) | Investor persona configuration, residual drift sensitivity slider ($|z| > 2.0$), alert switches, and backend audit stream. | Updates saved to `/api/user/profile` and `/api/user/preferences`. |
| **FR-08** | Authentication | Frictionless 1-click Demo investor session (`POST /api/auth/demo`) and JWT token management with local persistence. | Users can test full functionality instantly without manual registration barriers. |

### 2.4 Non-Functional Requirements (NFR)
- **Performance**: Time-to-Interactive (TTI) $< 1.5\text{s}$, client bundle minified with manual chunk splitting.
- **Aesthetic Consistency**: Strict adherence to the landing page light theme (`#F5F5F5` canvas, `#FFFFFF` cards, `border-black/10`, `Inter` / `TT Norms Pro` font, black pill navigation).
- **Fault Tolerance & Offline Resilience**: Built-in mock generation fallbacks ensure the frontend functions gracefully even if the backend is temporarily offline during demonstrations.
- **Security**: JWT Access Tokens stored securely, sanitized API request parameters via TypeScript interfaces.

---

## 3. Phase 2 — System Architecture & Data Contracts

### 3.1 Layered Architecture Diagram

```mermaid
graph TD
    subgraph Client [Frontend Web App (React 19 + TypeScript + Vite)]
        Router[React Router DOM v7]
        
        subgraph StateLayer [Context Providers]
            AuthCtx[AuthContext: User Profile, JWT Tokens, Demo Session]
            StockCtx[StockContext: Selected Ticker, NSE Universe, URL Sync]
        end
        
        subgraph Layouts [Layout Shells]
            LandingLayout[Public Landing Shell]
            UserShell[UserLayout: TopNav + PillTabs + Container + Footer]
        end
        
        subgraph Views [Page Modules]
            P_Home[LandingPage /]
            P_Dash[DashboardPage /dashboard]
            P_Models[ModelsPage /models]
            P_Shap[ShapPage /shap]
            P_Watch[WatchlistPage /watchlist]
            P_Sim[SimulationPage /simulate]
            P_Prof[ProfilePage /profile]
        end
        
        subgraph Services [API Service Layer]
            ApiClient[api.ts: Typed REST Client + Auth Headers + Fallback Generators]
        end
    end
    
    subgraph BackendAPI [Node.js / Express Backend (Port 5000)]
        Routes[API Routes: /api/auth, /api/user, /api/stocks, /api/backtest, /api/metrics, /api/regimes, /api/shap]
    end
    
    subgraph Database [Storage & Feature Store]
        DB[(Supabase PostgreSQL / DuckDB Feature Store)]
    end

    Router --> StateLayer
    StateLayer --> Layouts
    Layouts --> Views
    Views --> ApiClient
    ApiClient -->|JSON REST Requests| Routes
    Routes --> DB
```

### 3.2 Supabase & REST API Data Contracts

#### 1. Prediction Records Contract (`GET /api/backtest/:symbol?limit=300`)
```typescript
export interface StockResultRow {
  Date: string;                    // ISO date string (YYYY-MM-DD)
  Ticker: string;                  // NSE equity symbol (e.g. INFY)
  Actual_Price: number;            // Observed market closing price (INR)
  Actual_Return: number;           // Log return: ln(P_t / P_{t-1})
  Actual_Return_Pct: number;       // Return percentage: Actual_Return * 100
  y_hat_Static: number;            // Static Liu et al. predicted price (INR)
  y_hat_Adaptive: number;          // Regime-Adaptive Ridge predicted price (INR)
  Regime_Flag: 'Low' | 'Medium' | 'High'; // 20-day ATR volatility tercile
  drift_detected: boolean;         // True if |z_score| > drift_threshold
  z_score: number;                 // Rolling 30-day residual z-score
}
```

#### 2. Cross-Model Leaderboard Contract (`GET /api/metrics?symbol=:symbol`)
```typescript
export interface ModelMetricSummary {
  model_name: string;              // Model identifier (LSTM, ANN, RF, XGBoost, Static, Adaptive)
  mean_mae: number;                // Mean Absolute Error on log returns
  mean_rmse: number;               // Root Mean Squared Error on log returns
  mean_r2: number;                 // Coefficient of Determination (R²)
  mean_directional_accuracy: string; // Hit Rate / Directional Accuracy %
  evaluated_folds: number;         // Total rolling test folds evaluated (e.g. 2,296)
}
```

#### 3. User & Portfolio Contracts (`/api/user/*`)
```typescript
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  trading_horizon: 'intraday' | 'swing' | 'positional';
  default_stock: string;
  primary_sector: string;
}

export interface UserPreferences {
  drift_threshold: number;         // Default 2.0 (|z| > 2.0)
  primary_baseline: string;        // Default 'XGBoost Baseline'
  alert_volatility_spike: boolean; // Volatility tercile alert switch
  alert_drift_detected: boolean;   // Concept drift alert switch
  biometric_enabled: boolean;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;                  // e.g. INFY.NS
  notes?: string;
  target_entry_price?: number;
  target_stop_loss?: number;
  created_at: string;
}

export interface SimulationItem {
  id: string;
  symbol: string;
  input_price: number;
  scenario_type: string;
  simulated_adaptive_return: number;
  simulated_static_return: number;
  simulated_adaptive_price: number;
  simulated_static_price: number;
  simulated_error_reduction: number;
  notes?: string;
  created_at: string;
}
```

---

## 4. Phase 3 — UI/UX Design System & Screen Specifications

### 4.1 Design System Tokens

```
+-------------------------------------------------------------------------------------------------------------------+
|                                                 DESIGN SYSTEM TOKENS                                              |
+-------------------------------------------------------------------------------------------------------------------+
|  Canvas Background : #F5F5F5 (Light Gray Mathematical Surface)                                                   |
|  Card Container    : #FFFFFF (Pure White, rounded-2xl, border border-black/10, shadow-sm hover:shadow-md)         |
|  Divider Lines     : border-black/5 (rgba(0,0,0,0.05))                                                           |
|  Primary Text      : #000000 (Inter / TT Norms Pro, font-medium, tracking-[-0.02em] to [-0.04em])                 |
|  Secondary Text    : text-black/70 or text-black/60                                                              |
|  Action Pills      : bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 shadow-sm                     |
|  Control Trays     : p-1.5 bg-black/5 rounded-full border border-black/10                                         |
|  Adaptive Accent   : #10B981 (Emerald 500/600), badge: bg-emerald-100 text-emerald-800 border-emerald-200       |
|  Static Accent     : #0284C7 (Sky 700), badge: bg-sky-100 text-sky-800 border-sky-200                           |
|  Drift / Alert     : #E11D48 (Rose 600), badge: bg-rose-100 text-rose-800 border-rose-200                         |
|  High Contrast Box : #2B2644 (Obsidian Deep Plum with white text for highlight callouts)                         |
+-------------------------------------------------------------------------------------------------------------------+
```

---

### 4.2 Comprehensive Screen Wireframes

#### Screen 1: Market Intelligence & Backtest Dashboard (`/dashboard`)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [Logo] StockMarketIntelligence NSE v4    |   [Search: Ticker ▾ INFY.NS ]   | [API: ● ONLINE] [Dr. Sethi ▾] [Exit] |
+-------------------------------------------------------------------------------------------------------------------+
|  [ (•) Dashboard ]  [ (𝛂) Models & Ablation ]  [ (★) SHAP Studio ]  [ (👁) Watchlist ]  [ (⚙) Sandbox ]  [ Profile ] |
+-------------------------------------------------------------------------------------------------------------------+
|  TICKER CONTEXT HEADER                                                                                            |
|  Infosys Limited (INFY.NS) • IT Services • Nifty 50          [Add to Watchlist +] [Run Scenario] [Export Data ▾]  |
|  Last Close: ₹1,842.50 (+1.45%)  |  Regime: [ LOW VOLATILITY (ATR: 1.42%) ]  |  Drift: [ NORMAL (|z| = 0.84) ]    |
+-------------------------------------------------------------------------------------------------------------------+
|  KPI CARDS ROW (4 Columns - bg-white rounded-2xl border border-black/10)                                          |
|  +--------------------+ +--------------------+ +--------------------+ +--------------------+                      |
|  | ACTUAL PRICE       | | STATIC META-MODEL  | | ADAPTIVE META-MODEL| | CURRENT REGIME     |                      |
|  | ₹1,842.50          | | ₹1,828.10          | | ₹1,840.20          | | Low Volatility     |                      |
|  | +1.45% Today       | | Base: Liu et al.   | | +0.66% Outperform  | | ATR Tercile 1/3    |                      |
|  +--------------------+ +--------------------+ +--------------------+ +--------------------+                      |
+-------------------------------------------------------------------------------------------------------------------+
|  MAIN CHART & REGIME CONTAINER (12 Columns)                                                                       |
|  +--------------------------------------------------------------------------+ +--------------------------------+  |
|  | PRICE FORECAST TRAJECTORY (9 Cols)                       [30D|90D|6M|1Y|ALL] | | REGIME & VOLATILITY (3 Cols)  |  |
|  |  Recharts Dual-Line Plot:                                                | | High: 14,408 days (55%)        |  |
|  |   - Actual Close (Solid Black, 2.5px)                                    | | Med:   4,716 days (18%)        |  |
|  |   - Static Prediction (Sky Blue, 2px dashed)                             | | Low:   6,706 days (27%)        |  |
|  |   - Adaptive Prediction (Emerald Green, 2.5px solid)                     | | ------------------------------ |  |
|  |   - Concept Drift Points (|z| > 2.0 highlighted with Rose markers)       | | Ridge Re-fits: 42 triggers     |  |
|  +--------------------------------------------------------------------------+ +--------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------+
|  RECENT REGIME TIMELINE & DRIFT EVENTS                                                                            |
|  [|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||]   |
|  Color-coded chronological bar: Emerald (Low), Amber (Med), Rose (High/Drift), hover shows date and z-score      |
+-------------------------------------------------------------------------------------------------------------------+
```

#### Screen 2: Model Analytics & Comparative Ablation (`/models`)
```
+-------------------------------------------------------------------------------------------------------------------+
|  WALK-FORWARD MODEL BENCHMARK (Ablation Leaderboard)                                                              |
|  Evaluated over 2,296 walk-forward monthly test folds (252-day train, 21-day test window, zero data leakage)       |
+-------------------------------------------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------------------------------------------+  |
|  | Rank | Model Architecture          | Class         | Mean MAE  | Mean RMSE | Mean R²   | Hit Rate | Status  |  |
|  |------+-------------------------------+---------------+-----------+-----------+-----------+----------+---------|  |
|  |  #1  | Regime-Adaptive Ridge (Ours)  | Novel Ensem.  | 0.010680  | 0.014184  | -0.0782   | 51.33%   | [BEST]  |  |
|  |  #2  | PyTorch 2-Layer LSTM (100u)   | Base Learner  | 0.010729  | 0.014254  | -0.0963   | 50.05%   | Active  |  |
|  |  #3  | PyTorch ANN (100->50 ReLU)    | Base Learner  | 0.011520  | 0.015026  | -0.2974   | 49.64%   | Active  |  |
|  |  #4  | XGBoost Benchmark             | Tree Baseline | 0.011646  | 0.015301  | -0.3617   | 49.95%   | Active  |  |
|  |  #5  | Liu et al. Static Stacking    | Control (OLS) | 0.011771  | 0.015312  | -0.3525   | 49.52%   | Control |  |
|  |  #6  | Random Forest Benchmark       | Tree Baseline | 0.011975  | 0.015564  | -0.4303   | 49.75%   | Active  |  |
|  +-------------------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------+
|  REGIME STRESS MATRIX (3 Column Grid)                                                                             |
|  +--------------------------------+ +--------------------------------+ +--------------------------------+         |
|  | HIGH VOLATILITY REGIME         | | MEDIUM VOLATILITY REGIME       | | LOW VOLATILITY REGIME          |         |
|  | 14,408 test samples (55%)      | | 4,716 test samples (18%)       | | 6,706 test samples (27%)       |         |
|  | Static MAE:   0.012741         | | Static MAE:   0.011465         | | Static MAE:   0.010227         |         |
|  | Adaptive MAE: 0.011507         | | Adaptive MAE: 0.010314         | | Adaptive MAE: 0.009415         |         |
|  | Gain: +9.69% Error Reduction   | | Gain: +10.04% Error Reduction  | | Gain: +7.94% Error Reduction   |         |
|  +--------------------------------+ +--------------------------------+ +--------------------------------+         |
+-------------------------------------------------------------------------------------------------------------------+
|  MATHEMATICAL ARCHITECTURE ANALYSIS                                                                               |
|  Left: Why Static OLS Degrades: Collinear predictions between LSTM & ANN cause singular matrix inversion.         |
|  Right: Ridge Solution: L2 shrinkage (lambda = 1.0) guarantees numerical stability and swift weight re-balancing.  |
+-------------------------------------------------------------------------------------------------------------------+
```

#### Screen 3: Tree SHAP Studio (`/shap`)
```
+-------------------------------------------------------------------------------------------------------------------+
|  TREE SHAP FEATURE ATTRIBUTION & IMPORTANCE MATRIX                                                                |
|  Filter: [ ALL ]  [ Volatility ]  [ Momentum ]  [ Trend ]  [ Volume ]  [ Price Action ]                           |
+-------------------------------------------------------------------------------------------------------------------+
|  GLOBAL FEATURE ATTRIBUTIONS (7 Columns)                     |  FEATURE INSPECTOR & LOCAL WATERFALL (5 Columns)   |
|  +---------------------------------------------------------+ |  +-----------------------------------------------+  |
|  | ATR-20 (Average True Range)         [████████████] 92%  | |  | Selected: ATR-20 (Average True Range)          |  |
|  | RSI-14 (Relative Strength Index)    [██████████░░] 86%  | |  | Formula: ATR_20 = (1/20) * sum(TR_t)          |  |
|  | MACD Signal Histogram               [████████░░░░] 74%  | |  | Domain: Volatility | Effect: Expands Variance |  |
|  | Bollinger Band Width (20d)          [███████░░░░░] 68%  | |  | -------------------------------------------  |  |
|  | 5-Day Volume Ratio                  [██████░░░░░░] 59%  | |  | LOCAL FOLD WATERFALL (Sample Fold #142)       |  |
|  | Lag-1 Daily Log Return              [█████░░░░░░░] 51%  | |  | Base Return E[y]:               +0.02%        |  |
|  +---------------------------------------------------------+ |  | + ATR-20 High Vol Shock:        +0.48%        |  |
|                                                              |  | + RSI-14 Oversold Bounce:       +0.25%        |  |
|                                                              |  | - MACD Bearish Divergence:      -0.19%        |  |
|                                                              |  | Output Prediction f(x):        +0.56%        |  |
|                                                              |  +-----------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------+
```

#### Screen 4: Watchlist & Portfolio Monitor (`/watchlist`)
```
+-------------------------------------------------------------------------------------------------------------------+
|  MY WATCHLIST & LIVE ASSET MONITOR                                       [+ Add Equity to Track] [Scan Drift]     |
|  Monitoring 6 selected NSE equities for volatility regime shifts and concept drift                               |
+-------------------------------------------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------------------------------------------+  |
|  | Symbol   | Company Name       | Market Price | 1D Return | Regime    | Drift Status | Target | Actions       |  |
|  |----------+--------------------+--------------+-----------+-----------+--------------+--------+---------------|  |
|  | INFY.NS  | Infosys Limited    | ₹1,842.50    | +1.45%    | [Low Vol] | [Normal 0.8] | ₹1,800 | [Inspect] [✕] |  |
|  | TCS.NS   | Tata Consultancy   | ₹4,120.00    | -0.32%    | [Med Vol] | [Normal 1.2] | ₹4,050 | [Inspect] [✕] |  |
|  | RELIANCE | Reliance Industries| ₹2,980.10    | +2.10%    | [High Vol]| [DRIFT 2.3!] | ₹2,900 | [Inspect] [✕] |  |
|  | HDFCBANK | HDFC Bank Limited  | ₹1,630.00    | +0.12%    | [Low Vol] | [Normal 0.4] | ₹1,600 | [Inspect] [✕] |  |
|  +-------------------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------+
```

#### Screen 5: Scenario Simulator Sandbox (`/simulate`)
```
+-------------------------------------------------------------------------------------------------------------------+
|  ADAPTIVE STRESS SCENARIO SANDBOX                                                                                 |
|  Evaluate how the Regime-Adaptive Ridge model adapts under sudden market shocks relative to Static Liu et al.     |
+-------------------------------------------------------------------------------------------------------------------+
|  INPUT PARAMETERS (Left 5 Cols)                              |  SIMULATED OUTCOME PREVIEW (Right 7 Cols)          |
|  +---------------------------------------------------------+ |  +-----------------------------------------------+  |
|  | Equity: [ INFY.NS ▾ ]                                   | |  | MODEL COMPARISON UNDER SHOCK                  |  |
|  | Current Base Price: ₹1,842.50                           | |  | Simulated Market Price:   ₹1,750.37 (-5.00%)  |  |
|  | Preset Shocks:                                          | |  | Static Predicted Price:   ₹1,801.04 (-2.25%)  |  |
|  |  [ Flash Drop (-5%) ]  [ Volatility Surge (+150%) ]     | |  | Adaptive Predicted Price: ₹1,761.43 (-4.40%)  |  |
|  |  [ Earnings Gap (+4%) ] [ Custom Target Price ]         | |  | -------------------------------------------  |  |
|  | Notes: "Testing downside resilience in Q3 shock"        | |  | Adaptive Advantage: +41.3% Error Reduction    |  |
|  | [ Save Scenario to History ]                            | |  | Drift Condition: DRIFT TRIGGERED (|z| = 2.84) |  |
|  +---------------------------------------------------------+ |  +-----------------------------------------------+  |
|  SAVED SIMULATIONS HISTORY                                                                                        |
|  [ INFY.NS | Flash Drop (-5%) | Target: ₹1,750.00 | Adaptive Gain: +41.3% | Notes: Testing earnings shock ]       |
+-------------------------------------------------------------------------------------------------------------------+
```

#### Screen 6: Investor Profile & ML Calibration (`/profile`)
```
+-------------------------------------------------------------------------------------------------------------------+
|  INVESTOR PROFILE & ML CONFIGURATION                                                                              |
+-------------------------------------------------------------------------------------------------------------------+
|  INVESTOR PERSONA (Left 6 Cols)                              |  ML TUNING & SENSITIVITY (Right 6 Cols)            |
|  +---------------------------------------------------------+ |  +-----------------------------------------------+  |
|  | Full Name: [ Dr. Vikram Sethi                         ] | |  | Residual Drift Threshold:                      |  |
|  | Role:      [ Quantitative Portfolio Manager           ] | |  | [────●──────────────────────] |z| > 2.0 (Default)|  |
|  | Risk Tolerance: [ Moderate ▾ ]                          | |  | Primary Baseline: [ XGBoost Baseline ▾ ]       |  |
|  | Trading Horizon: [ Swing (2-20 Days) ▾ ]                | |  | Alerts:                                       |  |
|  | Default Stock:  [ INFY.NS ▾ ]                           | |  | [x] Alert on Volatility Regime Spike (High)   |  |
|  | [ Save Profile Changes ]                                | |  | [x] Alert on Concept Drift Trigger (|z| > 2.0) |  |
|  |                                                         | |  | [ Update ML Calibration ]                      |  |
|  +---------------------------------------------------------+ |  +-----------------------------------------------+  |
|  AUDIT TRAIL & RECENT ACTIVITY FEED                                                                               |
|  - 11:20 AM: Scenario Simulated: Flash Shock (-5%) for INFY.NS at ₹1,750.00                                      |
|  - 10:45 AM: Added RELIANCE.NS to active tracking portfolio                                                       |
|  - Yesterday: ML drift threshold calibrated to |z| > 2.0                                                          |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 5. Phase 4 — Implementation Roadmap & Task Matrix

```
+-------------------------------------------------------------------------------------------------------------------+
|  TASK ID | TASK DESCRIPTION                                  | DEPENDENCIES | TARGET ARTIFACTS                    |
|----------+---------------------------------------------------+--------------+-------------------------------------|
|  FE-001  | Global Routing & Application Shell Setup          | None         | src/App.tsx, src/main.tsx           |
|  FE-002  | State Contexts (AuthContext & StockContext)       | FE-001       | src/context/*.tsx                   |
|  FE-003  | Typed API Client & Fallback Engine                | FE-002       | src/services/api.ts, api.js         |
|  FE-004  | User Layout, Top Navigation & Pill Tabs           | FE-003       | src/layouts/UserLayout.tsx, Nav     |
|  FE-005  | Market Intelligence Dashboard & Recharts Series   | FE-004       | src/pages/user/DashboardPage.tsx    |
|  FE-006  | Walk-Forward Model Ablation Leaderboard           | FE-004       | src/pages/user/ModelsPage.tsx       |
|  FE-007  | Tree SHAP Explainability & Waterfall Studio       | FE-004       | src/pages/user/ShapPage.tsx         |
|  FE-008  | User Watchlist & Alert Portfolio Monitor          | FE-004       | src/pages/user/WatchlistPage.tsx    |
|  FE-009  | Scenario Simulator & Shock Recalibration Sandbox  | FE-004       | src/pages/user/SimulationPage.tsx   |
|  FE-010  | Investor Profile, Drift Slider & Audit Stream     | FE-004       | src/pages/user/ProfilePage.tsx      |
|  FE-011  | Public Marketing Landing Page Navbar Integration  | FE-001       | src/components/Navbar.tsx           |
|  FE-012  | Production Build & Rolldown Code Splitting Config | FE-001-011   | vite.config.js, index.css           |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 6. Phase 5 — Quality Assurance, Verification & Test Plan

### 6.1 Automated Verification Suite
1. **Compilation & Type-Checking**:
   - `npm run build` executed via Vite 8.2 + Rolldown engine.
   - Requirement: **Zero TypeScript errors, zero build warnings, zero missing chunk warnings**.
2. **Linter & Code Quality**:
   - `npm run lint` (`oxlint`).
   - Requirement: **Zero syntax errors and zero blocking linter violations**.

### 6.2 Test Case Matrix

| Test ID | Category | Test Procedure | Expected Result | Pass Criteria |
|---|---|---|---|---|
| **TC-01** | Navigation | Click "Launch Platform" on `/` landing page. | Transitions to `/dashboard` with `#F5F5F5` background. | URL is `/dashboard`, Header and Pills render. |
| **TC-02** | Ticker Switching | Select `TCS.NS` from TopNav dropdown. | Updates StockContext, URL query `?ticker=TCS`, and chart series. | Price updates to TCS level, chart redraws. |
| **TC-03** | Time Filtering | Click `30D`, `90D`, `6M`, `1Y`, `ALL` filter pills. | Chart slices data dynamically without full-page reload. | Recharts XAxis adjusts smoothly. |
| **TC-04** | Watchlist Add | Click "+ Add Equity to Track", enter `APOLLOHOSP.NS`. | Item appears in table and persists to `/api/user/watchlist`. | Watchlist length increases by 1. |
| **TC-05** | Stress Sandbox | Select "-5% Flash Shock", click "Save Scenario". | Error reduction computes (+41.3%), logs to simulation history. | Saved scenario appears in history table. |
| **TC-06** | Drift Calibration | Drag drift threshold slider to `|z| > 2.5` and save. | Value saves to preferences, reflected in alert badges. | Success badge displays for 3 seconds. |
| **TC-07** | Offline Fallback | Run frontend while backend is stopped. | Graceful mock generator populates charts and KPIs seamlessly. | No uncaught crashes or blank screens. |

---

## 7. Phase 6 — Deployment, Operations & Release Guide

### 7.1 Production Build Deliverables
- **Static Bundle Location**: `c:\Projects\StockMarketIntelligence\frontend_web\dist/`
- **Output Artifacts**:
  - `dist/index.html` (1.33 kB)
  - `dist/assets/index-*.css` (45.82 kB)
  - `dist/assets/vendor-react-*.js` (220.66 kB)
  - `dist/assets/vendor-charts-*.js` (310.99 kB)
  - `dist/assets/vendor-*.js` (88.42 kB)
  - `dist/assets/index-*.js` (109.08 kB)

### 7.2 Environment Configuration
```env
# Production API endpoint
VITE_API_BASE_URL=https://api.stockmarketintelligence.ai

# Data mode toggle: 'production' | 'temporary'
VITE_DATA_SOURCE=production
```

### 7.3 Maintenance & Run Commands
```bash
# Start local development server (Port 5173)
npm run dev

# Run production build and code splitting
npm run build

# Preview production build locally
npm run preview

# Run fast Rust-based linter
npm run lint
```
