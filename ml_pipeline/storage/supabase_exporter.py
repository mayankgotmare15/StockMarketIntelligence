"""
Supabase Data Exporter module.
Transfers historical predictions, ablation comparisons, SHAP attributions,
and experiment metrics from DuckDB to Supabase (PostgreSQL Cloud).
"""

from __future__ import annotations
from typing import List, Dict, Any, Optional
import math
import numpy as np
import pandas as pd
from supabase import create_client, Client

from config.settings import settings
from ml_pipeline.utils.logger import app_logger


class SupabaseExporter:
    """Exports structured ML experiment data and predictions to Supabase PostgreSQL."""

    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None
    ):
        self.url = supabase_url or settings.supabase_url
        self.key = supabase_key or settings.supabase_key
        self.client: Optional[Client] = None

        if self.url and self.key and "your-project" not in self.url:
            try:
                self.client = create_client(self.url, self.key)
                app_logger.info(f"Connected to Supabase at: {self.url}")
            except Exception as e:
                app_logger.warning(f"Could not connect to Supabase: {e}. Storing data locally.")
        else:
            app_logger.info("Supabase credentials not configured in .env. Local DuckDB/Parquet storage active.")

    @property
    def is_connected(self) -> bool:
        return self.client is not None

    def _sanitize_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Cleans NaN / Inf values to None for JSON serialization."""
        clean = {}
        for k, v in record.items():
            if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                clean[k] = None
            elif isinstance(v, (np.floating, np.integer)):
                clean[k] = v.item()
            elif isinstance(v, pd.Timestamp):
                clean[k] = v.strftime("%Y-%m-%d")
            else:
                clean[k] = v
        return clean

    def export_stock_universe(self, records: List[Dict[str, Any]], batch_size: int = 100):
        """Exports stock universe metadata to Supabase."""
        if not self.is_connected:
            return
        
        clean_records = [self._sanitize_record(r) for r in records]
        app_logger.info(f"Exporting {len(clean_records)} stocks to Supabase `stock_universe` table...")
        
        for i in range(0, len(clean_records), batch_size):
            chunk = clean_records[i : i + batch_size]
            try:
                self.client.table("stock_universe").upsert(chunk).execute()
            except Exception as e:
                app_logger.error(f"Error exporting stock_universe chunk {i}: {e}")

    def export_daily_ohlcv(self, df: pd.DataFrame, batch_size: int = 500):
        """Exports daily OHLCV and feature records to Supabase."""
        if not self.is_connected or df.empty:
            return

        records = df.to_dict(orient="records")
        clean_records = [self._sanitize_record(r) for r in records]
        app_logger.info(f"Exporting {len(clean_records)} OHLCV rows to Supabase `daily_ohlcv` table...")

        for i in range(0, len(clean_records), batch_size):
            chunk = clean_records[i : i + batch_size]
            try:
                self.client.table("daily_ohlcv").upsert(chunk).execute()
            except Exception as e:
                app_logger.error(f"Error exporting daily_ohlcv chunk {i}: {e}")

    def export_ablation_predictions(self, df: pd.DataFrame, batch_size: int = 500):
        """
        Exports ablation predictions to Supabase `ablation_predictions` table.
        Contract: [Date, Ticker, Actual_Return, Actual_Price, y_hat_Static, y_hat_Adaptive, Regime_Flag]
        """
        if not self.is_connected or df.empty:
            return

        records = df.to_dict(orient="records")
        clean_records = [self._sanitize_record(r) for r in records]
        app_logger.info(f"Exporting {len(clean_records)} prediction records to Supabase `ablation_predictions` table...")

        for i in range(0, len(clean_records), batch_size):
            chunk = clean_records[i : i + batch_size]
            try:
                self.client.table("ablation_predictions").upsert(chunk).execute()
            except Exception as e:
                app_logger.error(f"Error exporting ablation_predictions chunk {i}: {e}")

    def export_shap_importance(self, records: List[Dict[str, Any]], batch_size: int = 500):
        """Exports tree model SHAP feature importance records to Supabase."""
        if not self.is_connected or not records:
            return

        clean_records = [self._sanitize_record(r) for r in records]
        app_logger.info(f"Exporting {len(clean_records)} SHAP records to Supabase `shap_importance` table...")

        for i in range(0, len(clean_records), batch_size):
            chunk = clean_records[i : i + batch_size]
            try:
                self.client.table("shap_importance").upsert(chunk).execute()
            except Exception as e:
                app_logger.error(f"Error exporting shap_importance chunk {i}: {e}")

    def export_experiment_metrics(self, df: pd.DataFrame, batch_size: int = 500):
        """Exports model evaluation metrics to Supabase `experiment_metrics` table."""
        if not self.is_connected or df.empty:
            return

        records = df.to_dict(orient="records")
        clean_records = [self._sanitize_record(r) for r in records]
        app_logger.info(f"Exporting {len(clean_records)} metric records to Supabase `experiment_metrics` table...")

        for i in range(0, len(clean_records), batch_size):
            chunk = clean_records[i : i + batch_size]
            try:
                self.client.table("experiment_metrics").upsert(chunk).execute()
            except Exception as e:
                app_logger.error(f"Error exporting experiment_metrics chunk {i}: {e}")
