# Project Memory (v4)

## Context & Pivot
- **Project Name:** Real-Time Indian Stock Market Intelligence Platform (v4)
- **Pivot Reason:** While v3 identified "regime adaptivity" as the novel idea, it relied on an unstructured ensemble of 4 disparate models. v4 anchors the novelty to a **specific, published, citable architecture** (Liu et al. 2024, LSTM+ANN Stacking) and extends its single static assumption (fixed meta-model coefficients).

## Key Decisions & The Novelty Claim
1. **The Control Group:** The exact reproduction of the Liu et al. 2024 static stacking ensemble (LSTM + ANN + Linear Meta-Model) applied to NSE data, evaluated under both (a) their original single-TimeSeriesSplit and (b) walk-forward CV, to allow explicit comparison of evaluation methodologies. *Note: We reproduce only their architecture. The original paper has fatal flaws (hallucinated citations, impossible 860M record dataset, and global scaling leakage). We explicitly correct these flaws in our implementation.*
2. **The Contribution:** Extending the static `ŷ_meta = β₀ + β₁·ŷ_LSTM + β₂·ŷ_ANN` to a regime-adaptive version where `β(r_t)` adapts based on a drift detector.
3. **Why this is better:** It creates a mathematically precise, single-variable ablation study (Static Coefficients vs. Dynamic Coefficients). This is significantly stronger and cleaner for peer review than a vague "adaptive vs static" claim across mismatched models.
4. **Data Strategy:** 25–30 NSE stocks across 5 sectors (Banking, IT, FMCG, Auto, Pharma). **Precondition:** Minimum 400 trading days required. `yfinance` ingestion requires 3-retry exponential backoff. Returns-based experiments are mandated to check for R² inflation.
5. **Additional Baselines:** RF and XGBoost are evaluated independently alongside the main LSTM+ANN ablation to satisfy the reviewer's "limited model comparison" critique.
6. **SHAP Scope:** SHAP explainability is applied to RF and XGBoost only. Applying SHAP to LSTM/ANN is out of scope for this build cycle.
7. **Drift Detector:** Rolling z-score threshold (30-day window, |z| > 2.0) on meta-model residuals is the primary implementation. Page-Hinkley test is a stretch upgrade only if time allows.
8. **Regime Definition:** Start with volatility terciles (Low / Medium / High, based on 20-day ATR). Upgrade to a trend+volatility 2D grid only if time allows.
9. **Meta-Model Implementation:** Prototype rolling re-fit of the linear meta-model first (60-day lookback window, utilizing **Ridge Regression** to prevent multicollinearity crashes). A per-regime coefficient bank is an alternative variant if rolling re-fit proves unstable.
10. **Timeline:** 7–9 weeks solo build alongside coursework. Contingency cut order: React Native App → dashboard polish → SHAP → RF/XGBoost baselines → Page-Hinkley upgrade. The static-vs-adaptive meta-model ablation is never cut.
11. **Paper-Facing Outputs:** The build must produce an auto-generated experiment report (metrics table + regime-timeline plots) suitable for direct use in the revised paper, along with a rewritten Related Work section and fixed reference list.
12. **Tech Stack Shift:** Shifted from local Flask/DuckDB to Cloud: Python (ML) + Supabase (DB) + Node.js (API) + React (Web) + React Native (Mobile).

## Non-Goals (explicitly cut)

- Live trading / order execution
- Options / derivatives data
- Kafka/Redis Streams ingestion (deferred to future work)
- Temporal Fusion Transformer / TFT (cite as related work, do not implement)
- Sentiment / news ingestion (future work)
- SHAP for LSTM/ANN base learners

## Open Questions (from master PRD §9)

- Whether to reproduce Liu et al.'s exact hyperparameters (2-layer LSTM, 100 units; ANN 100→50 units) or tune them for NSE data — start with their exact settings, note any necessary changes explicitly in the paper.
- Regime definition: start with volatility terciles; upgrade only if time allows.
- Coefficient bank vs. rolling re-fit for the adaptive meta-model — rolling re-fit is simpler; coefficient bank is more interpretable for the dashboard. Prototype rolling re-fit first.
- Confirm the resubmission deadline: if under ~4 weeks, ship the reproduced static Liu et al. baseline plus the rigor fixes now, and describe the regime-adaptive meta-model as "future work".

## Final Goal
Ship a single, highly defensible ablation study demonstrating that making a static meta-model regime-adaptive yields superior predictive robustness during market shifts on Indian equities.
