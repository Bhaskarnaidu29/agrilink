/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Calculates estimated transportation cost based on distance and quantity
 */
export function calculateTransportCost(
  distanceKm: number,
  quantityKg: number,
  baseFee: number = 200,
  ratePerKmPerTon: number = 15
): number {
  const tons = Math.max(0.1, quantityKg / 1000);
  const effectiveDistance = Math.max(5, distanceKm);
  const cost = baseFee + effectiveDistance * tons * ratePerKmPerTon;
  return Math.round(cost);
}

/**
 * Linear regression slope calculation for price history points
 */
export function calculateTrendSlope(prices: { date: Date | string; price: number }[]): {
  slope: number;
  direction: 'INCREASING' | 'STABLE' | 'DECREASING';
  percentageChange: number;
  averagePrice: number;
} {
  if (!prices || prices.length === 0) {
    return { slope: 0, direction: 'STABLE', percentageChange: 0, averagePrice: 0 };
  }

  const n = prices.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = prices[i].price;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const averagePrice = sumY / n;

  const firstPrice = prices[0].price;
  const lastPrice = prices[prices.length - 1].price;
  const percentageChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

  let direction: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
  if (percentageChange > 2) {
    direction = 'INCREASING';
  } else if (percentageChange < -2) {
    direction = 'DECREASING';
  }

  return {
    slope: Math.round(slope * 100) / 100,
    direction,
    percentageChange: Math.round(percentageChange * 10) / 10,
    averagePrice: Math.round(averagePrice * 10) / 10,
  };
}
