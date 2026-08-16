const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();

export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ok' || data.status === 'online';
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};

export const getStocks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/stocks`);
    if (!response.ok) throw new Error('Failed to fetch stocks');
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.stocks || data.data || []);
    return list.map(item => typeof item === 'string' ? item : (item.symbol ? item.symbol.replace('.NS', '') : item.ticker));
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return ['INFY', 'TCS', 'RELIANCE', 'HDFCBANK', 'ICICIBANK', 'APOLLOHOSP'];
  }
};

export const getStockResults = async (ticker) => {
  try {
    const cleanTicker = ticker ? ticker.replace('.NS', '') : 'INFY';
    const symbol = `${cleanTicker}.NS`;
    const response = await fetch(`${BASE_URL}/api/backtest/${symbol}?limit=300`);
    if (!response.ok) {
      // Fallback: try raw ticker if symbol not found
      const retryResp = await fetch(`${BASE_URL}/api/backtest/${cleanTicker}?limit=300`);
      if (!retryResp.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await retryResp.json();
      return normalizeRows(data, cleanTicker);
    }
    const data = await response.json();
    return normalizeRows(data, cleanTicker);
  } catch (error) {
    console.error(`Error fetching results for ${ticker}:`, error);
    throw error;
  }
};

function normalizeRows(data, ticker) {
  const rows = Array.isArray(data) ? data : (data.data || data.results || []);
  return rows.map((r) => {
    const actualPrice = Number(r.actual_price || r.Actual_Price || 0);
    const actualReturn = r.actual_return !== undefined ? Number(r.actual_return) : 0;
    const returnPct = r.Actual_Return_Pct !== undefined ? Number(r.Actual_Return_Pct) : actualReturn * 100;
    
    const staticPrice = Number(r.y_hat_static_price || r.y_hat_Static || actualPrice * (1 + (r.y_hat_static || 0)));
    const adaptivePrice = Number(r.y_hat_adaptive_price || r.y_hat_Adaptive || actualPrice * (1 + (r.y_hat_adaptive || 0)));

    return {
      Date: r.date || r.Date,
      date: r.date || r.Date,
      Ticker: ticker,
      Actual_Price: actualPrice,
      actual_price: actualPrice,
      Actual_Return: actualReturn,
      Actual_Return_Pct: returnPct,
      y_hat_Static: staticPrice,
      y_hat_static_price: staticPrice,
      y_hat_Adaptive: adaptivePrice,
      y_hat_adaptive_price: adaptivePrice,
      Regime_Flag: r.regime_flag || r.Regime_Flag || 'Low',
      regime_flag: r.regime_flag || r.Regime_Flag || 'Low',
      drift_detected: r.drift_detected || false,
      z_score: Number(r.z_score || 0)
    };
  });
}

export const getModelComparison = async (ticker) => {
  try {
    const symbol = ticker ? (ticker.endsWith('.NS') ? ticker : `${ticker}.NS`) : '';
    const response = await fetch(`${BASE_URL}/api/metrics${symbol ? `?symbol=${symbol}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return await response.json();
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
};

export const getRegimeTimeline = async (ticker) => {
  try {
    const cleanTicker = ticker ? ticker.replace('.NS', '') : 'INFY';
    const symbol = `${cleanTicker}.NS`;
    const response = await fetch(`${BASE_URL}/api/regimes/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch regimes');
    const res = await response.json();
    return res.distribution || res.data || [];
  } catch (error) {
    console.error("Error fetching regimes:", error);
    return [];
  }
};

export const getShapData = async (ticker) => {
  try {
    const cleanTicker = ticker ? ticker.replace('.NS', '') : 'INFY';
    const symbol = `${cleanTicker}.NS`;
    const response = await fetch(`${BASE_URL}/api/shap/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch SHAP data');
    const res = await response.json();
    const list = Array.isArray(res) ? res : (res.global_feature_ranking || res.data || []);
    return list;
  } catch (error) {
    console.error("Error fetching SHAP data:", error);
    return null;
  }
};
