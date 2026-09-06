import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ProtectedRoute } from './components/common/ProtectedRoute';

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
          <main className="flex-1 pb-16 md:pb-0">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/price-history" element={<PriceHistoryPage />} />

              {/* Farmer Journey */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['FARMER']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/add-produce"
                element={
                  <ProtectedRoute allowedRoles={['FARMER']}>
                    <AddProducePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/price-discovery"
                element={
                  <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                    <PriceDiscoveryPage />
                  </ProtectedRoute>
                }
              />

              {/* Buyer Journey */}
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/post-requirement"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <PostRequirementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/matching"
                element={
                  <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                    <MatchingFarmersPage />
                  </ProtectedRoute>
                }
              />

              {/* Aliased Marketplace Routes */}
              <Route
                path="/marketplace/produce"
                element={
                  <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                    <MatchingFarmersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace/buyers"
                element={
                  <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                    <PriceDiscoveryPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route
                path="/offers"
                element={
                  <ProtectedRoute>
                    <OffersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deals"
                element={
                  <ProtectedRoute>
                    <DealsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <MobileBottomNav />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
