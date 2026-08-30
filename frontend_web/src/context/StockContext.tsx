import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStocks } from '../services/api';

interface StockContextType {
  stocks: string[];
  selectedTicker: string;
  setSelectedTicker: (ticker: string) => void;
  isLoadingStocks: boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTicker = searchParams.get('ticker') || localStorage.getItem('selected_ticker') || 'INFY';

  const [selectedTicker, setSelectedTickerState] = useState<string>(initialTicker.replace('.NS', ''));
  const [stocks, setStocks] = useState<string[]>([
    'INFY', 'TCS', 'RELIANCE', 'HDFCBANK', 'ICICIBANK', 'APOLLOHOSP', 'MARUTI', 'SUNPHARMA', 'ITC'
  ]);
  const [isLoadingStocks, setIsLoadingStocks] = useState<boolean>(true);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const fetched = await getStocks();
        if (fetched && fetched.length > 0) {
          setStocks(fetched);
        }
      } catch (err) {
        console.error('Failed to load stocks:', err);
      } finally {
        setIsLoadingStocks(false);
      }
    };
    loadStocks();
  }, []);

  const setSelectedTicker = (ticker: string) => {
    const clean = ticker.replace('.NS', '');
    setSelectedTickerState(clean);
    localStorage.setItem('selected_ticker', clean);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('ticker', clean);
      return next;
    });
  };

  return (
    <StockContext.Provider
      value={{
        stocks,
        selectedTicker,
        setSelectedTicker,
        isLoadingStocks,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = (): StockContextType => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
