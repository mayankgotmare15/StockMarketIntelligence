# Real-Time Indian Stock Market Intelligence Platform

This project is a machine learning pipeline and full-stack application designed to forecast Indian National Stock Exchange (NSE) equities. It implements a specific architectural extension of the **LST[...]**

## 🚀 The Core Novelty

This platform makes two primary contributions:
1. **First application** of the Liu et al. LSTM+ANN stacking architecture to Indian NSE equities.
2. **Regime-adaptive extension:** While the original paper uses a static linear regression meta-model to combine LSTM and ANN predictions, our implementation introduces a drift detector and a regime-c[...] 

By monitoring rolling residual errors via a z-score threshold, the system detects market drift and dynamically re-fits the meta-model coefficients using Ridge Regression. This allows the ensemble weig[...]

## 🏗️ Architecture

The platform consists of an offline ML batch pipeline and a real-time full-stack dashboard.

- **Data Ingestion (Python):** Daily End-of-Day scraper fetching OHLCV data for 25-30 NSE stocks via `yfinance`.
- **ML Pipeline (Python/PyTorch/Scikit-learn):** 
  - Base Learners: LSTM and ANN
  - Evaluation: Walk-forward cross-validation on per-stock next-day log returns.
  - Baselines: Random Forest, XGBoost (with SHAP explainability), and the original static Liu et al. meta-model.
- **Storage:** **Supabase (PostgreSQL)** for historical data, predictions, and regime flags.
- **Backend API:** Node.js API serving Supabase data.
- **Frontend Dashboards:** React Web App and React Native Mobile App for visualizing the static vs. adaptive ablation experiment and market regime timelines.

## 📊 Evaluation & Methodology

- **Target Variable:** Next-day log returns (converted back to price levels for the dashboard).
- **Anti-Leakage Strategy:** All feature scaling (e.g., MinMaxScaler) is strictly fit per-fold on the training data and applied out-of-sample.
- **Rigor:** Model evaluated on 2+ years of data with walk-forward cross-validation (1-year training window, 1-month rolling test window).

## 🛠️ Technology Stack

- **Machine Learning:** Python, PyTorch/Keras, Scikit-learn, yfinance, SHAP
- **Database:** Supabase (PostgreSQL)
- **Backend:** Node.js (Render / AWS)
- **Frontend:** React (Web), React Native (Mobile)
- **Deployment:** Vercel (Frontend)

## 📅 Development Roadmap

- **Phase 1:** Data foundation, Supabase setup, and feature engineering (technical indicators).
- **Phase 2:** Reproducing the Liu et al. base learners and static meta-model (control).
- **Phase 3:** Walk-forward evaluation harness and baseline models (RF/XGBoost).
- **Phase 4:** Drift detector and regime-adaptive meta-model implementation.
- **Phase 5:** Full ablation experiment (Static vs. Adaptive).
- **Phase 6:** Node.js API and React dashboards.

---
*Note: This project is a build-ready implementation intended to produce a testable ablation study for academic submission.*


---

## Stock Market Intelligence — Real-Time NSE Forecasting & Regime-Adaptive Meta-Model

A research-grade machine learning pipeline and full-stack application for next-day forecasting of Indian National Stock Exchange (NSE) equities, focused on reproducing and extending the Liu et al. LSTM+ANN stacking architecture with a regime-adaptive meta-model for drift-aware ensembling.

## Core novelty (short)
- First application of the Liu et al. LSTM+ANN stacking approach to a basket of NSE equities.
- Regime-adaptive meta-model: a drift detector monitors rolling residuals and, when triggered, re-fits meta-model coefficients (Ridge regression) to adapt ensemble weights to changing market regimes.

## Stack
- Language(s): Python (ML), TypeScript / Node.js (backend), JavaScript/React (frontend)
- Framework / runtime: PyTorch + scikit-learn (ML), Express + TypeScript (backend)
- Notable libraries: torch, scikit-learn, xgboost, yfinance, supabase-js

## What’s included
- ml_pipeline/ — data ingestion, feature engineering, model implementations (LSTM, ANN), evaluation harness and baselines (RF, XGBoost).
- backend/ — Express + TypeScript REST API that serves forecasts, regime flags and evaluation artifacts (Supabase client present).
- frontend_web/ — Web dashboard (React) to visualize forecasts, ablation (static vs adaptive) and regime timelines.
- frontend_mobile/ — Mobile app (React Native) for on-the-go visualization.
- data/ and database/ — local data artifacts and DB helpers / schema.
- reports/ — experiment outputs, figures and paper-ready artifacts.
- scripts/ — helper scripts for data ingestion and orchestration.
- requirements.txt — Python dependencies.
- backend/package.json — backend scripts (dev / build / start).

## How it fits together (runtime shape)
1. Data ingestion (yfinance) collects OHLCV for 25–30 selected NSE tickers and persists into Supabase (Postgres) / local storage.
2. ml_pipeline processes time-series into features, trains base learners (LSTM, ANN) with walk-forward CV, computes meta-model outputs and baselines, and stores predictions + regime flags.
3. Backend reads results from Supabase (or local storage for dev) and exposes REST endpoints to the frontends.
4. Frontend visualizes timelines, per-fold performance, per-stock forecasts, regime changes and SHAP explanations for tree-based baselines.

## Quickstart — developer path (minimum to get running)

Prerequisites
- Python 3.10+
- Node.js 18+ and npm/yarn
- Supabase project (recommended) or local Postgres for storage
- Git

1) Clone
```bash
git clone https://github.com/mayankgotmare15/StockMarketIntelligence.git
cd StockMarketIntelligence
```

2) Python environment & dependencies (ML)
```bash
python -m venv .venv
source .venv/bin/activate    # macOS / Linux
# .venv\Scripts\activate     # Windows PowerShell
pip install --upgrade pip
pip install -r requirements.txt
```

3) Backend (API)
```bash
cd backend
npm install
# development (watch)
npm run dev
# build and start
npm run build
npm start
```
The backend package.json provides `dev`, `build` and `start` scripts (TypeScript + Express). Environment variables are read from .env in development.

4) Frontend
- frontend_web and frontend_mobile are React and React Native projects respectively. Typical steps:
```bash
cd frontend_web
npm install
npm run dev

cd ../frontend_mobile
npm install
# follow the mobile platform instructions (Expo / React Native CLI) in that directory
```

5) Running the ML pipeline
- The ML code lives under ml_pipeline/. Use the scripts/notebooks in that directory to run ingestion, feature engineering and experiments. Example (from repository root):
```bash
# run a data ingestion script or training script under ml_pipeline/
python -m ml_pipeline.scripts.ingest         # example; inspect ml_pipeline/ for exact entry-points
python -m ml_pipeline.scripts.train          # example; run the train/eval harness
```
(See ml_pipeline/ for the exact script names and examples; training uses PyTorch + scikit-learn and follows walk-forward CV.)

6) Environment variables
Create a `.env` (see `.env.example`) with at least:
- SUPABASE_URL
- SUPABASE_SERVICE_KEY (or anon key for readonly)
- DATABASE_URL (if using Postgres directly)
- NODE_ENV
- Any API keys required for data ingestion (if using alternative sources)

## Evaluation & methodology (concise)
- Target: next-day log returns (models predict returns; dashboards convert back to price levels).
- Anti-leakage: scalers and any preprocessing are fit only on the training fold and applied out-of-sample.
- Evaluation: walk-forward cross-validation across multi-year data (typical setup: 1-year training window, 1-month rolling test window).
- Baselines: Random Forest, XGBoost (with SHAP), and the static Liu et al. meta-model as control.

## Developer notes & conventions
- Results and experiment artifacts are persisted to Supabase (recommended) or local DuckDB/Parquet under ml_pipeline/storage/.
- The drift detector is z-score on rolling residuals and triggers Ridge re-fit of meta-model coefficients when the threshold is exceeded.
- SHAP integration is used for tree-based model explainability (XGBoost baseline).

## Tests
- Python tests use pytest (requirements.txt includes pytest).
- Backend unit tests use Vitest / supertest (see backend/package.json dev dependencies).

To run backend tests:
```bash
cd backend
npm test
```

To run Python tests:
```bash
pytest -q
```

## How to contribute
1. Open an issue describing the feature / bug / experiment.
2. Create a branch named `feat/<short-desc>` or `fix/<short-desc>`.
3. Add tests for new behaviors where applicable and document major changes in reports/ or README.
4. Open a PR with a clear description of the change, sample outputs, and any reproduction steps.

## Useful links & pointers
- requirements.txt — Python dependencies for ML and data ingestion
- backend/package.json — backend scripts and dependencies
- ml_pipeline/ — core ML code, look for scripts or notebook examples to reproduce experiments
- .env.example — template for required environment variables

---

*Author: mayankgotmare15*
