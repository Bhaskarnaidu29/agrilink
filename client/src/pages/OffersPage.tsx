import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Offer } from '../types';
import { Handshake, MessageSquare, Check, X, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterQuantity, setCounterQuantity] = useState<number>(0);
  const [counterNote, setCounterNote] = useState<string>('');

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
    }
  };

  const handleResponse = async (offerId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.put(`/offers/${offerId}/status`, { status });
      loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Handshake className="w-6 h-6 text-agri-600" /> Offers & Real-Time Negotiations
            </h1>
            <p className="text-sm text-gray-500">Negotiate prices, counter offer terms, and confirm agricultural deals</p>
          </div>
        </div>

        {offers.length === 0 ? (
          <Card className="text-center py-12 p-8">
            <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No active offers or negotiations found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => {
              const statusVariant =
                offer.status === 'ACCEPTED' ? 'success' :
                offer.status === 'COUNTERED' ? 'warning' :
                offer.status === 'REJECTED' ? 'danger' : 'info';

              return (
                <Card key={offer.id} className="p-6 space-y-4 border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Offer ID #{offer.id.slice(0, 8)}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                        {offer.produceListing?.crop?.name || offer.buyerRequirement?.crop?.name || 'Crop Produce'}
                      </h3>
                      <p className="text-xs text-gray-500">From: {offer.sender.name} ({offer.sender.role})</p>
                    </div>
                    <Badge variant={statusVariant}>{offer.status}</Badge>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price per Unit:</span>
                      <span className="font-bold text-gray-900">₹{offer.pricePerUnit}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-bold text-gray-900">{offer.quantity} kg</span>
                    </div>
                    <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                      <span className="font-bold text-agri-800">Total Amount:</span>
                      <span className="font-black text-agri-600">₹{offer.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Negotiation Timeline History */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-gray-500 block">Negotiation History:</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {offer.negotiations.map((n) => (
                        <div key={n.id} className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-gray-900">₹{n.pricePerUnit}/kg • {n.quantity} kg</span>
                            <p className="text-gray-500 text-[11px]">{n.note}</p>
                          </div>
                          <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {offer.status !== 'ACCEPTED' && offer.status !== 'REJECTED' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-agri-600 hover:bg-agri-700"
                        onClick={() => handleResponse(offer.id, 'ACCEPTED')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept Offer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openCounterModal(offer)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" /> Counter
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleResponse(offer.id, 'REJECTED')}
                      >
                        <X className="w-4 h-4" />
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
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">New Counter Price (₹/kg)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  required
                  value={counterQuantity}
                  onChange={(e) => setCounterQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Counter Note</label>
                <textarea
                  rows={2}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="e.g. Can supply 500 kg at ₹29/kg with farm pickup."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full bg-agri-600 hover:bg-agri-700">
                Submit Counter Offer
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
