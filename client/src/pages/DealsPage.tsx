import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Transaction } from '../types';
import { Award, Star, CheckCircle2, Truck, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const DealsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [reviewTx, setReviewTx] = useState<Transaction | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

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

    try {
      await api.post('/reviews', {
        transactionId: reviewTx.id,
        revieweeId: reviewTx.buyer?.user?.phone ? reviewTx.buyer.user.phone : reviewTx.farmer.user.phone,
        rating: Number(rating),
        comment,
      });

      setReviewTx(null);
      loadTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Review submission failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-agri-600" /> Confirmed Deals & Verified Ratings
            </h1>
            <p className="text-sm text-gray-500">Track deal fulfillment, pickup progress, and transaction reviews</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <Card className="text-center py-12 p-8">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No confirmed transactions found yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transactions.map((tx) => (
              <Card key={tx.id} className="p-6 space-y-4 border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Deal #{tx.id.slice(0, 8)}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                      {tx.produceListing?.crop?.name || tx.buyerRequirement?.crop?.name || 'Crop Produce'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Farmer: {tx.farmer.farmName} ({tx.farmer.city}) • Buyer: {tx.buyer.companyName}
                    </p>
                  </div>
                  <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'info'}>{tx.status}</Badge>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Agreed Price:</span>
                    <span className="font-bold text-gray-900">₹{tx.agreedPrice}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-bold text-gray-900">{tx.quantity} kg</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                    <span className="font-bold text-agri-800">Total Transaction Amount:</span>
                    <span className="font-black text-agri-600">₹{tx.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress Status Actions */}
                {tx.status === 'CONFIRMED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-agri-600 hover:bg-agri-700"
                    onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Order Completed & Fulfilled
                  </Button>
                )}

                {/* Reviews */}
                {tx.review ? (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                      <Star className="w-4 h-4 fill-amber-500" /> {tx.review.rating} / 5 Stars Verified Review
                    </div>
                    <p className="text-xs text-amber-900 font-medium">"{tx.review.comment}"</p>
                  </div>
                ) : (
                  tx.status === 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setReviewTx(tx)}
                    >
                      <Star className="w-4 h-4 mr-1 text-amber-500" /> Leave Transaction Review
                    </Button>
                  )
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewTx && (
          <Modal
            isOpen={!!reviewTx}
            onClose={() => setReviewTx(null)}
            title="Submit Verified Review"
          >
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars (Good)</option>
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
                  placeholder="e.g. Prompt payment and high quality produce pickup."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full bg-agri-600 hover:bg-agri-700">
                Submit Review
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
