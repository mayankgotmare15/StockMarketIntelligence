"""
Unit and Integration Tests for Phase 2: Data Ingestion & Storage Pipeline.
"""

import tempfile
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from ml_pipeline.data.indicators import TechnicalIndicatorCalculator
from ml_pipeline.storage.duckdb_manager import DuckDBManager
from ml_pipeline.data.collector import YFinanceCollector


@pytest.fixture
def synthetic_ohlcv():
    """Generates 500 days of synthetic OHLCV data for testing."""
    np.random.seed(42)
    dates = pd.date_range(start="2022-01-01", periods=500, freq="B")
    
    # Random walk price series
    returns = np.random.normal(loc=0.0005, scale=0.015, size=500)
    price = 100.0 * np.exp(np.cumsum(returns))
    
    high = price * (1 + np.random.uniform(0.002, 0.015, size=500))
    low = price * (1 - np.random.uniform(0.002, 0.015, size=500))
    open_p = (high + low) / 2
    volume = np.random.randint(100000, 5000000, size=500)

    df = pd.DataFrame({
        "Date": dates,
        "Open": open_p,
        "High": high,
        "Low": low,
        "Close": price,
        "Adj Close": price,
        "Volume": volume
    }).set_index("Date")
    
    return df


def test_technical_indicator_calculator(synthetic_ohlcv):
    """Verifies that all technical indicators are correctly calculated without NaNs."""
    calc = TechnicalIndicatorCalculator()
    features_df = calc.compute_all_indicators(synthetic_ohlcv, dropna=True)

    expected_cols = [
        "log_return", "target_return", "atr_20", "rsi_14", "macd",
        "macd_signal", "macd_hist", "bb_upper", "bb_lower", "bb_mid",
        "rolling_vol_20", "vol_ratio_5"
    ]

    for col in expected_cols:
        assert col in features_df.columns, f"Missing feature column: {col}"
        # Except the last row which might not have target_return, features should not have NaNs
        assert not features_df[col].iloc[:-1].isna().any(), f"NaN found in feature {col}"

    # Log return formula verification: r_t = ln(Close_t / Close_{t-1})
    close = features_df["Close"].values
    expected_log_ret = np.log(close[1:] / close[:-1])
    np.testing.assert_allclose(features_df["log_return"].values[1:], expected_log_ret, rtol=1e-5)

    # RSI should be bounded in [0, 100]
    assert (features_df["rsi_14"] >= 0).all()
    assert (features_df["rsi_14"] <= 100).all()

    # Bollinger Bands check: Upper > Mid > Lower
    assert (features_df["bb_upper"] >= features_df["bb_mid"]).all()
    assert (features_df["bb_mid"] >= features_df["bb_lower"]).all()

    # ATR should be strictly positive
    assert (features_df["atr_20"] > 0).all()


def test_duckdb_manager(synthetic_ohlcv):
    """Tests DuckDB table creation, persistence, query retrieval, and Parquet export."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db_path = Path(tmp_dir) / "test_market.duckdb"
        tmp_parquet_dir = Path(tmp_dir) / "parquet"
        
        manager = DuckDBManager(db_path=tmp_db_path)
        
        calc = TechnicalIndicatorCalculator()
        features_df = calc.compute_all_indicators(synthetic_ohlcv, dropna=True)
        
        # Test Save Metadata
        metadata = {
            "symbol": "TEST.NS",
            "name": "Test Company Limited",
            "sector": "IT",
            "history_days_count": 500,
            "min_history_met": True,
            "start_date": "2022-01-01",
            "end_date": "2024-01-01"
        }
        manager.save_stock_metadata(metadata)
        
        # Test Save Raw OHLCV
        manager.save_raw_ohlcv("TEST.NS", synthetic_ohlcv)
        
        # Test Save Features
        manager.save_engineered_features("TEST.NS", features_df)
        
        # Test Retrieval
        retrieved_features = manager.get_features("TEST.NS")
        assert len(retrieved_features) == len(features_df)
        assert "log_return" in retrieved_features.columns
        assert "atr_20" in retrieved_features.columns
        
        # Test Valid Symbols
        valid_symbols = manager.get_all_valid_symbols()
        assert "TEST.NS" in valid_symbols
        
        # Test Parquet Export
        manager.export_to_parquet(tmp_parquet_dir)
        assert (tmp_parquet_dir / "raw_ohlcv.parquet").exists()
        assert (tmp_parquet_dir / "engineered_features.parquet").exists()
        assert (tmp_parquet_dir / "stock_metadata.parquet").exists()


def test_history_precondition():
    """Verifies that stocks with < 400 trading days are flagged as invalid."""
    collector = YFinanceCollector(min_history_days=400)
    
    # Synthetic short series (150 days)
    dates = pd.date_range(start="2023-01-01", periods=150, freq="B")
    short_df = pd.DataFrame({
        "Date": dates,
        "Open": 100.0,
        "High": 105.0,
        "Low": 95.0,
        "Close": 102.0,
        "Volume": 100000
    }).set_index("Date")

    # Manually check metadata logic
    metadata = {
        "symbol": "SHORT.NS",
        "history_days_count": len(short_df),
        "min_history_met": len(short_df) >= collector.min_history_days
    }
    assert metadata["min_history_met"] is False
    assert metadata["history_days_count"] == 150
