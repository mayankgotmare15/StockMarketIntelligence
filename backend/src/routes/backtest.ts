import { Router, Request, Response } from "express";
import { getSupabase, queryDuckDB } from "../config/database.js";

export const backtestRouter = Router();

backtestRouter.get("/:symbol", async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.symbol;
    const rawStr = (Array.isArray(rawParam) ? rawParam[0] : (rawParam || "")).toUpperCase();
    const symbol = rawStr.endsWith(".NS") ? rawStr : `${rawStr}.NS`;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 1000;
    const foldIndex = req.query.fold ? parseInt(req.query.fold as string, 10) : undefined;

    const supabase = getSupabase();

    // Try Supabase first
    if (supabase) {
      let query = supabase
        .from("ablation_predictions")
        .select("*")
        .eq("symbol", symbol)
        .order("date", { ascending: true })
        .limit(limit);

      if (foldIndex !== undefined) {
        query = query.eq("fold_index", foldIndex);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return res.json({
          symbol,
          source: "supabase",
          count: data.length,
          data,
        });
      }
    }

    // Fallback to DuckDB
    let sql = `
      SELECT 
        symbol,
        CAST(date AS VARCHAR) AS date,
        fold_index,
        actual_price,
        actual_return,
        y_hat_static,
        y_hat_adaptive,
        y_hat_static_price,
        y_hat_adaptive_price,
        y_hat_lstm,
        y_hat_ann,
        y_hat_rf,
        y_hat_xgb,
        static_residual,
        adaptive_residual,
        z_score,
        drift_detected,
        regime_flag
      FROM ablation_predictions
      WHERE symbol = ?
    `;
    const params: any[] = [symbol];

    if (foldIndex !== undefined) {
      sql += ` AND fold_index = ?`;
      params.push(foldIndex);
    }

    sql += ` ORDER BY date ASC LIMIT ?`;
    params.push(limit);

    const rows = await queryDuckDB(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        error: `No backtest ablation predictions found for ticker ${symbol}`,
        available_action: "Run ablation pipeline or check stock universe via /api/stocks",
      });
    }

    res.json({
      symbol,
      source: "duckdb",
      count: rows.length,
      data: rows,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve backtest series",
      details: error.message,
    });
  }
});
