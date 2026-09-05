import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, TrendingUp, ShoppingBag, Handshake, ShieldCheck, LogOut, Menu, X, Bell } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-agri-600 text-white p-2 rounded-xl group-hover:bg-agri-700 transition-colors shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900">AGRI<span className="text-agri-600">LINK</span></span>
              <span className="block text-[10px] font-semibold text-agri-700 uppercase tracking-widest -mt-1">Price Discovery</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/price-discovery"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/price-discovery')
                  ? 'bg-agri-50 text-agri-700'
                  : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-agri-600" />
              Find Best Opportunity
            </Link>

            <Link
              to="/price-history"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive('/price-history')
                  ? 'bg-agri-50 text-agri-700'
                  : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
              }`}
            >
              Market Prices & Trends
            </Link>

            {user?.role === 'FARMER' && (
              <>
                <Link
                  to="/farmer/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/farmer/dashboard') ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
                  }`}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/marketplace/buyers"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/marketplace/buyers') ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
                  }`}
                >
                  Buyer Requirements
                </Link>
              </>
            )}

            {user?.role === 'BUYER' && (
              <>
                <Link
                  to="/buyer/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/buyer/dashboard') ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
                  }`}
                >
                  Buyer Dashboard
                </Link>
                <Link
                  to="/marketplace/produce"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/marketplace/produce') ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
                  }`}
                >
                  Browse Produce
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/admin') ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin Panel
              </Link>
            )}

            {user && (
              <>
                <Link
                  to="/offers"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive('/offers') ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
                  }`}
                >
                  <Handshake className="w-4 h-4" />
                  Offers & Negotiations
                </Link>

                <Link
                  to="/deals"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/deals') ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:text-agri-600 hover:bg-gray-50'
                  }`}
                >
                  Deals & Reviews
                </Link>
              </>
            )}
          </nav>

          {/* User Auth Profile / Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <span className="block text-xs font-bold text-gray-900">{user.name}</span>
                  <span className="block text-[11px] font-medium text-agri-700 uppercase tracking-wider">{user.role}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-gray-600 hover:text-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started 🌱
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/price-discovery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-agri-700 bg-agri-50"
          >
            🔍 Find Best Opportunity
          </Link>
          <Link
            to="/price-history"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Market Prices & Trends
          </Link>

          {user?.role === 'FARMER' && (
            <Link
              to="/farmer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Farmer Dashboard
            </Link>
          )}
          {user?.role === 'BUYER' && (
            <Link
              to="/buyer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Buyer Dashboard
            </Link>
          )}

          {user ? (
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-agri-700 font-semibold">{user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
