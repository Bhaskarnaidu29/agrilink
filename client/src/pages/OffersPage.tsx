import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Offer } from '../types';
import { Handshake, Check, X, RefreshCw, MessageSquare, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const OffersPage: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterQuantity, setCounterQuantity] = useState<number>(0);
  const [counterNote, setCounterNote] = useState<string>('');
  const [counterLoading, setCounterLoading] = useState<boolean>(false);

  // Action Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    offer: Offer | null;
    actionType: 'ACCEPTED' | 'REJECTED' | null;
  }>({ isOpen: false, offer: null, actionType: null });

  const loadOffers = async () => {
    try {
      const res = await api.get('/offers');
      setOffers(res.data.offers || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openCounterModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setCounterPrice(offer.pricePerUnit);
    setCounterQuantity(offer.quantity);
    setCounterNote('');
  };

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    setCounterLoading(true);

    try {
      await api.put(`/offers/${selectedOffer.id}/counter`, {
        pricePerUnit: Number(counterPrice),
        quantity: Number(counterQuantity),
        note: counterNote,
      });

      setSelectedOffer(null);
      loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Counter offer failed');
    } finally {
      setCounterLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.offer || !confirmModal.actionType) return;
    try {
      await api.put(`/offers/${confirmModal.offer.id}/status`, { status: confirmModal.actionType });
      setConfirmModal({ isOpen: false, offer: null, actionType: null });
      loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return o.status === 'PENDING' || o.status === 'COUNTERED';
    if (filterStatus === 'ACCEPTED') return o.status === 'ACCEPTED';
    if (filterStatus === 'CLOSED') return o.status === 'REJECTED' || o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Handshake className="w-6 h-6 text-agri-600" /> Offers & Negotiations
            </h1>
            <p className="text-sm text-gray-500">Review buyer & farmer offers, counter terms, and finalize direct sales</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl text-xs font-bold">
            {[
              { label: 'All Offers', key: 'ALL' },
              { label: 'Active', key: 'PENDING' },
              { label: 'Accepted', key: 'ACCEPTED' },
              { label: 'Closed', key: 'CLOSED' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  filterStatus === tab.key ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOffers.length === 0 ? (
          <Card className="text-center py-12 p-8">
            <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No offers found for selected filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOffers.map((offer) => {
              const cropName = offer.produceListing?.crop?.name || offer.buyerRequirement?.crop?.name || 'Harvest Produce';
              const grade = offer.produceListing?.qualityGrade || offer.buyerRequirement?.qualityGrade || 'Grade A';
              const locationCity = offer.produceListing?.locationCity || offer.buyerRequirement?.locationCity || '';
              const farmerName = offer.produceListing?.farmer?.farmName || (offer.sender.role === 'FARMER' ? offer.sender.name : offer.receiver.name);
              const buyerName = offer.buyerRequirement?.buyer?.companyName || (offer.sender.role === 'BUYER' ? offer.sender.name : offer.receiver.name);

              const latestSenderId = offer.negotiations && offer.negotiations.length > 0
                ? offer.negotiations[0].senderId
                : offer.senderId;

              const isInitiator = user?.id === latestSenderId;
              const recipientName = offer.senderId === latestSenderId ? offer.receiver.name : offer.sender.name;
              const isClosed = offer.status === 'ACCEPTED' || offer.status === 'REJECTED' || offer.status === 'CANCELLED';

              const statusVariant =
                offer.status === 'ACCEPTED' ? 'success' :
                offer.status === 'COUNTERED' ? 'warning' :
                offer.status === 'REJECTED' ? 'danger' : 'info';

              return (
                <Card key={offer.id} className="p-6 space-y-4 border-gray-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Offer #{offer.id.slice(0, 8)}</span>
                      <h3 className="text-lg font-black text-gray-900 mt-0.5">{cropName} ({grade})</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Farmer: <span className="font-bold text-gray-800">{farmerName}</span> • Buyer: <span className="font-bold text-gray-800">{buyerName}</span>
                      </p>
                      {locationCity && (
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">📍 Location: {locationCity}</p>
                      )}
                    </div>
                    <Badge variant={statusVariant}>{offer.status}</Badge>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-gray-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Offered Price / Unit:</span>
                      <span className="font-bold text-gray-900 text-sm">₹{offer.pricePerUnit}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target Quantity:</span>
                      <span className="font-bold text-gray-900">{offer.quantity} kg</span>
                    </div>
                    {offer.transportPayer && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transport:</span>
                        <span className="font-semibold text-gray-700">
                          {offer.transportPayer === 'BUYER' ? 'Buyer Pickup' : offer.transportPayer === 'FARMER' ? 'Farmer Delivery' : 'Shared Split'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-bold text-agri-800">Total Transaction Amount:</span>
                      <span className="font-black text-agri-600 text-base">₹{offer.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Negotiation Timeline History */}
                  {offer.negotiations && offer.negotiations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase text-gray-500 block">Negotiation History:</span>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {offer.negotiations.map((n) => {
                          const senderName = n.senderId === offer.senderId ? offer.sender.name : offer.receiver.name;
                          const senderRole = n.senderId === offer.senderId ? offer.sender.role : offer.receiver.role;
                          return (
                            <div key={n.id} className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="font-bold text-gray-900">{senderName}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${senderRole === 'FARMER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {senderRole}
                                  </span>
                                </div>
                                <span className="font-semibold text-agri-700">₹{n.pricePerUnit}/kg • {n.quantity} kg</span>
                                {n.note && <p className="text-gray-600 text-[11px] mt-0.5 font-normal">"{n.note}"</p>}
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions / Status for active offers */}
                  {!isClosed && (
                    <div className="pt-2">
                      {isInitiator ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                          <div>
                            <span className="font-bold block">Waiting for {recipientName}'s Response</span>
                            <span className="text-[11px] text-amber-700">You submitted the latest offer/counter terms. Please wait for recipient decision.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 bg-agri-600 hover:bg-agri-700 text-xs"
                            onClick={() => setConfirmModal({ isOpen: true, offer, actionType: 'ACCEPTED' })}
                          >
                            <Check className="w-4 h-4 mr-1" /> {offer.status === 'COUNTERED' ? 'Accept Counter' : 'Accept Offer'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => openCounterModal(offer)}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Counter
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs"
                            onClick={() => setConfirmModal({ isOpen: true, offer, actionType: 'REJECTED' })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {offer.status === 'ACCEPTED' && (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full bg-agri-600 hover:bg-agri-700 text-xs"
                        onClick={() => window.location.href = '/deals'}
                      >
                        View Deal Details & Contact
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Counter Offer Modal */}
        {selectedOffer && (
          <Modal
            isOpen={!!selectedOffer}
            onClose={() => setSelectedOffer(null)}
            title="Counter Offer Terms"
          >
            <form onSubmit={handleCounterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Counter Price (₹/kg)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  required
                  value={counterQuantity}
                  onChange={(e) => setCounterQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Counter Note (Optional)</label>
                <textarea
                  rows={2}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="e.g. Can supply 500 kg at ₹29/kg with farm pickup."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full bg-agri-600 hover:bg-agri-700" isLoading={counterLoading}>
                Submit Counter Offer
              </Button>
            </form>
          </Modal>
        )}

        {/* Confirmation Modal */}
        {confirmModal.isOpen && confirmModal.offer && (
          <Modal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, offer: null, actionType: null })}
            title={confirmModal.actionType === 'ACCEPTED' ? 'Confirm Deal Acceptance' : 'Reject Offer?'}
          >
            <div className="space-y-4">
              {confirmModal.actionType === 'ACCEPTED' ? (
                <div className="space-y-3">
                  <div className="bg-agri-50 border border-agri-200 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crop Produce:</span>
                      <span className="font-bold text-gray-900">
                        {confirmModal.offer.produceListing?.crop?.name || confirmModal.offer.buyerRequirement?.crop?.name || 'Harvest Produce'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agreed Price per Unit:</span>
                      <span className="font-bold text-gray-900">₹{confirmModal.offer.pricePerUnit}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Quantity:</span>
                      <span className="font-bold text-gray-900">{confirmModal.offer.quantity} kg</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-agri-200">
                      <span className="font-bold text-agri-900">Total Deal Value:</span>
                      <span className="font-black text-agri-700 text-base">₹{confirmModal.offer.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    ⚠️ By accepting, you agree to form a binding transaction deal for <strong>{confirmModal.offer.quantity} kg</strong> at <strong>₹{confirmModal.offer.pricePerUnit}/kg</strong>.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Are you sure you want to reject the offer of <strong>₹{confirmModal.offer.pricePerUnit}/kg</strong> for <strong>{confirmModal.offer.quantity} kg</strong>?
                </p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setConfirmModal({ isOpen: false, offer: null, actionType: null })}>
                  Cancel
                </Button>
                <Button
                  variant={confirmModal.actionType === 'ACCEPTED' ? 'primary' : 'danger'}
                  className={confirmModal.actionType === 'ACCEPTED' ? 'bg-agri-600 hover:bg-agri-700' : ''}
                  onClick={handleConfirmAction}
                >
                  {confirmModal.actionType === 'ACCEPTED' ? 'Confirm & Finalize Deal' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
