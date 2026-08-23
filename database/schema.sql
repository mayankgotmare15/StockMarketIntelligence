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

-- ==============================================================================
-- 6. User Profiles & Authentication
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth users (Google/Apple)
    google_id VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) DEFAULT 'local', -- 'local', 'google', 'apple', 'demo'
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'pro_trader', -- 'pro_trader', 'quant_analyst', 'guest'
    risk_tolerance VARCHAR(50) DEFAULT 'moderate', -- 'conservative', 'moderate', 'aggressive'
    trading_horizon VARCHAR(50) DEFAULT 'swing', -- 'intraday', 'swing', 'positional'
    default_stock VARCHAR(20) DEFAULT 'APOLLOHOSP.NS' REFERENCES stock_universe(symbol) ON DELETE SET NULL,
    primary_sector VARCHAR(100) DEFAULT 'Pharma',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id ON user_profiles(google_id);

-- ==============================================================================
-- 7. User ML Model & Drift Customization Preferences
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_ml_preferences (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    drift_threshold NUMERIC(4, 2) DEFAULT 2.00, -- 1.50, 2.00, 2.50
    primary_baseline VARCHAR(50) DEFAULT 'Liu_Static', -- 'Liu_Static', 'LSTM', 'ANN', 'XGBoost'
    alert_volatility_spike BOOLEAN DEFAULT TRUE,
    alert_drift_detected BOOLEAN DEFAULT TRUE,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 8. User Watchlists (Personalized Portfolio Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_watchlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL REFERENCES stock_universe(symbol) ON DELETE CASCADE,
    target_entry_price NUMERIC(12, 4),
    target_stop_loss NUMERIC(12, 4),
    alert_price_threshold NUMERIC(12, 4),
    notes TEXT,
    display_order INT DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_symbol UNIQUE (user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_user_watchlists_user ON user_watchlists(user_id);

-- ==============================================================================
-- 9. User Simulations (Bookmarked Keypad Scenarios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL REFERENCES stock_universe(symbol) ON DELETE CASCADE,
    input_price NUMERIC(12, 4) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL, -- 'Normal', 'High Vol', 'RSI Low', 'MACD'
    simulated_adaptive_return NUMERIC(10, 6) NOT NULL,
    simulated_static_return NUMERIC(10, 6) NOT NULL,
    simulated_adaptive_price NUMERIC(12, 4) NOT NULL,
    simulated_static_price NUMERIC(12, 4) NOT NULL,
    simulated_error_reduction NUMERIC(6, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_simulations_user ON user_simulations(user_id, created_at DESC);

-- ==============================================================================
-- 10. User Activity & Audit Feed
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'login', 'simulation_run', 'drift_alert', 'watchlist_add', 'preference_change'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_time ON user_activity_feed(user_id, created_at DESC);

-- ==============================================================================
-- 11. Auth Sessions & Refresh Token Rotation (RTR)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info TEXT,
    ip_address VARCHAR(45),
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_lookup ON auth_sessions(token_hash, is_revoked, expires_at);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ml_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to stock data & public benchmarks
ALTER TABLE stock_universe ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_ohlcv ENABLE ROW LEVEL SECURITY;
ALTER TABLE ablation_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shap_importance ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_stock_universe ON stock_universe FOR SELECT USING (true);
CREATE POLICY public_read_daily_ohlcv ON daily_ohlcv FOR SELECT USING (true);
CREATE POLICY public_read_ablation_predictions ON ablation_predictions FOR SELECT USING (true);
CREATE POLICY public_read_shap_importance ON shap_importance FOR SELECT USING (true);
CREATE POLICY public_read_experiment_metrics ON experiment_metrics FOR SELECT USING (true);
