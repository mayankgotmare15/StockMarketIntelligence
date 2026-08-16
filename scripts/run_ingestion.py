"""
Script to execute EOD data ingestion and feature engineering for NSE tickers.
Saves datasets to DuckDB and exports Parquet files.
"""

import sys
import argparse
from pathlib import Path
from tabulate import tabulate

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from ml_pipeline.data.preprocessor import DataPipelineOrchestrator
from ml_pipeline.storage.duckdb_manager import DuckDBManager
from config.settings import ticker_universe


def main():
    parser = argparse.ArgumentParser(description="Run NSE Data Ingestion and Feature Store Pipeline")
    parser.add_argument("--symbol", type=str, help="Specific symbol to ingest (e.g., TCS.NS)")
    parser.add_argument("--limit", type=int, help="Limit number of tickers to process (for quick testing)")
    args = parser.parse_args()

    orchestrator = DataPipelineOrchestrator()

    if args.symbol:
        symbols = [args.symbol]
    elif args.limit:
        symbols = ticker_universe.get_all_symbols()[:args.limit]
    else:
        symbols = ticker_universe.get_all_symbols()

    print(f"Executing data ingestion & feature engineering for {len(symbols)} tickers...")
    summary_df = orchestrator.run_full_pipeline(symbols)

    print("\n==================================================================")
    print(" Ingestion & Feature Engineering Summary")
    print("==================================================================")
    print(tabulate(summary_df, headers="keys", tablefmt="pretty", showindex=False))

    db_manager = DuckDBManager()
    valid_symbols = db_manager.get_all_valid_symbols()
    print(f"\nTotal Tickers meeting >= 400 trading days requirement: {len(valid_symbols)}/{len(symbols)}")


if __name__ == "__main__":
    main()
