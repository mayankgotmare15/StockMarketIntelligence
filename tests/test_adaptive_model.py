"""
Unit and Integration Tests for Phase 5: Drift Detector, Regime Classifier, and Adaptive Meta-Model.
"""

import numpy as np
import pandas as pd
import pytest

from ml_pipeline.models.drift_detector import RollingZScoreDriftDetector
from ml_pipeline.models.regime_classifier import VolatilityTercileClassifier
from ml_pipeline.models.adaptive_meta_model import AdaptiveRidgeMetaModel
from ml_pipeline.evaluation.walk_forward import WalkForwardCVHarness
from ml_pipeline.storage.duckdb_manager import DuckDBManager


def test_drift_detector_spike():
    """Verifies that an anomalous prediction error triggers a drift flag."""
    detector = RollingZScoreDriftDetector(window_size=30, z_threshold=2.5, min_samples=15)
    
    # Feed 30 stationary normal residuals with low variance
    np.random.seed(42)
    normal_residuals = np.random.normal(0.0, 0.002, size=30)
    for res in normal_residuals:
        detector.update_and_check(res)

    # Feed a massive error spike (> 10 sigma)
    spike = 0.05
    drift_flag, z_score = detector.update_and_check(spike)
    assert drift_flag is True, f"Expected drift flag on spike, got z={z_score}"
    assert z_score > 2.5


def test_regime_classifier_terciles():
    """Verifies that volatility tercile thresholds partition into Low, Medium, and High."""
    df_synthetic = pd.DataFrame({
        "atr_20": np.linspace(1.0, 10.0, 100)
    })
    
    classifier = VolatilityTercileClassifier(metric_column="atr_20")
    classifier.fit(df_synthetic)
    
    thresholds = classifier.get_thresholds()
    assert thresholds["tercile_low_boundary"] < thresholds["tercile_high_boundary"]

    # Low boundary check
    assert classifier.classify_scalar(1.5) == "Low"
    # Medium boundary check
    assert classifier.classify_scalar(5.5) == "Medium"
    # High boundary check
    assert classifier.classify_scalar(9.5) == "High"

    series_classes = classifier.classify_series(df_synthetic["atr_20"])
    unique_classes = set(series_classes)
    assert unique_classes == {"Low", "Medium", "High"}


def test_adaptive_ridge_multicollinearity_stability():
    """Verifies that Ridge regression handles extreme neural net multicollinearity without crashing."""
    np.random.seed(42)
    n_samples = 100
    
    # LSTM and ANN producing 99% correlated predictions
    y_true = np.random.normal(0.001, 0.015, size=n_samples)
    y_lstm = y_true + np.random.normal(0, 0.001, size=n_samples)
    y_ann = y_lstm + np.random.normal(0, 0.0001, size=n_samples)  # almost identical

    train_df = pd.DataFrame({"atr_20": np.random.uniform(5, 25, size=n_samples)})
    
    adaptive_model = AdaptiveRidgeMetaModel(lookback_refit_days=60, alpha=1.0)
    adaptive_model.fit_initial(train_df, y_lstm, y_ann, y_true)

    coefs = adaptive_model.get_current_coefficients()
    assert not np.isnan(coefs["beta_0_intercept"])
    assert not np.isnan(coefs["beta_1_lstm"])
    assert not np.isnan(coefs["beta_2_ann"])

    # Simulate sequential test steps
    n_test = 21
    y_lstm_test = y_lstm[:n_test]
    y_ann_test = y_ann[:n_test]
    y_true_test = y_true[:n_test]
    vol_metrics = np.random.uniform(5, 25, size=n_test)

    res = adaptive_model.predict_sequential(y_lstm_test, y_ann_test, y_true_test, vol_metrics)
    assert len(res["y_hat_adaptive"]) == n_test
    assert not np.isnan(res["y_hat_adaptive"]).any()
    assert len(res["drift_flags"]) == n_test
    assert len(res["regime_flags"]) == n_test


def test_walk_forward_ablation_side_by_side():
    """Runs a 2-fold Walk-Forward CV ablation on INFY.NS comparing Static vs. Adaptive."""
    db_manager = DuckDBManager()
    df = db_manager.get_features("INFY.NS")
    sample_df = df.iloc[:300].copy()

    harness = WalkForwardCVHarness(train_window=252, test_window=21, step_size=21, epochs=5)
    results = harness.evaluate_stock("INFY.NS", sample_df, include_shap=False)

    preds_df = results["predictions"]
    assert "y_hat_static" in preds_df.columns
    assert "y_hat_adaptive" in preds_df.columns
    assert "regime_flag" in preds_df.columns
    assert "drift_detected" in preds_df.columns
    assert "z_score" in preds_df.columns

    metrics_df = results["metrics"]
    models_evaluated = set(metrics_df["model_name"].unique())
    assert "Liu_Static" in models_evaluated
    assert "Regime_Adaptive" in models_evaluated
    assert "LSTM" in models_evaluated
    assert "ANN" in models_evaluated
    assert "RandomForest" in models_evaluated
    assert "XGBoost" in models_evaluated
