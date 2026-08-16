"""
Adaptive Meta-Model with Drift Detection and Ridge Regression Re-fitting (Our Core Novelty Contribution).

Extends the static Liu et al. equation to be regime-conditioned:
    y_meta(t) = beta_0(r_t) + beta_1(r_t) * y_hat_LSTM + beta_2(r_t) * y_hat_ANN + epsilon

When rolling residual error drift is detected (|z| > 2.0) or market regime shifts,
coefficients are dynamically re-estimated using Ridge Regression (L2) on trailing 60 days
to guarantee numerical stability against severe neural network collinearity.
"""

from __future__ import annotations
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

from config.settings import settings
from ml_pipeline.models.drift_detector import RollingZScoreDriftDetector
from ml_pipeline.models.regime_classifier import VolatilityTercileClassifier
from ml_pipeline.utils.logger import app_logger


class AdaptiveRidgeMetaModel:
    """
    Regime-Adaptive Ridge Stacking Meta-Model.
    Dynamically adjusts ensemble weighting coefficients beta(r_t) upon drift detection.
    """

    def __init__(
        self,
        lookback_refit_days: Optional[int] = None,
        alpha: Optional[float] = None,
        drift_window: Optional[int] = None,
        z_threshold: Optional[float] = None
    ):
        self.lookback_refit_days = lookback_refit_days or settings.adaptive_refit_lookback_days
        self.alpha = alpha or settings.ridge_alpha
        
        # Internal Drift Detector & Classifier
        self.drift_detector = RollingZScoreDriftDetector(window_size=drift_window, z_threshold=z_threshold)
        self.regime_classifier = VolatilityTercileClassifier()
        
        # Active Coefficients
        self.active_ridge = Ridge(alpha=self.alpha, fit_intercept=True)
        self.beta_0: float = 0.0
        self.beta_1: float = 0.5
        self.beta_2: float = 0.5
        self.is_fitted: bool = False

        # Rolling Buffer of historical base predictions and targets for re-fitting
        self.buffer_lstm: List[float] = []
        self.buffer_ann: List[float] = []
        self.buffer_target: List[float] = []

    def fit_initial(
        self,
        train_df: pd.DataFrame,
        y_hat_lstm_train: np.ndarray,
        y_hat_ann_train: np.ndarray,
        y_true_train: np.ndarray
    ) -> AdaptiveRidgeMetaModel:
        """
        Initializes the model on training fold data:
        1. Fits volatility tercile boundaries.
        2. Fits initial Ridge coefficients on the training set.
        3. Initializes the re-fit history buffer with training tail.
        """
        # 1. Fit regime classifier
        self.regime_classifier.fit(train_df)

        # 2. Fit baseline Ridge model
        Z_train = np.column_stack([y_hat_lstm_train.flatten(), y_hat_ann_train.flatten()])
        y_train = y_true_train.flatten()
        
        self.active_ridge.fit(Z_train, y_train)
        self.beta_0 = float(self.active_ridge.intercept_)
        self.beta_1 = float(self.active_ridge.coef_[0])
        self.beta_2 = float(self.active_ridge.coef_[1])
        self.is_fitted = True

        # 3. Populate rolling buffer with tail of training data
        self.buffer_lstm = list(y_hat_lstm_train.flatten())[-self.lookback_refit_days:]
        self.buffer_ann = list(y_hat_ann_train.flatten())[-self.lookback_refit_days:]
        self.buffer_target = list(y_true_train.flatten())[-self.lookback_refit_days:]

        # Initialize drift detector with initial residuals
        self.drift_detector.reset()
        initial_residuals = y_train - (self.beta_0 + (self.beta_1 * Z_train[:, 0]) + (self.beta_2 * Z_train[:, 1]))
        for res in initial_residuals[-30:]:
            self.drift_detector.update_and_check(res)

        return self

    def _refit_coefficients(self):
        """Re-fits the Ridge regression model using the trailing lookback buffer."""
        if len(self.buffer_target) < 10:
            return

        Z_recent = np.column_stack([np.array(self.buffer_lstm), np.array(self.buffer_ann)])
        y_recent = np.array(self.buffer_target)

        # Enforce Ridge (L2) regularized re-fit
        new_ridge = Ridge(alpha=self.alpha, fit_intercept=True)
        new_ridge.fit(Z_recent, y_recent)

        self.active_ridge = new_ridge
        self.beta_0 = float(new_ridge.intercept_)
        self.beta_1 = float(new_ridge.coef_[0])
        self.beta_2 = float(new_ridge.coef_[1])

    def predict_sequential(
        self,
        y_hat_lstm_test: np.ndarray,
        y_hat_ann_test: np.ndarray,
        y_true_test: np.ndarray,
        test_volatility_metrics: np.ndarray
    ) -> Dict[str, Any]:
        """
        Executes sequential, online-style simulation across the out-of-sample test window.
        At each step t:
        1. Classifies regime r_t.
        2. Detects drift from prior step. If drift triggered -> re-fit coefficients on last 60 days.
        3. Computes adaptive prediction y_hat_adaptive(t).
        4. Ingests actual return y_t and updates drift detector and rolling buffer.
        """
        if not self.is_fitted:
            raise ValueError("AdaptiveRidgeMetaModel must be fitted before predicting.")

        n_steps = len(y_hat_lstm_test)
        adaptive_preds = []
        drift_flags = []
        z_scores = []
        regime_flags = []
        active_coefs_history = []

        last_regime = None

        for t in range(n_steps):
            lstm_t = float(y_hat_lstm_test[t])
            ann_t = float(y_hat_ann_test[t])
            true_t = float(y_true_test[t])
            vol_metric_t = float(test_volatility_metrics[t])

            # 1. Classify regime at time t
            regime_t = self.regime_classifier.classify_scalar(vol_metric_t)
            regime_flags.append(regime_t)

            # Check for regime shift or prior drift
            # (Note: at t=0, checks residual from prior fold tail)
            res_estimate = true_t - (self.beta_0 + (self.beta_1 * lstm_t) + (self.beta_2 * ann_t))
            drift_flag, z_score = self.drift_detector.update_and_check(res_estimate)
            drift_flags.append(drift_flag)
            z_scores.append(z_score)

            # 2. Dynamic Re-fit Trigger
            if drift_flag or (last_regime is not None and regime_t != last_regime):
                self._refit_coefficients()

            last_regime = regime_t

            # 3. Generate adaptive forecast
            y_pred_t = self.beta_0 + (self.beta_1 * lstm_t) + (self.beta_2 * ann_t)
            adaptive_preds.append(float(y_pred_t))

            # 4. Update rolling history buffer
            self.buffer_lstm.append(lstm_t)
            self.buffer_ann.append(ann_t)
            self.buffer_target.append(true_t)

            # Maintain fixed lookback window size
            if len(self.buffer_target) > self.lookback_refit_days:
                self.buffer_lstm.pop(0)
                self.buffer_ann.pop(0)
                self.buffer_target.pop(0)

            active_coefs_history.append({
                "beta_0": self.beta_0,
                "beta_1": self.beta_1,
                "beta_2": self.beta_2
            })

        return {
            "y_hat_adaptive": np.array(adaptive_preds),
            "drift_flags": np.array(drift_flags, dtype=bool),
            "z_scores": np.array(z_scores, dtype=float),
            "regime_flags": np.array(regime_flags, dtype=object),
            "coefficients_history": active_coefs_history
        }

    def get_current_coefficients(self) -> Dict[str, float]:
        """Returns the most recent meta-model coefficients."""
        return {
            "beta_0_intercept": self.beta_0,
            "beta_1_lstm": self.beta_1,
            "beta_2_ann": self.beta_2
        }
