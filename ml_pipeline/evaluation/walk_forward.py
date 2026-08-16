"""
Walk-Forward Cross-Validation Harness (Rolling Origin).
Executes the core ablation experiment: Static Meta-Model (Liu et al. Control) vs.
Adaptive Meta-Model (Our Contribution) with independent Tree Baselines (RF, XGB) and SHAP.
Optimized for high-throughput execution with warm-start online fine-tuning.
"""

from __future__ import annotations
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd

from config.settings import settings
from ml_pipeline.data.dataset import DataFormatter, FEATURE_COLUMNS, TARGET_COLUMN
from ml_pipeline.models.base_learners import LSTMEstimator, ANNEstimator
from ml_pipeline.models.meta_model import StaticMetaModel
from ml_pipeline.models.adaptive_meta_model import AdaptiveRidgeMetaModel
from ml_pipeline.models.baselines import RandomForestBaseline, XGBoostBaseline
from ml_pipeline.evaluation.metrics import compute_metrics_dict, reconstruct_price_levels
from ml_pipeline.evaluation.shap_explainer import TreeSHAPExplainer
from ml_pipeline.utils.logger import app_logger


class WalkForwardCVHarness:
    """
    Executes rolling-origin walk-forward cross-validation.
    Guarantees strict zero-leakage by fitting scalers and models on train windows only.
    Runs the core ablation study comparing Static vs. Regime-Adaptive Meta-Models.
    """

    def __init__(
        self,
        train_window: Optional[int] = None,
        test_window: Optional[int] = None,
        step_size: Optional[int] = None,
        lookback_days: Optional[int] = None,
        epochs: int = 15,
        fine_tune_epochs: int = 5,
        batch_size: int = 64
    ):
        self.train_window = train_window or settings.wf_train_days
        self.test_window = test_window or settings.wf_test_days
        self.step_size = step_size or settings.wf_step_days
        self.lookback_days = lookback_days or settings.sequence_lookback_days
        self.epochs = epochs
        self.fine_tune_epochs = fine_tune_epochs
        self.batch_size = batch_size
        self.shap_explainer = TreeSHAPExplainer(FEATURE_COLUMNS)

    def generate_fold_splits(self, total_rows: int) -> List[Tuple[int, int, int, int]]:
        """
        Generates slice indices for each walk-forward fold:
            (train_start, train_end, test_start, test_end)
        """
        splits = []
        start = 0
        while (start + self.train_window + self.test_window) <= total_rows:
            train_start = start
            train_end = start + self.train_window
            test_start = train_end
            test_end = test_start + self.test_window
            splits.append((train_start, train_end, test_start, test_end))
            start += self.step_size

        return splits

    def evaluate_stock(
        self,
        symbol: str,
        df: pd.DataFrame,
        include_shap: bool = True
    ) -> Dict[str, Any]:
        """
        Executes full walk-forward CV across all rolling folds for a given stock DataFrame.
        Compares Static Control vs. Adaptive Meta-Model and Tree Baselines.
        """
        splits = self.generate_fold_splits(len(df))
        
        if not splits:
            raise ValueError(
                f"[{symbol}] Dataset length {len(df)} is insufficient for train_window {self.train_window} + test_window {self.test_window}."
            )

        fold_predictions_list = []
        fold_metrics_list = []
        shap_records_list = []

        # Persistent Estimators with warm-starting across sliding folds
        n_features = len(FEATURE_COLUMNS)
        lstm = LSTMEstimator(input_dim=n_features, epochs=self.epochs, batch_size=self.batch_size)
        ann = ANNEstimator(input_dim=self.lookback_days * n_features, epochs=self.epochs, batch_size=self.batch_size)
        adaptive_meta = AdaptiveRidgeMetaModel()

        total_folds = len(splits)

        for fold_idx, (tr_s, tr_e, te_s, te_e) in enumerate(splits, start=1):
            train_df = df.iloc[tr_s:tr_e].copy()
            test_slice_start = max(0, te_s - self.lookback_days + 1)
            test_df = df.iloc[test_slice_start:te_e].copy()
            
            pure_test_df = df.iloc[te_s:te_e].copy()
            test_dates = pure_test_df["date"].tolist() if "date" in pure_test_df.columns else pure_test_df.index.tolist()
            actual_prices = pure_test_df["close"].values if "close" in pure_test_df.columns else pure_test_df["Close"].values
            actual_returns = pure_test_df[TARGET_COLUMN].values
            test_vol_metrics = pure_test_df["atr_20"].values if "atr_20" in pure_test_df.columns else np.zeros(len(pure_test_df))

            # 1. Anti-Leakage Feature Scaling
            formatter = DataFormatter(lookback_days=self.lookback_days)
            formatter.fit_scaler(train_df)

            train_feats = formatter.transform_features(train_df)
            test_feats = formatter.transform_features(test_df)

            train_targets = train_df[TARGET_COLUMN].values
            test_targets = test_df[TARGET_COLUMN].values

            # 2. Sequence & Tabular Formatting
            X_train_lstm, y_train_lstm = formatter.create_lstm_sequences(train_feats, train_targets)
            X_test_lstm, y_test_lstm = formatter.create_lstm_sequences(test_feats, test_targets)

            X_train_tab, y_train_tab = formatter.create_ann_tabular(train_feats, train_targets)
            X_test_tab, y_test_tab = formatter.create_ann_tabular(test_feats, test_targets)

            # 3. Train Base Learners (LSTM & ANN) with fast sliding warm-start
            is_warm = (fold_idx > 1)
            current_epochs = self.fine_tune_epochs if is_warm else self.epochs

            lstm.fit(X_train_lstm, y_train_lstm, warm_start=is_warm, epochs_override=current_epochs)
            train_preds_lstm = lstm.predict(X_train_lstm)
            test_preds_lstm = lstm.predict(X_test_lstm)

            ann.fit(X_train_tab, y_train_tab, warm_start=is_warm, epochs_override=current_epochs)
            train_preds_ann = ann.predict(X_train_tab)
            test_preds_ann = ann.predict(X_test_tab)

            # 4. Train Static Meta-Model (Liu et al. Control)
            static_meta = StaticMetaModel(fit_intercept=True)
            static_meta.fit(train_preds_lstm, train_preds_ann, y_train_lstm.numpy().flatten())
            test_preds_static = static_meta.predict(test_preds_lstm, test_preds_ann)

            # 5. Fit & Run Adaptive Meta-Model (Our Contribution)
            if fold_idx == 1:
                adaptive_meta.fit_initial(
                    train_df=train_df,
                    y_hat_lstm_train=train_preds_lstm,
                    y_hat_ann_train=train_preds_ann,
                    y_true_train=y_train_lstm.numpy().flatten()
                )
            
            adaptive_res = adaptive_meta.predict_sequential(
                y_hat_lstm_test=test_preds_lstm,
                y_hat_ann_test=test_preds_ann,
                y_true_test=actual_returns,
                test_volatility_metrics=test_vol_metrics
            )
            test_preds_adaptive = adaptive_res["y_hat_adaptive"]
            drift_flags = adaptive_res["drift_flags"]
            z_scores = adaptive_res["z_scores"]
            regime_flags = adaptive_res["regime_flags"]

            # 6. Train Independent Tree Baselines (RF & XGBoost)
            X_tr_np = X_train_tab.numpy()
            y_tr_np = y_train_tab.numpy().flatten()
            X_te_np = X_test_tab.numpy()

            rf = RandomForestBaseline(n_estimators=40, max_depth=5)
            rf.fit(X_tr_np, y_tr_np)
            test_preds_rf = rf.predict(X_te_np)

            xgb_model = XGBoostBaseline(n_estimators=40, max_depth=4)
            xgb_model.fit(X_tr_np, y_tr_np)
            test_preds_xgb = xgb_model.predict(X_te_np)

            # 7. SHAP Extraction for Tree Baselines (sample periodic folds to maintain speed)
            if include_shap and (fold_idx == 1 or fold_idx == total_folds or fold_idx % 8 == 0):
                try:
                    shap_res_rf = self.shap_explainer.explain_model(rf, X_te_np, "RandomForest")
                    shap_recs_rf = self.shap_explainer.format_for_database(
                        symbol, test_dates, shap_res_rf["shap_values"], "RandomForest"
                    )
                    shap_records_list.extend(shap_recs_rf)
                except Exception as e:
                    app_logger.warning(f"[{symbol}] Fold {fold_idx} SHAP extraction notice: {e}")

            # 8. Price Reconstruction
            prev_close_prices = train_df["close"].iloc[-1:] if "close" in train_df.columns else train_df["Close"].iloc[-1:]
            prior_prices = np.concatenate([prev_close_prices.values, actual_prices[:-1]])
            
            static_price_preds = reconstruct_price_levels(prior_prices, test_preds_static)
            adaptive_price_preds = reconstruct_price_levels(prior_prices, test_preds_adaptive)

            # 9. Record Row-by-Row Predictions
            for i in range(len(test_dates)):
                fold_predictions_list.append({
                    "symbol": symbol,
                    "date": test_dates[i],
                    "fold_index": fold_idx,
                    "actual_price": float(actual_prices[i]),
                    "actual_return": float(actual_returns[i]),
                    "y_hat_static": float(test_preds_static[i]),
                    "y_hat_adaptive": float(test_preds_adaptive[i]),
                    "y_hat_static_price": float(static_price_preds[i]),
                    "y_hat_adaptive_price": float(adaptive_price_preds[i]),
                    "y_hat_lstm": float(test_preds_lstm[i]),
                    "y_hat_ann": float(test_preds_ann[i]),
                    "y_hat_rf": float(test_preds_rf[i]),
                    "y_hat_xgb": float(test_preds_xgb[i]),
                    "static_residual": float(actual_returns[i] - test_preds_static[i]),
                    "adaptive_residual": float(actual_returns[i] - test_preds_adaptive[i]),
                    "z_score": float(z_scores[i]),
                    "drift_detected": bool(drift_flags[i]),
                    "regime_flag": str(regime_flags[i])
                })

            # 10. Record Metrics per Model
            models_to_evaluate = {
                "Liu_Static": test_preds_static,
                "Regime_Adaptive": test_preds_adaptive,
                "LSTM": test_preds_lstm,
                "ANN": test_preds_ann,
                "RandomForest": test_preds_rf,
                "XGBoost": test_preds_xgb
            }

            for m_name, preds in models_to_evaluate.items():
                m_metrics = compute_metrics_dict(actual_returns, preds)
                fold_metrics_list.append({
                    "symbol": symbol,
                    "fold_index": fold_idx,
                    "model_name": m_name,
                    "mae": m_metrics["mae"],
                    "rmse": m_metrics["rmse"],
                    "r2": m_metrics["r2"],
                    "directional_accuracy": m_metrics["directional_accuracy"]
                })

        predictions_df = pd.DataFrame(fold_predictions_list)
        metrics_df = pd.DataFrame(fold_metrics_list)

        return {
            "symbol": symbol,
            "predictions": predictions_df,
            "metrics": metrics_df,
            "shap_records": shap_records_list
        }
