# Backend REST API Service

**Tech Stack:** Node.js (Express / TypeScript)
**Target Deployment:** Render / AWS

## Role in Architecture
Provides a decoupled REST API interface that connects to the **Supabase (PostgreSQL)** database to serve precomputed backtest results, live forecasts, regime flags, and SHAP explainability data to the web and mobile frontends.

## Endpoints (Planned for Phase 7)
- `GET /api/health` - Service health status
- `GET /api/stocks` - List 25-30 NSE tickers with sector metadata and backtest availability
- `GET /api/backtest/:symbol` - Retrieve Static vs. Adaptive ablation backtest timeline
- `GET /api/regimes/:symbol` - Retrieve regime timeline and drift trigger events
- `GET /api/shap/:symbol` - Retrieve Tree SHAP feature importance
- `GET /api/metrics` - Retrieve aggregate and per-fold performance metrics
