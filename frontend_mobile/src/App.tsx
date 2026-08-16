import React, { useState, useEffect } from "react";
import { DeviceFrame } from "./components/DeviceFrame";
import { BottomNavBar } from "./components/BottomNavBar";
import { HomeScreen } from "./components/HomeScreen";
import { ActivityScreen } from "./components/ActivityScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { ShapScreen } from "./components/ShapScreen";
import { KeypadModal } from "./components/KeypadModal";
import {
  fetchStocks,
  fetchBacktest,
  fetchRegimes,
  fetchShap,
  fetchMetrics,
} from "./services/api";
import {
  StockMetadata,
  BacktestRow,
  RegimeDistributionItem,
  ShapRankingItem,
  ModelMetricSummary,
  ActiveTab,
} from "./types";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [stocks, setStocks] = useState<StockMetadata[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>("APOLLOHOSP.NS");
  const [backtestData, setBacktestData] = useState<BacktestRow[]>([]);
  const [regimeData, setRegimeData] = useState<{
    distribution: RegimeDistributionItem[];
    drift_events_count: number;
  }>({ distribution: [], drift_events_count: 0 });
  const [shapData, setShapData] = useState<ShapRankingItem[]>([]);
  const [metrics, setMetrics] = useState<{
    model_summary: ModelMetricSummary[];
    regime_breakdown: any[];
  }>({ model_summary: [], regime_breakdown: [] });
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Initial Load of Stock Universe & Metrics
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const [stocksRes, metricsRes] = await Promise.all([
        fetchStocks(),
        fetchMetrics(),
      ]);
      setStocks(stocksRes);
      setMetrics(metricsRes);
      if (stocksRes.length > 0 && !stocksRes.some((s) => s.symbol === selectedStock)) {
        setSelectedStock(stocksRes[0].symbol);
      }
      setIsLoading(false);
    }
    init();
  }, []);

  // 2. Load Stock Specific Data
  useEffect(() => {
    async function loadStockData() {
      if (!selectedStock) return;
      setIsLoading(true);
      const [bData, rData, sData] = await Promise.all([
        fetchBacktest(selectedStock),
        fetchRegimes(selectedStock),
        fetchShap(selectedStock),
      ]);
      setBacktestData(bData);
      setRegimeData({
        distribution: rData.distribution || [],
        drift_events_count: rData.drift_events?.length || 0,
      });
      setShapData(sData);
      setIsLoading(false);
    }
    loadStockData();
  }, [selectedStock]);

  const handleSync = async () => {
    setIsLoading(true);
    const [bData, rData, sData, mData] = await Promise.all([
      fetchBacktest(selectedStock),
      fetchRegimes(selectedStock),
      fetchShap(selectedStock),
      fetchMetrics(),
    ]);
    setBacktestData(bData);
    setRegimeData({
      distribution: rData.distribution || [],
      drift_events_count: rData.drift_events?.length || 0,
    });
    setShapData(sData);
    setMetrics(mData);
    setIsLoading(false);
  };

  return (
    <DeviceFrame>
      {/* Scrollable Screen Content Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {activeTab === "home" && (
          <HomeScreen
            stocks={stocks}
            selectedStock={selectedStock}
            onSelectStock={setSelectedStock}
            backtestData={backtestData}
            regimeData={regimeData}
            onSync={handleSync}
            isLoading={isLoading}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "activity" && (
          <ActivityScreen
            backtestData={backtestData}
            selectedStock={selectedStock}
          />
        )}

        {activeTab === "insights" && (
          <LeaderboardScreen
            metrics={metrics}
            onBack={() => setActiveTab("home")}
          />
        )}

        {activeTab === "shap" && (
          <ShapScreen
            shapData={shapData}
            selectedStock={selectedStock}
            onBack={() => setActiveTab("home")}
          />
        )}
      </div>

      {/* Floating Keypad Simulation Modal */}
      <KeypadModal
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        selectedStock={selectedStock}
      />

      {/* Docked Sticky Bottom Navigation Bar (Stays pinned at bottom) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenKeypad={() => setIsKeypadOpen(true)}
      />
    </DeviceFrame>
  );
}

export default App;
