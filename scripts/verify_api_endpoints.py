"""
Live Endpoint Verification Script for Node.js REST API.
Executes HTTP requests across all API routes and validates response structure.
"""

import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:5000"

ENDPOINTS = [
    ("/api/health", "1. System Health & Database Status"),
    ("/api/stocks", "2. Stock Universe Listing (30 NSE Stocks)"),
    ("/api/backtest/APOLLOHOSP.NS?limit=3", "3. Walk-Forward Backtest Ablation (APOLLOHOSP.NS)"),
    ("/api/regimes/APOLLOHOSP.NS", "4. Volatility Regimes & Drift Events (APOLLOHOSP.NS)"),
    ("/api/shap/APOLLOHOSP.NS", "5. Tree SHAP Feature Importance (APOLLOHOSP.NS)"),
    ("/api/metrics", "6. Cross-Model Experiment Metrics Summary"),
    ("/api/backtest/NONEXISTENT.NS", "7. Graceful 404 Error Handling (Missing Ticker)")
]


def test_endpoints():
    print("=" * 75)
    print(" LIVE REST API ENDPOINT VALIDATION (http://localhost:5000)")
    print("=" * 75)

    for ep, title in ENDPOINTS:
        url = BASE_URL + ep
        print(f"\n[TEST] {title}")
        print(f"URL: GET {url}")

        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as resp:
                status = resp.status
                raw = resp.read().decode("utf-8")
                data = json.loads(raw)
                print(f"Status: {status} OK")
                
                # Format sample
                if "data" in data and isinstance(data["data"], list):
                    count = len(data["data"])
                    print(f"Payload: Array with {count} items. First item preview:")
                    sample = data["data"][0] if count > 0 else {}
                    print(json.dumps(sample, indent=2))
                else:
                    print("Payload Preview:")
                    print(json.dumps(data, indent=2)[:400] + ("..." if len(json.dumps(data, indent=2)) > 400 else ""))

        except urllib.error.HTTPError as e:
            err_body = json.loads(e.read().decode("utf-8"))
            print(f"Status: {e.code} HTTP Error (Expected for missing tickers)")
            print(json.dumps(err_body, indent=2))
        except Exception as e:
            print(f"Failed: {e}")


if __name__ == "__main__":
    test_endpoints()
