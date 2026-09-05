import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { BuyerRequirement, ProduceListing } from '../../types';
import { Target, CheckCircle2, MapPin, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface MatchItem {
  farmer: { id: string; name: string; farmName: string; phone: string; city: string };
  listing: ProduceListing;
  distanceKm: number;
  compatibilityPercent: number;
  rationale: string[];
}

export const MatchingFarmersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reqId = searchParams.get('reqId');
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState<BuyerRequirement | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMatches() {
      if (!reqId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.post('/matching/farmers', { requirementId: reqId });
        setRequirement(res.data.requirement);
        setMatches(res.data.matches);
      } catch (err) {
        console.error('Failed to load matching farmers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [reqId]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white p-8 rounded-3xl shadow-lg space-y-2">
          <span className="text-sky-300 text-xs font-bold uppercase tracking-widest block">🎯 Smart Matching Engine</span>
          <h1 className="text-3xl font-black">Top Matched Farmers for Requirement</h1>
          {requirement && (
            <p className="text-slate-300 text-sm">
              Sourcing {requirement.quantityNeeded} {requirement.unit} of {requirement.crop.name} ({requirement.qualityGrade}) @ Offered ₹{requirement.offeredPrice}/kg
            </p>
          )}
        </div>

        {matches.length === 0 ? (
          <Card className="text-center py-12 p-8">
            <p className="text-gray-500 font-medium">No matching active farmer listings found for this requirement currently.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((item, idx) => (
              <Card key={item.listing.id} className={`p-6 space-y-4 border-gray-200 ${idx === 0 ? 'border-2 border-sky-400 bg-sky-50/20' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="info" className="mb-1">
                      {item.compatibilityPercent}% Match Compatibility
                    </Badge>
                    <h3 className="text-lg font-bold text-gray-900">{item.farmer.farmName}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" /> {item.farmer.city} • {item.distanceKm} km away
                    </p>
                  </div>
                  <span className="text-2xl font-black text-sky-600">{idx + 1}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Listed Crop:</span>
                    <span className="font-bold text-gray-900">{item.listing.crop.name} ({item.listing.variety})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available Qty:</span>
                    <span className="font-bold text-gray-900">{item.listing.quantity} {item.listing.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Asking Min Price:</span>
                    <span className="font-bold text-agri-700">₹{item.listing.minPrice}/kg</span>
                  </div>
                </div>

                {/* Match Rationale */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-sky-900 block">Why Matched:</span>
                  <ul className="text-xs text-sky-950 space-y-0.5 font-medium">
                    {item.rationale.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="primary"
                  className="w-full bg-sky-600 hover:bg-sky-700 mt-2"
                  onClick={() => navigate('/offers')}
                >
                  Send Direct Offer <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
