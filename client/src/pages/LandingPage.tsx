import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { TrendingUp, Truck, Store, ArrowRight, ShieldCheck, DollarSign, MapPin, Search, CheckCircle2, UserCheck, Sprout } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [marketPrices, setMarketPrices] = useState<any[]>([]);

  useEffect(() => {
    async function loadPrices() {
      try {
        const res = await api.get('/markets/prices');
        if (res.data?.prices && Array.isArray(res.data.prices)) {
          setMarketPrices(res.data.prices.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load market prices ticker:', err);
      }
    }
    loadPrices();
  }, []);

  const handleFarmerCTA = () => {
    if (user?.role === 'FARMER') navigate('/farmer/dashboard');
    else if (user) navigate('/farmer/dashboard');
    else navigate('/register?role=FARMER');
  };

  const handleBuyerCTA = () => {
    if (user?.role === 'BUYER') navigate('/buyer/dashboard');
    else if (user) navigate('/buyer/dashboard');
    else navigate('/register?role=BUYER');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Live Market Price Ticker Header */}
      {marketPrices.length > 0 && (
        <div className="bg-slate-900 text-white text-xs py-2.5 px-4 overflow-hidden border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-agri-400 font-bold uppercase tracking-wider shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-agri-500 animate-pulse"></span>
              Live Mandi Rates
            </div>
            <div className="flex items-center gap-6 overflow-x-auto text-slate-300 font-medium whitespace-nowrap scrollbar-none py-0.5">
              {marketPrices.map((item, idx) => {
                const displayPrice = item.pricePerKg || (item.pricePerUnit > 500 ? Math.round((item.pricePerUnit / 100) * 10) / 10 : item.pricePerUnit);
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5">
                    <span className="text-white font-bold">{item.crop?.name || 'Produce'}:</span>
                    <span className="text-agri-300 font-extrabold">₹{displayPrice}/kg</span>
                    <span className="text-slate-400 text-[11px]">({item.market?.city || 'APMC'})</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-agri-950 via-agri-900 to-slate-950 text-white pt-16 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-agri-500/10 border border-agri-400/30 text-agri-300 text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-4 h-4 text-agri-400" /> Connecting Farmers to Better Markets
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Sell Smarter. <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-300 via-agri-400 to-emerald-200">Buy Closer.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Connect with nearby farmers, wholesalers, and local buyers. Compare offered prices, factor in estimated transport costs, negotiate directly, and make higher net earnings on every harvest.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={handleFarmerCTA}
              className="w-full sm:w-auto text-lg px-8 py-4 bg-agri-600 hover:bg-agri-500 shadow-lg shadow-agri-600/30 font-bold border border-agri-400/30"
            >
              👨‍🌾 Sell Produce
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleBuyerCTA}
              className="w-full sm:w-auto text-lg px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-white font-bold border-2 border-emerald-500/60 hover:border-emerald-400 shadow-lg focus:ring-2 focus:ring-emerald-400"
            >
              <Store className="w-5 h-5 mr-2 inline-block text-emerald-400 shrink-0" />
              <span>Buy Produce</span>
            </Button>
          </div>

          {/* Key Value Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 text-left">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-xl font-bold text-agri-400 flex items-center gap-1">
                <DollarSign className="w-5 h-5" /> Net Revenue
              </h4>
              <p className="text-xs text-slate-400 mt-1">Calculates true earnings after transport costs</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-xl font-bold text-amber-400 flex items-center gap-1">
                <MapPin className="w-5 h-5" /> Nearby First
              </h4>
              <p className="text-xs text-slate-400 mt-1">Prioritizes local buyers within 10–50 km</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-xl font-bold text-sky-400 flex items-center gap-1">
                <Store className="w-5 h-5" /> Direct Offers
              </h4>
              <p className="text-xs text-slate-400 mt-1">Negotiate prices & quantities directly</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
              <h4 className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-5 h-5" /> Verified Trade
              </h4>
              <p className="text-xs text-slate-400 mt-1">Transparent deal updates & direct contact</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-agri-700 font-bold text-xs uppercase tracking-widest block">Simple Marketplace Workflow</span>
            <h2 className="text-3xl font-black text-gray-900">How AgriLink Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Farmers */}
            <div className="bg-slate-50 border border-gray-200 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="w-10 h-10 bg-agri-600 text-white rounded-xl flex items-center justify-center text-xl font-bold">
                  👨‍🌾
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">For Farmers</h3>
                  <p className="text-xs text-gray-500">Sell crop harvest to profitable nearby buyers</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-agri-100 text-agri-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-bold text-gray-900">List Your Produce</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Enter crop, quantity, grade, and your expected minimum price.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-agri-100 text-agri-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-bold text-gray-900">Discover Nearby Buyers</h4>
                    <p className="text-gray-600 text-xs mt-0.5">See local traders, wholesalers, and processors looking for your harvest.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-agri-100 text-agri-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-bold text-gray-900">Compare Best Net Revenue</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Understand transport costs to pick the buyer giving the highest net profit in hand.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-agri-100 text-agri-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <h4 className="font-bold text-gray-900">Complete Sale & Get Paid</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Accept offer, arrange pickup, confirm deal, and rate your buyer.</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleFarmerCTA} variant="primary" className="w-full bg-agri-600 hover:bg-agri-700">
                List Your Harvest Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* For Buyers */}
            <div className="bg-slate-50 border border-gray-200 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center text-xl font-bold">
                  🏪
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">For Buyers & Wholesalers</h3>
                  <p className="text-xs text-gray-500">Source fresh produce directly from local farms</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-sky-100 text-sky-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-bold text-gray-900">Post Sourcing Requirement</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Specify crop needed, quantity, quality grade, and your offer price.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-sky-100 text-sky-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-bold text-gray-900">Find Farmers Nearby</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Browse active produce listings from farmers within your target radius.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-sky-100 text-sky-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-bold text-gray-900">Send Instant Offer</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Negotiate directly with farmers on terms, pickup, and price per kg.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-sky-100 text-sky-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <h4 className="font-bold text-gray-900">Procure & Build Reputation</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Fulfill purchases smoothly and build a high buyer reliability rating.</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleBuyerCTA} variant="primary" className="w-full bg-sky-600 hover:bg-sky-700">
                Post Sourcing Need <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Local Focus Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl font-black">Built for Real Trade. Simple & Local.</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm leading-relaxed">
            No complicated jargon. No hidden middlemen margins. AgriLink makes it obvious which local buyer gives you the best financial outcome.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-2">
              <CheckCircle2 className="w-6 h-6 text-agri-400" />
              <h3 className="text-lg font-bold text-white">Verified Profiles</h3>
              <p className="text-slate-400 text-xs">Clear buyer business types (Wholesaler, Trader, Processor) so farmers know who they deal with.</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-2">
              <Truck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Real Logistics Math</h3>
              <p className="text-slate-400 text-xs">Calculates estimated transport costs per kilometer and ton so distance is factored into every decision.</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-2">
              <UserCheck className="w-6 h-6 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Ratings & Reviews</h3>
              <p className="text-slate-400 text-xs">Verified transaction ratings after deal completion to ensure trust across both sides of the market.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
