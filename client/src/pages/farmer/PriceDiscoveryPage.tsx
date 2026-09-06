import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Crop, OpportunityAnalysisResult } from '../../types';
import { Search, Trophy, TrendingUp, MapPin, CheckCircle2, ArrowRight, Table, LayoutGrid, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MarketMap } from '../../components/maps/MarketMap';
import { PriceTrendChart } from '../../components/charts/PriceTrendChart';
import { LocationPicker } from '../../components/common/LocationPicker';
import { LocationResult } from '../../services/locationService';

export const PriceDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [quantityKg, setQuantityKg] = useState<string>('');
  const [qualityGrade, setQualityGrade] = useState<string>('');

  // Location State
  const [locationData, setLocationData] = useState<LocationResult | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<OpportunityAnalysisResult | null>(null);
  const [priceHistoryData, setPriceHistoryData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  useEffect(() => {
    async function loadCrops() {
      try {
        const res = await api.get('/crops');
        setCrops(res.data.crops);
      } catch (err) {
        console.error('Failed to load crops', err);
      }
    }
    loadCrops();

    // Default to farmer profile location if available
    const farmerCity = user?.farmerProfile?.city;
    if (farmerCity) {
      setLocationData({
        id: 'user-saved-loc',
        name: farmerCity,
        displayName: farmerCity,
        city: farmerCity,
        state: user?.farmerProfile?.state || 'Andhra Pradesh',
        latitude: user?.farmerProfile?.latitude || 16.5062,
        longitude: user?.farmerProfile?.longitude || 80.6480,
      });
    }
  }, [user]);

  const handleRunDiscovery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCropId || !quantityKg || Number(quantityKg) <= 0 || !qualityGrade) return;
    if (!locationData) {
      alert('Please search or detect your location to find nearby buyers.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/price-discovery', {
        cropId: selectedCropId,
        quantityKg: Number(quantityKg),
        qualityGrade,
        locationCity: locationData.displayName || locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      setResult(res.data);

      const histRes = await api.get(`/price-discovery/history?cropId=${selectedCropId}&days=30`);
      setPriceHistoryData(histRes.data.histories || []);
    } catch (err: any) {
      console.error('Discovery calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const best = result?.bestOpportunity;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-500/20 border border-agri-400/30 text-agri-300 text-xs font-bold uppercase tracking-wider">
              🔍 Market Price & Buyer Search
            </span>
            <h1 className="text-3xl font-black tracking-tight">Find Buyers & Market Prices</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Discover nearby buyers and wholesale APMC markets, compare offered prices, factor in estimated transport costs, and choose the deal that gives you the highest net earning.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <Card className="shadow-md border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleRunDiscovery} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Crop</label>
                <select
                  value={selectedCropId}
                  onChange={(e) => {
                    setSelectedCropId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                >
                  <option value="">[ Select a crop ]</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={quantityKg}
                  onChange={(e) => {
                    setQuantityKg(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => {
                    setQualityGrade(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                >
                  <option value="">[ Select quality grade ]</option>
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Fair)</option>
                </select>
              </div>

              {/* DYNAMIC LOCATION PICKER */}
              <div className="lg:col-span-1">
                <LocationPicker
                  label="Farm Location"
                  value={locationData ? {
                    locationName: locationData.name,
                    city: locationData.city,
                    state: locationData.state,
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                  } : undefined}
                  onChange={(loc) => {
                    setLocationData(loc);
                  }}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!selectedCropId || !quantityKg || Number(quantityKg) <= 0 || !qualityGrade || !locationData || loading}
                  className="w-full py-2.5 text-sm font-bold bg-agri-600 hover:bg-agri-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  isLoading={loading}
                >
                  <Search className="w-4 h-4 mr-1.5" /> Find Buyers & Prices
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* RESULTS SECTION */}
        {!result ? (
          <Card className="text-center py-12 p-8 border-gray-200 shadow-xs">
            <Search className="w-12 h-12 text-agri-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Select your crop to discover nearby buyers and market prices</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              Select your crop, enter your quantity, choose quality grade, and set your farm location above to discover nearby buyers and APMC market prices.
            </p>
          </Card>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* 🏆 BEST CHOICE BANNER */}
            {best && (
              <Card className="border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-xs">
                  <Trophy className="w-4 h-4" /> 🏆 RECOMMENDED BEST CHOICE
                </div>

                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">{best.name}</span>
                        <Badge variant={best.type === 'BUYER' ? 'info' : 'earth'}>{best.type}</Badge>
                      </div>
                      <p className="text-slate-600 text-sm flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-agri-600" /> {best.locationCity} • {best.distanceKm} km away from farm
                      </p>
                    </div>

                    <div className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                      <div className="text-right">
                        <span className="block text-xs font-bold text-gray-500 uppercase">Offered Price</span>
                        <span className="text-2xl font-black text-slate-900">₹{best.unitPrice}<span className="text-xs text-gray-500">/kg</span></span>
                      </div>
                      <div className="h-10 w-px bg-gray-200"></div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-agri-700 uppercase">Expected Net Revenue</span>
                        <span className="text-3xl font-black text-agri-600">₹{best.expectedNetRevenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Math */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-200/60">
                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                      <span className="block text-xs font-bold text-gray-500 uppercase">1. Gross Revenue</span>
                      <span className="text-xl font-bold text-gray-900">₹{best.grossRevenue.toLocaleString('en-IN')}</span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">{quantityKg} kg × ₹{best.unitPrice}/kg</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                      <span className="block text-xs font-bold text-rose-600 uppercase">2. Est. Transport Cost</span>
                      <span className="text-xl font-bold text-rose-600">- ₹{best.transportCost.toLocaleString('en-IN')}</span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">Distance {best.distanceKm} km</span>
                    </div>

                    <div className="p-4 bg-agri-600 text-white rounded-xl shadow-md">
                      <span className="block text-xs font-bold text-agri-200 uppercase">3. Net Earning in Hand</span>
                      <span className="text-xl font-black">₹{best.expectedNetRevenue.toLocaleString('en-IN')}</span>
                      <span className="block text-[11px] text-agri-100 mt-0.5">Highest expected net profit</span>
                    </div>
                  </div>

                  {/* Why Recommended Explanation */}
                  <div className="bg-amber-100/60 border border-amber-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-700" /> Why this deal is recommended:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950 font-medium">
                      {best.rationale.map((r, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    {best.type === 'BUYER' ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="bg-agri-600 hover:bg-agri-700 shadow-md"
                        onClick={() => navigate('/offers')}
                      >
                        Send Offer to Buyer <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        className="bg-agri-600 hover:bg-agri-700 shadow-md"
                        onClick={() => navigate('/price-history')}
                      >
                        View APMC Mandi Prices <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ADVISOR & MAP */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <TrendingUp className="w-5 h-5 text-agri-600" /> Market Price Advisory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-xl border text-center space-y-1 ${
                    result.sellOrWaitAdvice.decision === 'CONSIDER WAITING'
                      ? 'bg-sky-50 border-sky-200 text-sky-900'
                      : 'bg-agri-50 border-agri-200 text-agri-900'
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">Selling Suggestion</span>
                    <h3 className="text-2xl font-black">{result.sellOrWaitAdvice.decision}</h3>
                    <p className="text-xs font-bold mt-2">
                      Expected Range: <span className="text-slate-900">{result.sellOrWaitAdvice.expectedPriceRange}</span>
                    </p>
                  </div>

                  <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                    <p><strong>Current Market Avg:</strong> ₹{result.sellOrWaitAdvice.currentAvgPrice}/kg</p>
                    <p><strong>Reasoning:</strong> {result.sellOrWaitAdvice.reasoning}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-2">30-Day Mandi Price Trend</span>
                    <PriceTrendChart data={priceHistoryData} cropName={result.crop.name} />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <MapPin className="w-5 h-5 text-agri-600" /> Nearby Buyers & Mandis Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketMap farmerLocation={result.farmerLocation} options={result.options} />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-4 h-4 text-agri-600" /> Green circle depicts 25 km radius around farm. Pins show nearby buyers and markets.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* COMPARISON TABLE */}
            <Card className="border-gray-200">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Table className="w-5 h-5 text-agri-600" /> All Buyer & Market Options
                </CardTitle>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md text-xs font-bold transition ${viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-gray-500'}`}
                  >
                    <Table className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-md text-xs font-bold transition ${viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-gray-500'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'table' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-bold uppercase text-gray-600">
                          <th className="py-3 px-4">Buyer / Market</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Distance</th>
                          <th className="py-3 px-4">Offered Price</th>
                          <th className="py-3 px-4">Est. Transport</th>
                          <th className="py-3 px-4">Expected Net Revenue</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.options.map((opt) => (
                          <tr key={opt.id} className={`hover:bg-gray-50 transition ${opt.isRecommended ? 'bg-amber-50/60 font-semibold' : ''}`}>
                            <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                              {opt.isRecommended && <span className="text-lg">🏆</span>}
                              {opt.name}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={opt.type === 'BUYER' ? 'info' : 'earth'}>{opt.type}</Badge>
                            </td>
                            <td className="py-3.5 px-4 text-gray-600">{opt.distanceKm} km</td>
                            <td className="py-3.5 px-4 font-bold text-gray-900">₹{opt.unitPrice}/kg</td>
                            <td className="py-3.5 px-4 text-rose-600 font-medium">- ₹{opt.transportCost.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 px-4 font-black text-agri-600 text-base">₹{opt.expectedNetRevenue.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                variant={opt.isRecommended ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => navigate(opt.type === 'BUYER' ? '/offers' : '/price-history')}
                              >
                                Select
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.options.map((opt) => (
                      <Card key={opt.id} className={`p-4 space-y-3 ${opt.isRecommended ? 'border-2 border-amber-400 bg-amber-50/40' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant={opt.type === 'BUYER' ? 'info' : 'earth'} className="mb-1">{opt.type}</Badge>
                            <h4 className="font-bold text-gray-900 text-base">{opt.name}</h4>
                            <p className="text-xs text-gray-500">{opt.locationCity} • {opt.distanceKm} km away</p>
                          </div>
                          {opt.isRecommended && (
                            <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full">
                              🏆 Best Deal
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
                          <span className="text-gray-500">Unit Price:</span>
                          <span className="font-bold text-gray-900">₹{opt.unitPrice}/kg</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Est. Transport Cost:</span>
                          <span className="text-rose-600 font-medium">₹{opt.transportCost}</span>
                        </div>
                        <div className="flex justify-between items-center text-base pt-1 border-t border-gray-100">
                          <span className="font-bold text-agri-800">Net Revenue:</span>
                          <span className="font-black text-agri-600">₹{opt.expectedNetRevenue.toLocaleString('en-IN')}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
