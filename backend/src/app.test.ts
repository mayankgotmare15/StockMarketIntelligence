import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("Stock Market Intelligence REST API Integration Tests", () => {
  it("GET /api/health - returns 200 and online status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("online");
    expect(res.body.service).toContain("Stock Market Intelligence");
    expect(res.body.database).toBeDefined();
  });

  it("GET /api/stocks - returns stock universe array", async () => {
    const res = await request(app).get("/api/stocks");
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data)).toBe(true);

    const firstStock = res.body.data[0];
    expect(firstStock).toHaveProperty("symbol");
    expect(firstStock).toHaveProperty("sector");
    expect(firstStock).toHaveProperty("min_history_met");
  });

  it("GET /api/metrics - returns model summary and regime breakdown", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("model_summary");
    expect(res.body).toHaveProperty("regime_breakdown");
    expect(res.body).toHaveProperty("symbol_breakdown");
    expect(Array.isArray(res.body.model_summary)).toBe(true);
  });

  it("GET /api/backtest/APOLLOHOSP.NS - returns ablation time series", async () => {
    const res = await request(app).get("/api/backtest/APOLLOHOSP.NS");
    // If backtest has run for APOLLOHOSP.NS
    if (res.status === 200) {
      expect(res.body.symbol).toBe("APOLLOHOSP.NS");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const row = res.body.data[0];
      expect(row).toHaveProperty("actual_price");
      expect(row).toHaveProperty("y_hat_static");
      expect(row).toHaveProperty("y_hat_adaptive");
      expect(row).toHaveProperty("regime_flag");
    } else {
      expect(res.status).toBe(404);
    }
  });

  it("GET /api/backtest/UNKNOWN.NS - returns 404 for nonexistent ticker", async () => {
    const res = await request(app).get("/api/backtest/UNKNOWN.NS");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("GET /api/regimes/APOLLOHOSP.NS - returns regime analysis", async () => {
    const res = await request(app).get("/api/regimes/APOLLOHOSP.NS");
    if (res.status === 200) {
      expect(res.body.symbol).toBe("APOLLOHOSP.NS");
      expect(res.body).toHaveProperty("distribution");
      expect(res.body).toHaveProperty("drift_events");
      expect(res.body).toHaveProperty("timeline");
    } else {
      expect(res.status).toBe(404);
    }
  });

  it("GET /nonexistent-route - returns 404 error", async () => {
    const res = await request(app).get("/nonexistent-route");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Endpoint not found");
  });
});
