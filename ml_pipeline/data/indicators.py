"""
Technical indicator computation module.
Implements mathematically rigorous indicators:
- Log Returns (current & next-day target)
- 20-day Average True Range (ATR)
- 14-day Relative Strength Index (RSI)
- Moving Average Convergence Divergence (MACD: 12, 26, 9)
- Bollinger Bands (20-day, 2 std)
- 20-day Rolling Volatility
- 5-day Volume Ratio
"""

from __future__ import annotations
import numpy as np
import pandas as pd


class TechnicalIndicatorCalculator:
    """Calculates technical indicators for daily OHLCV equity data."""

    @staticmethod
    def compute_all_indicators(df: pd.DataFrame, dropna: bool = True) -> pd.DataFrame:
        """
        Computes all technical features and target returns.
        
        Args:
            df: DataFrame containing at least ['Open', 'High', 'Low', 'Close', 'Volume'] or lowercase variants.
            dropna: If True, drops initial warmup rows containing NaN.
            
        Returns:
            DataFrame augmented with technical indicators and log return targets.
        """
        df = df.copy()
        
        # Standardize column casing
        col_map = {c: c.capitalize() for c in df.columns}
        if "Adj close" in col_map.values():
            col_map = {c: "Adj Close" if c.lower() == "adj close" or c.lower() == "adj_close" else c.capitalize() for c in df.columns}
        df.rename(columns=col_map, inplace=True)

        for req in ["Open", "High", "Low", "Close", "Volume"]:
            if req not in df.columns:
                raise ValueError(f"Missing required price column: {req}")

        # 1. Log Returns: r_t = ln(Close_t / Close_{t-1})
        close = df["Close"].astype(float)
        high = df["High"].astype(float)
        low = df["Low"].astype(float)
        volume = df["Volume"].astype(float)

        df["log_return"] = np.log(close / close.shift(1))
        
        # 2. Target Variable: Next-Day Log Return y_t = ln(Close_{t+1} / Close_t)
        df["target_return"] = df["log_return"].shift(-1)

        # 3. 20-day Average True Range (ATR)
        prev_close = close.shift(1)
        tr1 = high - low
        tr2 = (high - prev_close).abs()
        tr3 = (low - prev_close).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        df["atr_20"] = tr.ewm(span=20, adjust=False).mean()

        # 4. 14-day Relative Strength Index (RSI)
        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = (-delta).clip(lower=0)
        avg_gain = gain.ewm(span=14, adjust=False).mean()
        avg_loss = loss.ewm(span=14, adjust=False).mean()
        rs = avg_gain / (avg_loss + 1e-10)
        df["rsi_14"] = 100 - (100 / (1 + rs))

        # 5. MACD (12, 26, 9)
        ema_12 = close.ewm(span=12, adjust=False).mean()
        ema_26 = close.ewm(span=26, adjust=False).mean()
        df["macd"] = ema_12 - ema_26
        df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
        df["macd_hist"] = df["macd"] - df["macd_signal"]

        # 6. Bollinger Bands (20-day, 2 std)
        bb_mid = close.rolling(window=20).mean()
        bb_std = close.rolling(window=20).std()
        df["bb_mid"] = bb_mid
        df["bb_upper"] = bb_mid + (2 * bb_std)
        df["bb_lower"] = bb_mid - (2 * bb_std)

        # 7. 20-day Rolling Volatility (annualized daily std)
        df["rolling_vol_20"] = df["log_return"].rolling(window=20).std() * np.sqrt(252)

        # 8. 5-day Volume Ratio
        vol_sma_5 = volume.rolling(window=5).mean()
        df["vol_ratio_5"] = volume / (vol_sma_5 + 1e-8)

        if dropna:
            # We drop initial warmup rows (e.g. 26-day MACD/BB warmup), but keep the last row unless target is required
            # Note: For offline training, we drop rows where features are NaN
            feature_cols = [
                "log_return", "atr_20", "rsi_14", "macd", "macd_signal",
                "macd_hist", "bb_upper", "bb_lower", "bb_mid", "rolling_vol_20", "vol_ratio_5"
            ]
            df = df.dropna(subset=feature_cols).copy()

        return df
