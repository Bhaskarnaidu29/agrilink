import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Truck, Store, Award, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, MapPin, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Today's Ticker Header Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-agri-400 font-semibold uppercase tracking-wider">
            <span className="inline-block w-2 h-2 rounded-full bg-agri-500 animate-pulse"></span>
            Live APMC Mandi Ticker
          </div>
          <div className="flex items-center gap-6 overflow-x-auto text-slate-300 font-medium">
            <span>🍅 Tomato: <strong className="text-white">₹28.50/kg</strong> <span className="text-agri-400">↑ 8.2%</span></span>
            <span>🧅 Onion: <strong className="text-white">₹32.00/kg</strong> <span className="text-rose-400">↓ 2.1%</span></span>
            <span>🌶️ Red Chilli: <strong className="text-white">₹185.00/kg</strong> <span className="text-agri-400">↑ 5.4%</span></span>
            <span>🥔 Potato: <strong className="text-white">₹22.00/kg</strong> <span className="text-slate-400">→ 0.0%</span></span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-agri-900 via-agri-950 to-slate-950 text-white pt-20 pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-agri-500/10 border border-agri-400/30 text-agri-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-agri-400" /> SIH 2026 — Problem Statement 26132
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Sell Smarter. <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-300 via-agri-400 to-emerald-200">Earn Better.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            AgriLink helps farmers discover true market prices, calculate transportation costs, compare mandis, match with verified buyers, and make intelligent selling decisions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/price-discovery">
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-lg px-8 py-4 bg-agri-500 hover:bg-agri-600 shadow-lg shadow-agri-500/30">
                <Search className="w-5 h-5 mr-2" />
                Find Best Selling Opportunity
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 border-slate-700 text-white hover:bg-slate-800 bg-slate-900/60">
                Register as Farmer / Buyer
              </Button>
            </Link>
          </div>

          {/* Key Value Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 text-left">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-2xl font-black text-agri-400">₹ Net Revenue</h4>
              <p className="text-xs text-slate-400 mt-1">Gross Price minus Transport Math</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-2xl font-black text-amber-400">0–100 Score</h4>
              <p className="text-xs text-slate-400 mt-1">Multi-factor Opportunity Ranking</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-2xl font-black text-sky-400">Sell vs Wait</h4>
              <p className="text-xs text-slate-400 mt-1">Historical Trend Advisor</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-2xl font-black text-emerald-400">Direct Link</h4>
              <p className="text-xs text-slate-400 mt-1">Instant Real-time Negotiation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Question Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-agri-700 font-bold text-xs uppercase tracking-widest block mb-2">Empowering Decision Making</span>
            <h2 className="text-3xl font-black text-gray-900">Answering the Four Pillars of Selling</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-agri-100 text-agri-700 rounded-xl flex items-center justify-center font-black text-xl">1</div>
              <h3 className="text-lg font-bold text-gray-900">WHAT is the current price?</h3>
              <p className="text-sm text-gray-600">Real-time daily mandi rates & historical series from Vijayawada, Guntur, Azadpur & APMC hubs.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-xl">2</div>
              <h3 className="text-lg font-bold text-gray-900">WHERE should I sell?</h3>
              <p className="text-sm text-gray-600">Calculates transport cost per km/ton so you never choose a high raw price that eats profit in logistics.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-black text-xl">3</div>
              <h3 className="text-lg font-bold text-gray-900">TO WHOM should I sell?</h3>
              <p className="text-sm text-gray-600">Matches crop grade & quantity with verified wholesalers, processors, retailers, and exporters.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-black text-xl">4</div>
              <h3 className="text-lg font-bold text-gray-900">WHEN should I sell?</h3>
              <p className="text-sm text-gray-600">Analyzes recent 7 to 90-day price trends to advise whether to sell today or hold for better returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demonstration Workflow Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-agri-400 font-bold text-xs uppercase tracking-widest block mb-2">How AgriLink Works</span>
            <h2 className="text-3xl font-black text-white">End-to-End Market Discovery & Linkage</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl relative">
              <div className="text-agri-400 font-bold text-sm mb-2">STEP 01</div>
              <h3 className="text-xl font-bold text-white mb-3">Enter Produce Details</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Farmer enters Crop, Variety, Quantity (e.g. 500 kg), Quality Grade (Grade A), and Location.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl relative">
              <div className="text-agri-400 font-bold text-sm mb-2">STEP 02</div>
              <h3 className="text-xl font-bold text-white mb-3">Market Intelligence Engine</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Calculates Gross Revenue, Distance, Transport Costs, Expected Net Revenue, and computes 0–100 Opportunity Score.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl relative">
              <div className="text-agri-400 font-bold text-sm mb-2">STEP 03</div>
              <h3 className="text-xl font-bold text-white mb-3">🏆 Best Opportunity Recommendation</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Ranks top mandis & direct buyers with transparent net revenue breakdowns and real-time negotiation capability.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/price-discovery">
              <Button size="lg" variant="primary" className="px-8 bg-agri-600 hover:bg-agri-500">
                Try Price Discovery Engine Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
