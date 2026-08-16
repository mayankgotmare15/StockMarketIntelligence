"""
Base Learners reproducing Liu et al. (2024) mathematical architecture:
1. LSTM: 2 layers, 100 hidden units each, dropout.
2. ANN: 2 hidden layers (100 ReLU -> 50 ReLU -> Linear).
Optimized for high-throughput Walk-Forward sliding-origin training with warm-starting support.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from config.settings import settings


def set_seed(seed: int = 42):
    """Sets random seeds for reproducibility."""
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    np.random.seed(seed)


class PyTorchLSTM(nn.Module):
    """2-Layer LSTM with Dropout and Linear Output Layer (Liu et al. 2024)."""

    def __init__(
        self,
        input_dim: int,
        hidden_dim: int = 100,
        num_layers: int = 2,
        dropout: float = 0.20
    ):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0.0,
            batch_first=True
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        lstm_out, _ = self.lstm(x)
        last_step = lstm_out[:, -1, :]
        out = self.dropout(last_step)
        pred = self.fc(out)
        return pred


class PyTorchANN(nn.Module):
    """2-Hidden-Layer Artificial Neural Network (100 -> 50 -> 1) with ReLU (Liu et al. 2024)."""

    def __init__(
        self,
        input_dim: int,
        hidden_1: int = 100,
        hidden_2: int = 50,
        dropout: float = 0.10
    ):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_1),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_1, hidden_2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_2, 1)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class LSTMEstimator:
    """Wrapper providing fit/predict interface for PyTorchLSTM with warm-start capability."""

    def __init__(
        self,
        input_dim: int,
        hidden_dim: Optional[int] = None,
        num_layers: Optional[int] = None,
        dropout: Optional[float] = None,
        lr: Optional[float] = None,
        epochs: Optional[int] = None,
        batch_size: Optional[int] = None,
        seed: Optional[int] = None
    ):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim or settings.lstm_units
        self.num_layers = num_layers or settings.lstm_layers
        self.dropout = dropout if dropout is not None else settings.lstm_dropout
        self.lr = lr or settings.learning_rate
        self.epochs = epochs or settings.epochs
        self.batch_size = batch_size or 64
        self.seed = seed or settings.random_seed

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[PyTorchLSTM] = None
        self.loss_history: List[float] = []

    def _init_model(self):
        set_seed(self.seed)
        self.model = PyTorchLSTM(
            input_dim=self.input_dim,
            hidden_dim=self.hidden_dim,
            num_layers=self.num_layers,
            dropout=self.dropout
        ).to(self.device)

    def fit(self, X: torch.Tensor, y: torch.Tensor, warm_start: bool = False, epochs_override: Optional[int] = None) -> LSTMEstimator:
        """Trains or fine-tunes the LSTM model."""
        if not warm_start or self.model is None:
            self._init_model()

        self.model.train()
        dataset = TensorDataset(X, y)
        loader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True, drop_last=False)
        
        optimizer = torch.optim.Adam(self.model.parameters(), lr=self.lr, weight_decay=1e-5)
        criterion = nn.MSELoss()

        num_epochs = epochs_override or self.epochs
        self.loss_history = []
        for epoch in range(num_epochs):
            epoch_loss = 0.0
            for batch_x, batch_y in loader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                optimizer.zero_grad()
                preds = self.model(batch_x)
                loss = criterion(preds, batch_y)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                optimizer.step()
                epoch_loss += loss.item() * len(batch_x)

            avg_loss = epoch_loss / len(dataset)
            self.loss_history.append(avg_loss)

        return self

    def predict(self, X: torch.Tensor) -> np.ndarray:
        """Generates predictions for sequence tensor X."""
        if self.model is None:
            raise ValueError("Model must be trained before predicting.")
        self.model.eval()
        with torch.no_grad():
            X_dev = X.to(self.device)
            preds = self.model(X_dev)
            return preds.cpu().numpy().flatten()


class ANNEstimator:
    """Wrapper providing fit/predict interface for PyTorchANN with warm-start capability."""

    def __init__(
        self,
        input_dim: int,
        hidden_1: Optional[int] = None,
        hidden_2: Optional[int] = None,
        lr: Optional[float] = None,
        epochs: Optional[int] = None,
        batch_size: Optional[int] = None,
        seed: Optional[int] = None
    ):
        self.input_dim = input_dim
        self.hidden_1 = hidden_1 or settings.ann_hidden_1
        self.hidden_2 = hidden_2 or settings.ann_hidden_2
        self.lr = lr or settings.learning_rate
        self.epochs = epochs or settings.epochs
        self.batch_size = batch_size or 64
        self.seed = seed or settings.random_seed

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[PyTorchANN] = None
        self.loss_history: List[float] = []

    def _init_model(self):
        set_seed(self.seed)
        self.model = PyTorchANN(
            input_dim=self.input_dim,
            hidden_1=self.hidden_1,
            hidden_2=self.hidden_2
        ).to(self.device)

    def fit(self, X: torch.Tensor, y: torch.Tensor, warm_start: bool = False, epochs_override: Optional[int] = None) -> ANNEstimator:
        """Trains or fine-tunes the ANN model."""
        if not warm_start or self.model is None:
            self._init_model()

        self.model.train()
        dataset = TensorDataset(X, y)
        loader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True, drop_last=False)
        
        optimizer = torch.optim.Adam(self.model.parameters(), lr=self.lr, weight_decay=1e-5)
        criterion = nn.MSELoss()

        num_epochs = epochs_override or self.epochs
        self.loss_history = []
        for epoch in range(num_epochs):
            epoch_loss = 0.0
            for batch_x, batch_y in loader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                optimizer.zero_grad()
                preds = self.model(batch_x)
                loss = criterion(preds, batch_y)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item() * len(batch_x)

            avg_loss = epoch_loss / len(dataset)
            self.loss_history.append(avg_loss)

        return self

    def predict(self, X: torch.Tensor) -> np.ndarray:
        """Generates predictions for tabular tensor X."""
        if self.model is None:
            raise ValueError("Model must be trained before predicting.")
        self.model.eval()
        with torch.no_grad():
            X_dev = X.to(self.device)
            preds = self.model(X_dev)
            return preds.cpu().numpy().flatten()
