"""
Unit and Integration Tests for Phase 6: Full Ablation Experiment & Exporter.
"""

import tempfile
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from ml_pipeline.storage.supabase_exporter import SupabaseExporter
from ml_pipeline.storage.duckdb_manager import DuckDBManager
from ml_pipeline.evaluation.walk_forward import WalkForwardCVHarness


def test_supabase_exporter_offline_fallback():
    """Verifies that SupabaseExporter handles missing credentials without crashing."""
    exporter = SupabaseExporter(supabase_url=None, supabase_key=None)
    assert not exporter.is_connected

    # Calling exports should safely do nothing
    exporter.export_stock_universe([{"symbol": "TEST.NS"}])
    exporter.export_daily_ohlcv(pd.DataFrame({"symbol": ["TEST.NS"]}))
    exporter.export_ablation_predictions(pd.DataFrame({"symbol": ["TEST.NS"]}))
    exporter.export_shap_importance([{"symbol": "TEST.NS"}])
    exporter.export_experiment_metrics(pd.DataFrame({"symbol": ["TEST.NS"]}))


def test_supabase_record_sanitization():
    """Verifies that NaNs and Infs are converted to None for valid JSON serialization."""
    exporter = SupabaseExporter()
    raw_record = {
        "symbol": "TCS.NS",
        "valid_float": 12.34,
        "nan_float": float("nan"),
        "inf_float": float("inf"),
        "np_float": np.float64(0.015),
        "timestamp": pd.Timestamp("2024-01-01")
    }

    clean = exporter._sanitize_record(raw_record)
    assert clean["nan_float"] is None
    assert clean["inf_float"] is None
    assert clean["valid_float"] == 12.34
    assert clean["timestamp"] == "2024-01-01"
    assert isinstance(clean["np_float"], float)


def test_duckdb_ablation_storage_and_queries():
    """Tests storing and aggregating ablation predictions and regime breakdown in DuckDB."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db_path = Path(tmp_dir) / "test_ablation.duckdb"
        manager = DuckDBManager(db_path=tmp_db_path)

        preds_data = pd.DataFrame({
            "symbol": ["TCS.NS"] * 6,
            "date": pd.date_range("2024-01-01", periods=6, freq="B"),
            "fold_index": [1, 1, 1, 2, 2, 2],
            "actual_price": [3500.0, 3520.0, 3510.0, 3550.0, 3540.0, 3560.0],
            "actual_return": [0.005, -0.002, 0.008, -0.003, 0.006, 0.001],
            "y_hat_static": [0.004, -0.001, 0.007, -0.002, 0.005, 0.002],
            "y_hat_adaptive": [0.0045, -0.0015, 0.0075, -0.0025, 0.0055, 0.0015],
            "y_hat_static_price": [3490.0] * 6,
            "y_hat_adaptive_price": [3495.0] * 6,
            "y_hat_lstm": [0.004] * 6,
            "y_hat_ann": [0.004] * 6,
            "y_hat_rf": [0.003] * 6,
            "y_hat_xgb": [0.003] * 6,
            "static_residual": [0.001, -0.001, 0.001, -0.001, 0.001, -0.001],
            "adaptive_residual": [0.0005, -0.0005, 0.0005, -0.0005, 0.0005, -0.0005],
            "z_score": [0.5, 0.6, 0.4, 0.5, 0.7, 0.3],
            "drift_detected": [False] * 6,
            "regime_flag": ["Low", "Low", "Medium", "Medium", "High", "High"]
        })

        manager.save_ablation_predictions(preds_data)

        # Query predictions
        retrieved_preds = manager.get_predictions("TCS.NS")
        assert len(retrieved_preds) == 6

        # Query regime breakdown
        regime_df = manager.get_regime_breakdown()
        assert len(regime_df) == 3
        # Adaptive MAE should be lower than Static MAE in our synthetic test data
        for _, row in regime_df.iterrows():
            assert row["adaptive_mae"] <= row["static_mae"]


def test_walk_forward_multi_stock_ablation():
    """Runs a quick multi-stock walk-forward test for TCS.NS and HDFCBANK.NS."""
    db_manager = DuckDBManager()
    harness = WalkForwardCVHarness(train_window=252, test_window=21, step_size=21, epochs=3)

    for symbol in ["TCS.NS", "HDFCBANK.NS"]:
        df = db_manager.get_features(symbol)
        sample_df = df.iloc[:294].copy()  # exactly 2 folds
        res = harness.evaluate_stock(symbol, sample_df, include_shap=False)

        assert len(res["predictions"]) == 42  # 2 folds * 21 days
        assert len(res["metrics"]) == 12      # 2 folds * 6 models
