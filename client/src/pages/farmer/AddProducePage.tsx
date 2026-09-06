import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Crop } from '../../types';
import { Sprout, ArrowRight, Check, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { LocationPicker } from '../../components/common/LocationPicker';
import { CropImageUploader } from '../../components/common/CropImageUploader';
import { LocationResult } from '../../services/locationService';

export const AddProducePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropId, setCropId] = useState<string>('');
  const [variety, setVariety] = useState<string>('Standard');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [qualityGrade, setQualityGrade] = useState<string>('');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sellingDate, setSellingDate] = useState<string>(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);

  // Location State
  const [locationData, setLocationData] = useState<LocationResult | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadCrops() {
      try {
        const res = await api.get('/crops');
        setCrops(res.data.crops);
      } catch (err) {
        console.error('Failed to load crops:', err);
      }
    }
    loadCrops();

    // Default to farmer profile location if available
    if (user?.farmerProfile?.city || user?.farmerProfile?.address) {
      setLocationData({
        id: 'farmer-saved-loc',
        name: user.farmerProfile.city || user.farmerProfile.address || 'My Location',
        displayName: user.farmerProfile.city,
        city: user.farmerProfile.city,
        state: user.farmerProfile.state || 'Andhra Pradesh',
        latitude: user.farmerProfile.latitude || 16.5062,
        longitude: user.farmerProfile.longitude || 80.6480,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationData) {
      setError('Please specify your farm location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/farmers/produce', {
        cropId,
        variety,
        quantity: Number(quantity),
        unit,
        qualityGrade,
        harvestDate,
        sellingDate,
        locationCity: locationData.displayName || locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        minPrice: Number(minPrice),
        description,
        images,
      });

      // Immediately navigate to price discovery to view matching buyers
      navigate('/price-discovery');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to list produce');
    } finally {
      setLoading(false);
    }
  };

  const selectedCropObj = crops.find((c) => c.id === cropId);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
            <Sprout className="w-6 h-6 text-agri-600" /> Sell Your Produce
          </h1>
          <p className="text-sm text-gray-500">List your crop in 4 simple steps to match with nearby buyers</p>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="flex items-center justify-between px-4">
          {[
            { num: 1, label: 'Crop' },
            { num: 2, label: 'Produce Details' },
            { num: 3, label: 'Location' },
            { num: 4, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === s.num
                    ? 'bg-agri-600 text-white ring-4 ring-agri-100'
                    : step > s.num
                    ? 'bg-agri-100 text-agri-800'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>

        <Card className="shadow-md border-gray-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1 — CROP */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">STEP 1 — Select Crop</h3>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Which crop are you selling?</label>
                    <select
                      value={cropId}
                      onChange={(e) => setCropId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-base font-bold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
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
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Variety (Optional)</label>
                    <input
                      type="text"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      placeholder="e.g. Hybrid Red / Desi / Standard"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      disabled={!cropId}
                      onClick={() => setStep(2)}
                      variant="primary"
                      className="bg-agri-600 hover:bg-agri-700 disabled:opacity-50"
                    >
                      Next: Produce Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2 — DETAILS */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">STEP 2 — Harvest & Quality Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity Available</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quality Grade</label>
                      <select
                        value={qualityGrade}
                        onChange={(e) => setQualityGrade(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                      >
                        <option value="">[ Select quality grade ]</option>
                        <option value="Grade A">Grade A (Premium)</option>
                        <option value="Grade B">Grade B (Standard)</option>
                        <option value="Grade C">Grade C (Fair)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Min Expected Price (₹/kg)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Enter price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-agri-700 focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Harvest Date</label>
                      <input
                        type="date"
                        value={harvestDate}
                        onChange={(e) => setHarvestDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Ready for Sale Date</label>
                      <input
                        type="date"
                        value={sellingDate}
                        onChange={(e) => setSellingDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* AI-ASSISTED MULTI-PHOTO UPLOADER */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Batch Photos for AI Visual Assessment (Recommended 4+ Photos)
                    </label>
                    <CropImageUploader
                      cropName={selectedCropObj?.name || 'Produce'}
                      declaredGrade={qualityGrade}
                      quantity={Number(quantity) || 0}
                      unit={unit}
                      images={images}
                      onChange={(imgs) => setImages(imgs)}
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button type="button" onClick={() => setStep(1)} variant="outline">
                      Back
                    </Button>
                    <Button
                      type="button"
                      disabled={!quantity || Number(quantity) <= 0 || !qualityGrade || !minPrice}
                      onClick={() => setStep(3)}
                      variant="primary"
                      className="bg-agri-600 hover:bg-agri-700 disabled:opacity-50"
                    >
                      Next: Location <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3 — DYNAMIC LOCATION */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">STEP 3 — Farm Location</h3>

                  <LocationPicker
                    label="Specify Farm Location (Village / Mandal / PIN)"
                    value={locationData ? {
                      locationName: locationData.name,
                      city: locationData.city,
                      state: locationData.state,
                      latitude: locationData.latitude,
                      longitude: locationData.longitude,
                    } : undefined}
                    onChange={(loc) => setLocationData(loc)}
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Note for Buyers (Optional)</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Fresh farm pickup available. Packed in 25kg crates."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button type="button" onClick={() => setStep(2)} variant="outline">
                      Back
                    </Button>
                    <Button
                      type="button"
                      disabled={!locationData}
                      onClick={() => setStep(4)}
                      variant="primary"
                      className="bg-agri-600 hover:bg-agri-700 disabled:opacity-50"
                    >
                      Next: Review Summary <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4 — REVIEW & SUBMIT */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">STEP 4 — Review & List Produce</h3>

                  <div className="bg-agri-50/60 p-4 rounded-2xl border border-agri-200 space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-agri-200/60 pb-2">
                      <span className="text-gray-600 font-medium">Crop:</span>
                      <span className="font-black text-gray-900 text-base">{selectedCropObj?.name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Quantity & Grade:</span>
                      <span className="font-bold text-gray-900">{quantity} {unit} • {qualityGrade}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Min Expected Price:</span>
                      <span className="font-bold text-agri-700 text-base">₹{minPrice}/kg</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Location:</span>
                      <span className="font-bold text-gray-900">📍 {locationData?.displayName || locationData?.name}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-agri-200/60">
                      <span className="text-gray-600 font-medium">Estimated Gross Value:</span>
                      <span className="font-black text-agri-800 text-lg">₹{(Number(quantity) * Number(minPrice)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3">
                    <Button type="button" onClick={() => setStep(3)} variant="outline">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1 bg-agri-600 hover:bg-agri-700 shadow-md"
                      isLoading={loading}
                    >
                      List Produce & View Matching Buyers <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
