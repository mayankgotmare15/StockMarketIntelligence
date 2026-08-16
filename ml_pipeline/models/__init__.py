"""
Model definitions:
- Base Learners (LSTM, ANN based on Liu et al. 2024 topology)
- Static Meta-Model (Liu et al. Linear Regression Stacking)
- Adaptive Meta-Model (Regime-Conditioned Ridge Stacking - Core Novelty)
- Drift Detector (Rolling Residual Z-Score)
- Market Regime Classifier (Volatility Terciles via 20-day ATR)
- Tree Baselines (Random Forest, XGBoost)
"""

from .base_learners import (
    PyTorchLSTM,
    PyTorchANN,
    LSTMEstimator,
    ANNEstimator,
    set_seed
)
from .meta_model import StaticMetaModel
from .drift_detector import RollingZScoreDriftDetector
from .regime_classifier import VolatilityTercileClassifier
from .adaptive_meta_model import AdaptiveRidgeMetaModel
from .baselines import RandomForestBaseline, XGBoostBaseline

__all__ = [
    "PyTorchLSTM",
    "PyTorchANN",
    "LSTMEstimator",
    "ANNEstimator",
    "StaticMetaModel",
    "RollingZScoreDriftDetector",
    "VolatilityTercileClassifier",
    "AdaptiveRidgeMetaModel",
    "RandomForestBaseline",
    "XGBoostBaseline",
    "set_seed"
]
