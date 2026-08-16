"""
Data preprocessor pipeline orchestrator.
Coordinates data ingestion, indicator computation, and DuckDB storage.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
import pandas as pd

from config.settings import settings, ticker_universe
from ml_pipeline.data.collector import YFinanceCollector
from ml_pipeline.data.indicators import TechnicalIndicatorCalculator
from ml_pipeline.storage.duckdb_manager import DuckDBManager
from ml_pipeline.utils.logger import app_logger


class DataPipelineOrchestrator:
    """Orchestrates end-to-end data ingestion, feature engineering, and storage."""

    def __init__(
        self,
        collector: Optional[YFinanceCollector] = None,
        db_manager: Optional[DuckDBManager] = None
    ):
        self.collector = collector or YFinanceCollector()
        self.db_manager = db_manager or DuckDBManager()
        self.indicator_calc = TechnicalIndicatorCalculator()

    def process_single_stock(self, symbol: str) -> Dict[str, Any]:
        """
        Executes ingestion, feature computation, and storage for a single stock.
        """
        raw_df, metadata = self.collector.fetch_ticker_data(symbol)
        
        # Save metadata regardless of outcome
        self.db_manager.save_stock_metadata(metadata)

        if raw_df is None or raw_df.empty or not metadata["min_history_met"]:
            app_logger.warning(f"[{symbol}] Ingestion skipped or rejected: {metadata.get('error')}")
            return {
                "symbol": symbol,
                "status": "FAILED" if metadata.get("error") else "SKIPPED",
                "reason": metadata.get("error", "Precondition not met"),
                "rows_raw": len(raw_df) if raw_df is not None else 0,
                "rows_engineered": 0
            }

        # 1. Save Raw OHLCV to DuckDB
        self.db_manager.save_raw_ohlcv(symbol, raw_df)

        # 2. Compute Technical Indicators & Targets
        features_df = self.indicator_calc.compute_all_indicators(raw_df, dropna=True)

        # 3. Save Engineered Features to DuckDB
        self.db_manager.save_engineered_features(symbol, features_df)

        app_logger.info(
            f"[{symbol}] Processed successfully: {len(raw_df)} raw rows -> {len(features_df)} feature rows stored in DuckDB."
        )

        return {
            "symbol": symbol,
            "status": "SUCCESS",
            "name": metadata["name"],
            "sector": metadata["sector"],
            "rows_raw": len(raw_df),
            "rows_engineered": len(features_df),
            "start_date": metadata["start_date"],
            "end_date": metadata["end_date"]
        }

    def run_full_pipeline(self, symbols: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Runs ingestion and feature pipeline for all target symbols.
        
        Args:
            symbols: Optional list of symbols. If None, uses all configured tickers.
            
        Returns:
            Summary DataFrame of ingestion and feature engineering results.
        """
        symbols_to_run = symbols or ticker_universe.get_all_symbols()
        app_logger.info(f"=== Starting Data Pipeline Run for {len(symbols_to_run)} symbols ===")
        
        summary_records = []
        for symbol in symbols_to_run:
            rec = self.process_single_stock(symbol)
            summary_records.append(rec)

        # Export DuckDB tables to Parquet
        self.db_manager.export_to_parquet()

        summary_df = pd.DataFrame(summary_records)
        app_logger.info("=== Data Pipeline Execution Finished ===")
        return summary_df
