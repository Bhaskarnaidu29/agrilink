import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Crop, Market } from '../../types';
import { ShieldCheck, Users, Store, Package, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedMarketId, setSelectedMarketId] = useState<string>('');
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [pricePerUnit, setPricePerUnit] = useState<number>(30);
  const [minPrice, setMinPrice] = useState<number>(27);
  const [maxPrice, setMaxPrice] = useState<number>(33);

  const loadAdminData = async () => {
    try {
      const [analyticsRes, cropRes, mktRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/crops'),
        api.get('/markets'),
      ]);
      setMetrics(analyticsRes.data.metrics || {});
      setCrops(cropRes.data.crops || []);
      setMarkets(mktRes.data.markets || []);
      if (mktRes.data.markets.length > 0) setSelectedMarketId(mktRes.data.markets[0].id);
      if (cropRes.data.crops.length > 0) setSelectedCropId(cropRes.data.crops[0].id);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/market-prices', {
        marketId: selectedMarketId,
        cropId: selectedCropId,
        pricePerUnit: Number(pricePerUnit),
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
      });

      setModalOpen(false);
      loadAdminData();
      alert('Market price updated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Price update failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-400" /> Platform Admin Control Center
            </h1>
            <p className="text-sm text-slate-400">Monitor system analytics, APMC mandi rates, and platform transactions</p>
          </div>

          <Button
            variant="primary"
            className="bg-purple-600 hover:bg-purple-500"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Update Daily Mandi Price
          </Button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-agri-600">
            <span className="text-xs font-bold text-gray-500 uppercase">Registered Farmers</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.totalFarmers || 0}</h3>
          </Card>

          <Card className="p-4 border-l-4 border-l-sky-600">
            <span className="text-xs font-bold text-gray-500 uppercase">Verified Buyers</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.totalBuyers || 0}</h3>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <span className="text-xs font-bold text-gray-500 uppercase">Active Listings / Demands</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{(metrics.activeListings || 0) + (metrics.openRequirements || 0)}</h3>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-600">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Trade Volume</span>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              ₹{(metrics.totalTradeVolume || 0).toLocaleString('en-IN')}
            </h3>
          </Card>
        </div>

        {/* Price Update Modal */}
        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Update APMC Mandi Price"
          >
            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Mandi Market</label>
                <select
                  value={selectedMarketId}
                  onChange={(e) => setSelectedMarketId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                >
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Crop</label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Modal Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    step="0.5"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full bg-purple-600 hover:bg-purple-700">
                Save & Broadcast Daily Rate
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
