"""
Secondary Methodological Benchmark: Single TimeSeriesSplit (Liu et al. 2024 Setup).
Evaluates the static meta-model on a single 80/20 train-test partition to allow
direct comparison between their evaluation methodology and our Walk-Forward CV harness.
"""

from __future__ import annotations
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd

from ml_pipeline.data.dataset import DataFormatter, FEATURE_COLUMNS, TARGET_COLUMN
from ml_pipeline.models.base_learners import LSTMEstimator, ANNEstimator
from ml_pipeline.models.meta_model import StaticMetaModel
from ml_pipeline.evaluation.metrics import compute_metrics_dict
from ml_pipeline.utils.logger import app_logger


class SingleTimeSeriesSplitBenchmark:
    """
    Executes a single TimeSeriesSplit evaluation reproducing Liu et al.'s evaluation setup.
    Explicitly documented as a methodological comparison, not a competing model.
    """

    def __init__(
        self,
        train_ratio: float = 0.80,
        lookback_days: int = 10,
        epochs: int = 40,
        batch_size: int = 32
    ):
        self.train_ratio = train_ratio
        self.lookback_days = lookback_days
        self.epochs = epochs
        self.batch_size = batch_size

    def evaluate_stock(self, symbol: str, df: pd.DataFrame) -> Dict[str, Any]:
        """Runs single-split evaluation for a stock."""
        n_total = len(df)
        split_idx = int(n_total * self.train_ratio)
        
        train_df = df.iloc[:split_idx].copy()
        test_df = df.iloc[split_idx - self.lookback_days + 1:].copy()
        pure_test_df = df.iloc[split_idx:].copy()

        actual_returns = pure_test_df[TARGET_COLUMN].values

        # Scaling
        formatter = DataFormatter(lookback_days=self.lookback_days)
        formatter.fit_scaler(train_df)

        train_feats = formatter.transform_features(train_df)
        test_feats = formatter.transform_features(test_df)

        train_targets = train_df[TARGET_COLUMN].values
        test_targets = test_df[TARGET_COLUMN].values

        # Sequences
        X_train_lstm, y_train_lstm = formatter.create_lstm_sequences(train_feats, train_targets)
        X_test_lstm, y_test_lstm = formatter.create_lstm_sequences(test_feats, test_targets)

        X_train_ann, y_train_ann = formatter.create_ann_tabular(train_feats, train_targets)
        X_test_ann, y_test_ann = formatter.create_ann_tabular(test_feats, test_targets)

        # Train Base Learners
        n_features = len(FEATURE_COLUMNS)
        lstm = LSTMEstimator(input_dim=n_features, epochs=self.epochs, batch_size=self.batch_size)
        lstm.fit(X_train_lstm, y_train_lstm)
        train_preds_lstm = lstm.predict(X_train_lstm)
        test_preds_lstm = lstm.predict(X_test_lstm)

        ann = ANNEstimator(input_dim=self.lookback_days * n_features, epochs=self.epochs, batch_size=self.batch_size)
        ann.fit(X_train_ann, y_train_ann)
        train_preds_ann = ann.predict(X_train_ann)
        test_preds_ann = ann.predict(X_test_ann)

        # Train Static Meta-Model
        static_meta = StaticMetaModel(fit_intercept=True)
        static_meta.fit(train_preds_lstm, train_preds_ann, y_train_lstm.numpy().flatten())
        test_preds_static = static_meta.predict(test_preds_lstm, test_preds_ann)

        # Compute Metrics
        metrics = compute_metrics_dict(actual_returns, test_preds_static)
        app_logger.info(
            f"[{symbol}] Liu et al. Single TimeSeriesSplit Metrics: MAE={metrics['mae']:.5f}, RMSE={metrics['rmse']:.5f}, R2={metrics['r2']:.4f}, DA={metrics['directional_accuracy']:.2f}%"
        )

        return {
            "symbol": symbol,
            "methodology": "Single_TimeSeriesSplit_Liu2024",
            "train_size": split_idx,
            "test_size": len(pure_test_df),
            "metrics": metrics,
            "coefficients": static_meta.get_coefficients()
        }
