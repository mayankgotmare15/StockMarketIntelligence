"""
Independent Tree Baselines: Random Forest and XGBoost.
Trained on tabular features and evaluated under the same Walk-Forward CV harness.
"""

from __future__ import annotations
from typing import Optional, Dict, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb

from config.settings import settings


class RandomForestBaseline:
    """Random Forest regressor baseline with scikit-learn interface."""

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 6,
        random_state: Optional[int] = None
    ):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state or settings.random_seed
        self.model = RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.is_fitted: bool = False

    def fit(self, X: np.ndarray, y: np.ndarray) -> RandomForestBaseline:
        """Fits Random Forest on tabular features X (N, D) and target returns y (N,)."""
        self.model.fit(X, y.flatten())
        self.is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Generates predictions for tabular features X."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before predicting.")
        return self.model.predict(X)

    @property
    def underlying_model(self) -> RandomForestRegressor:
        return self.model


class XGBoostBaseline:
    """XGBoost regressor baseline with scikit-learn interface."""

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 4,
        learning_rate: float = 0.05,
        random_state: Optional[int] = None
    ):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.random_state = random_state or settings.random_seed
        self.model = xgb.XGBRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            learning_rate=self.learning_rate,
            random_state=self.random_state,
            n_jobs=-1,
            verbosity=0
        )
        self.is_fitted: bool = False

    def fit(self, X: np.ndarray, y: np.ndarray) -> XGBoostBaseline:
        """Fits XGBoost on tabular features X (N, D) and target returns y (N,)."""
        self.model.fit(X, y.flatten())
        self.is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Generates predictions for tabular features X."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before predicting.")
        return self.model.predict(X)

    @property
    def underlying_model(self) -> xgb.XGBRegressor:
        return self.model
