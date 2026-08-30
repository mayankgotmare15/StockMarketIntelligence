import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Check, ArrowLeft, Sparkles, SlidersHorizontal } from 'lucide-react';
import LogoIcon from '../LogoIcon';
import { useAuth } from '../../context/AuthContext';
import { useStock } from '../../context/StockContext';
import { checkApiHealth, NSE_UNIVERSE, getStockMeta } from '../../services/api';

export const UserTopNav: React.FC = () => {
  const { user } = useAuth();
  const { selectedTicker, setSelectedTicker } = useStock();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const testHealth = async () => {
      const healthy = await checkApiHealth();
      setApiOnline(healthy);
    };
    testHealth();
    const interval = setInterval(testHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUniverse = NSE_UNIVERSE.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const activeMeta = getStockMeta(selectedTicker);
  const sectors = ['ALL', 'Banking', 'IT', 'FMCG', 'Auto', 'Pharma'];

  return (
    <header className="sticky top-0 z-40 bg-[#F5F5F5]/90 backdrop-blur-md border-b border-black/10 px-6 py-3.5">
      <div className="max-w-[88rem] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand + Landing link */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 text-black hover:opacity-80 transition-opacity">
            <LogoIcon className="w-6 h-6 text-black" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium tracking-tight text-black">StockIntelligence</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-black/5 text-black/70 rounded-full border border-black/10">
                NSE v4
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-black/60 hover:text-black transition-colors pl-3 border-l border-black/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Overview</span>
          </Link>
        </div>

        {/* Center: Stock Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-white border border-black/10 hover:border-black/20 text-black px-4 py-1.5 rounded-full shadow-sm text-sm font-medium transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-black tracking-tight font-mono">{activeMeta.symbol}.NS</span>
              <span className="text-[11px] text-black/50 hidden md:inline">({activeMeta.name})</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-black/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-black/10 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-black/5 bg-[#F5F5F5]/60 space-y-2">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-black/40" />
                  <input
                    type="text"
                    placeholder="Search 30 NSE Equities or Sectors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full bg-white border border-black/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-black/30"
                  />
                </div>

                {/* Sector Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 text-[11px]">
                  {sectors.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSector(sec)}
                      className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                        selectedSector === sec
                          ? 'bg-black text-white font-medium'
                          : 'bg-black/5 text-black/60 hover:text-black'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto py-1 divide-y divide-black/5">
                {filteredUniverse.length === 0 ? (
                  <div className="py-6 text-center text-xs text-black/50">No stocks matching query</div>
                ) : (
                  filteredUniverse.map((stock) => {
                    const isSelected = stock.symbol === selectedTicker;
                    return (
                      <button
                        key={stock.symbol}
                        type="button"
                        onClick={() => {
                          setSelectedTicker(stock.symbol);
                          setIsDropdownOpen(false);
                          setSearchTerm('');
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-black/5 font-semibold text-black' : 'text-black/70 hover:bg-black/[0.02] hover:text-black'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-black">{stock.symbol}.NS</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-black/5 rounded text-black/60 font-medium">
                              {stock.sector}
                            </span>
                            {isSelected && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">Active</span>}
                          </div>
                          <span className="text-[11px] text-black/50 truncate max-w-[220px] mt-0.5">
                            {stock.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-black/70">₹{stock.basePrice}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Status + User Profile + Quick Action */}
        <div className="flex items-center gap-3">
          {/* API Health Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-black/10 text-xs font-medium">
            <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
            <span className="text-black/70 font-mono text-[11px]">{apiOnline ? 'API CONNECTED' : 'OFFLINE'}</span>
          </div>

          {/* User Profile Pill / Demo Switch */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 bg-white hover:bg-black/5 border border-black/10 px-3 py-1.5 rounded-full transition-colors text-xs font-medium text-black"
            title="Manage Investor Profile"
          >
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
              {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'VS'}
            </div>
            <span className="hidden md:inline max-w-[110px] truncate">{user?.full_name || 'Dr. Sethi'}</span>
          </button>

          {/* Quick Scenario Button */}
          <button
            type="button"
            onClick={() => navigate('/simulate')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-black text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Shock</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default UserTopNav;
