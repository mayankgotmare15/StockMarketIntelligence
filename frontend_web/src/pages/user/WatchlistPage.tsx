import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useStock } from '../../context/StockContext';
import {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  WatchlistItem,
  NSE_UNIVERSE,
} from '../../services/api';

export const WatchlistPage: React.FC = () => {
  const { stocks, setSelectedTicker } = useStock();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add form fields
  const [newSymbol, setNewSymbol] = useState<string>(stocks[0] || 'INFY');
  const [targetEntry, setTargetEntry] = useState<string>('');
  const [targetStopLoss, setTargetStopLoss] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const items = await getUserWatchlist();
      setWatchlist(items);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addToWatchlist({
        symbol: newSymbol,
        targetEntryPrice: targetEntry ? parseFloat(targetEntry) : undefined,
        targetStopLoss: targetStopLoss ? parseFloat(targetStopLoss) : undefined,
        notes: notes || undefined,
      });
      setShowAddModal(false);
      setTargetEntry('');
      setTargetStopLoss('');
      setNotes('');
      await fetchWatchlist();
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist((prev) => prev.filter((item) => !item.symbol.includes(symbol.replace('.NS', ''))));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  const handleSelectAndNavigate = (symbol: string) => {
    setSelectedTicker(symbol.replace('.NS', ''));
    navigate('/dashboard');
  };

  // Mock static metadata for display
  const getStockMeta = (sym: string) => {
    const clean = sym.replace('.NS', '').toUpperCase();
    const map: Record<string, { name: string; price: number; ret: number; regime: string; drift: boolean }> = {
      INFY: { name: 'Infosys Limited', price: 1842.5, ret: 1.45, regime: 'Low', drift: false },
      TCS: { name: 'Tata Consultancy Services', price: 4120.0, ret: -0.32, regime: 'Medium', drift: false },
      RELIANCE: { name: 'Reliance Industries', price: 2980.1, ret: 2.1, regime: 'High', drift: true },
      HDFCBANK: { name: 'HDFC Bank Limited', price: 1630.0, ret: 0.12, regime: 'Low', drift: false },
      ICICIBANK: { name: 'ICICI Bank Limited', price: 1210.4, ret: 0.85, regime: 'Medium', drift: false },
      MARUTI: { name: 'Maruti Suzuki India', price: 12400.0, ret: -1.15, regime: 'High', drift: false },
      SUNPHARMA: { name: 'Sun Pharma Industries', price: 1750.8, ret: 0.65, regime: 'Low', drift: false },
      APOLLOHOSP: { name: 'Apollo Hospitals', price: 6890.0, ret: 1.82, regime: 'Medium', drift: false },
      ITC: { name: 'ITC Limited', price: 495.2, ret: -0.15, regime: 'Low', drift: false },
    };
    return map[clean] || { name: `${clean} Equities`, price: 1500, ret: 0.5, regime: 'Low', drift: false };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-black/50 block mb-1">
            Personal Investment Portfolio • Multi-Asset Monitor
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-black">
            Active Watchlist &amp; Alerts
          </h1>
          <p className="text-sm text-black/60 mt-1">
            Real-time monitoring across your selected Indian equities for concept drift and volatility regime shifts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-black text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Equity to Track</span>
        </button>
      </div>

      {/* Watchlist Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-black/60" />
            <h2 className="text-base font-medium text-black">Tracked Equities ({watchlist.length})</h2>
          </div>
          <span className="text-xs text-black/50 font-mono">Synced with User Profile</span>
        </div>

        {watchlist.length === 0 ? (
          <div className="py-16 text-center text-xs text-black/50 space-y-3">
            <Bookmark className="w-8 h-8 mx-auto text-black/20" />
            <p>Your watchlist is currently empty.</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-black font-semibold underline underline-offset-4"
            >
              Add your first equity
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.02] text-black/60 font-medium text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Symbol &amp; Company</th>
                  <th className="py-4 px-6 text-right">Market Price</th>
                  <th className="py-4 px-6 text-right">1D Return</th>
                  <th className="py-4 px-6 text-center">Regime</th>
                  <th className="py-4 px-6 text-center">Drift Status</th>
                  <th className="py-4 px-6 text-right">Target Entry</th>
                  <th className="py-4 px-6">Notes / Thesis</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-black">
                {watchlist.map((item) => {
                  const meta = getStockMeta(item.symbol);
                  return (
                    <tr key={item.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleSelectAndNavigate(item.symbol)}
                          className="text-left group"
                        >
                          <div className="flex items-center gap-1.5 font-bold font-mono text-black group-hover:text-emerald-700 transition-colors">
                            <span>{item.symbol}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-xs text-black/50">{meta.name}</span>
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-medium">
                        ₹{meta.price.toFixed(2)}
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-medium">
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs ${
                            meta.ret >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {meta.ret >= 0 ? '+' : ''}{meta.ret.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                            meta.regime === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : meta.regime === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {meta.regime} Vol
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        {meta.drift ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Drift Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-black/50">Normal</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-xs">
                        {item.target_entry_price ? `₹${item.target_entry_price.toFixed(0)}` : '—'}
                      </td>

                      <td className="py-4 px-6 text-xs text-black/60 max-w-[200px] truncate">
                        {item.notes || '—'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAndNavigate(item.symbol)}
                            className="p-1.5 rounded-full hover:bg-black/5 text-black/70 hover:text-black transition-colors"
                            title="Inspect in Dashboard"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.symbol)}
                            className="p-1.5 rounded-full hover:bg-rose-50 text-black/40 hover:text-rose-600 transition-colors"
                            title="Remove Stock"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-medium text-black">Add Stock to Watchlist</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-black/5 text-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-black/70 font-medium mb-1.5">NSE Equity Symbol</label>
                <select
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                >
                  {NSE_UNIVERSE.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol}.NS — {s.name} ({s.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-black/70 font-medium mb-1.5">Target Entry (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1800"
                    value={targetEntry}
                    onChange={(e) => setTargetEntry(e.target.value)}
                    className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-black/70 font-medium mb-1.5">Stop Loss (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1720"
                    value={targetStopLoss}
                    onChange={(e) => setTargetStopLoss(e.target.value)}
                    className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-black/70 font-medium mb-1.5">Investment Thesis / Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Expecting margin expansion in next quarter results..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-black/10 text-black/70 hover:text-black text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Save to Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
