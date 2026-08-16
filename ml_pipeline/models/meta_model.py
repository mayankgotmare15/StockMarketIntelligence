"""
Static Linear Regression Meta-Model (Liu et al. 2024 Control Condition).
Stacks predictions from independently trained LSTM and ANN base learners:
    y_meta = beta_0 + beta_1 * y_hat_LSTM + beta_2 * y_hat_ANN + epsilon
"""

from __future__ import annotations
from typing import Dict, Any, Optional, Tuple
import numpy as np
from sklearn.linear_model import LinearRegression


class StaticMetaModel:
    """
    Static linear stacking meta-model (Liu et al. 2024).
    Fits fixed regression coefficients beta_0, beta_1, beta_2 on base learner predictions.
    """

    def __init__(self, fit_intercept: bool = True):
        self.fit_intercept = fit_intercept
        self.model = LinearRegression(fit_intercept=fit_intercept)
        self.beta_0: float = 0.0
        self.beta_1: float = 0.5
        self.beta_2: float = 0.5
        self.is_fitted: bool = False

    def _stack_features(self, y_hat_lstm: np.ndarray, y_hat_ann: np.ndarray) -> np.ndarray:
        """Stacks LSTM and ANN predictions into meta-feature matrix Z (N, 2)."""
        return np.column_stack([y_hat_lstm.flatten(), y_hat_ann.flatten()])

    def fit(self, y_hat_lstm: np.ndarray, y_hat_ann: np.ndarray, y_true: np.ndarray) -> StaticMetaModel:
        """
        Fits linear meta-model coefficients on training fold base learner predictions.
        
        Args:
            y_hat_lstm: Out-of-sample or training predictions from LSTM.
            y_hat_ann: Out-of-sample or training predictions from ANN.
            y_true: Ground truth target returns.
        """
        Z = self._stack_features(y_hat_lstm, y_hat_ann)
        y = y_true.flatten()

        self.model.fit(Z, y)
        self.is_fitted = True

        if self.fit_intercept:
            self.beta_0 = float(self.model.intercept_)
        else:
            self.beta_0 = 0.0

        self.beta_1 = float(self.model.coef_[0])
        self.beta_2 = float(self.model.coef_[1])

        return self

    def predict(self, y_hat_lstm: np.ndarray, y_hat_ann: np.ndarray) -> np.ndarray:
        """
        Combines LSTM and ANN predictions using the fitted static coefficients.
        
        Args:
            y_hat_lstm: Predictions from LSTM.
            y_hat_ann: Predictions from ANN.
            
        Returns:
            Ensemble prediction array y_hat_meta.
        """
        if not self.is_fitted:
            raise ValueError("StaticMetaModel must be fitted before predicting.")
        
        Z = self._stack_features(y_hat_lstm, y_hat_ann)
        return self.model.predict(Z)

    def get_coefficients(self) -> Dict[str, float]:
        """Returns the fitted stacking parameters."""
        return {
            "beta_0_intercept": self.beta_0,
            "beta_1_lstm": self.beta_1,
            "beta_2_ann": self.beta_2
        }
