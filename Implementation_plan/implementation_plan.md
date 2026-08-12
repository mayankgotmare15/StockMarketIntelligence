# Implementation Plan: Real-Time Indian Stock Market Intelligence (v4)

## 1. Executive Summary & Implementation Order
This implementation plan covers the complete end-to-end development of the v4 architecture, moving from raw data ingestion to the final Flask visualization dashboard and paper-facing exports. 

**Implementation Order:**
Phase 1 — Project Foundation
Phase 2 — Data Ingestion & Storage (DuckDB)
Phase 3 — ML Foundation (Base Learners & Static Control)
Phase 4 — Walk-Forward Evaluation Harness
Phase 5 — Adaptive Meta-Model (Core Novelty)
Phase 6 — Full Ablation Experiment & Supabase Export
Phase 7 — Node.js API, React Web, & React Native Mobile App
Phase 8 — Documentation & Paper Outputs

## 2. Risk Management

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **`yfinance` API bans/failures** | High | High | Implement 3-retry exponential backoff. Gracefully skip and log permanently failed tickers. |
| **Multicollinearity in Meta-Model** | High | High | Two neural networks will likely produce highly correlated predictions. Unregularized OLS will crash with singular matrix errors. *Mitigation:* Enforce Ridge Regression (L2) for the adaptive re-fit. |
| **UI/ML Blocking** | High | Medium | *Mitigation:* Strictly decouple the Node/React frontends from ML training. Frontend must *only* read the final Supabase records. |
| **Insufficient Stock History** | Medium | Low | *Mitigation:* Explicitly drop stocks with < 400 trading days before the ML pipeline starts. |

## 3. Milestones

- **M1 — Data Foundation:** Ingestion script runs daily, populating DuckDB (for offline training) and writing final structures to Supabase.
- **M2 — Control Group Stable:** Static Liu et al. architecture successfully runs on NSE data.
- **M3 — Ablation Experiment:** Walk-Forward CV completes, comparing Static vs. Adaptive meta-models.
- **M4 — Full Stack Live:** Node.js API and React UI successfully render the Supabase ablation results.

---

## 4. Detailed Tasks

### Phase 1 — Project Foundation

**Task ID:** ENV-001
**Task:** Repository & Environment Setup
**Description:** Initialize Git repository, create Python virtual environment, and define `requirements.txt`.
**Priority:** Critical
**Dependencies:** None
**Expected Output:** Working local environment with `pandas`, `yfinance`, `torch`/`tensorflow`, `scikit-learn`, `supabase-py`, Node.js, and React.
**Acceptance Criteria:** Environment loads without dependency conflicts.
**Estimate:** XS

---

### Phase 2 — Data Ingestion & Storage

**Task ID:** DATA-001
**Task:** EOD `yfinance` Ingestion Script
**Description:** Build the daily EOD batch script for 30 NSE tickers. Must include 3-retry exponential backoff and drop tickers with < 400 days history.
**Priority:** Critical
**Dependencies:** ENV-001
**Expected Output:** Raw OHLCV dataset.
**Acceptance Criteria:** Script survives network drops and successfully outputs data for valid stocks.
**Estimate:** S

**Task ID:** DATA-002
**Task:** Feature Engineering & DuckDB Storage
**Description:** Calculate Log Returns ($ln(P_t / P_{t-1})$), 20-day ATR, RSI, MACD, and Bollinger Bands. Save to DuckDB.
**Priority:** Critical
**Dependencies:** DATA-001
**Expected Output:** DuckDB feature store partitioned by stock.
**Acceptance Criteria:** Target variable `y` (Log Returns) and all indicators are correctly calculated without NaN propagation.
**Estimate:** M

---

### Phase 3 — ML Foundation

**Task ID:** ML-001
**Task:** Build Base Learners (LSTM & ANN)
**Description:** Implement LSTM (2 layers, 100 units, dropout) and ANN (100 -> 50 units, ReLU).
**Priority:** Critical
**Dependencies:** DATA-002
**Expected Output:** PyTorch/Keras model classes.
**Acceptance Criteria:** Models compile and can train on a single fold of data.
**Estimate:** M

**Task ID:** ML-002
**Task:** Implement Static Meta-Model (Control)
**Description:** Implement the original Liu et al. static linear regression stacking `ŷ_meta = β₀ + β₁·ŷ_LSTM + β₂·ŷ_ANN`.
**Priority:** Critical
**Dependencies:** ML-001
**Expected Output:** Static stacking pipeline.
**Acceptance Criteria:** Successfully outputs `ŷ_meta` for a single test split.
**Estimate:** S

---

### Phase 4 — Evaluation Harness

**Task ID:** EVAL-001
**Task:** Walk-Forward CV Harness
**Description:** Implement the rolling origin CV loop. Train window: 252 days, Test window: 21 days, Step: 21 days. Include strictly out-of-sample scaling (MinMaxScaler).
**Priority:** Critical
**Dependencies:** ML-002
**Expected Output:** Walk-forward loop that can wrap the ML-001 models.
**Acceptance Criteria:** No data leakage (scalers fit only on training windows). Loop slides correctly through the data.
**Estimate:** L

**Task ID:** EVAL-002
**Task:** Breadth Baselines (RF & XGBoost)
**Description:** Integrate Random Forest and XGBoost into the CV harness as independent baselines.
**Priority:** Medium
**Dependencies:** EVAL-001
**Estimate:** S

---

### Phase 5 — Adaptive Meta-Model (Core Novelty)

**Task ID:** ADAPT-001
**Task:** Drift Detector & Regime Classifier
**Description:** Implement rolling z-score on meta-model residuals (30-day window, \|z\| > 2.0). Implement volatility tercile classifier based on 20-day ATR.
**Priority:** Critical
**Dependencies:** EVAL-001
**Acceptance Criteria:** Returns boolean drift flags and categorical regime states.
**Estimate:** S

**Task ID:** ADAPT-002
**Task:** Adaptive Ridge Regression Re-fit
**Description:** When ADAPT-001 flags drift, re-fit the meta-model coefficients on the last 60 trading days using Ridge Regression ($L2$).
**Priority:** Critical
**Dependencies:** ADAPT-001, ML-002
**Acceptance Criteria:** Coefficient updates successfully without singular matrix errors.
**Estimate:** M

---

### Phase 6 — Full Ablation & Export

**Task ID:** EXP-001
**Task:** Execute Core Ablation Study
**Description:** Run the full pipeline (Base Learners -> Static Meta-Model vs Adaptive Meta-Model) for all 30 stocks across the CV harness.
**Priority:** Critical
**Dependencies:** ADAPT-002
**Acceptance Criteria:** Pipeline runs unattended for all valid stocks.
**Estimate:** L

**Task ID:** EXP-002
**Task:** Supabase Data Contract Export
**Description:** Format and export the final predictions to Supabase following the strict schema: `[Date, Ticker, Actual_Return, Actual_Price, y_hat_Static, y_hat_Adaptive, Regime_Flag]`. Include SHAP values for tree models.
**Priority:** Critical
**Dependencies:** EXP-001
**Acceptance Criteria:** Database records exactly match the schema required by the Node.js API.
**Estimate:** S

---

### Phase 7 — Cloud API & Presentation Layer

**Task ID:** UI-001
**Task:** Node.js Backend API
**Description:** Setup basic Node.js (Express/Nest) app deployed to Render/AWS to serve the Supabase data via a lightweight JSON REST API.
**Priority:** High
**Dependencies:** EXP-002
**Estimate:** S

**Task ID:** UI-002
**Task:** React Web Dashboard
**Description:** Implement the frontend UI deployed to Vercel. Add a Top-Nav dropdown selector for the tickers. Add the Empty State UI ("Backtest results not available") if a Supabase record is missing.
**Priority:** High
**Dependencies:** UI-001
**Acceptance Criteria:** Dropdown successfully switches context. Missing data triggers the empty state rather than a crash.
**Estimate:** M

**Task ID:** UI-003
**Task:** Visualization Charts
**Description:** Plot the Static vs Adaptive predictions (converting Returns back to Price for readability) and the Regime Timeline using a charting library (e.g., Plotly/Chart.js).
**Priority:** High
**Dependencies:** UI-002
**Estimate:** M

**Task ID:** UI-004
**Task:** React Native Mobile App
**Description:** Build the iOS/Android mobile application mirroring the web dashboard functionality.
**Priority:** Medium
**Dependencies:** UI-001
**Estimate:** L
