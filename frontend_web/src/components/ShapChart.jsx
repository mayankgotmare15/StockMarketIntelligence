import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const ShapChart = ({ shapData }) => {
  const [activeTab, setActiveTab] = useState('Global');

  // Normalize data if array or object
  const normalizedData = React.useMemo(() => {
    if (!shapData) {
      return [
        { feature: 'ATR-20', importance: 0.000412 },
        { feature: 'RSI-14', importance: 0.000378 },
        { feature: 'MACD Signal', importance: 0.000315 },
        { feature: 'Bollinger Width', importance: 0.000289 },
        { feature: '5D Volume Ratio', importance: 0.000244 },
        { feature: 'Return Lag-1', importance: 0.000198 },
        { feature: 'Rolling Vol 20d', importance: 0.000162 },
        { feature: 'MACD Hist', importance: 0.000145 },
      ];
    }
    if (Array.isArray(shapData)) {
      return shapData.map(d => ({
        feature: d.feature_name || d.feature,
        importance: d.mean_abs_shap || d.importance || 0
      }));
    }
    const arr = shapData[activeTab] || shapData.RF || shapData.XGBoost || [];
    return arr.map(d => ({
      feature: d.feature || d.feature_name,
      importance: d.importance || d.mean_abs_shap || 0
    }));
  }, [shapData, activeTab]);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Tree SHAP Feature Importance</h3>
          <p className="text-xs text-muted-foreground mt-1">Mean absolute Shapley values ($E[|\phi_j|]$) explaining non-linear drivers</p>
        </div>
        
        <div className="flex bg-secondary-bg rounded-lg p-1 border border-border">
          {['Global', 'Random Forest', 'XGBoost'].map(tab => (
            <button 
              key={tab}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === tab ? 'bg-card text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={normalizedData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis dataKey="feature" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'var(--color-secondary-bg)' }}
              contentStyle={{ backgroundColor: '#110B29', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F5F7FA' }}
              itemStyle={{ color: '#10B981', fontWeight: 600 }}
              formatter={(val) => [Number(val).toFixed(6), 'SHAP Value']}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
              {normalizedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#0EA5E9' : '#8B5CF6'} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ShapChart;
