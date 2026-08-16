"""
yfinance data collector with exponential backoff retry logic and data validation.
Fetches daily OHLCV for NSE stocks and enforces history preconditions.
"""

from __future__ import annotations
import time
import random
from typing import Optional, Dict, Tuple, List
import pandas as pd
import yfinance as yf

from config.settings import settings, ticker_universe
from ml_pipeline.utils.logger import app_logger


class YFinanceCollector:
    """Collects EOD stock data from Yahoo Finance with retry and error resilience."""

    def __init__(
        self,
        start_date: Optional[str] = None,
        max_retries: Optional[int] = None,
        backoff_seconds: Optional[int] = None,
        min_history_days: Optional[int] = None
    ):
        self.start_date = start_date or settings.ingestion_start_date
        self.max_retries = max_retries or settings.ingestion_max_retries
        self.backoff_seconds = backoff_seconds or settings.ingestion_retry_backoff_seconds
        self.min_history_days = min_history_days or settings.min_trading_days_history

    def fetch_ticker_data(self, symbol: str) -> Tuple[Optional[pd.DataFrame], Dict[str, any]]:
        """
        Fetches historical daily OHLCV data for a given symbol with exponential backoff.
        
        Args:
            symbol: Ticker symbol (e.g., 'TCS.NS')
            
        Returns:
            Tuple of (DataFrame or None, metadata_dict)
        """
        stock_name = ticker_universe.get_stock_name(symbol)
        sector = ticker_universe.get_stock_sector(symbol)
        metadata = {
            "symbol": symbol,
            "name": stock_name,
            "sector": sector,
            "history_days_count": 0,
            "min_history_met": False,
            "start_date": None,
            "end_date": None,
            "error": None
        }

        attempt = 0
        df = None

        while attempt < self.max_retries:
            try:
                attempt += 1
                app_logger.info(f"[{symbol}] Ingestion attempt {attempt}/{self.max_retries} (Start: {self.start_date})...")
                
                ticker_obj = yf.Ticker(symbol)
                # auto_adjust=False to preserve raw Open, High, Low, Close, Adj Close, Volume
                df = ticker_obj.history(start=self.start_date, auto_adjust=False, timeout=20)

                if df is not None and not df.empty:
                    # Clean index and tz
                    if df.index.tz is not None:
                        df.index = df.index.tz_localize(None)
                    df.index = pd.to_datetime(df.index).normalize()
                    df.index.name = "Date"
                    
                    # Remove zero-volume or invalid rows
                    df = df[df["Close"] > 0].copy()
                    
                    history_count = len(df)
                    metadata["history_days_count"] = history_count
                    metadata["start_date"] = df.index.min().strftime("%Y-%m-%d")
                    metadata["end_date"] = df.index.max().strftime("%Y-%m-%d")
                    
                    # Precondition check: >= 400 trading days
                    if history_count >= self.min_history_days:
                        metadata["min_history_met"] = True
                        app_logger.info(
                            f"[{symbol}] Success: {history_count} trading days fetched ({metadata['start_date']} to {metadata['end_date']})."
                        )
                        return df, metadata
                    else:
                        metadata["min_history_met"] = False
                        metadata["error"] = f"Insufficient history: {history_count} < {self.min_history_days} days"
                        app_logger.warning(
                            f"[{symbol}] Precondition Failed: {history_count} trading days (< required {self.min_history_days}). Skipping."
                        )
                        return df, metadata
                else:
                    app_logger.warning(f"[{symbol}] Attempt {attempt}: Empty dataset returned by yfinance.")
            except Exception as e:
                app_logger.warning(f"[{symbol}] Attempt {attempt} failed with error: {e}")
                if attempt >= self.max_retries:
                    metadata["error"] = str(e)
                    app_logger.error(f"[{symbol}] All {self.max_retries} ingestion attempts exhausted.")
                    return None, metadata
            
            # Exponential backoff with jitter
            sleep_time = (self.backoff_seconds ** attempt) + random.uniform(0.5, 1.5)
            time.sleep(sleep_time)

        return None, metadata

    def fetch_all_tickers(self, symbols: Optional[List[str]] = None) -> Dict[str, Tuple[Optional[pd.DataFrame], Dict[str, any]]]:
        """
        Fetches data for a list of tickers (or all configured tickers).
        
        Args:
            symbols: Optional list of tickers. If None, uses all configured tickers.
            
        Returns:
            Dict mapping symbol -> (df, metadata)
        """
        symbols_to_fetch = symbols or ticker_universe.get_all_symbols()
        results = {}
        
        app_logger.info(f"Starting batch ingestion for {len(symbols_to_fetch)} symbols...")
        for idx, sym in enumerate(symbols_to_fetch, start=1):
            app_logger.info(f"Processing ({idx}/{len(symbols_to_fetch)}): {sym}")
            df, meta = self.fetch_ticker_data(sym)
            results[sym] = (df, meta)
            # Polite pause between tickers to avoid rate limiting
            time.sleep(0.5)

        valid_count = sum(1 for _, m in results.values() if m["min_history_met"])
        app_logger.info(f"Batch Ingestion Complete: {valid_count}/{len(symbols_to_fetch)} stocks satisfied the {self.min_history_days}-day threshold.")
        return results
