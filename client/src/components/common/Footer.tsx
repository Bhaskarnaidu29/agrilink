import React from 'react';
import { Sprout, ShieldCheck, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-agri-600 text-white p-2 rounded-xl">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">AGRI<span className="text-agri-400">LINK</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering Indian farmers with price discovery, transportation revenue optimization, and direct buyer linkages.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-agri-400 bg-agri-950/60 border border-agri-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Award className="w-4 h-4" /> SIH 2026 — Problem Statement 26132
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Core Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/price-discovery" className="hover:text-agri-400 transition-colors">Find Best Selling Market</a></li>
              <li><a href="/price-history" className="hover:text-agri-400 transition-colors">Real-Time Mandi Prices</a></li>
              <li><a href="/marketplace/produce" className="hover:text-agri-400 transition-colors">Farmer Produce Listings</a></li>
              <li><a href="/marketplace/buyers" className="hover:text-agri-400 transition-colors">Buyer Requirements</a></li>
            </ul>
          </div>

          {/* Key Value */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Smart Engine</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Transport Cost Calculator</li>
              <li>Net Revenue Optimization</li>
              <li>Opportunity Score (0-100)</li>
              <li>Sell Now or Wait Advisor</li>
            </ul>
          </div>

          {/* Trust Badge */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Trust & Verification</h4>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-agri-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" /> Verified APMC Data
              </div>
              <p className="text-xs text-slate-400">
                Connected with Vijayawada, Guntur, Azadpur, Kolar & major APMC Mandis across India.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AgriLink Platform. Built for Indian Agriculture & Market Intelligence.</p>
          <p className="flex items-center gap-1">
            Created with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Farmers & Mandis
          </p>
        </div>
      </div>
    </footer>
  );
};
