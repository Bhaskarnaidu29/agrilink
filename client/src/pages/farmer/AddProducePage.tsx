import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Crop } from '../../types';
import { Sprout, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const AddProducePage: React.FC = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropId, setCropId] = useState<string>('');
  const [variety, setVariety] = useState<string>('Standard');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<string>('kg');
  const [qualityGrade, setQualityGrade] = useState<string>('Grade A');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sellingDate, setSellingDate] = useState<string>(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [locationCity, setLocationCity] = useState<string>('Vijayawada');
  const [minPrice, setMinPrice] = useState<number>(25);
  const [description, setDescription] = useState<string>('');

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

    let latitude = 16.5062;
    let longitude = 80.6480;
    if (locationCity === 'Guntur') { latitude = 16.3067; longitude = 80.4365; }
    if (locationCity === 'Eluru') { latitude = 16.7107; longitude = 81.1035; }
    if (locationCity === 'Hyderabad') { latitude = 17.3850; longitude = 78.4867; }

    try {
      await api.post('/farmers/produce', {
        cropId,
        variety,
        quantity: Number(quantity),
        unit,
        qualityGrade,
        harvestDate,
        sellingDate,
        locationCity,
        latitude,
        longitude,
        minPrice: Number(minPrice),
        description,
      });

      navigate('/price-discovery');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create produce listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
            <Sprout className="w-6 h-6 text-agri-600" /> Add Harvest Produce
          </h1>
          <p className="text-sm text-gray-500">List your crop to calculate net revenue & find matched buyers</p>
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
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Crop</label>
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
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
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
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quality Grade</label>
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
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Expected Sale Date</label>
                  <input
                    type="date"
                    value={sellingDate}
                    onChange={(e) => setSellingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Farm Location</label>
                  <select
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                  >
                    <option value="Vijayawada">Vijayawada</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Eluru">Eluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Min Price (₹/unit)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Firm Grade A tomatoes ready for immediate pickup."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full bg-agri-600 hover:bg-agri-700" isLoading={loading}>
                Save & Run Price Discovery <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
