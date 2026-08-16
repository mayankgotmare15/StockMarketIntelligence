"""
Script to execute the Core Ablation Experiment across the 30-stock NSE universe.
Benchmarks Static Liu et al. (2024) vs. Regime-Adaptive Meta-Model under Walk-Forward CV.
Exports results to DuckDB, Parquet, and Supabase.
"""

from __future__ import annotations
import sys
import argparse
from pathlib import Path
import time
import pandas as pd
from tabulate import tabulate

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from config.settings import settings, ticker_universe
from ml_pipeline.storage.duckdb_manager import DuckDBManager
from ml_pipeline.storage.supabase_exporter import SupabaseExporter
from ml_pipeline.evaluation.walk_forward import WalkForwardCVHarness
from ml_pipeline.utils.logger import app_logger


def run_ablation(
    symbols: list[str],
    epochs: int = 25,
    include_shap: bool = True,
    export_supabase: bool = True
):
    start_time = time.time()
    db_manager = DuckDBManager()
    supabase_exporter = SupabaseExporter()
    harness = WalkForwardCVHarness(epochs=epochs)

    app_logger.info(f"=== Initiating Ablation Study for {len(symbols)} stocks (Epochs per fold: {epochs}) ===")

    all_predictions = []
    all_metrics = []
    all_shap = []

    for idx, symbol in enumerate(symbols, start=1):
        app_logger.info(f"[{idx}/{len(symbols)}] Evaluating stock: {symbol}")
        df = db_manager.get_features(symbol)

        if df.empty or len(df) < 300:
            app_logger.warning(f"[{symbol}] Insufficient feature rows in DuckDB ({len(df)}). Skipping.")
            continue

        try:
            results = harness.evaluate_stock(symbol, df, include_shap=include_shap)
            
            preds_df = results["predictions"]
            metrics_df = results["metrics"]
            shap_recs = results["shap_records"]

            # Save to DuckDB
            db_manager.save_ablation_predictions(preds_df)
            db_manager.save_experiment_metrics(metrics_df)
            db_manager.save_shap_importance(shap_recs)

            all_predictions.append(preds_df)
            all_metrics.append(metrics_df)
            all_shap.extend(shap_recs)

            # Export individual stock to Supabase if connected
            if export_supabase and supabase_exporter.is_connected:
                supabase_exporter.export_ablation_predictions(preds_df)
                supabase_exporter.export_experiment_metrics(metrics_df)
                supabase_exporter.export_shap_importance(shap_recs)

        except Exception as e:
            app_logger.error(f"[{symbol}] Walk-Forward CV failed: {e}", exc_info=True)

    # Export all tables to Parquet
    try:
        db_manager.export_to_parquet()
    except Exception as e:
        app_logger.warning(f"Parquet export notice: {e}")

    elapsed_minutes = (time.time() - start_time) / 60.0

    print("\n" + "=" * 75)
    print(f" ABLATION STUDY COMPLETE (Elapsed Time: {elapsed_minutes:.2f} mins)")
    print("=" * 75)

    # 1. Overall Model Comparison Table
    summary_df = db_manager.get_metrics_summary()
    print("\n--- Model Performance Summary (Averaged across all Walk-Forward folds) ---")
    print(tabulate(summary_df, headers="keys", tablefmt="pretty", showindex=False))

    # 2. Volatility Regime Breakdown Table (The Core Hypothesis Validation)
    regime_df = db_manager.get_regime_breakdown()
    print("\n--- Regime Breakdown: Static vs. Adaptive MAE by Market Volatility ---")
    print(tabulate(regime_df, headers="keys", tablefmt="pretty", showindex=False))

    # Save summary tables to reports/
    settings.report_dir.mkdir(parents=True, exist_ok=True)
    summary_df.to_csv(settings.report_dir / "ablation_metrics_summary.csv", index=False)
    regime_df.to_csv(settings.report_dir / "regime_ablation_breakdown.csv", index=False)
    app_logger.info(f"Saved ablation summary reports to: {settings.report_dir}")


def main():
    parser = argparse.ArgumentParser(description="Run Full Ablation Study on NSE Universe")
    parser.add_argument("--symbols", type=str, help="Comma-separated list of symbols (e.g. TCS.NS,INFY.NS)")
    parser.add_argument("--limit", type=int, help="Limit number of symbols to run")
    parser.add_argument("--epochs", type=int, default=20, help="Epochs per walk-forward fold (default: 20)")
    parser.add_argument("--no-shap", action="store_true", help="Disable SHAP extraction for speed")
    parser.add_argument("--no-supabase", action="store_true", help="Disable Supabase export")
    args = parser.parse_args()

    db_manager = DuckDBManager()
    valid_symbols = db_manager.get_all_valid_symbols()

    if not valid_symbols:
        valid_symbols = ticker_universe.get_all_symbols()

    if args.symbols:
        target_symbols = [s.strip() for s in args.symbols.split(",")]
    elif args.limit:
        target_symbols = valid_symbols[:args.limit]
    else:
        target_symbols = valid_symbols

    run_ablation(
        symbols=target_symbols,
        epochs=args.epochs,
        include_shap=not args.no_shap,
        export_supabase=not args.no_supabase
    )


if __name__ == "__main__":
    main()
