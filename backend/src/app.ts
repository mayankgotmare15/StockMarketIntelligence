import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { stocksRouter } from "./routes/stocks.js";
import { backtestRouter } from "./routes/backtest.js";
import { regimesRouter } from "./routes/regimes.js";
import { shapRouter } from "./routes/shap.js";
import { metricsRouter } from "./routes/metrics.js";

export const app: Express = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API Routes
app.use("/api/health", healthRouter);
app.use("/health", healthRouter);
app.use("/api/stocks", stocksRouter);
app.use("/api/backtest", backtestRouter);
app.use("/api/regimes", regimesRouter);
app.use("/api/shap", shapRouter);
app.use("/api/metrics", metricsRouter);

// Aliases for /api/stocks/:symbol/*
app.use("/api/stocks/:symbol/results", (req, res, next) => {
  req.url = `/${req.params.symbol}`;
  return backtestRouter(req, res, next);
});
app.use("/api/stocks/:symbol/regimes", (req, res, next) => {
  req.url = `/${req.params.symbol}`;
  return regimesRouter(req, res, next);
});
app.use("/api/stocks/:symbol/shap", (req, res, next) => {
  req.url = `/${req.params.symbol}`;
  return shapRouter(req, res, next);
});
app.use("/api/stocks/:symbol/metrics", (req, res, next) => {
  req.url = `/${req.params.symbol}`;
  return metricsRouter(req, res, next);
});

// Root greeting
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Indian Stock Market Intelligence & Adaptive Stacking API",
    docs: "/api/health",
    endpoints: [
      "/api/health",
      "/api/stocks",
      "/api/backtest/:symbol",
      "/api/regimes/:symbol",
      "/api/shap/:symbol",
      "/api/metrics",
    ],
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] Unhandled exception:`, err);
  res.status(500).json({
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
