import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Activity,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStock } from '../../context/StockContext';
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getUserActivity,
  ActivityItem,
  NSE_UNIVERSE,
} from '../../services/api';

export const ProfilePage: React.FC = () => {
  const { user, setUser, loginDemo } = useAuth();
  const { stocks } = useStock();

  // Profile form
  const [fullName, setFullName] = useState<string>(user?.full_name || 'Dr. Vikram Sethi');
  const [role, setRole] = useState<string>(user?.role || 'Quantitative Portfolio Manager');
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>(
    user?.risk_tolerance || 'moderate'
  );
  const [tradingHorizon, setTradingHorizon] = useState<'intraday' | 'swing' | 'positional'>(
    user?.trading_horizon || 'swing'
  );
  const [defaultStock, setDefaultStock] = useState<string>(user?.default_stock || 'INFY');

  // Preferences form
  const [driftThreshold, setDriftThreshold] = useState<number>(2.0);
  const [primaryBaseline, setPrimaryBaseline] = useState<string>('XGBoost Baseline');
  const [alertVolSpike, setAlertVolSpike] = useState<boolean>(true);
  const [alertDrift, setAlertDrift] = useState<boolean>(true);

  // Activity feed
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [_loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);
  const [savedMessage, setSavedMessage] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profile, prefs, acts] = await Promise.allSettled([
          getUserProfile(),
          getUserPreferences(),
          getUserActivity(10),
        ]);

        if (profile.status === 'fulfilled' && profile.value) {
          setUser(profile.value);
          setFullName(profile.value.full_name);
          setRole(profile.value.role);
          setRiskTolerance(profile.value.risk_tolerance);
          setTradingHorizon(profile.value.trading_horizon);
          setDefaultStock(profile.value.default_stock);
        }

        if (prefs.status === 'fulfilled' && prefs.value) {
          setDriftThreshold(prefs.value.drift_threshold || 2.0);
          setPrimaryBaseline(prefs.value.primary_baseline || 'XGBoost Baseline');
          setAlertVolSpike(prefs.value.alert_volatility_spike ?? true);
          setAlertDrift(prefs.value.alert_drift_detected ?? true);
        }

        if (acts.status === 'fulfilled' && acts.value) {
          setActivities(acts.value);
        }
      } catch (err) {
        console.error('Error loading profile settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateUserProfile({
        fullName,
        role,
        riskTolerance,
        tradingHorizon,
        defaultStock,
      } as any);
      setUser(updated);
      setSavedMessage('Profile updated successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await updateUserPreferences({
        drift_threshold: driftThreshold,
        primary_baseline: primaryBaseline,
        alert_volatility_spike: alertVolSpike,
        alert_drift_detected: alertDrift,
      });
      setSavedMessage('ML preferences calibrated!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-1">
            Account Management • Quantitative Settings
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-black">
            Investor Profile &amp; ML Calibration
          </h1>
          <p className="text-sm text-black/60 mt-1">
            Configure your personal investment persona, residual drift sensitivity triggers, and notification alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loginDemo()}
          className="inline-flex items-center gap-2 bg-black/5 hover:bg-black/10 text-black border border-black/10 text-xs font-medium px-4 py-2 rounded-full transition-colors self-start md:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reset Demo Profile</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main 2-Column Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Investor Persona */}
        <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <User className="w-4 h-4 text-black/60" />
            <h2 className="text-base font-medium text-black">Investor Persona &amp; Style</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-black/70 font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-black/70 font-medium mb-1.5">Professional Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-black/70 font-medium mb-1.5">Risk Tolerance</label>
                <select
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                  className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <div>
                <label className="block text-black/70 font-medium mb-1.5">Trading Horizon</label>
                <select
                  value={tradingHorizon}
                  onChange={(e) => setTradingHorizon(e.target.value as any)}
                  className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                >
                  <option value="intraday">Intraday</option>
                  <option value="swing">Swing (2-20 Days)</option>
                  <option value="positional">Positional (Months)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-black/70 font-medium mb-1.5">Primary Default Stock</label>
              <select
                value={defaultStock}
                onChange={(e) => setDefaultStock(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
              >
                {NSE_UNIVERSE.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol}.NS — {s.name} ({s.sector})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Updating...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: ML Tuning & Sensitivity */}
        <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <Sliders className="w-4 h-4 text-black/60" />
            <h2 className="text-base font-medium text-black">Adaptive ML Drift Sensitivity</h2>
          </div>

          <div className="space-y-5 text-xs">
            {/* Drift Threshold Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-black/80 font-medium">
                  Residual Drift Trigger Threshold (|z|-score)
                </label>
                <span className="font-mono font-bold text-sm text-black">|z| &gt; {driftThreshold.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={driftThreshold}
                onChange={(e) => setDriftThreshold(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/40 mt-1 font-mono">
                <span>1.0 (Sensitive)</span>
                <span>2.0 (Default Empirical)</span>
                <span>3.5 (Conservative)</span>
              </div>
              <p className="text-[11px] text-black/60 mt-2 leading-relaxed">
                When the 30-day rolling z-score of prediction residuals exceeds this boundary, an online 60-day Ridge re-fit is automatically executed.
              </p>
            </div>

            {/* Benchmark model selector */}
            <div>
              <label className="block text-black/70 font-medium mb-1.5">Primary Comparison Baseline</label>
              <select
                value={primaryBaseline}
                onChange={(e) => setPrimaryBaseline(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
              >
                <option value="XGBoost Baseline">XGBoost Baseline</option>
                <option value="Random Forest Baseline">Random Forest Baseline</option>
                <option value="PyTorch LSTM">PyTorch LSTM</option>
                <option value="PyTorch ANN">PyTorch ANN</option>
              </select>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-3 pt-2 border-t border-black/5">
              <span className="font-semibold text-black block">Alert Preferences</span>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertVolSpike}
                  onChange={(e) => setAlertVolSpike(e.target.checked)}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="text-black/80">Notify when stock enters High Volatility Regime (ATR Tercile 3)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertDrift}
                  onChange={(e) => setAlertDrift(e.target.checked)}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="text-black/80">Notify when concept drift condition is triggered (|z| &gt; {driftThreshold})</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPrefs ? 'Calibrating...' : 'Update ML Calibration'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Audit Feed */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-black/60" />
            <h3 className="text-base font-medium text-black">Audit Trail &amp; Recent Activity</h3>
          </div>
          <span className="text-xs font-mono text-black/40">Backend Event Log</span>
        </div>

        <div className="divide-y divide-black/5 text-xs">
          {activities.map((act) => (
            <div key={act.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-black/40 mt-1.5" />
                <div>
                  <span className="font-semibold text-black">{act.title}</span>
                  <p className="text-black/60 mt-0.5">{act.description}</p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-black/40 shrink-0">
                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
