import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserLayout from './layouts/UserLayout';
import DashboardPage from './pages/user/DashboardPage';
import ModelsPage from './pages/user/ModelsPage';
import ShapPage from './pages/user/ShapPage';
import WatchlistPage from './pages/user/WatchlistPage';
import SimulationPage from './pages/user/SimulationPage';
import ProfilePage from './pages/user/ProfilePage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Marketing Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Authenticated / Investor Workspace */}
      <Route element={<UserLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/shap" element={<ShapPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/simulate" element={<SimulationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 3. Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
