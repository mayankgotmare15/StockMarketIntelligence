"""
DuckDB local storage manager for staging raw OHLCV, engineered features,
ablation experiment predictions, metrics, and SHAP attributions.
"""

from __future__ import annotations
from pathlib import Path
from typing import List, Optional, Dict, Any
import duckdb
import pandas as pd

from config.settings import settings
from ml_pipeline.utils.logger import app_logger


class DuckDBManager:
    """Manages local DuckDB instance and parquet feature store."""

    def __init__(self, db_path: Optional[Path] = None, read_only: bool = False):
        self.db_path = db_path or settings.duckdb_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.read_only = read_only
        if not self.read_only:
            try:
                self._init_tables()
            except Exception as e:
                app_logger.debug(f"DuckDB tables init skipped: {e}")

    def get_connection(self, read_only: Optional[bool] = None) -> duckdb.DuckDBPyConnection:
        """Returns a new connection to the DuckDB database."""
        ro = self.read_only if read_only is None else read_only
        try:
            return duckdb.connect(database=str(self.db_path), read_only=ro)
        except duckdb.IOException:
            # Fallback to read_only connection on Windows concurrent lock
            return duckdb.connect(database=str(self.db_path), read_only=True)

    def _init_tables(self):
        """Initializes tables in DuckDB if they do not exist."""
        with self.get_connection(read_only=False) as con:
            # 1. Stock Universe Metadata
            con.execute("""
                CREATE TABLE IF NOT EXISTS stock_metadata (
                    symbol VARCHAR PRIMARY KEY,
                    name VARCHAR,
                    sector VARCHAR,
                    history_days_count INTEGER,
                    min_history_met BOOLEAN,
                    start_date DATE,
                    end_date DATE,
                    last_updated TIMESTAMP
                );
            """)

            # 2. Raw OHLCV
            con.execute("""
                CREATE TABLE IF NOT EXISTS raw_ohlcv (
                    symbol VARCHAR,
                    date DATE,
                    open DOUBLE,
                    high DOUBLE,
                    low DOUBLE,
                    close DOUBLE,
                    adj_close DOUBLE,
                    volume BIGINT,
                    PRIMARY KEY (symbol, date)
                );
            """)

            # 3. Engineered Features
            con.execute("""
                CREATE TABLE IF NOT EXISTS engineered_features (
                    symbol VARCHAR,
                    date DATE,
                    open DOUBLE,
                    high DOUBLE,
                    low DOUBLE,
                    close DOUBLE,
                    adj_close DOUBLE,
                    volume BIGINT,
                    log_return DOUBLE,
                    target_return DOUBLE,
                    atr_20 DOUBLE,
                    rsi_14 DOUBLE,
                    macd DOUBLE,
                    macd_signal DOUBLE,
                    macd_hist DOUBLE,
                    bb_upper DOUBLE,
                    bb_lower DOUBLE,
                    bb_mid DOUBLE,
                    rolling_vol_20 DOUBLE,
                    vol_ratio_5 DOUBLE,
                    PRIMARY KEY (symbol, date)
                );
            """)

            # 4. Ablation Predictions
            con.execute("""
                CREATE TABLE IF NOT EXISTS ablation_predictions (
                    symbol VARCHAR,
                    date DATE,
                    fold_index INTEGER,
                    actual_price DOUBLE,
                    actual_return DOUBLE,
                    y_hat_static DOUBLE,
                    y_hat_adaptive DOUBLE,
                    y_hat_static_price DOUBLE,
                    y_hat_adaptive_price DOUBLE,
                    y_hat_lstm DOUBLE,
                    y_hat_ann DOUBLE,
                    y_hat_rf DOUBLE,
                    y_hat_xgb DOUBLE,
                    static_residual DOUBLE,
                    adaptive_residual DOUBLE,
                    z_score DOUBLE,
                    drift_detected BOOLEAN,
                    regime_flag VARCHAR,
                    PRIMARY KEY (symbol, date)
                );
            """)

            # 5. Experiment Metrics
            con.execute("""
                CREATE TABLE IF NOT EXISTS experiment_metrics (
                    symbol VARCHAR,
                    fold_index INTEGER,
                    model_name VARCHAR,
                    mae DOUBLE,
                    rmse DOUBLE,
                    r2 DOUBLE,
                    directional_accuracy DOUBLE
                );
            """)

            # 6. SHAP Importance
            con.execute("""
                CREATE TABLE IF NOT EXISTS shap_importance (
                    symbol VARCHAR,
                    date DATE,
                    model_type VARCHAR,
                    feature_name VARCHAR,
                    shap_value DOUBLE
                );
            """)

    def save_stock_metadata(self, metadata: Dict[str, Any]):
        """Upsert stock metadata."""
        with self.get_connection() as con:
            con.execute("""
                INSERT OR REPLACE INTO stock_metadata (
                    symbol, name, sector, history_days_count, min_history_met, start_date, end_date, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                metadata["symbol"],
                metadata["name"],
                metadata["sector"],
                metadata["history_days_count"],
                metadata["min_history_met"],
                metadata.get("start_date"),
                metadata.get("end_date")
            ))

    def save_raw_ohlcv(self, symbol: str, df: pd.DataFrame):
        """Saves raw OHLCV dataframe for a stock."""
        if df.empty:
            return
        
        df_to_save = df.copy().reset_index()
        if "Date" in df_to_save.columns:
            df_to_save.rename(columns={"Date": "date"}, inplace=True)
        
        df_to_save.columns = [c.lower().replace(" ", "_") for c in df_to_save.columns]
        df_to_save["symbol"] = symbol
        df_to_save["date"] = pd.to_datetime(df_to_save["date"]).dt.date
        
        required_cols = ["symbol", "date", "open", "high", "low", "close", "adj_close", "volume"]
        for col in required_cols:
            if col not in df_to_save.columns:
                if col == "adj_close" and "close" in df_to_save.columns:
                    df_to_save["adj_close"] = df_to_save["close"]
                else:
                    df_to_save[col] = 0.0

        df_to_save = df_to_save[required_cols]

        with self.get_connection() as con:
            con.register("temp_raw_df", df_to_save)
            con.execute("""
                INSERT OR REPLACE INTO raw_ohlcv 
                SELECT symbol, date, open, high, low, close, adj_close, volume FROM temp_raw_df
            """)

    def save_engineered_features(self, symbol: str, df: pd.DataFrame):
        """Saves engineered features dataframe for a stock."""
        if df.empty:
            return
        
        df_to_save = df.copy().reset_index()
        if "Date" in df_to_save.columns:
            df_to_save.rename(columns={"Date": "date"}, inplace=True)
            
        df_to_save.columns = [c.lower().replace(" ", "_") for c in df_to_save.columns]
        df_to_save["symbol"] = symbol
        df_to_save["date"] = pd.to_datetime(df_to_save["date"]).dt.date

        required_cols = [
            "symbol", "date", "open", "high", "low", "close", "adj_close", "volume",
            "log_return", "target_return", "atr_20", "rsi_14", "macd", "macd_signal",
            "macd_hist", "bb_upper", "bb_lower", "bb_mid", "rolling_vol_20", "vol_ratio_5"
        ]

        for col in required_cols:
            if col not in df_to_save.columns:
                df_to_save[col] = 0.0

        df_to_save = df_to_save[required_cols]

        with self.get_connection() as con:
            con.register("temp_features_df", df_to_save)
            con.execute("""
                INSERT OR REPLACE INTO engineered_features 
                SELECT 
                    symbol, date, open, high, low, close, adj_close, volume,
                    log_return, target_return, atr_20, rsi_14, macd, macd_signal,
                    macd_hist, bb_upper, bb_lower, bb_mid, rolling_vol_20, vol_ratio_5
                FROM temp_features_df
            """)

    def save_ablation_predictions(self, df: pd.DataFrame):
        """Saves ablation predictions for one or more stocks."""
        if df.empty:
            return
        
        df_to_save = df.copy()
        df_to_save["date"] = pd.to_datetime(df_to_save["date"]).dt.date

        with self.get_connection() as con:
            con.register("temp_preds_df", df_to_save)
            con.execute("""
                INSERT OR REPLACE INTO ablation_predictions 
                SELECT 
                    symbol, date, fold_index, actual_price, actual_return,
                    y_hat_static, y_hat_adaptive, y_hat_static_price, y_hat_adaptive_price,
                    y_hat_lstm, y_hat_ann, y_hat_rf, y_hat_xgb,
                    static_residual, adaptive_residual, z_score, drift_detected, regime_flag
                FROM temp_preds_df
            """)

    def save_experiment_metrics(self, df: pd.DataFrame):
        """Saves fold metrics into DuckDB."""
        if df.empty:
            return
        
        with self.get_connection() as con:
            con.register("temp_metrics_df", df)
            con.execute("INSERT INTO experiment_metrics SELECT * FROM temp_metrics_df")

    def save_shap_importance(self, records: List[Dict[str, Any]]):
        """Saves SHAP attribution records into DuckDB."""
        if not records:
            return
        df = pd.DataFrame(records)
        df["date"] = pd.to_datetime(df["date"]).dt.date

        with self.get_connection() as con:
            con.register("temp_shap_df", df)
            con.execute("INSERT INTO shap_importance SELECT symbol, date, model_type, feature_name, shap_value FROM temp_shap_df")

    def get_features(self, symbol: str) -> pd.DataFrame:
        """Retrieves engineered features for a stock sorted chronologically."""
        with self.get_connection() as con:
            df = con.execute("""
                SELECT * FROM engineered_features 
                WHERE symbol = ? 
                ORDER BY date ASC
            """, (symbol,)).df()
        return df

    def get_predictions(self, symbol: Optional[str] = None) -> pd.DataFrame:
        """Retrieves ablation predictions for a specific stock or all stocks."""
        with self.get_connection() as con:
            if symbol:
                df = con.execute("""
                    SELECT * FROM ablation_predictions 
                    WHERE symbol = ? 
                    ORDER BY date ASC
                """, (symbol,)).df()
            else:
                df = con.execute("SELECT * FROM ablation_predictions ORDER BY symbol, date ASC").df()
        return df

    def get_metrics_summary(self) -> pd.DataFrame:
        """Aggregates experiment metrics across models."""
        with self.get_connection() as con:
            df = con.execute("""
                SELECT 
                    model_name,
                    ROUND(AVG(mae), 6) AS mean_mae,
                    ROUND(AVG(rmse), 6) AS mean_rmse,
                    ROUND(AVG(r2), 6) AS mean_r2,
                    ROUND(AVG(directional_accuracy), 2) AS mean_directional_accuracy,
                    COUNT(*) AS total_evaluated_folds
                FROM experiment_metrics
                GROUP BY model_name
                ORDER BY mean_mae ASC
            """).df()
        return df

    def get_regime_breakdown(self) -> pd.DataFrame:
        """Evaluates MAE and RMSE conditioned on detected market regimes."""
        with self.get_connection() as con:
            df = con.execute("""
                SELECT 
                    regime_flag,
                    COUNT(*) AS sample_count,
                    ROUND(AVG(ABS(static_residual)), 6) AS static_mae,
                    ROUND(AVG(ABS(adaptive_residual)), 6) AS adaptive_mae,
                    ROUND(AVG(static_residual * static_residual), 6) AS static_mse,
                    ROUND(AVG(adaptive_residual * adaptive_residual), 6) AS adaptive_mse,
                    ROUND((AVG(ABS(static_residual)) - AVG(ABS(adaptive_residual))) / AVG(ABS(static_residual)) * 100, 2) AS pct_mae_improvement
                FROM ablation_predictions
                GROUP BY regime_flag
                ORDER BY regime_flag ASC
            """).df()
        return df

    def get_all_valid_symbols(self) -> List[str]:
        """Retrieves list of tickers that met the minimum history requirement."""
        with self.get_connection() as con:
            res = con.execute("""
                SELECT symbol FROM stock_metadata 
                WHERE min_history_met = TRUE 
                ORDER BY symbol ASC
            """).fetchall()
        return [r[0] for r in res]

    def export_to_parquet(self, output_dir: Optional[Path] = None):
        """Exports all DuckDB tables to Parquet files."""
        out_path = output_dir or settings.parquet_dir
        out_path.mkdir(parents=True, exist_ok=True)
        with self.get_connection() as con:
            con.execute(f"COPY raw_ohlcv TO '{out_path / 'raw_ohlcv.parquet'}' (FORMAT PARQUET);")
            con.execute(f"COPY engineered_features TO '{out_path / 'engineered_features.parquet'}' (FORMAT PARQUET);")
            con.execute(f"COPY stock_metadata TO '{out_path / 'stock_metadata.parquet'}' (FORMAT PARQUET);")
            con.execute(f"COPY ablation_predictions TO '{out_path / 'ablation_predictions.parquet'}' (FORMAT PARQUET);")
            con.execute(f"COPY experiment_metrics TO '{out_path / 'experiment_metrics.parquet'}' (FORMAT PARQUET);")
            con.execute(f"COPY shap_importance TO '{out_path / 'shap_importance.parquet'}' (FORMAT PARQUET);")
        app_logger.info(f"Exported all tables to Parquet at: {out_path}")
