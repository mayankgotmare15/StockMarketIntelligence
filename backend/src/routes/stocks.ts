import { Router, Request, Response } from "express";
import { getSupabase, queryDuckDB } from "../config/database.js";

export const stocksRouter = Router();

stocksRouter.get("/", async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();

    // Try Supabase first
    if (supabase) {
      const { data, error } = await supabase
        .from("stock_universe")
        .select("*")
        .order("sector", { ascending: true })
        .order("symbol", { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json({
          source: "supabase",
          count: data.length,
          data,
        });
      }
    }

    // Fallback to DuckDB
    const rows = await queryDuckDB(`
      SELECT 
        symbol,
        name,
        sector,
        history_days_count,
        min_history_met,
        CAST(start_date AS VARCHAR) AS start_date,
        CAST(end_date AS VARCHAR) AS end_date,
        CAST(last_updated AS VARCHAR) AS last_updated
      FROM stock_metadata
      ORDER BY sector ASC, symbol ASC
    `);

    // Also check which stocks have completed ablation predictions
    const completedFolds = await queryDuckDB(`
      SELECT symbol, COUNT(DISTINCT fold_index) AS completed_folds, COUNT(*) AS total_predictions
      FROM ablation_predictions
      GROUP BY symbol
    `);

    const foldMap = new Map<string, { completed_folds: number; total_predictions: number }>();
    completedFolds.forEach((r: any) => {
      foldMap.set(r.symbol, {
        completed_folds: Number(r.completed_folds),
        total_predictions: Number(r.total_predictions),
      });
    });

    const enriched = rows.map((r: any) => ({
      ...r,
      completed_folds: foldMap.get(r.symbol)?.completed_folds || 0,
      total_predictions: foldMap.get(r.symbol)?.total_predictions || 0,
      has_backtest: (foldMap.get(r.symbol)?.total_predictions || 0) > 0,
    }));

    res.json({
      source: "duckdb",
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve stock universe",
      details: error.message,
    });
  }
});
