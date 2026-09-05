import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { PriceDiscoveryPage } from './pages/farmer/PriceDiscoveryPage';
import { PriceHistoryPage } from './pages/PriceHistoryPage';

import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { AddProducePage } from './pages/farmer/AddProducePage';

import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { PostRequirementPage } from './pages/buyer/PostRequirementPage';
import { MatchingFarmersPage } from './pages/buyer/MatchingFarmersPage';

import { OffersPage } from './pages/OffersPage';
import { DealsPage } from './pages/DealsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Price Discovery & Market Intelligence */}
              <Route path="/price-discovery" element={<PriceDiscoveryPage />} />
              <Route path="/price-history" element={<PriceHistoryPage />} />

              {/* Farmer Journey */}
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/add-produce" element={<AddProducePage />} />

              {/* Buyer Journey */}
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/post-requirement" element={<PostRequirementPage />} />
              <Route path="/buyer/matching" element={<MatchingFarmersPage />} />

              {/* Marketplaces */}
              <Route path="/marketplace/produce" element={<PriceDiscoveryPage />} />
              <Route path="/marketplace/buyers" element={<PostRequirementPage />} />

              {/* Offers, Deals & Admin */}
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
