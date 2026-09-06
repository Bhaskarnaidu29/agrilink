import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { BuyerRequirement, ProduceListing } from '../../types';
import { Target, CheckCircle2, MapPin, ArrowRight, UserCheck, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MakeOfferModal } from '../../components/common/MakeOfferModal';
import { ProduceDetailsModal } from '../../components/common/ProduceDetailsModal';
import { AgriTrustModal } from '../../components/common/AgriTrustModal';

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
  const [allListings, setAllListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [selectedListingForOffer, setSelectedListingForOffer] = useState<ProduceListing | null>(null);
  const [makeOfferModalOpen, setMakeOfferModalOpen] = useState<boolean>(false);
  const [selectedListingForDetails, setSelectedListingForDetails] = useState<ProduceListing | null>(null);
  const [produceDetailsModalOpen, setProduceDetailsModalOpen] = useState<boolean>(false);
  const [selectedAgriTrust, setSelectedAgriTrust] = useState<any | null>(null);
  const [agriTrustModalOpen, setAgriTrustModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadMatches() {
      if (!reqId) {
        // Fallback: browse all active produce listings
        try {
          const res = await api.get('/marketplace/produce');
          setAllListings(res.data.listings || []);
        } catch (err) {
          console.error('Failed to load produce listings:', err);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.post('/matching/farmers', { requirementId: reqId });
        setRequirement(res.data.requirement);
        setMatches(res.data.matches || []);
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
        <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-slate-900 text-white p-8 rounded-3xl shadow-lg space-y-2">
          <span className="text-sky-300 text-xs font-bold uppercase tracking-widest block">📍 Nearby Farmers Match</span>
          <h1 className="text-3xl font-black">Farmers Looking to Sell</h1>
          {requirement ? (
            <p className="text-slate-300 text-sm">
              Sourcing {requirement.quantityNeeded} {requirement.unit} of {requirement.crop?.name || 'Crop'} ({requirement.qualityGrade}) @ Offered ₹{requirement.offeredPrice}/kg
            </p>
          ) : (
            <p className="text-slate-300 text-sm">Browse active produce listings from verified local farmers</p>
          )}
        </div>

        {reqId ? (
          matches.length === 0 ? (
            <Card className="text-center py-12 p-8 space-y-3">
              <Target className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-600 font-medium">No matching active farmer listings found for this requirement currently.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/buyer/dashboard')}>
                Back to Dashboard
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((item, idx) => (
                <Card key={item.listing.id} className={`p-6 space-y-4 border-gray-200 ${idx === 0 ? 'border-2 border-sky-400 bg-sky-50/20 shadow-md' : 'shadow-xs'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="text-lg font-bold text-gray-900">{item.farmer.farmName || item.farmer.name}</h3>
                        <UserCheck className="w-4 h-4 text-agri-600" />
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" /> {item.farmer.city} • {item.distanceKm} km away
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Crop:</span>
                      <span className="font-bold text-gray-900">{item.listing.crop?.name} ({item.listing.qualityGrade})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Available Qty:</span>
                      <span className="font-bold text-gray-900">{item.listing.quantity} {item.listing.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-gray-100">
                      <span className="text-gray-600 font-medium">Expected Price:</span>
                      <span className="font-bold text-sky-700">₹{item.listing.minPrice}/kg</span>
                    </div>
                  </div>

                  {item.rationale && item.rationale.length > 0 && (
                    <div className="space-y-1">
                      <ul className="text-xs text-sky-950 space-y-1 font-medium">
                        {item.rationale.map((r, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full bg-sky-600 hover:bg-sky-700 mt-2"
                    onClick={() => {
                      setSelectedListingForOffer(item.listing);
                      setMakeOfferModalOpen(true);
                    }}
                  >
                    Send Direct Offer <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* BROWSE ALL PRODUCE LISTINGS FALLBACK */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allListings.map((item) => {
              const agriTrust = item.farmer?.agriTrust;
              const thumb = item.images && item.images.length > 0 ? item.images[0] : item.imageUrl;

              return (
                <Card key={item.id} className="p-6 space-y-4 border-gray-200 hover:border-sky-300 transition flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Thumbnail Image Header if present */}
                    {thumb && (
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-gray-100">
                        <img src={thumb} alt={item.crop?.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-agri-400" />
                          {item.aiAssessmentStatus === 'INCONSISTENT' ? '⚠️ Quality Variance' : 'AI-Assessed'}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.farmer?.farmName || item.farmer?.user?.name || 'Local Farm'}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-600" /> 📍 {item.locationCity}
                        </p>
                      </div>
                      {agriTrust && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAgriTrust(agriTrust);
                            setAgriTrustModalOpen(true);
                          }}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-2xs transition ${
                            agriTrust.isNewFarmer ? 'bg-agri-50 text-agri-800 border-agri-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {agriTrust.badgeLabel}
                        </button>
                      )}
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Produce:</span>
                        <span className="font-bold text-gray-900">{item.crop?.name} ({item.qualityGrade})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Available:</span>
                        <span className="font-bold text-gray-900">{item.quantity} {item.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                        <span className="text-gray-600 font-medium">Asking Price:</span>
                        <span className="font-black text-sky-700">₹{item.minPrice}/kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setSelectedListingForDetails(item);
                        setProduceDetailsModalOpen(true);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Inspect
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 bg-sky-600 hover:bg-sky-700 text-xs font-bold"
                      onClick={() => {
                        setSelectedListingForOffer(item);
                        setMakeOfferModalOpen(true);
                      }}
                    >
                      Send Offer <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* MAKE OFFER MODAL */}
        {makeOfferModalOpen && selectedListingForOffer && (
          <MakeOfferModal
            isOpen={makeOfferModalOpen}
            onClose={() => {
              setMakeOfferModalOpen(false);
              setSelectedListingForOffer(null);
            }}
            listing={selectedListingForOffer}
          />
        )}

        {/* PRODUCE DETAILS INSPECTION MODAL */}
        {produceDetailsModalOpen && selectedListingForDetails && (
          <ProduceDetailsModal
            isOpen={produceDetailsModalOpen}
            onClose={() => {
              setProduceDetailsModalOpen(false);
              setSelectedListingForDetails(null);
            }}
            listing={selectedListingForDetails}
            onMakeOffer={(lst) => {
              setSelectedListingForOffer(lst);
              setMakeOfferModalOpen(true);
            }}
          />
        )}

        {/* AGRITRUST BREAKDOWN MODAL */}
        {agriTrustModalOpen && selectedAgriTrust && (
          <AgriTrustModal
            isOpen={agriTrustModalOpen}
            onClose={() => {
              setAgriTrustModalOpen(false);
              setSelectedAgriTrust(null);
            }}
            agriTrust={selectedAgriTrust}
          />
        )}
      </div>
    </div>
  );
};
