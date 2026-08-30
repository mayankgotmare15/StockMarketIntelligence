import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from './LogoIcon';

interface NavbarProps {
  onExploreClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExploreClick }) => {
  const navLinks = [
    { name: 'Architecture', href: '#architecture' },
    { name: 'Ablation Study', href: '#ablation' },
    { name: 'Regimes', href: '#regimes' },
    { name: 'SHAP Explainability', href: '#shap' },
    { name: 'NSE Universe', href: '#universe' },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
      <div className="max-w-[88rem] mx-auto flex items-center justify-between">
        {/* Left: Quant Logo + Wordmark */}
        <div className="flex items-center gap-3">
          <LogoIcon className="w-7 h-7 text-black" />
          <span className="text-2xl font-medium tracking-tight text-black flex items-center gap-1.5">
            <span>StockIntelligence</span>
            <span className="text-[11px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-black/5 text-black/70 rounded-full border border-black/10">
              NSE v4
            </span>
          </span>
        </div>

        {/* Center: Nav links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="#ablation"
            onClick={onExploreClick}
            className="hidden sm:inline-block text-black/80 hover:text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            Explore Research
          </a>
          <Link
            to="/dashboard"
            className="inline-block bg-black text-white text-sm md:text-base font-medium px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer shadow-sm"
          >
            Launch Platform
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
