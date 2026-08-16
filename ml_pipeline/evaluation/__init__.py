"""
Evaluation modules:
- Walk-Forward Rolling-Origin Cross-Validation (Strict Anti-Leakage)
- Methodological comparison single TimeSeriesSplit
- Evaluation metrics (MAE, RMSE, R2, Directional Accuracy)
- Tree SHAP explainability extraction
"""

from .walk_forward import WalkForwardCVHarness
from .time_series_split import SingleTimeSeriesSplitBenchmark
from .shap_explainer import TreeSHAPExplainer
from .metrics import (
    calculate_mae,
    calculate_rmse,
    calculate_r2,
    calculate_directional_accuracy,
    compute_metrics_dict,
    reconstruct_price_levels
)

__all__ = [
    "WalkForwardCVHarness",
    "SingleTimeSeriesSplitBenchmark",
    "TreeSHAPExplainer",
    "calculate_mae",
    "calculate_rmse",
    "calculate_r2",
    "calculate_directional_accuracy",
    "compute_metrics_dict",
    "reconstruct_price_levels"
]
