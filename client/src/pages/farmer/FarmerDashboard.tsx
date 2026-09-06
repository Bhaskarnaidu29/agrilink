import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { ProduceListing, Offer, BuyerRequirement, RecommendedOption } from '../../types';
import { Plus, Search, Package, CheckCircle2, Edit, Trash2, MapPin, Trophy, Handshake, ArrowRight, ShieldCheck, Scale, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [nearbyBuyers, setNearbyBuyers] = useState<RecommendedOption[]>([]);
  const [nearbyMarkets, setNearbyMarkets] = useState<RecommendedOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter chips state
  const [distanceFilter, setDistanceFilter] = useState<string>('50'); // 10, 25, 50, 100, all
  const [activeTab, setActiveTab] = useState<'buyers' | 'markets'>('buyers');

  // Compare Modal State
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<RecommendedOption[]>([]);

  // Edit Profile State
  const [editProfileOpen, setEditProfileOpen] = useState<boolean>(false);
  const [farmName, setFarmName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  // Edit Produce State
  const [editProduce, setEditProduce] = useState<ProduceListing | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editMinPrice, setEditMinPrice] = useState<number>(0);
  const [editGrade, setEditGrade] = useState<string>('Grade A');

  const loadDashboard = async () => {
    try {
      const [listRes, offerRes] = await Promise.all([
        api.get('/farmers/produce'),
        api.get('/offers'),
      ]);

      const userListings: ProduceListing[] = listRes.data.listings || [];
      setListings(userListings);
      setOffers(offerRes.data.offers || []);

      // If farmer has listings, run discovery for the first active listing
      if (userListings.length > 0) {
        const primaryListing = userListings[0];
        try {
          const discRes = await api.post('/price-discovery', {
            cropId: primaryListing.cropId,
            quantityKg: primaryListing.quantity,
            qualityGrade: primaryListing.qualityGrade,
            locationCity: primaryListing.locationCity || user?.farmerProfile?.city || 'Vijayawada',
            latitude: primaryListing.latitude || user?.farmerProfile?.latitude || 16.5062,
            longitude: primaryListing.longitude || user?.farmerProfile?.longitude || 80.6480,
          });

          const options: RecommendedOption[] = discRes.data.options || [];
          const buyers = options.filter((o) => o.type === 'BUYER');
          const markets = options.filter((o) => o.type === 'MARKET');

          setNearbyBuyers(buyers);
          setNearbyMarkets(markets);
        } catch (discErr) {
          console.error('Failed to calculate nearby buyer opportunities:', discErr);
        }
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const openProfileModal = () => {
    setFarmName(user?.farmerProfile?.farmName || '');
    setCity(user?.farmerProfile?.city || 'Vijayawada');
    setAddress(user?.farmerProfile?.address || '');
    setEditProfileOpen(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/farmers/profile', { farmName, city, address });
      setEditProfileOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Profile update failed');
    }
  };

  const openProduceModal = (item: ProduceListing) => {
    setEditProduce(item);
    setEditQuantity(item.quantity);
    setEditMinPrice(item.minPrice);
    setEditGrade(item.qualityGrade);
  };

  const handleProduceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduce) return;

    try {
      await api.put(`/farmers/produce/${editProduce.id}`, {
        quantity: Number(editQuantity),
        minPrice: Number(editMinPrice),
        qualityGrade: editGrade,
      });

      setEditProduce(null);
      loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Produce update failed');
    }
  };

  const handleDeleteProduce = async (id: string) => {
    if (!confirm('Are you sure you want to delete this produce listing?')) return;
    try {
      await api.delete(`/farmers/produce/${id}`);
      loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Filter buyers by distance
  const filteredBuyers = nearbyBuyers.filter((b) => {
    if (distanceFilter === 'all') return true;
    return b.distanceKm <= Number(distanceFilter);
  });

  const toggleCompare = (opt: RecommendedOption) => {
    if (selectedForCompare.find((o) => o.id === opt.id)) {
      setSelectedForCompare(selectedForCompare.filter((o) => o.id !== opt.id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare up to 4 buyers at a time.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, opt]);
    }
  };

  const pendingOffers = offers.filter((o) => o.status === 'PENDING' || o.status === 'COUNTERED');
  const userCity = user?.farmerProfile?.city || 'Vijayawada';

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Farmer Marketplace Header */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">Good morning, {user?.name || 'Farmer'} 👋</h1>
              <button onClick={openProfileModal} className="text-gray-400 hover:text-agri-600 p-1">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-agri-600" /> 📍 {userCity} • {user?.farmerProfile?.farmName || 'My Farm'}
            </p>
            <p className="text-xs text-agri-700 font-semibold pt-0.5">Find the best buyer for your harvest.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/farmer/add-produce">
              <Button variant="primary" className="bg-agri-600 hover:bg-agri-700 shadow-md">
                <Plus className="w-4 h-4 mr-1.5" /> Sell Produce
              </Button>
            </Link>
            <Link to="/price-discovery">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-1.5" /> Find Buyers
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. MY PRODUCE SECTION */}
        <Card className="border-gray-200">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Package className="w-5 h-5 text-agri-600" /> My Produce ({listings.length})
            </CardTitle>
            <Link to="/farmer/add-produce">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add Crop
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 p-6">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">Ready to sell your harvest?</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  List your crop and we'll show buyers looking for it nearby with estimated transport profit calculations.
                </p>
                <Link to="/farmer/add-produce">
                  <Button variant="primary" size="sm" className="bg-agri-600 hover:bg-agri-700 mt-2">
                    List Produce
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((item) => (
                  <Card key={item.id} className="p-5 space-y-3 border-gray-200 hover:border-agri-400 transition shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold text-agri-700 uppercase tracking-wider">{item.crop.category}</span>
                        <h3 className="text-lg font-black text-gray-900">{item.crop.name}</h3>
                        <p className="text-xs text-gray-500">{item.variety} • {item.qualityGrade}</p>
                      </div>
                      <Badge variant="success">{item.status}</Badge>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500 text-xs">Available Quantity:</span>
                      <span className="font-bold text-gray-900">{item.quantity} {item.unit}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 text-xs">Expected Min Price:</span>
                      <span className="font-bold text-agri-700">₹{item.minPrice}/kg</span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-agri-600 hover:bg-agri-700 text-xs"
                        onClick={() => navigate('/price-discovery')}
                      >
                        View Buyers
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProduceModal(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteProduce(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. NEARBY BUYERS & MARKETS SECTION */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('buyers')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  activeTab === 'buyers'
                    ? 'bg-agri-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Nearby Buyers ({filteredBuyers.length})
              </button>
              <button
                onClick={() => setActiveTab('markets')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  activeTab === 'markets'
                    ? 'bg-agri-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Nearby APMC Markets ({nearbyMarkets.length})
              </button>
            </div>

            {/* Distance Filter Chips */}
            {activeTab === 'buyers' && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-gray-500 font-medium mr-1">Distance:</span>
                {[
                  { label: 'Within 10 km', val: '10' },
                  { label: 'Within 25 km', val: '25' },
                  { label: 'Within 50 km', val: '50' },
                  { label: 'Within 100 km', val: '100' },
                  { label: 'Any', val: 'all' },
                ].map((chip) => (
                  <button
                    key={chip.val}
                    onClick={() => setDistanceFilter(chip.val)}
                    className={`px-2.5 py-1 rounded-full font-semibold transition whitespace-nowrap ${
                      distanceFilter === chip.val
                        ? 'bg-agri-100 text-agri-800 border border-agri-300'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BUYERS TAB */}
          {activeTab === 'buyers' && (
            <div className="space-y-4">
              {filteredBuyers.length === 0 ? (
                <Card className="text-center py-10 p-6 space-y-3">
                  <Search className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-gray-600 font-medium text-sm">
                    No buyers found within {distanceFilter} km for your listed crop.
                  </p>
                  {distanceFilter !== 'all' && (
                    <Button variant="outline" size="sm" onClick={() => setDistanceFilter('all')}>
                      Expand Search Radius
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBuyers.map((buyer) => {
                    const isSelected = !!selectedForCompare.find((o) => o.id === buyer.id);

                    return (
                      <Card
                        key={buyer.id}
                        className={`p-5 space-y-4 border transition relative ${
                          buyer.isRecommended
                            ? 'border-2 border-amber-400 bg-amber-50/20 shadow-md'
                            : 'border-gray-200 hover:border-agri-300 shadow-xs'
                        }`}
                      >
                        {/* Recommendation Badge */}
                        {buyer.isRecommended && (
                          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <Trophy className="w-3 h-3" /> Best Deal
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">{buyer.name}</h3>
                            <ShieldCheck className="w-4 h-4 text-agri-600" />
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-agri-600" /> 📍 {buyer.locationCity} • {buyer.distanceKm} km away
                          </p>
                        </div>

                        {/* Price & Earning Details */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Buyer Offer Price:</span>
                            <span className="font-extrabold text-slate-900 text-sm">₹{buyer.unitPrice}/kg</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Est. Transport Cost:</span>
                            <span className="text-rose-600 font-semibold">- ₹{buyer.transportCost}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm">
                            <span className="font-bold text-agri-800">Est. Net Earning:</span>
                            <span className="font-black text-agri-600">₹{buyer.expectedNetRevenue.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Rationale / Explanation */}
                        {buyer.rationale && buyer.rationale.length > 0 && (
                          <p className="text-[11px] text-gray-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                            💡 {buyer.rationale[0]}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 bg-agri-600 hover:bg-agri-700 text-xs"
                            onClick={() => navigate('/offers')}
                          >
                            Accept / Offer
                          </Button>
                          <Button
                            variant={isSelected ? 'secondary' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => toggleCompare(buyer)}
                          >
                            <Scale className="w-3.5 h-3.5 mr-1" />
                            {isSelected ? 'Added' : 'Compare'}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Compare Bar Floating CTA */}
              {selectedForCompare.length > 0 && (
                <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-xl mx-auto z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-agri-400">{selectedForCompare.length} Buyers Selected</span>
                    <p className="text-slate-400">Compare net revenue & transport costs side-by-side</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-300 border-slate-700 hover:bg-slate-800"
                      onClick={() => setSelectedForCompare([])}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-agri-500 hover:bg-agri-600 text-slate-950 font-bold"
                      onClick={() => setCompareModalOpen(true)}
                    >
                      Compare Buyers ({selectedForCompare.length})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MARKETS TAB */}
          {activeTab === 'markets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyMarkets.map((market) => (
                <Card key={market.id} className="p-5 space-y-3 border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="earth">APMC MANDI</Badge>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{market.name}</h3>
                      <p className="text-xs text-gray-500">📍 {market.locationCity} • {market.distanceKm} km away</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Indicative Mandi Rate:</span>
                      <span className="font-bold text-gray-900">₹{market.unitPrice}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Transport:</span>
                      <span className="text-rose-600 font-medium">- ₹{market.transportCost}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                      <span className="font-bold text-agri-800">Est. Net Value:</span>
                      <span className="font-black text-agri-600">₹{market.expectedNetRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate('/price-history')}
                  >
                    View Mandi Price Trends
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* COMPARE BUYERS MODAL */}
        {compareModalOpen && (
          <Modal
            isOpen={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
            title="Compare Nearby Buyers Side-by-Side"
          >
            <div className="overflow-x-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[500px]">
                {selectedForCompare.map((buyer) => (
                  <div
                    key={buyer.id}
                    className={`p-4 rounded-2xl border space-y-3 text-xs ${
                      buyer.isRecommended ? 'border-2 border-amber-400 bg-amber-50/30' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {buyer.isRecommended && (
                      <Badge variant="warning" className="text-[10px] bg-amber-400 text-slate-900 border-none font-bold">
                        🏆 Best Deal
                      </Badge>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{buyer.name}</h4>
                      <p className="text-gray-500">{buyer.locationCity} ({buyer.distanceKm} km)</p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-gray-100">
                      <p className="text-gray-500">Offered Price:</p>
                      <p className="text-base font-black text-slate-900">₹{buyer.unitPrice}/kg</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-500">Est. Transport:</p>
                      <p className="font-semibold text-rose-600">- ₹{buyer.transportCost}</p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-gray-100">
                      <p className="text-gray-500 font-medium">Est. Net Earning:</p>
                      <p className="text-lg font-black text-agri-600">₹{buyer.expectedNetRevenue.toLocaleString('en-IN')}</p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-agri-600 hover:bg-agri-700 text-xs mt-2"
                      onClick={() => {
                        setCompareModalOpen(false);
                        navigate('/offers');
                      }}
                    >
                      Accept / Offer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Profile Modal */}
        {editProfileOpen && (
          <Modal
            isOpen={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            title="Edit Farm Profile"
          >
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Farm / Village Name</label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">City / Mandal</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Address (Optional)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full bg-agri-600">
                Save Profile
              </Button>
            </form>
          </Modal>
        )}

        {/* Edit Produce Modal */}
        {editProduce && (
          <Modal
            isOpen={!!editProduce}
            onClose={() => setEditProduce(null)}
            title="Edit Produce Listing"
          >
            <form onSubmit={handleProduceUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  required
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Min Acceptable Price (₹/kg)</label>
                <input
                  type="number"
                  required
                  value={editMinPrice}
                  onChange={(e) => setEditMinPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quality Grade</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                >
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Grade C">Grade C</option>
                </select>
              </div>
              <Button type="submit" variant="primary" className="w-full bg-agri-600">
                Update Listing
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
