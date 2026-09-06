import React from 'react';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-16 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-agri-600 text-white p-2 rounded-xl">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                AGRI<span className="text-agri-400">LINK</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting farmers directly with nearby buyers, wholesalers, and local APMC markets for better net earnings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/price-discovery" className="hover:text-agri-400 transition-colors">
                  Find Buyers & Prices
                </Link>
              </li>
              <li>
                <Link to="/price-history" className="hover:text-agri-400 transition-colors">
                  APMC Mandi Prices
                </Link>
              </li>
              <li>
                <Link to="/marketplace/produce" className="hover:text-agri-400 transition-colors">
                  Farmers Near You
                </Link>
              </li>
            </ul>
          </div>

          {/* Key Value */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Value for Farmers</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Compare Nearby Buyers</li>
              <li>Net Earnings Calculation</li>
              <li>Estimated Transport Costs</li>
              <li>Direct Offer Negotiation</li>
            </ul>
          </div>

          {/* Trust Badge */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Trust & Verification</h4>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-agri-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" /> Verified Local Buyers
              </div>
              <p className="text-xs text-slate-400">
                Direct trade connections with verified traders, wholesalers, and APMC Mandis across India.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AgriLink Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Farmers, Wholesalers & Local Traders
          </p>
        </div>
      </div>
    </footer>
  );
};
