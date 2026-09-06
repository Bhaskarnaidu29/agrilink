import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { ProduceListing, BuyerRequirement } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Handshake, MapPin, ShieldCheck, UserCheck } from 'lucide-react';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: ProduceListing | null;
  requirement?: BuyerRequirement | null;
  onSuccess?: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  listing,
  requirement,
  onSuccess,
}) => {
  const navigate = useNavigate();

  const [pricePerUnit, setPricePerUnit] = useState<number>(
    listing ? listing.minPrice : requirement ? requirement.offeredPrice : 0
  );
  const [quantity, setQuantity] = useState<number>(
    listing ? listing.quantity : requirement ? requirement.quantityNeeded : 0
  );
  const [transportPayer, setTransportPayer] = useState<'BUYER' | 'FARMER' | 'SHARED'>('BUYER');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Sync state whenever selected item changes
  React.useEffect(() => {
    if (listing) {
      setPricePerUnit(listing.minPrice);
      setQuantity(listing.quantity);
    } else if (requirement) {
      setPricePerUnit(requirement.offeredPrice);
      setQuantity(requirement.quantityNeeded);
    }
    setError('');
  }, [listing, requirement]);

  if (!listing && !requirement) return null;

  const cropName = listing?.crop?.name || requirement?.crop?.name || 'Produce';
  const category = listing?.crop?.category || requirement?.crop?.category || 'Agriculture';
  const grade = listing?.qualityGrade || requirement?.qualityGrade || 'Grade A';
  const variety = listing?.variety || requirement?.variety || 'Standard';
  const locationCity = listing?.locationCity || requirement?.locationCity || 'Location';

  const sellerOrBuyerName = listing
    ? (listing.farmer?.farmName || listing.farmer?.user?.name || 'Local Farmer')
    : (requirement?.buyer?.companyName || requirement?.buyer?.user?.name || 'Verified Buyer');

  const receiverUserId = listing
    ? (listing.farmer?.userId || listing.farmer?.user?.id || listing.farmerId)
    : (requirement?.buyer?.userId || requirement?.buyer?.user?.id || requirement?.buyerId);

  const totalAmount = Math.round((Number(pricePerUnit) || 0) * (Number(quantity) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverUserId) {
      setError('Unable to identify receiver profile. Please refresh and try again.');
      return;
    }

    if (pricePerUnit <= 0 || quantity <= 0) {
      setError('Offered price and quantity must be greater than zero.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        receiverId: receiverUserId,
        pricePerUnit: Number(pricePerUnit),
        quantity: Number(quantity),
        transportPayer,
        message: message.trim() || undefined,
      };

      if (listing) {
        payload.produceListingId = listing.id;
      } else if (requirement) {
        payload.buyerRequirementId = requirement.id;
      }

      await api.post('/offers', payload);

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/offers');
      }
    } catch (err: any) {
      console.error('Failed to submit offer:', err);
      setError(err.response?.data?.message || 'Failed to submit offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Make Direct Offer — ${cropName}`}>
      <div className="space-y-5">
        {/* Selected Item Summary Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-agri-400 tracking-wider">
                {category} • {grade} ({variety})
              </span>
              <h3 className="text-xl font-black text-white">{cropName}</h3>
            </div>
            <span className="bg-agri-500/20 text-agri-300 text-xs px-2.5 py-1 rounded-full font-bold border border-agri-400/30">
              Listing #{listing ? listing.id.slice(0, 8) : requirement?.id.slice(0, 8)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
            <div>
              <span className="text-slate-400 block">
                {listing ? 'Seller Farm:' : 'Buyer Company:'}
              </span>
              <span className="font-bold text-white flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-agri-400" /> {sellerOrBuyerName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Location:</span>
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> 📍 {locationCity}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl flex justify-between items-center text-xs">
            <span className="text-slate-300">
              {listing ? `Available: ${listing.quantity} ${listing.unit}` : `Needed: ${requirement?.quantityNeeded} ${requirement?.unit}`}
            </span>
            <span className="text-agri-300 font-extrabold text-sm">
              {listing ? `Asking: ₹${listing.minPrice}/kg` : `Offered: ₹${requirement?.offeredPrice}/kg`}
            </span>
          </div>
        </div>

        {/* Offer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Offered Price (₹/kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Quantity (kg)
              </label>
              <input
                type="number"
                min="1"
                max={listing ? listing.quantity : undefined}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Transport Expense Borne By
            </label>
            <select
              value={transportPayer}
              onChange={(e: any) => setTransportPayer(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
            >
              <option value="BUYER">Buyer Pays Transport (Farmgate Pickup)</option>
              <option value="FARMER">Farmer Pays Transport (Delivered to Buyer Mandi)</option>
              <option value="SHARED">Shared Transport Expense (50 / 50 Split)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Note / Message to {listing ? 'Farmer' : 'Buyer'} (Optional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. We will arrange pickup vehicle tomorrow morning."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
            />
          </div>

          {/* Dynamic Total Summary */}
          <div className="p-4 bg-agri-50 border border-agri-200 rounded-2xl flex justify-between items-center text-sm">
            <div>
              <span className="text-xs text-gray-600 font-medium block">Total Transaction Amount:</span>
              <span className="text-xs text-gray-400 font-normal">
                {quantity} kg × ₹{pricePerUnit}/kg
              </span>
            </div>
            <span className="text-2xl font-black text-agri-700">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-agri-600 hover:bg-agri-700 font-bold"
              isLoading={loading}
            >
              <Handshake className="w-4 h-4 mr-1.5" /> Submit Offer
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
