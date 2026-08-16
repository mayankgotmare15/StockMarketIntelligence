"""
Unit and Integration Tests for Phase 4: Walk-Forward Evaluation Harness, Baselines, and SHAP.
"""

import numpy as np
import pandas as pd
import pytest

from ml_pipeline.evaluation.metrics import (
    calculate_mae,
    calculate_rmse,
    calculate_r2,
    calculate_directional_accuracy,
    reconstruct_price_levels,
    compute_metrics_dict
)
from ml_pipeline.models.baselines import RandomForestBaseline, XGBoostBaseline
from ml_pipeline.evaluation.shap_explainer import TreeSHAPExplainer
from ml_pipeline.evaluation.walk_forward import WalkForwardCVHarness
from ml_pipeline.evaluation.time_series_split import SingleTimeSeriesSplitBenchmark
from ml_pipeline.storage.duckdb_manager import DuckDBManager
from ml_pipeline.data.dataset import FEATURE_COLUMNS


def test_metric_calculations():
    """Verifies correctness of MAE, RMSE, R2, and Directional Accuracy."""
    y_true = np.array([0.01, -0.02, 0.015, -0.005, 0.03])
    y_pred = np.array([0.008, -0.018, 0.012, 0.002, 0.025]) # 4 out of 5 signs match
    
    mae = calculate_mae(y_true, y_pred)
    assert np.isclose(mae, np.mean(np.abs(y_true - y_pred)))

    rmse = calculate_rmse(y_true, y_pred)
    assert np.isclose(rmse, np.sqrt(np.mean((y_true - y_pred) ** 2)))

    da = calculate_directional_accuracy(y_true, y_pred)
    assert da == 80.0  # 4 / 5 * 100%

    metrics = compute_metrics_dict(y_true, y_pred)
    assert "mae" in metrics and "rmse" in metrics and "r2" in metrics and "directional_accuracy" in metrics


def test_price_reconstruction():
    """Verifies price level conversion P_hat = P_prev * exp(y_hat)."""
    p_prev = np.array([100.0, 105.0, 110.0])
    y_hat = np.array([0.02, -0.01, 0.05])
    
    reconstructed = reconstruct_price_levels(p_prev, y_hat)
    expected = p_prev * np.exp(y_hat)
    
    np.testing.assert_allclose(reconstructed, expected, rtol=1e-6)


def test_tree_baselines_and_shap():
    """Tests Random Forest, XGBoost, and Tree SHAP feature attribution."""
    np.random.seed(42)
    n_samples, n_feats = 100, len(FEATURE_COLUMNS)
    X = np.random.randn(n_samples, n_feats)
    y = 0.5 * X[:, 0] - 0.3 * X[:, 1] + np.random.randn(n_samples) * 0.01

    rf = RandomForestBaseline(n_estimators=20, max_depth=3)
    rf.fit(X, y)
    preds_rf = rf.predict(X)
    assert len(preds_rf) == n_samples

    xgb_model = XGBoostBaseline(n_estimators=20, max_depth=3)
    xgb_model.fit(X, y)
    preds_xgb = xgb_model.predict(X)
    assert len(preds_xgb) == n_samples

    # SHAP Explainer
    explainer = TreeSHAPExplainer(FEATURE_COLUMNS)
    shap_res = explainer.explain_model(rf, X[:10], "RandomForest")
    assert "shap_values" in shap_res
    assert "mean_abs_importance" in shap_res
    assert len(shap_res["mean_abs_importance"]) == n_feats
    
    # Feature 0 should be among top important features
    top_feature = shap_res["mean_abs_importance"].iloc[0]["feature"]
    assert top_feature in FEATURE_COLUMNS


def test_walk_forward_splits():
    """Tests sliding fold generator index logic."""
    harness = WalkForwardCVHarness(train_window=252, test_window=21, step_size=21)
    splits = harness.generate_fold_splits(total_rows=500)
    
    assert len(splits) > 0
    for tr_s, tr_e, te_s, te_e in splits:
        assert (tr_e - tr_s) == 252
        assert (te_e - te_s) == 21
        assert tr_e == te_s  # Test window starts immediately after train window


def test_walk_forward_integration_sample_stock():
    """Runs a 2-fold Walk-Forward CV test on HDFCBANK.NS data."""
    db_manager = DuckDBManager()
    df = db_manager.get_features("HDFCBANK.NS")
    assert len(df) >= 350

    # Slice a small sample for rapid testing (300 days = ~2 folds)
    sample_df = df.iloc[:300].copy()
    harness = WalkForwardCVHarness(train_window=252, test_window=21, step_size=21, epochs=5)
    results = harness.evaluate_stock("HDFCBANK.NS", sample_df, include_shap=True)

    assert "predictions" in results
    assert "metrics" in results
    assert "shap_records" in results

    preds_df = results["predictions"]
    assert len(preds_df) > 0
    assert "y_hat_static" in preds_df.columns
    assert "y_hat_lstm" in preds_df.columns
    assert "y_hat_ann" in preds_df.columns
    assert "y_hat_rf" in preds_df.columns
    assert "y_hat_xgb" in preds_df.columns
    assert "y_hat_static_price" in preds_df.columns


def test_single_timeseries_split_benchmark():
    """Runs the secondary Liu et al. single-split benchmark."""
    db_manager = DuckDBManager()
    df = db_manager.get_features("HDFCBANK.NS")
    sample_df = df.iloc[:300].copy()

    benchmark = SingleTimeSeriesSplitBenchmark(train_ratio=0.80, epochs=5)
    results = benchmark.evaluate_stock("HDFCBANK.NS", sample_df)

    assert results["methodology"] == "Single_TimeSeriesSplit_Liu2024"
    assert "metrics" in results
    assert "mae" in results["metrics"]
    assert "directional_accuracy" in results["metrics"]
