"""
Dataset and sequence generation utilities for time-series deep learning models.
Implements anti-leakage scaling and sliding window sequence formulation.
"""

from __future__ import annotations
from typing import Tuple, List, Optional
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import MinMaxScaler


FEATURE_COLUMNS = [
    "log_return",
    "atr_20",
    "rsi_14",
    "macd",
    "macd_signal",
    "macd_hist",
    "bb_upper",
    "bb_lower",
    "bb_mid",
    "rolling_vol_20",
    "vol_ratio_5"
]

TARGET_COLUMN = "target_return"


class TimeSeriesDataset(Dataset):
    """PyTorch Dataset for sliding-window sequence data."""

    def __init__(self, sequences: torch.Tensor, targets: torch.Tensor):
        self.sequences = sequences
        self.targets = targets

    def __len__(self) -> int:
        return len(self.sequences)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        return self.sequences[idx], self.targets[idx]


class DataFormatter:
    """Handles anti-leakage feature scaling and sequence formatting for LSTM and ANN."""

    def __init__(
        self,
        lookback_days: int = 10,
        feature_cols: Optional[List[str]] = None,
        target_col: str = TARGET_COLUMN
    ):
        self.lookback_days = lookback_days
        self.feature_cols = feature_cols or FEATURE_COLUMNS
        self.target_col = target_col
        self.scaler: Optional[MinMaxScaler] = None

    def fit_scaler(self, train_df: pd.DataFrame):
        """Fits MinMaxScaler strictly on the training fold features."""
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.scaler.fit(train_df[self.feature_cols].values)

    def transform_features(self, df: pd.DataFrame) -> np.ndarray:
        """Transforms features using the fitted scaler."""
        if self.scaler is None:
            raise ValueError("Scaler must be fit on training data before transforming.")
        return self.scaler.transform(df[self.feature_cols].values)

    def create_lstm_sequences(
        self,
        features: np.ndarray,
        targets: np.ndarray
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Creates 3D sequences (N, Lookback, Features) for LSTM.
        Sequence at index i uses features from i to i+lookback-1 to predict target at i+lookback-1.
        """
        X_seqs = []
        y_seqs = []
        n_samples = len(features)

        for i in range(n_samples - self.lookback_days + 1):
            seq_x = features[i : i + self.lookback_days]
            seq_y = targets[i + self.lookback_days - 1]
            X_seqs.append(seq_x)
            y_seqs.append(seq_y)

        if not X_seqs:
            return torch.empty((0, self.lookback_days, len(self.feature_cols)), dtype=torch.float32), torch.empty((0, 1), dtype=torch.float32)

        return (
            torch.tensor(np.array(X_seqs), dtype=torch.float32),
            torch.tensor(np.array(y_seqs), dtype=torch.float32).unsqueeze(1)
        )

    def create_ann_tabular(
        self,
        features: np.ndarray,
        targets: np.ndarray
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Creates 2D tabular features (N, Lookback * Features) for ANN.
        Flattens the lookback window to provide identical historical context as LSTM.
        """
        X_tab = []
        y_tab = []
        n_samples = len(features)

        for i in range(n_samples - self.lookback_days + 1):
            tab_x = features[i : i + self.lookback_days].flatten()
            tab_y = targets[i + self.lookback_days - 1]
            X_tab.append(tab_x)
            y_tab.append(tab_y)

        if not X_tab:
            return torch.empty((0, self.lookback_days * len(self.feature_cols)), dtype=torch.float32), torch.empty((0, 1), dtype=torch.float32)

        return (
            torch.tensor(np.array(X_tab), dtype=torch.float32),
            torch.tensor(np.array(y_tab), dtype=torch.float32).unsqueeze(1)
        )
