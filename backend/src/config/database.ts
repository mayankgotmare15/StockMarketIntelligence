import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import duckdb from "duckdb";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Enable automatic BigInt serialization to Number for JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

dotenv.config({ path: path.resolve(PROJECT_ROOT, ".env") });
dotenv.config(); // fallback to local .env

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";

// Robust path resolution for DuckDB
let duckdbPathCandidate = path.resolve(PROJECT_ROOT, "data/market_intelligence.duckdb");
if (!fs.existsSync(duckdbPathCandidate)) {
  const envPath = process.env.DUCKDB_PATH;
  if (envPath && fs.existsSync(envPath)) {
    duckdbPathCandidate = envPath;
  }
}
const DUCKDB_PATH = duckdbPathCandidate;

let supabaseClient: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes("your-project")) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(`[Database] Supabase client initialized: ${SUPABASE_URL}`);
  } catch (err) {
    console.warn(`[Database] Failed to initialize Supabase client:`, err);
  }
}

// Local DuckDB connection instance
let duckDbInstance: duckdb.Database | null = null;
try {
  duckDbInstance = new duckdb.Database(DUCKDB_PATH, duckdb.OPEN_READONLY);
  console.log(`[Database] DuckDB connected at: ${DUCKDB_PATH}`);
} catch (err) {
  console.warn(`[Database] Failed to open DuckDB:`, err);
}

export function getDuckDB(): Promise<duckdb.Connection> {
  return new Promise((resolve, reject) => {
    if (!duckDbInstance) {
      return reject(new Error("DuckDB instance not initialized"));
    }
    const conn = duckDbInstance.connect();
    resolve(conn);
  });
}

function sanitizeDuckDBResult(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return Number(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeDuckDBResult);
  if (typeof obj === "object") {
    const res: any = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = sanitizeDuckDBResult(v);
    }
    return res;
  }
  return obj;
}

export function queryDuckDB<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const conn = await getDuckDB();
      conn.all(sql, ...(params as any), (err: Error | null, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(sanitizeDuckDBResult(rows) || []);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

export async function getDatabaseStatus(): Promise<{
  supabaseConnected: boolean;
  duckDbConnected: boolean;
  activeSource: "supabase" | "duckdb" | "none";
  duckDbPath: string;
}> {
  const supabaseConnected = supabaseClient !== null;
  let duckDbConnected = false;
  try {
    const res = await queryDuckDB("SELECT 1 AS ok");
    duckDbConnected = res.length > 0;
  } catch {
    duckDbConnected = false;
  }

  return {
    supabaseConnected,
    duckDbConnected,
    activeSource: supabaseConnected ? "supabase" : duckDbConnected ? "duckdb" : "none",
    duckDbPath: DUCKDB_PATH,
  };
}
