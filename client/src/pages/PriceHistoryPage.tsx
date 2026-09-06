import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Crop, Market, MarketPrice } from '../types';
import { TrendingUp, Filter, Search, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PriceTrendChart } from '../components/charts/PriceTrendChart';

export const PriceHistoryPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('');
  const [days, setDays] = useState<number>(30);

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cropRes, mktRes] = await Promise.all([
          api.get('/crops'),
          api.get('/markets'),
        ]);
        setCrops(cropRes.data.crops || []);
        setMarkets(mktRes.data.markets || []);
        if (cropRes.data.crops?.length > 0) setSelectedCropId(cropRes.data.crops[0].id);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadMeta();
  }, []);

  const loadData = async () => {
    if (!selectedCropId) return;
    setLoading(true);
    try {
      const [priceRes, histRes] = await Promise.all([
        api.get(`/markets/prices?cropId=${selectedCropId}${selectedMarketId ? `&marketId=${selectedMarketId}` : ''}`),
        api.get(`/price-discovery/history?cropId=${selectedCropId}${selectedMarketId ? `&marketId=${selectedMarketId}` : ''}&days=${days}`),
      ]);
      setPrices(priceRes.data.prices || []);
      setHistoryData(histRes.data.histories || []);
    } catch (err) {
      console.error('Failed to load prices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCropId, selectedMarketId, days]);

  const selectedCrop = crops.find((c) => c.id === selectedCropId);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-agri-600" /> APMC Mandi Prices & Trends
            </h1>
            <p className="text-sm text-gray-500">Benchmark mandi rates & historical price trends across agricultural markets</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-200 shadow-xs">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Crop</label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Mandi Market (Optional)</label>
                <select
                  value={selectedMarketId}
                  onChange={(e) => setSelectedMarketId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                >
                  <option value="">All Mandi Markets</option>
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Time Horizon</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Graph */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900">
              {selectedCrop?.name || 'Crop'} Price Trend Curve ({days} Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PriceTrendChart data={historyData} cropName={selectedCrop?.name || 'Crop'} />
          </CardContent>
        </Card>

        {/* Mandi Rates Grid */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900">Current APMC Mandi Benchmark Rates ({prices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prices.map((p) => (
                <div key={p.id} className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{p.market.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-agri-600" /> {p.market.city}, {p.market.state}
                      </p>
                    </div>
                    <Badge variant="earth">{p.crop.name}</Badge>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-xs text-gray-500 font-medium">Modal Price:</span>
                    <span className="text-xl font-black text-agri-600">₹{p.pricePerUnit}/kg</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Min: ₹{p.minPrice}/kg</span>
                    <span>Max: ₹{p.maxPrice}/kg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
