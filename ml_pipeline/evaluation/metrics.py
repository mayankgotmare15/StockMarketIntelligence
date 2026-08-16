"""
Evaluation metrics computation module for financial time-series predictions.
Calculates MAE, RMSE, R2, Directional Accuracy, and price reconstruction.
"""

from __future__ import annotations
from typing import Dict, Any, Union
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def calculate_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Absolute Error."""
    return float(mean_absolute_error(y_true, y_pred))


def calculate_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Root Mean Squared Error."""
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def calculate_r2(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    R-squared coefficient of determination.
    Note: For daily stock returns, R2 is typically near 0; this is standard and honest in financial econometrics.
    """
    return float(r2_score(y_true, y_pred))


def calculate_directional_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Directional Accuracy (Hit Rate %):
    Measures percentage of days where predicted sign of return matches actual sign.
    """
    y_true = np.asarray(y_true).flatten()
    y_pred = np.asarray(y_pred).flatten()
    
    if len(y_true) == 0:
        return 0.0

    # Non-zero signs: 1 if positive, -1 if negative, 0 if flat
    sign_true = np.sign(y_true)
    sign_pred = np.sign(y_pred)
    
    correct = (sign_true == sign_pred).sum()
    return float((correct / len(y_true)) * 100.0)


def compute_metrics_dict(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Computes all standard metrics in a clean dictionary."""
    y_true = np.asarray(y_true).flatten()
    y_pred = np.asarray(y_pred).flatten()

    return {
        "mae": calculate_mae(y_true, y_pred),
        "rmse": calculate_rmse(y_true, y_pred),
        "r2": calculate_r2(y_true, y_pred),
        "directional_accuracy": calculate_directional_accuracy(y_true, y_pred)
    }


def reconstruct_price_levels(
    prev_prices: Union[np.ndarray, pd.Series],
    predicted_log_returns: Union[np.ndarray, pd.Series]
) -> np.ndarray:
    """
    Converts predicted log returns back into absolute price levels for dashboard visualization:
        P_hat_t = P_{t-1} * exp(y_hat_t)
    
    Args:
        prev_prices: Series or array of previous day close prices P_{t-1}.
        predicted_log_returns: Predicted next-day log returns y_hat_t.
        
    Returns:
        Array of reconstructed price forecasts P_hat_t.
    """
    p_prev = np.asarray(prev_prices).flatten()
    y_hat = np.asarray(predicted_log_returns).flatten()
    return p_prev * np.exp(y_hat)
