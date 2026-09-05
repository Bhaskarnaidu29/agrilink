import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { BuyerRequirement, Offer } from '../../types';
import { Store, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
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
      const [reqRes, offerRes] = await Promise.all([
        api.get('/requirements'),
        api.get('/offers'),
      ]);
      setRequirements(reqRes.data.requirements || []);
      setOffers(offerRes.data.offers || []);
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{user?.buyerProfile?.companyName || user?.name} 👋</h1>
              <button onClick={openProfileModal} className="text-gray-400 hover:text-sky-600 p-1">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{user?.buyerProfile?.businessType} • GST Verified • {user?.buyerProfile?.city}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/buyer/post-requirement">
              <Button variant="primary" className="bg-sky-600 hover:bg-sky-700">
                <Plus className="w-4 h-4 mr-2" /> Post New Requirement
              </Button>
            </Link>
            <Link to="/marketplace/produce">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" /> Browse Produce
              </Button>
            </Link>
          </div>
        </div>

        {/* Requirements & Smart Matching Section */}
        <Card className="border-gray-200">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-sky-600" /> Active Sourcing Requirements ({requirements.length})
            </CardTitle>
            <Link to="/buyer/post-requirement">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Post Requirement
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {requirements.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Store className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 font-medium">No sourcing requirements posted yet.</p>
                <Link to="/buyer/post-requirement">
                  <Button variant="primary" size="sm" className="bg-sky-600">Post Sourcing Requirement</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requirements.map((req) => (
                  <Card key={req.id} className="p-5 space-y-3 border-gray-200 hover:border-sky-400">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">{req.crop.category}</span>
                        <h3 className="text-lg font-bold text-gray-900">{req.crop.name}</h3>
                        <p className="text-xs text-gray-500">{req.variety} • {req.qualityGrade}</p>
                      </div>
                      <Badge variant="info">{req.status}</Badge>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500">Needed Quantity:</span>
                      <span className="font-bold text-gray-900">{req.quantityNeeded} {req.unit}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Offered Price:</span>
                      <span className="font-bold text-sky-700">₹{req.offeredPrice}/kg</span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-sky-600 hover:bg-sky-700"
                        onClick={() => navigate(`/buyer/matching?reqId=${req.id}`)}
                      >
                        🎯 Matching
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Food Processor">Food Processor</option>
                  <option value="Exporter">Exporter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full bg-sky-600">Save Business Profile</Button>
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full bg-sky-600">Update Requirement</Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
