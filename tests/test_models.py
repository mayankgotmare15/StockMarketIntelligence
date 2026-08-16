"""
Unit tests for Phase 3: Base Learners (LSTM & ANN) and Static Meta-Model.
"""

import numpy as np
import pandas as pd
import torch
import pytest

from ml_pipeline.models.base_learners import LSTMEstimator, ANNEstimator, set_seed
from ml_pipeline.models.meta_model import StaticMetaModel
from ml_pipeline.data.dataset import DataFormatter, FEATURE_COLUMNS
from ml_pipeline.storage.duckdb_manager import DuckDBManager


def test_lstm_estimator_training():
    """Tests that PyTorch LSTM trains and loss decreases."""
    set_seed(42)
    n_samples, lookback, n_features = 100, 10, len(FEATURE_COLUMNS)
    
    # Synthetic random sequences
    X = torch.randn(n_samples, lookback, n_features)
    y = torch.randn(n_samples, 1) * 0.02  # scale of daily returns
    
    lstm = LSTMEstimator(input_dim=n_features, hidden_dim=32, num_layers=2, epochs=15, batch_size=16)
    lstm.fit(X, y)
    
    assert len(lstm.loss_history) == 15
    # Loss should decrease from first to last epoch
    assert lstm.loss_history[-1] < lstm.loss_history[0]
    
    preds = lstm.predict(X)
    assert preds.shape == (n_samples,)
    assert not np.isnan(preds).any()


def test_ann_estimator_training():
    """Tests that PyTorch ANN trains and loss decreases."""
    set_seed(42)
    n_samples, lookback, n_features = 100, 10, len(FEATURE_COLUMNS)
    
    # Flattened tabular input (lookback * n_features)
    input_dim = lookback * n_features
    X = torch.randn(n_samples, input_dim)
    y = torch.randn(n_samples, 1) * 0.02
    
    ann = ANNEstimator(input_dim=input_dim, hidden_1=64, hidden_2=32, epochs=15, batch_size=16)
    ann.fit(X, y)
    
    assert len(ann.loss_history) == 15
    assert ann.loss_history[-1] < ann.loss_history[0]
    
    preds = ann.predict(X)
    assert preds.shape == (n_samples,)
    assert not np.isnan(preds).any()


def test_static_meta_model():
    """Tests that the Static Linear Regression Stacking accurately computes beta weights."""
    n_samples = 100
    np.random.seed(42)
    
    # Simulate true returns and model predictions
    y_true = np.random.normal(0.001, 0.015, size=n_samples)
    y_hat_lstm = y_true + np.random.normal(0, 0.005, size=n_samples)
    y_hat_ann = y_true + np.random.normal(0, 0.005, size=n_samples)
    
    meta_model = StaticMetaModel(fit_intercept=True)
    meta_model.fit(y_hat_lstm, y_hat_ann, y_true)
    
    coefs = meta_model.get_coefficients()
    assert "beta_0_intercept" in coefs
    assert "beta_1_lstm" in coefs
    assert "beta_2_ann" in coefs
    
    preds = meta_model.predict(y_hat_lstm, y_hat_ann)
    assert preds.shape == (n_samples,)
    
    # Manual verification of linear equation
    manual_preds = coefs["beta_0_intercept"] + (coefs["beta_1_lstm"] * y_hat_lstm) + (coefs["beta_2_ann"] * y_hat_ann)
    np.testing.assert_allclose(preds, manual_preds, rtol=1e-5)


def test_end_to_end_single_stock_pipeline():
    """Tests end-to-end integration on real ingested features for TCS.NS."""
    db_manager = DuckDBManager()
    df = db_manager.get_features("TCS.NS")
    
    assert len(df) >= 400
    
    # Split into 252-day train and 21-day test
    train_df = df.iloc[:252].copy()
    test_df = df.iloc[252:273].copy()
    
    formatter = DataFormatter(lookback_days=10)
    formatter.fit_scaler(train_df)
    
    train_feats = formatter.transform_features(train_df)
    test_feats = formatter.transform_features(test_df)
    
    train_targets = train_df["target_return"].values
    test_targets = test_df["target_return"].values
    
    # Form LSTM sequences
    X_train_lstm, y_train_lstm = formatter.create_lstm_sequences(train_feats, train_targets)
    X_test_lstm, y_test_lstm = formatter.create_lstm_sequences(test_feats, test_targets)
    
    # Form ANN tabular
    X_train_ann, y_train_ann = formatter.create_ann_tabular(train_feats, train_targets)
    X_test_ann, y_test_ann = formatter.create_ann_tabular(test_feats, test_targets)
    
    # Train LSTM
    lstm = LSTMEstimator(input_dim=len(FEATURE_COLUMNS), epochs=10, batch_size=32)
    lstm.fit(X_train_lstm, y_train_lstm)
    train_preds_lstm = lstm.predict(X_train_lstm)
    test_preds_lstm = lstm.predict(X_test_lstm)
    
    # Train ANN
    ann = ANNEstimator(input_dim=10 * len(FEATURE_COLUMNS), epochs=10, batch_size=32)
    ann.fit(X_train_ann, y_train_ann)
    train_preds_ann = ann.predict(X_train_ann)
    test_preds_ann = ann.predict(X_test_ann)
    
    # Fit Static Meta-Model on train predictions
    meta_model = StaticMetaModel(fit_intercept=True)
    meta_model.fit(train_preds_lstm, train_preds_ann, y_train_lstm.numpy().flatten())
    
    # Predict on test split
    meta_test_preds = meta_model.predict(test_preds_lstm, test_preds_ann)
    
    assert len(meta_test_preds) == len(test_preds_lstm)
    assert not np.isnan(meta_test_preds).any()
