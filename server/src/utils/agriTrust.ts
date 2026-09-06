export interface AgriTrustBreakdown {
  score: number;
  badgeLabel: string;
  isNewFarmer: boolean;
  breakdown: {
    farmerVerification: string;
    completedTransactions: number;
    buyerRating: string;
    qualityReliability: string;
  };
  explanation: string;
}

export function calculateAgriTrustScore(data: {
  verified: boolean;
  completedTransactionsCount: number;
  averageRating: number;
  totalReviewsCount: number;
  qualityMatchRate?: number; // 0 to 100%
}): AgriTrustBreakdown {
  const {
    verified,
    completedTransactionsCount = 0,
    averageRating = 4.5,
    totalReviewsCount = 0,
    qualityMatchRate = 95,
  } = data;

  const isNewFarmer = completedTransactionsCount < 2;

  // 1. Verification points (25 pts max)
  const verificationPoints = verified ? 25 : 10;

  // 2. Completed transactions points (35 pts max: 5 pts per deal up to 7 deals)
  const transactionPoints = Math.min(35, completedTransactionsCount * 5);

  // 3. Buyer rating points (25 pts max: rating/5 * 25)
  const ratingPoints = totalReviewsCount > 0 ? Math.round((averageRating / 5) * 25) : 20;

  // 4. Quality match / reliability points (15 pts max)
  const qualityPoints = Math.round((qualityMatchRate / 100) * 15);

  const rawScore = verificationPoints + transactionPoints + ratingPoints + qualityPoints;
  const score = Math.max(50, Math.min(99, rawScore));

  const badgeLabel = isNewFarmer ? '🌱 New Farmer' : `🟢 AgriTrust ${score}/100`;

  return {
    score,
    badgeLabel,
    isNewFarmer,
    breakdown: {
      farmerVerification: verified ? 'Verified Farmer Account (+25 pts)' : 'Standard Account (+10 pts)',
      completedTransactions: completedTransactionsCount,
      buyerRating: totalReviewsCount > 0 ? `${averageRating.toFixed(1)} / 5 Stars (${totalReviewsCount} Reviews)` : '4.5 / 5.0 Default Rating',
      qualityReliability: `${Math.round(qualityMatchRate)}% Declared vs AI Grade Match`,
    },
    explanation:
      'AgriTrust Score is calculated from verified account status, completed transaction history, buyer reviews, and quality grade consistency.',
  };
}
