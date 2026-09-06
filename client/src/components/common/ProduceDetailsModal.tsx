import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ProduceListing } from '../../types';
import { Sparkles, MapPin, UserCheck, ShieldCheck, Handshake, AlertTriangle, CheckCircle2, Info, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AgriTrustModal } from './AgriTrustModal';

interface ProduceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: ProduceListing | null;
  onMakeOffer?: (listing: ProduceListing) => void;
}

export const ProduceDetailsModal: React.FC<ProduceDetailsModalProps> = ({
  isOpen,
  onClose,
  listing,
  onMakeOffer,
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const [agriTrustModalOpen, setAgriTrustModalOpen] = useState<boolean>(false);

  if (!listing) return null;

  const images = listing.images && listing.images.length > 0 ? listing.images : listing.imageUrl ? [listing.imageUrl] : [];

  const farmerName = listing.farmer?.farmName || listing.farmer?.user?.name || 'Local Farm';
  const farmerCity = listing.locationCity;
  const agriTrust = listing.farmer?.agriTrust;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Produce Details — ${listing.crop?.name}`}>
      <div className="space-y-5">
        {/* Photo Gallery / Carousel */}
        {images.length > 0 ? (
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 aspect-video shadow-md">
              <img
                src={images[selectedImgIndex]}
                alt={`${listing.crop?.name} Photo ${selectedImgIndex + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur">
                {selectedImgIndex === 0 ? 'Batch Overview Photo' : `Sample Photo #${selectedImgIndex}`}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur">
                {selectedImgIndex + 1} of {images.length} Photos
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImgIndex(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      selectedImgIndex === i ? 'border-agri-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 bg-slate-100 rounded-2xl text-center space-y-2 text-gray-500">
            <Camera className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-xs font-semibold">No produce photos uploaded for this listing</p>
          </div>
        )}

        {/* Title & Key Pricing Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-agri-400">
                {listing.crop?.category} • {listing.qualityGrade} ({listing.variety})
              </span>
              <h3 className="text-2xl font-black">{listing.crop?.name}</h3>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-agri-400" /> {farmerName} • 📍 {farmerCity}
              </p>
            </div>

            {/* AgriTrust Badge */}
            {agriTrust && (
              <button
                type="button"
                onClick={() => setAgriTrustModalOpen(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition border shadow-xs ${
                  agriTrust.isNewFarmer
                    ? 'bg-agri-500/20 text-agri-300 border-agri-400/40 hover:bg-agri-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                }`}
              >
                {agriTrust.badgeLabel} ℹ️
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-400 block">Available Quantity:</span>
              <span className="text-base font-extrabold text-white">{listing.quantity} {listing.unit}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-400 block">Asking Minimum Price:</span>
              <span className="text-base font-black text-agri-400">₹{listing.minPrice}/kg</span>
            </div>
          </div>
        </div>

        {/* AI-ASSISTED VISUAL QUALITY ASSESSMENT SECTION */}
        <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
          listing.aiAssessmentStatus === 'INCONSISTENT'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : listing.aiAssessmentStatus === 'MISMATCH'
            ? 'bg-orange-50 border-orange-300 text-orange-950'
            : 'bg-agri-50 border-agri-200 text-agri-950'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-agri-600" />
              <span>AI-Assisted Visual Quality Assessment</span>
            </div>
            <Badge variant={
              listing.aiAssessmentStatus === 'INCONSISTENT' ? 'warning' :
              listing.aiAssessmentStatus === 'MISMATCH' ? 'danger' : 'success'
            }>
              {listing.aiAssessmentStatus === 'INCONSISTENT' ? '⚠️ Inconsistency Detected' :
               listing.aiAssessmentStatus === 'MISMATCH' ? '⚠️ Grade Mismatch' : 'AI-Assessed'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white/90 p-3 rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-500 block text-[11px]">Farmer Declared:</span>
              <span className="font-bold text-gray-900 text-sm">{listing.qualityGrade}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">AI Estimated Grade:</span>
              <span className="font-black text-agri-700 text-sm">{listing.aiEstimatedGrade || listing.qualityGrade}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Image Consistency:</span>
              <span className={`font-bold text-sm ${
                (listing.imageConsistency || 90) < 75 ? 'text-amber-700 font-black' : 'text-emerald-700'
              }`}>
                {listing.imageConsistency || 92}%
              </span>
            </div>
          </div>

          {listing.aiObservations && listing.aiObservations.length > 0 && (
            <div className="space-y-1 font-medium">
              {listing.aiObservations.map((obs, i) => (
                <p key={i} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-agri-600 shrink-0"></span> {obs}
                </p>
              ))}
            </div>
          )}

          <div className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-200/60 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" />
            <span>AI assessment is based on visible characteristics and does not replace physical quality inspection or laboratory testing where required.</span>
          </div>
        </div>

        {/* Description if present */}
        {listing.description && (
          <div className="space-y-1 text-xs">
            <span className="font-bold uppercase text-gray-500 block">Farmer Listing Description:</span>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 font-medium">
              "{listing.description}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {onMakeOffer && (
            <Button
              variant="primary"
              className="flex-1 bg-agri-600 hover:bg-agri-700 font-bold"
              onClick={() => {
                onClose();
                onMakeOffer(listing);
              }}
            >
              <Handshake className="w-4 h-4 mr-1.5" /> Make Offer
            </Button>
          )}
        </div>
      </div>

      {/* AgriTrust Score Breakdown Modal */}
      {agriTrustModalOpen && (
        <AgriTrustModal
          isOpen={agriTrustModalOpen}
          onClose={() => setAgriTrustModalOpen(false)}
          agriTrust={agriTrust}
          farmerName={farmerName}
        />
      )}
    </Modal>
  );
};
