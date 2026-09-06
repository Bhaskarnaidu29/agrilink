import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Crop } from '../../types';
import { Store, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { LocationPicker } from '../../components/common/LocationPicker';
import { LocationResult } from '../../services/locationService';

export const PostRequirementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropId, setCropId] = useState<string>('');
  const [variety, setVariety] = useState<string>('Standard');
  const [quantityNeeded, setQuantityNeeded] = useState<number>(1000);
  const [unit, setUnit] = useState<string>('kg');
  const [qualityGrade, setQualityGrade] = useState<string>('Grade A');
  const [offeredPrice, setOfferedPrice] = useState<number>(28.5);
  const [requiredDate, setRequiredDate] = useState<string>(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [maxDistance, setMaxDistance] = useState<number>(50);

  // Location State
  const [locationData, setLocationData] = useState<LocationResult | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadCrops() {
      try {
        const res = await api.get('/crops');
        setCrops(res.data.crops);
        if (res.data.crops.length > 0) {
          setCropId(res.data.crops[0].id);
        }
      } catch (err) {
        console.error('Failed to load crops:', err);
      }
    }
    loadCrops();

    // Default to buyer profile location if available
    if (user?.buyerProfile?.city) {
      setLocationData({
        id: 'buyer-saved-loc',
        name: user.buyerProfile.city,
        displayName: user.buyerProfile.city,
        city: user.buyerProfile.city,
        state: user.buyerProfile.state || 'Andhra Pradesh',
        latitude: user.buyerProfile.latitude || 16.5193,
        longitude: user.buyerProfile.longitude || 80.6305,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationData) {
      setError('Please specify your location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/requirements', {
        cropId,
        variety,
        quantityNeeded: Number(quantityNeeded),
        unit,
        qualityGrade,
        offeredPrice: Number(offeredPrice),
        requiredDate,
        locationCity: locationData.displayName || locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      navigate(`/buyer/matching?reqId=${res.data.requirement.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
            <Store className="w-6 h-6 text-sky-600" /> Post Sourcing Requirement
          </h1>
          <p className="text-sm text-gray-500">Specify produce needed to connect directly with nearby farmers</p>
        </div>

        <Card className="shadow-md border-gray-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Crop Needed</label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Hybrid Red / Any"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="quintal">Quintals</option>
                    <option value="ton">Tons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Fair)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Offered Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Required By Date</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Max Sourcing Radius</label>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold"
                >
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                  <option value={100}>Within 100 km</option>
                </select>
              </div>

              {/* DYNAMIC LOCATION PICKER */}
              <LocationPicker
                label="Buyer Sourcing Location"
                value={locationData ? {
                  locationName: locationData.name,
                  city: locationData.city,
                  state: locationData.state,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                } : undefined}
                onChange={(loc) => setLocationData(loc)}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!locationData}
                className="w-full bg-sky-600 hover:bg-sky-700 shadow-md disabled:opacity-50"
                isLoading={loading}
              >
                Post & Find Nearby Farmers <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
