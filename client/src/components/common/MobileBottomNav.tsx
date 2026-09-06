import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, Handshake, User, TrendingUp, LogIn, ShoppingBag, Plus } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (user?.role === 'FARMER') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          to="/farmer/dashboard"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/farmer/dashboard') ? 'text-agri-700' : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          to="/price-discovery"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/price-discovery') ? 'text-agri-700' : 'text-gray-500'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Buyers</span>
        </Link>

        <Link
          to="/farmer/add-produce"
          className="flex flex-col items-center -mt-5"
        >
          <div className="bg-agri-600 text-white p-3 rounded-full shadow-lg border-4 border-slate-50 hover:bg-agri-700 transition transform active:scale-95">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] font-bold text-agri-800 mt-0.5">Sell</span>
        </Link>

        <Link
          to="/offers"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/offers') ? 'text-agri-700' : 'text-gray-500'
          }`}
        >
          <Handshake className="w-5 h-5 mb-0.5" />
          <span>Offers</span>
        </Link>

        <Link
          to="/deals"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/deals') ? 'text-gray-500' : 'text-gray-500'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Deals</span>
        </Link>
      </div>
    );
  }

  if (user?.role === 'BUYER') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          to="/buyer/dashboard"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/buyer/dashboard') ? 'text-sky-700' : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          to="/marketplace/produce"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/marketplace/produce') ? 'text-sky-700' : 'text-gray-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Find</span>
        </Link>

        <Link
          to="/buyer/post-requirement"
          className="flex flex-col items-center -mt-5"
        >
          <div className="bg-sky-600 text-white p-3 rounded-full shadow-lg border-4 border-slate-50 hover:bg-sky-700 transition transform active:scale-95">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] font-bold text-sky-800 mt-0.5">Post</span>
        </Link>

        <Link
          to="/offers"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/offers') ? 'text-sky-700' : 'text-gray-500'
          }`}
        >
          <Handshake className="w-5 h-5 mb-0.5" />
          <span>Offers</span>
        </Link>

        <Link
          to="/deals"
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            isActive('/deals') ? 'text-sky-700' : 'text-gray-500'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Purchases</span>
        </Link>
      </div>
    );
  }

  // Guest / Unauthenticated
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 flex items-center justify-around shadow-lg">
      <Link
        to="/"
        className={`flex flex-col items-center text-xs font-semibold ${
          isActive('/') ? 'text-agri-700' : 'text-gray-500'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </Link>

      <Link
        to="/price-history"
        className={`flex flex-col items-center text-xs font-semibold ${
          isActive('/price-history') ? 'text-agri-700' : 'text-gray-500'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span>Markets</span>
      </Link>

      <Link
        to="/login"
        className={`flex flex-col items-center text-xs font-semibold ${
          isActive('/login') ? 'text-agri-700' : 'text-gray-500'
        }`}
      >
        <LogIn className="w-5 h-5 mb-0.5" />
        <span>Sign In</span>
      </Link>

      <Link
        to="/register"
        className="bg-agri-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
      >
        Get Started
      </Link>
    </div>
  );
};
