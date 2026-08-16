"""
Market Regime Classifier module.
Discretizes market conditions into Volatility Terciles (Low, Medium, High)
based on 20-day Average True Range (ATR) with anti-leakage threshold fitting.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
import numpy as np
import pandas as pd


class VolatilityTercileClassifier:
    """
    Classifies market regimes into Low, Medium, and High volatility states.
    Thresholds are fit strictly on the training fold distribution to avoid lookahead leakage.
    """

    def __init__(self, metric_column: str = "atr_20"):
        self.metric_column = metric_column
        self.t_low: float = 0.0
        self.t_high: float = 0.0
        self.is_fitted: bool = False

    def fit(self, train_df: pd.DataFrame) -> VolatilityTercileClassifier:
        """
        Calculates the 33.3rd and 66.7th percentile thresholds on training data.
        
        Args:
            train_df: Training fold DataFrame containing metric_column.
        """
        if self.metric_column not in train_df.columns:
            # Fallback to ATR-20 or first numeric column
            col = "atr_20" if "atr_20" in train_df.columns else train_df.select_dtypes(include=[np.number]).columns[0]
        else:
            col = self.metric_column

        values = train_df[col].dropna().values
        self.t_low = float(np.percentile(values, 33.33))
        self.t_high = float(np.percentile(values, 66.67))
        self.is_fitted = True
        return self

    def classify_scalar(self, val: float) -> str:
        """Classifies a single metric value into a regime string."""
        if not self.is_fitted:
            raise ValueError("Classifier must be fitted before classifying.")
        
        if val <= self.t_low:
            return "Low"
        elif val <= self.t_high:
            return "Medium"
        else:
            return "High"

    def classify_series(self, values: Union[np.ndarray, pd.Series]) -> np.ndarray:
        """
        Classifies an array or Series of metric values into regime states.
        
        Returns:
            np.ndarray of strings: ['Low', 'Medium', 'High', ...]
        """
        if not self.is_fitted:
            raise ValueError("Classifier must be fitted before classifying.")

        vals = np.asarray(values)
        regimes = np.empty(len(vals), dtype=object)

        regimes[vals <= self.t_low] = "Low"
        regimes[(vals > self.t_low) & (vals <= self.t_high)] = "Medium"
        regimes[vals > self.t_high] = "High"

        return regimes

    def get_thresholds(self) -> Dict[str, float]:
        """Returns the fitted tercile boundaries."""
        return {
            "tercile_low_boundary": self.t_low,
            "tercile_high_boundary": self.t_high
        }
