import React from 'react';

interface LogoIconProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = 'w-7 h-7' }) => {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="StockMarketIntelligence Logo"
    >
      {/* Modern geometric quant delta + interlocking adaptive layers */}
      <path d="M128 24L24 208h208L128 24zm0 48l66 116H62l66-116z" opacity="0.9" />
      <path d="M128 108l34 60H94l34-60z" />
    </svg>
  );
};

export default LogoIcon;
