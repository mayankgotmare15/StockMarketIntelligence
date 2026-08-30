// API service client with full TypeScript types and backend connectivity
const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();

// Helper to retrieve auth token
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface StockResultRow {
  Date: string;
  date: string;
  Ticker: string;
  Actual_Price: number;
  actual_price: number;
  Actual_Return: number;
  Actual_Return_Pct: number;
  y_hat_Static: number;
  y_hat_static_price: number;
  y_hat_Adaptive: number;
  y_hat_adaptive_price: number;
  Regime_Flag: string;
  regime_flag: string;
  drift_detected: boolean;
  z_score: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  trading_horizon: 'intraday' | 'swing' | 'positional';
  default_stock: string;
  primary_sector: string;
  avatar_url?: string;
}

export interface UserPreferences {
  drift_threshold: number;
  primary_baseline: string;
  alert_volatility_spike: boolean;
  alert_drift_detected: boolean;
  biometric_enabled: boolean;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  notes?: string;
  target_entry_price?: number;
  target_stop_loss?: number;
  created_at: string;
}

export interface SimulationItem {
  id: string;
  user_id: string;
  symbol: string;
  input_price: number;
  scenario_type: string;
  simulated_adaptive_return: number;
  simulated_static_return: number;
  simulated_adaptive_price: number;
  simulated_static_price: number;
  simulated_error_reduction: number;
  notes?: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  action: string;
  title: string;
  description: string;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Health & Base Data
// ----------------------------------------------------------------------------

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ok' || data.status === 'online';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export interface StockMeta {
  symbol: string;
  name: string;
  sector: 'Banking' | 'IT' | 'FMCG' | 'Auto' | 'Pharma' | 'Diversified';
  basePrice: number;
}

export const NSE_UNIVERSE: StockMeta[] = [
  // Banking & Finance (6)
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking', basePrice: 1630 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Banking', basePrice: 1210 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', basePrice: 815 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', basePrice: 1780 },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', sector: 'Banking', basePrice: 1140 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', sector: 'Banking', basePrice: 6950 },

  // IT & Technology (6)
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', basePrice: 4120 },
  { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT', basePrice: 1842 },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'IT', basePrice: 535 },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', basePrice: 1680 },
  { symbol: 'TECHM', name: 'Tech Mahindra Limited', sector: 'IT', basePrice: 1510 },
  { symbol: 'LTIM', name: 'LTIMindtree Limited', sector: 'IT', basePrice: 5420 },

  // FMCG & Consumption (5)
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', basePrice: 495 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', basePrice: 2680 },
  { symbol: 'NESTLEIND', name: 'Nestle India Limited', sector: 'FMCG', basePrice: 2450 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'FMCG', basePrice: 5890 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products', sector: 'FMCG', basePrice: 1120 },

  // Automobile (5)
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', sector: 'Auto', basePrice: 12400 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Auto', basePrice: 980 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Auto', basePrice: 2750 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Limited', sector: 'Auto', basePrice: 9650 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Limited', sector: 'Auto', basePrice: 4820 },

  // Pharma & Healthcare (5)
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', basePrice: 1750 },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Labs", sector: 'Pharma', basePrice: 6540 },
  { symbol: 'CIPLA', name: 'Cipla Limited', sector: 'Pharma', basePrice: 1560 },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', sector: 'Pharma', basePrice: 6890 },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories", sector: 'Pharma', basePrice: 4850 },

  // Diversified & Energy (3)
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Diversified', basePrice: 2980 },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Diversified', basePrice: 3580 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Diversified', basePrice: 1480 },
];

export const getStockMeta = (ticker: string): StockMeta => {
  const clean = ticker.replace('.NS', '').toUpperCase();
  const found = NSE_UNIVERSE.find((s) => s.symbol === clean);
  return found || { symbol: clean, name: `${clean} Equities`, sector: 'Diversified', basePrice: 1500 };
};

export const getStocks = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/stocks`);
    if (!response.ok) throw new Error('Failed to fetch stocks');
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.stocks || data.data || []);
    if (list.length === 0) return NSE_UNIVERSE.map((s) => s.symbol);
    return list.map((item: any) =>
      typeof item === 'string'
        ? item
        : item.symbol
        ? item.symbol.replace('.NS', '')
        : item.ticker
    );
  } catch (error) {
    return NSE_UNIVERSE.map((s) => s.symbol);
  }
};

export const getStockResults = async (ticker: string): Promise<StockResultRow[]> => {
  try {
    const cleanTicker = ticker ? ticker.replace('.NS', '') : 'INFY';
    const symbol = `${cleanTicker}.NS`;
    const response = await fetch(`${BASE_URL}/api/backtest/${symbol}?limit=300`);
    if (!response.ok) {
      const retryResp = await fetch(`${BASE_URL}/api/backtest/${cleanTicker}?limit=300`);
      if (!retryResp.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await retryResp.json();
      return normalizeRows(data, cleanTicker);
    }
    const data = await response.json();
    return normalizeRows(data, cleanTicker);
  } catch (error) {
    return generateFallbackResults(ticker || 'INFY');
  }
};

function normalizeRows(data: any, ticker: string): StockResultRow[] {
  const rows = Array.isArray(data) ? data : (data.data || data.results || []);
  return rows.map((r: any) => {
    const actualPrice = Number(r.actual_price || r.Actual_Price || 0);
    const actualReturn = r.actual_return !== undefined ? Number(r.actual_return) : 0;
    const returnPct = r.Actual_Return_Pct !== undefined ? Number(r.Actual_Return_Pct) : actualReturn * 100;
    const staticPrice = Number(r.y_hat_static_price || r.y_hat_Static || actualPrice * (1 + (r.y_hat_static || 0)));
    const adaptivePrice = Number(r.y_hat_adaptive_price || r.y_hat_Adaptive || actualPrice * (1 + (r.y_hat_adaptive || 0)));

    return {
      Date: r.date || r.Date || new Date().toISOString().split('T')[0],
      date: r.date || r.Date || new Date().toISOString().split('T')[0],
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
      drift_detected: Boolean(r.drift_detected),
      z_score: Number(r.z_score || 0),
    };
  });
}

function generateFallbackResults(ticker: string): StockResultRow[] {
  const meta = getStockMeta(ticker);
  const basePrice = meta.basePrice;
  const results: StockResultRow[] = [];
  const now = new Date();

  for (let i = 120; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const noise = (Math.sin(i * 0.15) * 0.02) + ((Math.random() - 0.49) * 0.015);
    const price = basePrice * (1 + noise + ((120 - i) * 0.0008));
    const ret = noise;
    const staticPred = price * (1 + noise * 0.65);
    const adaptivePred = price * (1 + noise * 0.88);
    const zScore = Math.abs(noise / 0.012);
    const regime = zScore > 2.0 ? 'High' : zScore > 1.2 ? 'Medium' : 'Low';

    results.push({
      Date: d.toISOString().split('T')[0],
      date: d.toISOString().split('T')[0],
      Ticker: meta.symbol,
      Actual_Price: price,
      actual_price: price,
      Actual_Return: ret,
      Actual_Return_Pct: ret * 100,
      y_hat_Static: staticPred,
      y_hat_static_price: staticPred,
      y_hat_Adaptive: adaptivePred,
      y_hat_adaptive_price: adaptivePred,
      Regime_Flag: regime,
      regime_flag: regime,
      drift_detected: zScore > 2.0,
      z_score: zScore,
    });
  }
  return results;
}

export const getModelComparison = async (ticker: string) => {
  try {
    const symbol = ticker ? (ticker.endsWith('.NS') ? ticker : `${ticker}.NS`) : '';
    const response = await fetch(`${BASE_URL}/api/metrics${symbol ? `?symbol=${symbol}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return null;
  }
};

export const getRegimeTimeline = async (ticker: string) => {
  try {
    const cleanTicker = ticker ? ticker.replace('.NS', '') : 'INFY';
    const symbol = `${cleanTicker}.NS`;
    const response = await fetch(`${BASE_URL}/api/regimes/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch regimes');
    const res = await response.json();
    return res.distribution || res.data || [];
  } catch (error) {
    console.error('Error fetching regimes:', error);
    return [];
  }
};

export const getShapData = async (ticker: string) => {
  try {
    const cleanTicker = ticker ? ticker.replace('.NS', '') : 'INFY';
    const symbol = `${cleanTicker}.NS`;
    const response = await fetch(`${BASE_URL}/api/shap/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch SHAP data');
    const res = await response.json();
    return Array.isArray(res) ? res : (res.global_feature_ranking || res.data || []);
  } catch (error) {
    console.error('Error fetching SHAP data:', error);
    return null;
  }
};

// ----------------------------------------------------------------------------
// Authentication & User APIs
// ----------------------------------------------------------------------------

export const loginDemoUser = async (): Promise<{ user: UserProfile; accessToken: string; refreshToken: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Demo login failed');
    const data = await response.json();
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Demo login API fallback:', error);
    const mockUser: UserProfile = {
      id: 'demo-investor-01',
      email: 'demo.investor@stockmarketintelligence.ai',
      full_name: 'Dr. Vikram Sethi',
      role: 'Quantitative Portfolio Manager',
      risk_tolerance: 'moderate',
      trading_horizon: 'swing',
      default_stock: 'INFY',
      primary_sector: 'Technology & IT Services',
    };
    localStorage.setItem('access_token', 'demo-token-mock');
    localStorage.setItem('user_profile', JSON.stringify(mockUser));
    return {
      user: mockUser,
      accessToken: 'demo-token-mock',
      refreshToken: 'demo-refresh-mock',
    };
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    const data = await response.json();
    return data.user;
  } catch (error) {
    const cached = localStorage.getItem('user_profile');
    if (cached) return JSON.parse(cached);
    return null;
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetch(`${BASE_URL}/api/user/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  const data = await response.json();
  if (data.user) {
    localStorage.setItem('user_profile', JSON.stringify(data.user));
  }
  return data.user;
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch preferences');
    const data = await response.json();
    return data.preferences;
  } catch (error) {
    return {
      drift_threshold: 2.0,
      primary_baseline: 'XGBoost Baseline',
      alert_volatility_spike: true,
      alert_drift_detected: true,
      biometric_enabled: false,
    };
  }
};

export const updateUserPreferences = async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    const data = await response.json();
    return data.preferences;
  } catch (error) {
    return updates as UserPreferences;
  }
};

export const getUserWatchlist = async (): Promise<WatchlistItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/watchlist`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch watchlist');
    const data = await response.json();
    return data.watchlist || [];
  } catch (error) {
    const local = localStorage.getItem('local_watchlist');
    if (local) return JSON.parse(local);
    return [
      { id: '1', user_id: 'demo', symbol: 'INFY.NS', notes: 'Core IT long allocation', target_entry_price: 1800, target_stop_loss: 1720, created_at: new Date().toISOString() },
      { id: '2', user_id: 'demo', symbol: 'TCS.NS', notes: 'Stable large-cap compounder', target_entry_price: 4050, target_stop_loss: 3900, created_at: new Date().toISOString() },
      { id: '3', user_id: 'demo', symbol: 'RELIANCE.NS', notes: 'Energy & Retail swing play', target_entry_price: 2900, target_stop_loss: 2800, created_at: new Date().toISOString() },
      { id: '4', user_id: 'demo', symbol: 'HDFCBANK.NS', notes: 'Banking credit cycle proxy', target_entry_price: 1600, target_stop_loss: 1540, created_at: new Date().toISOString() },
    ];
  }
};

export const addToWatchlist = async (payload: { symbol: string; notes?: string; targetEntryPrice?: number; targetStopLoss?: number }): Promise<WatchlistItem> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/watchlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to add to watchlist');
    const data = await response.json();
    return data.item;
  } catch (error) {
    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      user_id: 'demo',
      symbol: payload.symbol.endsWith('.NS') ? payload.symbol : `${payload.symbol}.NS`,
      notes: payload.notes || '',
      target_entry_price: payload.targetEntryPrice,
      target_stop_loss: payload.targetStopLoss,
      created_at: new Date().toISOString(),
    };
    const current = await getUserWatchlist();
    const updated = [newItem, ...current];
    localStorage.setItem('local_watchlist', JSON.stringify(updated));
    return newItem;
  }
};

export const removeFromWatchlist = async (symbol: string): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/api/user/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (error) {
    // fallback local
    const current = await getUserWatchlist();
    const cleanSym = symbol.replace('.NS', '');
    const updated = current.filter(item => !item.symbol.includes(cleanSym));
    localStorage.setItem('local_watchlist', JSON.stringify(updated));
  }
};

export const getUserSimulations = async (): Promise<SimulationItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/simulations`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch simulations');
    const data = await response.json();
    return data.simulations || [];
  } catch (error) {
    const local = localStorage.getItem('local_simulations');
    if (local) return JSON.parse(local);
    return [
      {
        id: 'sim-1',
        user_id: 'demo',
        symbol: 'INFY.NS',
        input_price: 1750,
        scenario_type: 'Flash Shock (-5%)',
        simulated_adaptive_return: -4.1,
        simulated_static_return: -2.2,
        simulated_adaptive_price: 1764,
        simulated_static_price: 1798,
        simulated_error_reduction: 9.8,
        notes: 'Simulated market selloff following high US inflation print',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }
};

export const saveSimulation = async (payload: any): Promise<SimulationItem> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/simulations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to save simulation');
    const data = await response.json();
    return data.simulation;
  } catch (error) {
    const newSim: SimulationItem = {
      id: Date.now().toString(),
      user_id: 'demo',
      symbol: payload.symbol,
      input_price: payload.inputPrice,
      scenario_type: payload.scenarioType,
      simulated_adaptive_return: payload.simulatedAdaptiveReturn,
      simulated_static_return: payload.simulatedStaticReturn,
      simulated_adaptive_price: payload.simulatedAdaptivePrice,
      simulated_static_price: payload.simulatedStaticPrice,
      simulated_error_reduction: payload.simulatedErrorReduction,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };
    const current = await getUserSimulations();
    const updated = [newSim, ...current];
    localStorage.setItem('local_simulations', JSON.stringify(updated));
    return newSim;
  }
};

export const getUserActivity = async (limit = 20): Promise<ActivityItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/activity?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activity');
    const data = await response.json();
    return data.activity || [];
  } catch (error) {
    return [
      {
        id: 'act-1',
        user_id: 'demo',
        action: 'simulation_run',
        title: 'Scenario Simulated',
        description: 'Executed Flash Shock (-5%) scenario for INFY.NS at ₹1,750.00.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'act-2',
        user_id: 'demo',
        action: 'watchlist_add',
        title: 'Added to Watchlist',
        description: 'Added RELIANCE.NS to active tracking portfolio.',
        created_at: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'act-3',
        user_id: 'demo',
        action: 'preferences_update',
        title: 'ML Settings Updated',
        description: 'Residual drift threshold calibrated to |z| > 2.0.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'act-4',
        user_id: 'demo',
        action: 'auth_login',
        title: 'Platform Session Started',
        description: 'Authenticated via Demo Quantitative Investor profile.',
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  }
};
