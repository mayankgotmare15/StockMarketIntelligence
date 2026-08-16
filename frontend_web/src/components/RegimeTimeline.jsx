import React from 'react';

const RegimeTimeline = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col h-[150px] items-center justify-center glass-card text-muted-foreground p-6 text-center border border-dashed border-border">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">REGIME TIMELINE</h3>
        <p className="text-sm">Connecting to Walk-Forward Volatility Regime Store...</p>
      </div>
    );
  }

  const getRegimeColor = (regime) => {
    switch (regime?.toUpperCase()) {
      case 'LOW':
        return 'bg-accent-static/30 text-accent-static border-accent-static/40';
      case 'MEDIUM':
        return 'bg-accent-warning/30 text-accent-warning border-accent-warning/40';
      case 'HIGH':
        return 'bg-accent-critical/30 text-accent-critical border-accent-critical/40';
      default:
        return 'bg-accent-neutral/30 text-accent-neutral border-accent-neutral/40';
    }
  };

  // Group contiguous regimes
  const blocks = [];
  let currentBlock = null;

  data.forEach((item, i) => {
    const r = item.Regime_Flag || item.regime_flag || item.regime || 'Low';
    const dateStr = item.Date || item.date || `Fold ${i + 1}`;
    if (!currentBlock || currentBlock.regime !== r) {
      if (currentBlock) {
        currentBlock.endIndex = i - 1;
        blocks.push(currentBlock);
      }
      currentBlock = {
        regime: r,
        startIndex: i,
        startDate: dateStr
      };
    }
  });
  if (currentBlock) {
    currentBlock.endIndex = data.length - 1;
    currentBlock.endDate = data[data.length - 1]?.Date || data[data.length - 1]?.date || 'Present';
    blocks.push(currentBlock);
  }

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Market Volatility Regime Timeline</h3>
          <p className="text-xs text-muted-foreground mt-1">Walk-Forward Tercile Classification ($ATR_{20}$ percentiles)</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent-static" /> Low Vol</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent-warning" /> Med Vol</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent-critical" /> High Vol</span>
        </div>
      </div>
      
      <div className="relative w-full h-12 rounded-lg overflow-hidden flex border border-border">
        {blocks.map((block, idx) => {
          const widthPercent = ((block.endIndex - block.startIndex + 1) / data.length) * 100;
          return (
            <div 
              key={idx} 
              className={`h-full flex items-center justify-center border-r last:border-r-0 text-[10px] font-bold tracking-wider ${getRegimeColor(block.regime)} transition-all hover:brightness-125`}
              style={{ width: `${widthPercent}%` }}
              title={`${block.startDate} - ${block.endDate || 'Present'} (${block.regime} Volatility)`}
            >
              {widthPercent > 10 ? `${block.regime} Vol` : ''}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-[11px] font-medium text-muted-foreground">
        <span>{data[0]?.Date || data[0]?.date || 'Start'}</span>
        <span>{data[data.length - 1]?.Date || data[data.length - 1]?.date || 'Present'}</span>
      </div>
    </div>
  );
};

export default RegimeTimeline;
