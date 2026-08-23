import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("User Engagement & Authentication API (SDL Verification)", () => {
  const testEmail = `trader_${Date.now()}@stockai.in`;
  const testPassword = "SuperSecurePassword2026!";
  let accessToken = "";
  let refreshToken = "";
  let userId = "";

  // 1. Registration Flow
  describe("POST /api/auth/register", () => {
    it("should register a new investor profile with credentials & preferences", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          fullName: "Rohan Verma",
          role: "pro_trader",
          riskTolerance: "aggressive",
          tradingHorizon: "swing",
          defaultStock: "APOLLOHOSP.NS",
          primarySector: "Pharma",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.full_name).toBe("Rohan Verma");
      expect(res.body.user.role).toBe("pro_trader");
      expect(res.body.user).not.toHaveProperty("password_hash");

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
      userId = res.body.user.id;
    });

    it("should reject registration with duplicate email (409 Conflict)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: "AnotherPassword123",
          fullName: "Duplicate User",
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error");
    });

    it("should reject invalid email format (400 Bad Request)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email-string",
          password: "Pass",
          fullName: "Test",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("details");
    });
  });

  // 2. Login Flow
  describe("POST /api/auth/login", () => {
    it("should authenticate with valid credentials and issue tokens", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe(testEmail);

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it("should reject invalid password (401 Unauthorized)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword!",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // 3. Refresh Token Rotation (RTR)
  describe("POST /api/auth/refresh", () => {
    it("should exchange valid refreshToken for new token pair and rotate token", async () => {
      const oldRefreshToken = refreshToken;

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: oldRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.refreshToken).not.toBe(oldRefreshToken);

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;

      // Replay attack test: Trying to use old revoked refresh token MUST fail
      const replayRes = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: oldRefreshToken });

      expect(replayRes.status).toBe(401);
    });
  });

  // 4. Demo Trader Session
  describe("POST /api/auth/demo", () => {
    it("should initialize a 1-tap Pro Trader session", async () => {
      const res = await request(app).post("/api/auth/demo").send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body.user.role).toBe("pro_trader");
    });
  });

  // 5. Google Authentication (OAuth 2.0 / Supabase)
  describe("POST /api/auth/google", () => {
    const googleId = "google_sub_109283746501";
    const googleEmail = `google_trader_${Date.now()}@gmail.com`;

    it("should provision a new account via Google Sign-In and issue tokens", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({
          email: googleEmail,
          fullName: "Priya Sharma",
          avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          googleId: googleId,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe(googleEmail);
      expect(res.body.user.full_name).toBe("Priya Sharma");
      expect(res.body.user.auth_provider).toBe("google");
      expect(res.body.user.google_id).toBe(googleId);
    });

    it("should log in existing user when same Google ID is presented", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({
          email: googleEmail,
          fullName: "Priya Sharma Updated",
          avatarUrl: "https://lh3.googleusercontent.com/a/new-avatar=s96-c",
          googleId: googleId,
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(googleEmail);
      expect(res.body.user.google_id).toBe(googleId);
    });
  });

  // 5. User Profile Endpoints
  describe("GET & PUT /api/user/profile", () => {
    it("should reject unauthenticated request without token (401)", async () => {
      const res = await request(app).get("/api/user/profile");
      expect(res.status).toBe(401);
    });

    it("should return authenticated user profile with Bearer token", async () => {
      const res = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.full_name).toBe("Rohan Verma");
    });

    it("should update user profile traits", async () => {
      const res = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          tradingHorizon: "intraday",
          defaultStock: "TCS.NS",
          primarySector: "IT",
        });

      expect(res.status).toBe(200);
      expect(res.body.user.trading_horizon).toBe("intraday");
      expect(res.body.user.default_stock).toBe("TCS.NS");
      expect(res.body.user.primary_sector).toBe("IT");
    });
  });

  // 6. ML Preferences & Custom Drift Sensitivity
  describe("GET & PUT /api/user/preferences", () => {
    it("should fetch user ML preferences", async () => {
      const res = await request(app)
        .get("/api/user/preferences")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.preferences).toHaveProperty("drift_threshold");
      expect(res.body.preferences.primary_baseline).toBe("Liu_Static");
    });

    it("should update ML drift sensitivity and baseline model", async () => {
      const res = await request(app)
        .put("/api/user/preferences")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          driftThreshold: 1.5,
          primaryBaseline: "LSTM",
          alertVolatilitySpike: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.preferences.drift_threshold).toBe(1.5);
      expect(res.body.preferences.primary_baseline).toBe("LSTM");
    });
  });

  // 7. Watchlist Management
  describe("Watchlist CRUD", () => {
    it("should add a stock to personalized watchlist", async () => {
      const res = await request(app)
        .post("/api/user/watchlist")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          symbol: "INFY.NS",
          notes: "Targeting breakout above 1850",
          targetEntryPrice: 1850.0,
          targetStopLoss: 1800.0,
        });

      expect(res.status).toBe(201);
      expect(res.body.item.symbol).toBe("INFY.NS");
      expect(res.body.item.notes).toBe("Targeting breakout above 1850");
    });

    it("should list active watchlist items", async () => {
      const res = await request(app)
        .get("/api/user/watchlist")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.watchlist).toBeInstanceOf(Array);
      expect(res.body.watchlist.some((i: any) => i.symbol === "INFY.NS")).toBe(true);
    });

    it("should remove stock from watchlist", async () => {
      const res = await request(app)
        .delete("/api/user/watchlist/INFY.NS")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app)
        .get("/api/user/watchlist")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(checkRes.body.watchlist.some((i: any) => i.symbol === "INFY.NS")).toBe(false);
    });
  });

  // 8. Keypad Scenario Simulation Bookmarks
  describe("Simulation Bookmarking", () => {
    it("should save a simulated scenario from Keypad modal", async () => {
      const res = await request(app)
        .post("/api/user/simulations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          symbol: "APOLLOHOSP.NS",
          inputPrice: 4320.0,
          scenarioType: "High Vol",
          simulatedAdaptiveReturn: 0.0215,
          simulatedStaticReturn: 0.0078,
          simulatedAdaptivePrice: 4412.88,
          simulatedStaticPrice: 4353.69,
          simulatedErrorReduction: 12.4,
          notes: "Stress test during elevated volatility regime",
        });

      expect(res.status).toBe(201);
      expect(res.body.simulation.symbol).toBe("APOLLOHOSP.NS");
      expect(res.body.simulation.scenario_type).toBe("High Vol");
    });

    it("should retrieve user simulation history", async () => {
      const res = await request(app)
        .get("/api/user/simulations")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.simulations.length).toBeGreaterThan(0);
      expect(res.body.simulations[0].symbol).toBe("APOLLOHOSP.NS");
    });
  });

  // 9. Activity Feed Audit Trail
  describe("GET /api/user/activity", () => {
    it("should return audit feed of user actions", async () => {
      const res = await request(app)
        .get("/api/user/activity")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.activity).toBeInstanceOf(Array);
      expect(res.body.activity.length).toBeGreaterThan(0);
    });
  });
});
