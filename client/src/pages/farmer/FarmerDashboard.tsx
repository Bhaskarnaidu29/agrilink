import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { ProduceListing, Offer } from '../../types';
import { Plus, Search, Package, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      setListings(listRes.data.listings || []);
      setOffers(offerRes.data.offers || []);
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

  const pendingOffers = offers.filter((o) => o.status === 'PENDING' || o.status === 'COUNTERED');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">Good Morning, {user?.name || 'Farmer'} 👋</h1>
              <button onClick={openProfileModal} className="text-gray-400 hover:text-agri-600 p-1">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{user?.farmerProfile?.farmName} • {user?.farmerProfile?.city}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/price-discovery">
              <Button variant="primary" className="bg-agri-600 hover:bg-agri-700">
                <Search className="w-4 h-4 mr-2" /> 🔍 Find Best Opportunity
              </Button>
            </Link>
            <Link to="/farmer/add-produce">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Add Produce
              </Button>
            </Link>
          </div>
        </div>

        {/* Ticker Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-agri-600">
            <span className="text-xs font-bold text-gray-500 uppercase">Active Produce Listings</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{listings.length}</h3>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending Buyer Offers</span>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingOffers.length}</h3>
          </Card>

          <Card className="p-4 border-l-4 border-l-sky-500">
            <span className="text-xs font-bold text-gray-500 uppercase">Tomato APMC Price</span>
            <h3 className="text-3xl font-black text-sky-600 mt-1">₹28.50<span className="text-xs text-gray-500">/kg</span></h3>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500">
            <span className="text-xs font-bold text-gray-500 uppercase">Verification Status</span>
            <h3 className="text-xl font-bold text-emerald-700 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Verified Farmer
            </h3>
          </Card>
        </div>

        {/* My Produce Section */}
        <Card className="border-gray-200">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-agri-600" /> My Listed Produce ({listings.length})
            </CardTitle>
            <Link to="/farmer/add-produce">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add New Crop
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 font-medium">No produce listed yet.</p>
                <Link to="/farmer/add-produce">
                  <Button variant="primary" size="sm">Add Your First Produce</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((item) => (
                  <Card key={item.id} className="p-5 space-y-3 border-gray-200 hover:border-agri-400">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">{item.crop.category}</span>
                        <h3 className="text-lg font-bold text-gray-900">{item.crop.name}</h3>
                        <p className="text-xs text-gray-500">{item.variety} • {item.qualityGrade}</p>
                      </div>
                      <Badge variant="success">{item.status}</Badge>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-bold text-gray-900">{item.quantity} {item.unit}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Min Acceptable Price:</span>
                      <span className="font-bold text-agri-700">₹{item.minPrice}/kg</span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-agri-600 hover:bg-agri-700"
                        onClick={() => navigate('/price-discovery')}
                      >
                        🔍 Discovery
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

        {/* Edit Profile Modal */}
        {editProfileOpen && (
          <Modal
            isOpen={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            title="Edit Farm Profile"
          >
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
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
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full bg-agri-600">Save Profile</Button>
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Min Acceptable Price (₹/kg)</label>
                <input
                  type="number"
                  required
                  value={editMinPrice}
                  onChange={(e) => setEditMinPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quality Grade</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                >
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Grade C">Grade C</option>
                </select>
              </div>
              <Button type="submit" variant="primary" className="w-full bg-agri-600">Update Produce Listing</Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
