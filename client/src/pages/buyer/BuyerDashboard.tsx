import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { BuyerRequirement, Offer, ProduceListing } from '../../types';
import { Store, Plus, Search, Edit, Trash2, MapPin, ShieldCheck, ShoppingBag, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [matchingFarmers, setMatchingFarmers] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit Profile State
  const [editProfileOpen, setEditProfileOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('Wholesaler');
  const [city, setCity] = useState<string>('');

  // Edit Requirement State
  const [editReq, setEditReq] = useState<BuyerRequirement | null>(null);
  const [editQtyNeeded, setEditQtyNeeded] = useState<number>(0);
  const [editOfferedPrice, setEditOfferedPrice] = useState<number>(0);

  const loadBuyerDashboard = async () => {
    try {
      const [reqRes, offerRes, farmerListingsRes] = await Promise.all([
        api.get('/requirements'),
        api.get('/offers'),
        api.get('/marketplace/produce'),
      ]);
      setRequirements(reqRes.data.requirements || []);
      setOffers(offerRes.data.offers || []);
      setMatchingFarmers(farmerListingsRes.data.listings || []);
    } catch (err) {
      console.error('Failed to load buyer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyerDashboard();
  }, []);

  const openProfileModal = () => {
    setCompanyName(user?.buyerProfile?.companyName || '');
    setBusinessType(user?.buyerProfile?.businessType || 'Wholesaler');
    setCity(user?.buyerProfile?.city || 'Vijayawada');
    setEditProfileOpen(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/buyers/profile', { companyName, businessType, city });
      setEditProfileOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Profile update failed');
    }
  };

  const openReqModal = (req: BuyerRequirement) => {
    setEditReq(req);
    setEditQtyNeeded(req.quantityNeeded);
    setEditOfferedPrice(req.offeredPrice);
  };

  const handleReqUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReq) return;

    try {
      await api.put(`/requirements/${editReq.id}`, {
        quantityNeeded: Number(editQtyNeeded),
        offeredPrice: Number(editOfferedPrice),
      });

      setEditReq(null);
      loadBuyerDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Requirement update failed');
    }
  };

  const handleDeleteReq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;
    try {
      await api.delete(`/requirements/${id}`);
      loadBuyerDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const userCity = user?.buyerProfile?.city || 'Vijayawada';
  const company = user?.buyerProfile?.companyName || user?.name;
  const bType = user?.buyerProfile?.businessType || 'Wholesaler';

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{company} 👋</h1>
              <button onClick={openProfileModal} className="text-gray-400 hover:text-sky-600 p-1">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-sky-600" /> {bType} • Verified Buyer • 📍 {userCity}
            </p>
            <p className="text-xs text-sky-700 font-semibold pt-0.5">Source produce directly from nearby farmers</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/buyer/post-requirement">
              <Button variant="primary" className="bg-sky-600 hover:bg-sky-700 shadow-md">
                <Plus className="w-4 h-4 mr-1.5" /> Post Requirement
              </Button>
            </Link>
            <Link to="/marketplace/produce">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-1.5" /> Find Farmers
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. ACTIVE SOURCING REQUIREMENTS */}
        <Card className="border-gray-200">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Store className="w-5 h-5 text-sky-600" /> Active Requirements ({requirements.length})
            </CardTitle>
            <Link to="/buyer/post-requirement">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Post New
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {requirements.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 p-6">
                <Store className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No requirements posted yet</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Tell farmers what produce you are looking for, target quantity, and your offer price per kg.
                </p>
                <Link to="/buyer/post-requirement">
                  <Button variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-700 mt-2">
                    Post Requirement
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requirements.map((req) => (
                  <Card key={req.id} className="p-5 space-y-3 border-gray-200 hover:border-sky-400 transition shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">{req.crop.category}</span>
                        <h3 className="text-lg font-black text-gray-900">{req.crop.name}</h3>
                        <p className="text-xs text-gray-500">{req.variety} • {req.qualityGrade}</p>
                      </div>
                      <Badge variant="info">{req.status}</Badge>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500 text-xs">Needed Quantity:</span>
                      <span className="font-bold text-gray-900">{req.quantityNeeded} {req.unit}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 text-xs">Offered Price:</span>
                      <span className="font-bold text-sky-700">₹{req.offeredPrice}/kg</span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-sky-600 hover:bg-sky-700 text-xs"
                        onClick={() => navigate(`/buyer/matching?reqId=${req.id}`)}
                      >
                        View Farmers
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReqModal(req)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteReq(req.id)}
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

        {/* 2. FARMERS NEAR YOU */}
        <Card className="border-gray-200">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <ShoppingBag className="w-5 h-5 text-sky-600" /> Farmers Near You ({matchingFarmers.length})
            </CardTitle>
            <Link to="/marketplace/produce">
              <Button size="sm" variant="outline">
                View All Produce
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {matchingFarmers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No active farmer produce listings found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingFarmers.slice(0, 6).map((item) => (
                  <Card key={item.id} className="p-5 space-y-3 border-gray-200 hover:border-sky-300 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-gray-900 text-base">{item.farmer?.farmName || item.farmer?.user?.name || 'Local Farm'}</h4>
                          <UserCheck className="w-4 h-4 text-agri-600" />
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-600" /> 📍 {item.locationCity}
                        </p>
                      </div>
                      <Badge variant="success">Available</Badge>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Crop Produce:</span>
                        <span className="font-bold text-gray-900">{item.crop.name} ({item.qualityGrade})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-bold text-gray-900">{item.quantity} {item.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                        <span className="text-gray-600 font-medium">Expected Price:</span>
                        <span className="font-black text-sky-700">₹{item.minPrice}/kg</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-sky-600 hover:bg-sky-700 text-xs"
                      onClick={() => navigate('/offers')}
                    >
                      Make Offer
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Modal */}
        {editProfileOpen && (
          <Modal
            isOpen={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            title="Edit Business Profile"
          >
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Company / Shop Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Buyer Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium"
                >
                  <option value="Local Trader">Local Trader</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Processor">Processor</option>
                  <option value="Exporter">Exporter</option>
                  <option value="Restaurant / Hotel Supplier">Restaurant / Hotel Supplier</option>
                  <option value="Cooperative">Cooperative</option>
                  <option value="Institutional Buyer">Institutional Buyer</option>
                  <option value="Other Business">Other Business</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">City / Location</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full bg-sky-600">
                Save Business Profile
              </Button>
            </form>
          </Modal>
        )}

        {/* Edit Requirement Modal */}
        {editReq && (
          <Modal
            isOpen={!!editReq}
            onClose={() => setEditReq(null)}
            title="Edit Sourcing Requirement"
          >
            <form onSubmit={handleReqUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Needed Quantity (kg)</label>
                <input
                  type="number"
                  required
                  value={editQtyNeeded}
                  onChange={(e) => setEditQtyNeeded(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Offered Price (₹/kg)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editOfferedPrice}
                  onChange={(e) => setEditOfferedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full bg-sky-600">
                Update Requirement
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
