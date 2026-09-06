import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';
import { Award, Star, CheckCircle2, Phone, MessageSquare, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [reviewTx, setReviewTx] = useState<Transaction | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);

  const loadTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/transactions/${id}/status`, { status });
      loadTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTx) return;
    setReviewLoading(true);

    const isCurrentFarmer = user?.id === reviewTx.farmer?.user?.id || user?.id === reviewTx.farmer?.userId;
    const targetRevieweeUser = isCurrentFarmer ? reviewTx.buyer?.user : reviewTx.farmer?.user;
    const targetRevieweeId = targetRevieweeUser?.id || (isCurrentFarmer ? reviewTx.buyer?.userId : reviewTx.farmer?.userId) || '';

    try {
      await api.post('/reviews', {
        transactionId: reviewTx.id,
        revieweeId: targetRevieweeId,
        rating: Number(rating),
        comment,
      });

      setReviewTx(null);
      loadTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Review submission failed');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatHumanStatus = (status: string) => {
    if (status === 'CONFIRMED') return 'Confirmed';
    if (status === 'IN_PROGRESS') return 'Ready for Pickup';
    if (status === 'COMPLETED') return 'Completed';
    if (status === 'CANCELLED') return 'Cancelled';
    return status;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-agri-600" /> Confirmed Deals & Purchases
            </h1>
            <p className="text-sm text-gray-500">Track deal status, contact trade partners, and leave verified ratings</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <Card className="text-center py-12 p-8">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No active or completed deals found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transactions.map((tx) => {
              const cropName = tx.produceListing?.crop?.name || tx.buyerRequirement?.crop?.name || 'Produce';

              // Determine if logged-in user is farmer or buyer in this deal
              const isCurrentFarmer = user?.id === tx.farmer?.user?.id || user?.id === tx.farmer?.userId;

              // Counterparty is the OTHER party in the trade
              const counterpartyUser = isCurrentFarmer ? tx.buyer?.user : tx.farmer?.user;
              const counterpartyName = isCurrentFarmer
                ? (tx.buyer?.companyName || tx.buyer?.user?.name || 'Buyer')
                : (tx.farmer?.farmName || tx.farmer?.user?.name || 'Farmer');

              const contactPhone = counterpartyUser?.phone || (isCurrentFarmer ? tx.buyer?.user?.phone : tx.farmer?.user?.phone) || '';
              const cleanPhone = contactPhone.replace(/[^\d]/g, '');

              return (
                <Card key={tx.id} className="p-6 space-y-4 border-gray-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Deal #{tx.id.slice(0, 8)}</span>
                      <h3 className="text-lg font-black text-gray-900 mt-0.5">{cropName}</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Farmer: <span className="font-bold text-gray-800">{tx.farmer?.farmName || tx.farmer?.user?.name}</span> ({tx.farmer?.city}) • Buyer: <span className="font-bold text-gray-800">{tx.buyer?.companyName || tx.buyer?.user?.name}</span>
                      </p>
                      <p className="text-xs text-agri-700 font-bold mt-1">
                        🤝 Contact Partner: <span className="text-gray-900">{counterpartyName}</span>
                      </p>
                    </div>
                    <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'info'}>
                      {formatHumanStatus(tx.status)}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-gray-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Agreed Unit Price:</span>
                      <span className="font-bold text-gray-900 text-sm">₹{tx.agreedPrice}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-bold text-gray-900">{tx.quantity} kg</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-bold text-agri-800">Total Agreed Amount:</span>
                      <span className="font-black text-agri-600 text-base">₹{tx.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Direct Contact Buttons to Counterparty */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${contactPhone}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" /> Call {contactPhone || 'Partner'}
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=Hi%20${encodeURIComponent(counterpartyName)}%2C%20regarding%20our%20AgriLink%20deal%20for%20${encodeURIComponent(cropName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                    </a>
                  </div>

                  {/* Progress Status Actions */}
                  {tx.status === 'CONFIRMED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-agri-600 hover:bg-agri-700 text-xs"
                      onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Deal Completed
                    </Button>
                  )}

                  {/* Reviews */}
                  {tx.review ? (
                    <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1 text-amber-700 font-bold text-xs">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {tx.review.rating} / 5 Stars Review
                      </div>
                      <p className="text-xs text-amber-950 font-medium">"{tx.review.comment}"</p>
                    </div>
                  ) : (
                    tx.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setReviewTx(tx)}
                      >
                        <Star className="w-4 h-4 mr-1 text-amber-500" /> Rate & Review Partner
                      </Button>
                    )
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {reviewTx && (
          <Modal
            isOpen={!!reviewTx}
            onClose={() => setReviewTx(null)}
            title="Submit Trade Review"
          >
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent Trade)</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars (Good Trade)</option>
                  <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
                  <option value="2">⭐⭐ 2 Stars (Fair)</option>
                  <option value="1">⭐ 1 Star (Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Feedback Comment</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Prompt pickup, fair price negotiation, and full payment."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full bg-agri-600 hover:bg-agri-700" isLoading={reviewLoading}>
                Submit Review
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
