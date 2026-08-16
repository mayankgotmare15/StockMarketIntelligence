import { Router, Request, Response } from "express";
import { queryDuckDB } from "../config/database.js";

export const regimesRouter = Router();

regimesRouter.get("/:symbol", async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.symbol;
    const rawStr = (Array.isArray(rawParam) ? rawParam[0] : (rawParam || "")).toUpperCase();
    const symbol = rawStr.endsWith(".NS") ? rawStr : `${rawStr}.NS`;

    // 1. Regime distribution & error metrics
    const rawDistribution = await queryDuckDB(`
      SELECT 
        regime_flag,
        COUNT(*) AS count,
        ROUND(AVG(ABS(static_residual)), 6) AS static_mae,
        ROUND(AVG(ABS(adaptive_residual)), 6) AS adaptive_mae
      FROM ablation_predictions
      WHERE symbol = ?
      GROUP BY regime_flag
      ORDER BY regime_flag ASC
    `, [symbol]);

    const distribution = rawDistribution.map((r: any) => {
      const sMae = Number(r.static_mae) || 0;
      const aMae = Number(r.adaptive_mae) || 0;
      const imp = sMae > 0 ? ((sMae - aMae) / sMae) * 100 : 0;
      return {
        ...r,
        pct_mae_improvement: Number(imp.toFixed(2)),
      };
    });

    // 2. Drift Events (|z| > 2.0 or drift_detected = true)
    const driftEvents = await queryDuckDB(`
      SELECT 
        CAST(date AS VARCHAR) AS date,
        fold_index,
        regime_flag,
        z_score,
        actual_return,
        static_residual,
        adaptive_residual
      FROM ablation_predictions
      WHERE symbol = ? AND (drift_detected = TRUE OR ABS(z_score) > 2.0)
      ORDER BY date ASC
    `, [symbol]);

    // 3. Chronological timeline for regime visualization
    const timeline = await queryDuckDB(`
      SELECT 
        CAST(date AS VARCHAR) AS date,
        regime_flag,
        z_score,
        drift_detected,
        actual_price
      FROM ablation_predictions
      WHERE symbol = ?
      ORDER BY date ASC
    `, [symbol]);

    if (timeline.length === 0) {
      return res.status(404).json({
        error: `No regime records found for ticker ${symbol}`,
      });
    }

    res.json({
      symbol,
      distribution,
      drift_events_count: driftEvents.length,
      drift_events: driftEvents,
      timeline,
    });
  } catch (error: any) {
    console.error("[Regimes Error]", error);
    res.status(500).json({
      error: "Failed to retrieve regime analytics",
      details: error.message,
    });
  }
});
