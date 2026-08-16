-- ==============================================================================
-- Supabase / PostgreSQL Schema Definition
-- Real-Time Indian Stock Market Intelligence Platform (v4)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Stock Universe Metadata
CREATE TABLE IF NOT EXISTS stock_universe (
    symbol VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    description TEXT,
    min_history_met BOOLEAN DEFAULT FALSE,
    history_days_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Daily OHLCV and Feature Store Table
CREATE TABLE IF NOT EXISTS daily_ohlcv (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL REFERENCES stock_universe(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    open NUMERIC(12, 4) NOT NULL,
    high NUMERIC(12, 4) NOT NULL,
    low NUMERIC(12, 4) NOT NULL,
    close NUMERIC(12, 4) NOT NULL,
    volume BIGINT NOT NULL,
    log_return NUMERIC(10, 6),
    atr_20 NUMERIC(12, 4),
    rsi_14 NUMERIC(8, 4),
    macd NUMERIC(10, 6),
    macd_signal NUMERIC(10, 6),
    macd_hist NUMERIC(10, 6),
    bb_upper NUMERIC(12, 4),
    bb_lower NUMERIC(12, 4),
    bb_mid NUMERIC(12, 4),
    rolling_vol_20 NUMERIC(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_stock_date UNIQUE (symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_ohlcv_symbol_date ON daily_ohlcv(symbol, date DESC);

-- 3. Ablation Predictions & Backtest Results Table
-- Contract: [Date, Ticker, Actual_Return, Actual_Price, y_hat_Static, y_hat_Adaptive, Regime_Flag]
CREATE TABLE IF NOT EXISTS ablation_predictions (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL REFERENCES stock_universe(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    fold_index INT NOT NULL,
    actual_price NUMERIC(12, 4) NOT NULL,
    actual_return NUMERIC(10, 6) NOT NULL,
    y_hat_static NUMERIC(10, 6) NOT NULL,
    y_hat_adaptive NUMERIC(10, 6) NOT NULL,
    y_hat_static_price NUMERIC(12, 4) NOT NULL,
    y_hat_adaptive_price NUMERIC(12, 4) NOT NULL,
    y_hat_lstm NUMERIC(10, 6),
    y_hat_ann NUMERIC(10, 6),
    y_hat_rf NUMERIC(10, 6),
    y_hat_xgb NUMERIC(10, 6),
    static_residual NUMERIC(10, 6),
    adaptive_residual NUMERIC(10, 6),
    z_score NUMERIC(8, 4),
    drift_detected BOOLEAN DEFAULT FALSE,
    regime_flag VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_pred_symbol_date UNIQUE (symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_ablation_preds_symbol_date ON ablation_predictions(symbol, date ASC);
CREATE INDEX IF NOT EXISTS idx_ablation_preds_regime ON ablation_predictions(regime_flag);

-- 4. Tree Models SHAP Feature Importance Table
CREATE TABLE IF NOT EXISTS shap_importance (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL REFERENCES stock_universe(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    model_type VARCHAR(20) NOT NULL, -- 'RandomForest', 'XGBoost'
    feature_name VARCHAR(50) NOT NULL,
    shap_value NUMERIC(10, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shap_symbol_model ON shap_importance(symbol, model_type, date DESC);

-- 5. Experiment Summary Metrics Table (Walk-Forward Fold-by-Fold & Aggregate)
CREATE TABLE IF NOT EXISTS experiment_metrics (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(50) NOT NULL,
    symbol VARCHAR(20) NOT NULL REFERENCES stock_universe(symbol) ON DELETE CASCADE,
    fold_index INT NOT NULL,
    model_name VARCHAR(50) NOT NULL, -- 'Liu_Static', 'Regime_Adaptive', 'LSTM', 'ANN', 'RF', 'XGB'
    mae NUMERIC(10, 6) NOT NULL,
    rmse NUMERIC(10, 6) NOT NULL,
    r2 NUMERIC(10, 6) NOT NULL,
    directional_accuracy NUMERIC(8, 4) NOT NULL,
    evaluation_type VARCHAR(50) DEFAULT 'WalkForward_CV', -- 'WalkForward_CV', 'Liu_TimeSeriesSplit'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exp_metrics_run_symbol ON experiment_metrics(run_id, symbol, model_name);
