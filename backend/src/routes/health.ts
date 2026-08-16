import { Router, Request, Response } from "express";
import { getDatabaseStatus } from "../config/database.js";

export const healthRouter = Router();

healthRouter.get("/", async (req: Request, res: Response) => {
  try {
    const dbStatus = await getDatabaseStatus();
    res.json({
      status: "online",
      service: "Indian Stock Market Intelligence REST API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "degraded",
      error: error.message || "Internal error",
      timestamp: new Date().toISOString(),
    });
  }
});
