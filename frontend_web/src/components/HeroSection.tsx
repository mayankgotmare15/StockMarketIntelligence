import React from 'react';
import { ArrowRight } from 'lucide-react';

const NSE_TICKERS = [
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services',
    style: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '15px',
    },
  },
  {
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank',
    style: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 900,
      letterSpacing: '0.08em',
      fontSize: '13px',
      textTransform: 'uppercase' as const,
    },
  },
  {
    symbol: 'INFY.NS',
    name: 'Infosys Limited',
    style: {
      fontFamily: "'Trebuchet MS', sans-serif",
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontSize: '15px',
      fontStyle: 'italic' as const,
    },
  },
  {
    symbol: 'ICICIBANK.NS',
    name: 'ICICI Bank',
    style: {
      fontFamily: "'Courier New', monospace",
      fontWeight: 700,
      letterSpacing: '0.12em',
      fontSize: '13px',
      textTransform: 'uppercase' as const,
    },
  },
  {
    symbol: 'SUNPHARMA.NS',
    name: 'Sun Pharma',
    style: {
      fontFamily: "Palatino, 'Book Antiqua', serif",
      fontWeight: 400,
      letterSpacing: '-0.01em',
      fontSize: '16px',
    },
  },
  {
    symbol: 'MARUTI.NS',
    name: 'Maruti Suzuki',
    style: {
      fontFamily: "Impact, 'Arial Narrow', sans-serif",
      fontWeight: 400,
      letterSpacing: '0.04em',
      fontSize: '14px',
    },
  },
  {
    symbol: 'APOLLOHOSP.NS',
    name: 'Apollo Hospitals',
    style: {
      fontFamily: 'Verdana, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      fontSize: '13px',
    },
  },
  {
    symbol: 'ITC.NS',
    name: 'ITC Limited',
    style: {
      fontFamily: "'Times New Roman', serif",
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontSize: '15px',
    },
  },
];

export const HeroSection: React.FC = () => {
  return (
    <section className="flex-1 px-6 pt-20 pb-6 flex items-end">
      {/* Scoped marquee styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
      `}</style>

      {/* Inner Hero Card with Video Background */}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-sm"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-start justify-start h-full p-8 md:p-12 pt-32 md:pt-36 max-w-[88rem] mx-auto w-full">
          {/* Main Headline */}
          <h1
            className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4"
            style={{ letterSpacing: '-0.04em' }}
          >
            Market Drift
            <br />
            Adaptive
          </h1>

          {/* Subtitle */}
          <p
            className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
          >
            A research-grade machine learning platform extending the Liu et al.
            (2024) LSTM+ANN stacking architecture with online concept-drift
            adaptation for Indian NSE equities.
          </p>

          {/* CTA Pill Button with Arrow Circle */}
          <a
            href="#ablation"
            className="group inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer shadow-lg"
          >
            <span>Explore Ablation Study</span>
            <span className="bg-white rounded-full p-2 group-hover:bg-white transition-colors">
              <ArrowRight className="w-5 h-5 text-black" />
            </span>
          </a>

          {/* NSE Universe Marquee */}
          <div className="mt-20 md:mt-24 w-full max-w-md overflow-hidden">
            <div className="marquee-track">
              {/* First iteration */}
              {NSE_TICKERS.map((ticker, idx) => (
                <span
                  key={`ticker-1-${idx}`}
                  className="mx-6 shrink-0 text-black/65 whitespace-nowrap flex items-center gap-2"
                  style={ticker.style}
                >
                  <span>{ticker.symbol}</span>
                  <span className="text-[11px] opacity-70 font-normal">({ticker.name})</span>
                </span>
              ))}
              {/* Second iteration for seamless loop */}
              {NSE_TICKERS.map((ticker, idx) => (
                <span
                  key={`ticker-2-${idx}`}
                  className="mx-6 shrink-0 text-black/65 whitespace-nowrap flex items-center gap-2"
                  style={ticker.style}
                >
                  <span>{ticker.symbol}</span>
                  <span className="text-[11px] opacity-70 font-normal">({ticker.name})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
