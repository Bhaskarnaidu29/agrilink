import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Crop } from '../../types';
import { Store, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const PostRequirementPage: React.FC = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropId, setCropId] = useState<string>('');
  const [variety, setVariety] = useState<string>('Standard');
  const [quantityNeeded, setQuantityNeeded] = useState<number>(1000);
  const [unit, setUnit] = useState<string>('kg');
  const [qualityGrade, setQualityGrade] = useState<string>('Grade A');
  const [offeredPrice, setOfferedPrice] = useState<number>(28.5);
  const [requiredDate, setRequiredDate] = useState<string>(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [locationCity, setLocationCity] = useState<string>('Vijayawada');

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let latitude = 16.5193;
    let longitude = 80.6305;
    if (locationCity === 'Guntur') { latitude = 16.3100; longitude = 80.4400; }
    if (locationCity === 'Hyderabad') { latitude = 17.3850; longitude = 78.4867; }

    try {
      const res = await api.post('/requirements', {
        cropId,
        variety,
        quantityNeeded: Number(quantityNeeded),
        unit,
        qualityGrade,
        offeredPrice: Number(offeredPrice),
        requiredDate,
        locationCity,
        latitude,
        longitude,
      });

      navigate(`/buyer/matching?reqId=${res.data.requirement.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post buyer requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
            <Store className="w-6 h-6 text-sky-600" /> Post Crop Requirement
          </h1>
          <p className="text-sm text-gray-500">Post your crop demand to find matching farmers</p>
        </div>

        <Card className="shadow-md border-gray-200">
          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Required Crop</label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                    placeholder="e.g. Hybrid Red"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Needed Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Desired Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Offered Price (₹/unit)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Required Date</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Buyer Location</label>
                <select
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                >
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi">Delhi APMC</option>
                </select>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full bg-sky-600 hover:bg-sky-700" isLoading={loading}>
                Post & Find Matching Farmers <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
