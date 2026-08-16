"""
Foundation Verification Script
Tests that Phase 1 environment, configuration, dependencies, and directory structure are intact.
"""

import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

def test_imports():
    print("--> 1. Testing Core Python Imports...")
    packages = [
        ("torch", "PyTorch"),
        ("sklearn", "Scikit-Learn"),
        ("xgboost", "XGBoost"),
        ("shap", "SHAP"),
        ("yfinance", "yfinance"),
        ("duckdb", "DuckDB"),
        ("supabase", "Supabase"),
        ("pandas", "Pandas"),
        ("numpy", "NumPy"),
        ("yaml", "PyYAML"),
        ("pydantic", "Pydantic"),
        ("dotenv", "python-dotenv"),
    ]
    for module_name, label in packages:
        try:
            mod = __import__(module_name)
            ver = getattr(mod, "__version__", "installed")
            print(f"  [PASS] {label:<15} ({ver})")
        except ImportError as e:
            print(f"  [FAIL] {label:<15} - Error: {e}")
            return False
    return True


def test_hardware_device():
    print("\n--> 2. Testing PyTorch Compute Device...")
    import torch
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"  [PASS] Compute Device: {device} (CUDA available: {torch.cuda.is_available()})")
    return True


def test_configuration():
    print("\n--> 3. Testing Settings and Ticker Universe...")
    from config.settings import settings, ticker_universe
    
    print(f"  [PASS] App Name: {settings.app_name} (v{settings.version})")
    print(f"  [PASS] Base Directory: {settings.base_dir}")
    print(f"  [PASS] Walk-Forward Train Days: {settings.wf_train_days}, Test Days: {settings.wf_test_days}")
    print(f"  [PASS] Drift Window: {settings.drift_window_days} days, Z-Threshold: {settings.drift_z_threshold}")
    print(f"  [PASS] Adaptive Re-fit Window: {settings.adaptive_refit_lookback_days} days (Ridge Alpha: {settings.ridge_alpha})")
    
    symbols = ticker_universe.get_all_symbols()
    print(f"  [PASS] Ticker Universe: {ticker_universe.universe_name} with {len(symbols)} total tickers")
    
    sectors = ticker_universe.sectors
    expected_sectors = ["Banking", "IT", "FMCG", "Automobile", "Pharma"]
    for sec_name in expected_sectors:
        if sec_name in sectors:
            count = len(sectors[sec_name].stocks)
            print(f"    * Sector '{sec_name}': {count} stocks")
        else:
            print(f"  [FAIL] Missing sector: {sec_name}")
            return False
            
    if len(symbols) != 30:
        print(f"  [WARN] Expected 30 stocks, found {len(symbols)}")
    return True


def test_schema_file():
    print("\n--> 4. Testing Supabase PostgreSQL Schema...")
    schema_path = BASE_DIR / "database" / "schema.sql"
    if not schema_path.exists():
        print(f"  [FAIL] schema.sql not found at {schema_path}")
        return False
    
    content = schema_path.read_text(encoding="utf-8")
    required_tables = [
        "stock_universe",
        "daily_ohlcv",
        "ablation_predictions",
        "shap_importance",
        "experiment_metrics"
    ]
    for table in required_tables:
        if f"CREATE TABLE IF NOT EXISTS {table}" in content:
            print(f"  [PASS] Schema Table: {table}")
        else:
            print(f"  [FAIL] Missing table in schema: {table}")
            return False
    return True


def test_logging():
    print("\n--> 5. Testing Logging Infrastructure...")
    from ml_pipeline.utils.logger import app_logger, LOG_FILE
    app_logger.info("Foundation test log event - Phase 1 verification in progress.")
    if LOG_FILE.exists():
        print(f"  [PASS] Log file created and verified at: {LOG_FILE}")
        return True
    else:
        print(f"  [FAIL] Log file not found at: {LOG_FILE}")
        return False


def main():
    print("==================================================================")
    print(" Phase 1 Foundation Verification Test")
    print(" Real-Time Indian Stock Market Intelligence Platform (v4)")
    print("==================================================================")
    
    results = [
        test_imports(),
        test_hardware_device(),
        test_configuration(),
        test_schema_file(),
        test_logging()
    ]
    
    print("\n==================================================================")
    if all(results):
        print(" [SUCCESS] All Phase 1 Foundation Verification Checks Passed!")
        print(" Ready to proceed to Phase 2: Data Ingestion & Storage (DuckDB)")
        print("==================================================================")
        sys.exit(0)
    else:
        print(" [ERROR] One or more verification checks failed.")
        print("==================================================================")
        sys.exit(1)


if __name__ == "__main__":
    main()
