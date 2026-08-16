"""
Global configuration loader for Real-Time Indian Stock Market Intelligence Platform (v4).
Loads and validates settings from environment variables (.env) and YAML configurations.
"""

from __future__ import annotations
import os
from pathlib import Path
from typing import Dict, List, Any
import yaml
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Base Directory Resolution
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")


class StockInfo(BaseModel):
    symbol: str
    name: str


class SectorInfo(BaseModel):
    description: str
    stocks: List[StockInfo]


class TickerUniverse(BaseModel):
    version: str
    universe_name: str
    min_history_days: int
    sectors: Dict[str, SectorInfo]

    def get_all_symbols(self) -> List[str]:
        symbols = []
        for sector in self.sectors.values():
            for stock in sector.stocks:
                symbols.append(stock.symbol)
        return symbols

    def get_stock_name(self, symbol: str) -> str:
        for sector in self.sectors.values():
            for stock in sector.stocks:
                if stock.symbol == symbol:
                    return stock.name
        return symbol

    def get_stock_sector(self, symbol: str) -> str:
        for sector_name, sector in self.sectors.items():
            for stock in sector.stocks:
                if stock.symbol == symbol:
                    return sector_name
        return "Unknown"


class Settings(BaseModel):
    # App Information
    app_name: str = "Real-Time Indian Stock Market Intelligence"
    version: str = "4.0.0"
    base_dir: Path = BASE_DIR

    # Supabase (Cloud Database)
    supabase_url: str = Field(default_factory=lambda: os.getenv("SUPABASE_URL", ""))
    supabase_key: str = Field(default_factory=lambda: os.getenv("SUPABASE_KEY", ""))

    # Storage Paths
    local_storage_dir: Path = Field(default_factory=lambda: BASE_DIR / os.getenv("LOCAL_STORAGE_DIR", "data"))
    duckdb_path: Path = Field(default_factory=lambda: BASE_DIR / os.getenv("DUCKDB_PATH", "data/market_intelligence.duckdb"))
    parquet_dir: Path = Field(default_factory=lambda: BASE_DIR / os.getenv("PARQUET_DIR", "data/parquet"))
    report_dir: Path = Field(default_factory=lambda: BASE_DIR / os.getenv("REPORT_DIR", "reports"))

    # Ingestion Parameters
    min_trading_days_history: int = Field(default_factory=lambda: int(os.getenv("MIN_TRADING_DAYS_HISTORY", "400")))
    ingestion_start_date: str = Field(default_factory=lambda: os.getenv("INGESTION_START_DATE", "2022-01-01"))
    ingestion_max_retries: int = Field(default_factory=lambda: int(os.getenv("INGESTION_MAX_RETRIES", "3")))
    ingestion_retry_backoff_seconds: int = Field(default_factory=lambda: int(os.getenv("INGESTION_RETRY_BACKOFF_SECONDS", "2")))

    # Walk-Forward Cross-Validation
    wf_train_days: int = Field(default_factory=lambda: int(os.getenv("WF_TRAIN_DAYS", "252")))
    wf_test_days: int = Field(default_factory=lambda: int(os.getenv("WF_TEST_DAYS", "21")))
    wf_step_days: int = Field(default_factory=lambda: int(os.getenv("WF_STEP_DAYS", "21")))
    sequence_lookback_days: int = Field(default_factory=lambda: int(os.getenv("SEQUENCE_LOOKBACK_DAYS", "10")))

    # Base Learners (Liu et al. 2024 Topology)
    lstm_units: int = Field(default_factory=lambda: int(os.getenv("LSTM_UNITS", "100")))
    lstm_layers: int = Field(default_factory=lambda: int(os.getenv("LSTM_LAYERS", "2")))
    lstm_dropout: float = Field(default_factory=lambda: float(os.getenv("LSTM_DROPOUT", "0.20")))
    ann_hidden_1: int = Field(default_factory=lambda: int(os.getenv("ANN_HIDDEN_1", "100")))
    ann_hidden_2: int = Field(default_factory=lambda: int(os.getenv("ANN_HIDDEN_2", "50")))
    learning_rate: float = Field(default_factory=lambda: float(os.getenv("LEARNING_RATE", "0.001")))
    batch_size: int = Field(default_factory=lambda: int(os.getenv("BATCH_SIZE", "32")))
    epochs: int = Field(default_factory=lambda: int(os.getenv("EPOCHS", "60")))
    random_seed: int = Field(default_factory=lambda: int(os.getenv("RANDOM_SEED", "42")))

    # Adaptive Meta-Model (Novelty Extension)
    drift_window_days: int = Field(default_factory=lambda: int(os.getenv("DRIFT_WINDOW_DAYS", "30")))
    drift_z_threshold: float = Field(default_factory=lambda: float(os.getenv("DRIFT_Z_THRESHOLD", "2.0")))
    adaptive_refit_lookback_days: int = Field(default_factory=lambda: int(os.getenv("ADAPTIVE_REFIT_LOOKBACK_DAYS", "60")))
    ridge_alpha: float = Field(default_factory=lambda: float(os.getenv("RIDGE_ALPHA", "1.0")))
    atr_window_days: int = Field(default_factory=lambda: int(os.getenv("ATR_WINDOW_DAYS", "20")))

    # Logging
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))


def load_ticker_universe(config_path: Path | None = None) -> TickerUniverse:
    """Load and parse the ticker universe YAML file."""
    if config_path is None:
        config_path = BASE_DIR / "config" / "tickers.yaml"
    
    if not config_path.exists():
        raise FileNotFoundError(f"Ticker configuration file not found at: {config_path}")
    
    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    
    return TickerUniverse(**data)


# Singleton instances
settings = Settings()
ticker_universe = load_ticker_universe()

# Ensure directories exist
settings.local_storage_dir.mkdir(parents=True, exist_ok=True)
settings.parquet_dir.mkdir(parents=True, exist_ok=True)
settings.report_dir.mkdir(parents=True, exist_ok=True)
