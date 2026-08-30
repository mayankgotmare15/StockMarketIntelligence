import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Layers, PieChart, Bookmark, Sliders, UserCheck } from 'lucide-react';

const tabs = [
  { name: 'Dashboard', path: '/dashboard', icon: Activity },
  { name: 'Models & Ablation', path: '/models', icon: Layers },
  { name: 'SHAP Studio', path: '/shap', icon: PieChart },
  { name: 'Watchlist & Alerts', path: '/watchlist', icon: Bookmark },
  { name: 'Scenario Sandbox', path: '/simulate', icon: Sliders },
  { name: 'Profile & ML Settings', path: '/profile', icon: UserCheck },
];

export const UserPillTabs: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto py-2 mb-6 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-black/5 rounded-full border border-black/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-black/70 hover:text-black hover:bg-black/5'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default UserPillTabs;
