"""
Tree SHAP Explainability module for Random Forest and XGBoost baselines.
Computes global feature importance and sample-level attributions.
"""

from __future__ import annotations
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
import shap

from ml_pipeline.utils.logger import app_logger


class TreeSHAPExplainer:
    """Computes SHAP values and feature attributions for tree-based models."""

    def __init__(self, feature_names: List[str]):
        self.feature_names = feature_names

    def explain_model(
        self,
        model: Any,
        X_test: np.ndarray,
        model_name: str = "TreeModel"
    ) -> Dict[str, Any]:
        """
        Calculates SHAP values for a tree model on test features.
        
        Args:
            model: Fitted RandomForestRegressor or XGBRegressor (or baseline wrapper).
            X_test: Test features array (N, D).
            model_name: Label for logging.
            
        Returns:
            Dict containing raw SHAP values matrix and global mean absolute importance.
        """
        # Unwrap underlying model if wrapper passed
        underlying = getattr(model, "underlying_model", model)
        
        explainer = shap.TreeExplainer(underlying)
        shap_values = explainer.shap_values(X_test)

        # In case of multidimensional array or list from some shap versions
        if isinstance(shap_values, list):
            shap_values = shap_values[0]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim > 2:
            shap_values = shap_values[..., 0]

        # Global feature importance (mean absolute SHAP value)
        mean_abs_shap = np.mean(np.abs(shap_values), axis=0)
        
        # Ensure correct dimension alignment
        if len(mean_abs_shap) != len(self.feature_names):
            # If flattened features were passed, use generic feature names
            f_names = [f"feat_{i}" for i in range(len(mean_abs_shap))]
        else:
            f_names = self.feature_names

        importance_df = pd.DataFrame({
            "feature": f_names,
            "importance": mean_abs_shap
        }).sort_values(by="importance", ascending=False).reset_index(drop=True)

        return {
            "shap_values": shap_values,
            "mean_abs_importance": importance_df,
            "model_name": model_name
        }

    def format_for_database(
        self,
        symbol: str,
        dates: List[Any],
        shap_matrix: np.ndarray,
        model_type: str
    ) -> List[Dict[str, Any]]:
        """Formats SHAP values into rows matching the Supabase `shap_importance` schema."""
        records = []
        n_samples, n_feats = shap_matrix.shape
        f_names = self.feature_names if len(self.feature_names) == n_feats else [f"feature_{i}" for i in range(n_feats)]

        for i in range(n_samples):
            d = dates[i]
            for j in range(n_feats):
                records.append({
                    "symbol": symbol,
                    "date": str(d),
                    "model_type": model_type,
                    "feature_name": f_names[j],
                    "shap_value": float(shap_matrix[i, j])
                })
        return records
