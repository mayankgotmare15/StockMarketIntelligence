import { app } from "./app.js";

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Stock Market Intelligence API running on http://0.0.0.0:${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[Server] Stocks universe: http://localhost:${PORT}/api/stocks`);
});
