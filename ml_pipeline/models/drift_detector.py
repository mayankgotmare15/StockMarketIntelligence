"""
Drift Detector module for monitoring concept drift in market predictions.
Computes rolling residual error and z-score thresholds on meta-model forecasts.
"""

from __future__ import annotations
from typing import Tuple, List, Optional
import numpy as np

from config.settings import settings


class RollingZScoreDriftDetector:
    """
    Monitors rolling residual error of the meta-model.
    Detects market distribution drift when rolling |z-score| exceeds the threshold.
    """

    def __init__(
        self,
        window_size: Optional[int] = None,
        z_threshold: Optional[float] = None,
        min_samples: int = 15
    ):
        self.window_size = window_size or settings.drift_window_days
        self.z_threshold = z_threshold or settings.drift_z_threshold
        self.min_samples = min(min_samples, self.window_size)
        self.residuals_buffer: List[float] = []

    def reset(self):
        """Clears the residual buffer."""
        self.residuals_buffer = []

    def update_and_check(self, residual: float) -> Tuple[bool, float]:
        """
        Updates buffer with latest prediction error (y_true - y_hat) and evaluates drift.
        
        Args:
            residual: Most recent forecast residual.
            
        Returns:
            Tuple of (drift_detected: bool, z_score: float)
        """
        self.residuals_buffer.append(float(residual))

        if len(self.residuals_buffer) < self.min_samples:
            # Insufficient samples for stable variance calculation
            return False, 0.0

        # Use recent trailing window (excluding current point for baseline estimation)
        recent_window = np.array(self.residuals_buffer[-self.window_size:-1])
        if len(recent_window) < 3:
            recent_window = np.array(self.residuals_buffer[-self.window_size:])

        mean_err = np.mean(recent_window)
        std_err = np.std(recent_window) + 1e-8

        # Compute z-score for current residual relative to recent distribution
        z_score = float((residual - mean_err) / std_err)
        drift_detected = bool(abs(z_score) > self.z_threshold)

        return drift_detected, z_score

    def batch_detect(self, residuals: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Computes z-scores and drift flags sequentially across a batch of historical residuals.
        
        Args:
            residuals: Array of sequential residuals (N,).
            
        Returns:
            Tuple of (drift_flags: np.ndarray[bool], z_scores: np.ndarray[float])
        """
        self.reset()
        drift_flags = []
        z_scores = []

        for res in residuals:
            flag, z = self.update_and_check(res)
            drift_flags.append(flag)
            z_scores.append(z)

        return np.array(drift_flags, dtype=bool), np.array(z_scores, dtype=float)
