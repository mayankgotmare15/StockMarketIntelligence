export interface StockMetadata {
  symbol: string;
  name: string;
  sector: string;
  history_days_count: number;
  min_history_met: boolean;
  start_date?: string;
  end_date?: string;
  last_updated?: string;
  completed_folds?: number;
  total_predictions?: number;
  has_backtest?: boolean;
}

export interface BacktestRow {
  symbol: string;
  date: string;
  fold_index: number;
  actual_price: number;
  actual_return: number;
  y_hat_static: number;
  y_hat_adaptive: number;
  y_hat_static_price: number;
  y_hat_adaptive_price: number;
  y_hat_lstm: number;
  y_hat_ann: number;
  y_hat_rf: number;
  y_hat_xgb: number;
  static_residual: number;
  adaptive_residual: number;
  z_score: number;
  drift_detected: boolean;
  regime_flag: "Low" | "Medium" | "High";
}

export interface RegimeDistributionItem {
  regime_flag: "Low" | "Medium" | "High";
  count: number;
  static_mae: number;
  adaptive_mae: number;
  pct_mae_improvement: number;
}

export interface DriftEvent {
  date: string;
  fold_index: number;
  regime_flag: string;
  z_score: number;
  actual_return: number;
  static_residual: number;
  adaptive_residual: number;
}

export interface ShapRankingItem {
  feature_name: string;
  mean_abs_shap: number;
  sample_count: number;
}

export interface ModelMetricSummary {
  model_name: string;
  mean_mae: number;
  mean_rmse: number;
  mean_r2: number;
  mean_directional_accuracy: number;
  total_evaluated_folds: number;
}

export type ActiveTab = "home" | "activity" | "keypad" | "insights" | "shap";
