# Real-Time Indian Stock Market Intelligence Platform

This project is a machine learning pipeline and full-stack application designed to forecast Indian National Stock Exchange (NSE) equities. It implements a specific architectural extension of the **LSTM+ANN stacking ensemble** proposed by Liu et al. (2024), adding a **regime-adaptive meta-model** to dynamically adjust to changing market conditions.

## 🚀 The Core Novelty

This platform makes two primary contributions:
1. **First application** of the Liu et al. LSTM+ANN stacking architecture to Indian NSE equities.
2. **Regime-adaptive extension:** While the original paper uses a static linear regression meta-model to combine LSTM and ANN predictions, our implementation introduces a drift detector and a regime-conditioned meta-model. 

By monitoring rolling residual errors via a z-score threshold, the system detects market drift and dynamically re-fits the meta-model coefficients using Ridge Regression. This allows the ensemble weighting to adapt to different market regimes (e.g., trending, sideways, high-volatility) rather than remaining frozen over time.

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
