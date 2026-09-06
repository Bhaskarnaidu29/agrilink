import React from 'react';
import { Modal } from '../ui/Modal';
import { AgriTrustBreakdown } from '../../types';
import { ShieldCheck, CheckCircle2, Star, Award, Info, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface AgriTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  agriTrust?: AgriTrustBreakdown | null;
  farmerName?: string;
}

export const AgriTrustModal: React.FC<AgriTrustModalProps> = ({
  isOpen,
  onClose,
  agriTrust,
  farmerName = 'Farmer Profile',
}) => {
  if (!agriTrust) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`AgriTrust Score Breakdown — ${farmerName}`}>
      <div className="space-y-5">
        {/* Score Header Card */}
        <div className={`p-6 rounded-2xl text-center space-y-2 border shadow-md ${
          agriTrust.isNewFarmer
            ? 'bg-agri-50 border-agri-200 text-agri-950'
            : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <span className="text-[11px] font-extrabold uppercase tracking-widest block text-agri-400">
            Platform Verified Reliability Index
          </span>
          <div className="text-4xl font-black tracking-tight">
            {agriTrust.isNewFarmer ? (
              <span className="text-agri-600 flex items-center justify-center gap-2">
                🌱 New Farmer
              </span>
            ) : (
              <span>🟢 {agriTrust.score} <span className="text-xl font-normal text-slate-400">/ 100</span></span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium max-w-sm mx-auto">
            {agriTrust.isNewFarmer
              ? 'This farmer is new to AgriLink. Verified account details are active.'
              : 'High transaction completion reliability and verified quality track record.'}
          </p>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
            Verified Factors & Performance Data
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-agri-600" /> Account Identity Verification
              </span>
              <span className="font-bold text-gray-900">{agriTrust.breakdown.farmerVerification}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-600" /> Completed Direct Deals
              </span>
              <span className="font-bold text-gray-900">{agriTrust.breakdown.completedTransactions} Successful Sales</span>
            </div>

            <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Buyer Ratings & Reviews
              </span>
              <span className="font-bold text-gray-900">{agriTrust.breakdown.buyerRating}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Quality Grade Consistency
              </span>
              <span className="font-bold text-gray-900">{agriTrust.breakdown.qualityReliability}</span>
            </div>
          </div>
        </div>

        {/* Transparency Explanation */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-900">
            <Info className="w-4 h-4 text-blue-600" /> How AgriTrust Score is Calculated
          </div>
          <p className="text-[11px] leading-relaxed text-blue-900/80">
            AgriTrust Score is calculated dynamically from verified account information, completed platform transactions, buyer feedback, and quality grade match history. It provides buyers with an objective trust metric without hidden penalties.
          </p>
        </div>

        <Button variant="outline" className="w-full" onClick={onClose}>
          Close Score Details
        </Button>
      </div>
    </Modal>
  );
};
