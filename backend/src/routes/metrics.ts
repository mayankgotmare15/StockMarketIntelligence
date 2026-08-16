import { Router, Request, Response } from "express";
import { queryDuckDB } from "../config/database.js";

export const metricsRouter = Router();

metricsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const rawSymbol = req.query.symbol as string | undefined;
    const symbol = rawSymbol ? (rawSymbol.toUpperCase().endsWith(".NS") ? rawSymbol.toUpperCase() : `${rawSymbol.toUpperCase()}.NS`) : undefined;

    // 1. Overall model comparison
    let modelSummarySql = `
      SELECT 
        model_name,
        ROUND(AVG(mae), 6) AS mean_mae,
        ROUND(AVG(rmse), 6) AS mean_rmse,
        ROUND(AVG(r2), 6) AS mean_r2,
        ROUND(AVG(directional_accuracy), 2) AS mean_directional_accuracy,
        COUNT(*) AS total_evaluated_folds
      FROM experiment_metrics
    `;
    const summaryParams: any[] = [];
    if (symbol) {
      modelSummarySql += ` WHERE symbol = ?`;
      summaryParams.push(symbol);
    }
    modelSummarySql += ` GROUP BY model_name ORDER BY mean_mae ASC`;

    const modelSummary = await queryDuckDB(modelSummarySql, summaryParams);

    // 2. Regime-conditioned breakdown
    let regimeSql = `
      SELECT 
        regime_flag,
        COUNT(*) AS sample_count,
        ROUND(AVG(ABS(static_residual)), 6) AS static_mae,
        ROUND(AVG(ABS(adaptive_residual)), 6) AS adaptive_mae,
        ROUND(AVG(static_residual * static_residual), 6) AS static_mse,
        ROUND(AVG(adaptive_residual * adaptive_residual), 6) AS adaptive_mse
      FROM ablation_predictions
    `;
    const regimeParams: any[] = [];
    if (symbol) {
      regimeSql += ` WHERE symbol = ?`;
      regimeParams.push(symbol);
    }
    regimeSql += ` GROUP BY regime_flag ORDER BY regime_flag ASC`;

    const rawRegimes = await queryDuckDB(regimeSql, regimeParams);
    const regimeBreakdown = rawRegimes.map((r: any) => {
      const sMae = Number(r.static_mae) || 0;
      const aMae = Number(r.adaptive_mae) || 0;
      const imp = sMae > 0 ? ((sMae - aMae) / sMae) * 100 : 0;
      return {
        ...r,
        pct_mae_improvement: Number(imp.toFixed(2)),
      };
    });

    // 3. Per-symbol leaderboard (Adaptive vs Static)
    const symbolLeaderboard = await queryDuckDB(`
      SELECT 
        symbol,
        COUNT(DISTINCT fold_index) AS folds_count,
        ROUND(AVG(mae) FILTER (WHERE model_name = 'Liu_Static'), 6) AS static_mae,
        ROUND(AVG(mae) FILTER (WHERE model_name = 'Regime_Adaptive'), 6) AS adaptive_mae,
        ROUND(AVG(mae) FILTER (WHERE model_name = 'LSTM'), 6) AS lstm_mae,
        ROUND(AVG(mae) FILTER (WHERE model_name = 'ANN'), 6) AS ann_mae,
        ROUND(AVG(mae) FILTER (WHERE model_name = 'RandomForest'), 6) AS rf_mae,
        ROUND(AVG(mae) FILTER (WHERE model_name = 'XGBoost'), 6) AS xgb_mae
      FROM experiment_metrics
      GROUP BY symbol
      ORDER BY symbol ASC
    `);

    res.json({
      model_summary: modelSummary,
      regime_breakdown: regimeBreakdown,
      symbol_breakdown: symbolLeaderboard,
      evaluation_protocol: "252-day Rolling Origin Walk-Forward Cross-Validation (21-day step)",
      target_variable: "Next-Day Log Return (y_t = ln(P_t+1 / P_t))",
    });
  } catch (error: any) {
    console.error("[Metrics Error]", error);
    res.status(500).json({
      error: "Failed to aggregate metrics",
      details: error.message,
    });
  }
});
