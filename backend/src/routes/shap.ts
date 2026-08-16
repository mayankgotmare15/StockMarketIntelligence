import { Router, Request, Response } from "express";
import { getSupabase, queryDuckDB } from "../config/database.js";

export const shapRouter = Router();

shapRouter.get("/:symbol", async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.symbol;
    const rawStr = (Array.isArray(rawParam) ? rawParam[0] : (rawParam || "")).toUpperCase();
    const symbol = rawStr.endsWith(".NS") ? rawStr : `${rawStr}.NS`;
    const supabase = getSupabase();

    // Try Supabase first
    if (supabase) {
      const { data, error } = await supabase
        .from("shap_importance")
        .select("*")
        .eq("symbol", symbol)
        .order("date", { ascending: false })
        .limit(200);

      if (!error && data && data.length > 0) {
        const featMap = new Map<string, { sumAbs: number; count: number }>();
        data.forEach((r: any) => {
          const cur = featMap.get(r.feature_name) || { sumAbs: 0, count: 0 };
          cur.sumAbs += Math.abs(r.shap_value || 0);
          cur.count += 1;
          featMap.set(r.feature_name, cur);
        });

        const ranking = Array.from(featMap.entries())
          .map(([feature, val]) => ({
            feature,
            mean_abs_shap: Number((val.sumAbs / val.count).toFixed(6)),
          }))
          .sort((a, b) => b.mean_abs_shap - a.mean_abs_shap);

        return res.json({
          symbol,
          source: "supabase",
          global_feature_ranking: ranking,
          sample_attributions: data.slice(0, 100),
        });
      }
    }

    // Fallback to DuckDB
    const ranking = await queryDuckDB(`
      SELECT 
        feature_name,
        ROUND(AVG(ABS(shap_value)), 6) AS mean_abs_shap,
        COUNT(*) AS sample_count
      FROM shap_importance
      WHERE symbol = ?
      GROUP BY feature_name
      ORDER BY mean_abs_shap DESC
    `, [symbol]);

    const samples = await queryDuckDB(`
      SELECT 
        CAST(date AS VARCHAR) AS date,
        model_type,
        feature_name,
        shap_value
      FROM shap_importance
      WHERE symbol = ?
      ORDER BY date DESC
      LIMIT 100
    `, [symbol]);

    if (ranking.length === 0 && samples.length === 0) {
      return res.status(404).json({
        error: `No SHAP attributions found for ticker ${symbol}`,
      });
    }

    res.json({
      symbol,
      source: "duckdb",
      global_feature_ranking: ranking,
      sample_attributions: samples,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve SHAP feature importance",
      details: error.message,
    });
  }
});
