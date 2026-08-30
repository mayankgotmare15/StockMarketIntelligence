import React from 'react';

const SECTOR_TECH_BRANDS = [
  {
    name: 'Banking & Financials',
    style: {
      fontFamily: "'Times New Roman', Times, serif",
      fontWeight: 400,
      letterSpacing: '0.02em',
      fontSize: '14px',
    },
  },
  {
    name: 'Information Technology',
    style: {
      fontFamily: "'Arial Black', Gadget, sans-serif",
      fontWeight: 900,
      letterSpacing: '0.08em',
      fontSize: '15px',
    },
  },
  {
    name: 'FMCG & Consumer',
    style: {
      fontFamily: "Impact, 'Arial Black', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.05em',
      fontSize: '17px',
    },
  },
  {
    name: 'Automobile & EV',
    style: {
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      fontSize: '16px',
    },
  },
  {
    name: 'Pharma & Healthcare',
    style: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      fontSize: '15px',
    },
  },
  {
    name: 'PyTorch LSTM+ANN',
    style: {
      fontFamily: 'Verdana, sans-serif',
      fontWeight: 700,
      letterSpacing: '0.06em',
      fontSize: '14px',
      textTransform: 'uppercase' as const,
    },
  },
  {
    name: 'DuckDB Engine',
    style: {
      fontFamily: "'Courier New', monospace",
      fontWeight: 700,
      letterSpacing: '0.18em',
      fontSize: '14px',
    },
  },
  {
    name: 'Ridge Regularization',
    style: {
      fontFamily: "Palatino, 'Book Antiqua', serif",
      fontWeight: 500,
      letterSpacing: '0.03em',
      fontSize: '15px',
    },
  },
];

export const BackedBySection: React.FC = () => {
  return (
    <section id="universe" className="bg-[#F5F5F5] px-6 py-12 scroll-mt-12">
      {/* Scoped marquee styles */}
      <style>{`
        @keyframes backers-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .backers-track {
          display: flex;
          width: max-content;
          animation: backers-marquee 30s linear infinite;
        }
      `}</style>

      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        {/* Left Column (1/4) */}
        <div className="md:col-span-1">
          <p className="text-black/70 text-base leading-relaxed whitespace-pre-line font-normal">
            Benchmarked across 30 large-caps{"\n"}and 5 key NSE industry sectors.
          </p>
        </div>

        {/* Right Column (3/4): Infinite Marquee */}
        <div className="md:col-span-3 overflow-hidden">
          <div className="backers-track">
            {/* First iteration */}
            {SECTOR_TECH_BRANDS.map((item, idx) => (
              <span
                key={`sector-1-${idx}`}
                className="mx-10 shrink-0 text-black/50 whitespace-nowrap flex items-center"
                style={item.style}
              >
                {item.name}
              </span>
            ))}
            {/* Second iteration for seamless loop */}
            {SECTOR_TECH_BRANDS.map((item, idx) => (
              <span
                key={`sector-2-${idx}`}
                className="mx-10 shrink-0 text-black/50 whitespace-nowrap flex items-center"
                style={item.style}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BackedBySection;
