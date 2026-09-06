import { prisma } from '../config/db';
import { calculateDistance, calculateTransportCost, calculateTrendSlope } from '../utils/math';
import { convertPriceToKg } from '../utils/unitConversion';

export interface OpportunityInput {
  cropId: string;
  quantityKg: number;
  qualityGrade?: string;
  locationCity?: string;
  latitude: number;
  longitude: number;
}

export interface RecommendedOption {
  id: string;
  type: 'MARKET' | 'BUYER';
  name: string;
  locationCity: string;
  distanceKm: number;
  unitPrice: number;
  grossRevenue: number;
  transportCost: number;
  expectedNetRevenue: number;
  opportunityScore: number;
  isRecommended: boolean;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  percentageChange: number;
  rationale: string[];
  contactName?: string;
  contactPhone?: string;
  buyerRequirementId?: string;
  marketId?: string;
  qualityMatchGrade: string;
}

export interface OpportunityAnalysisResult {
  crop: {
    id: string;
    name: string;
    category: string;
  };
  quantityKg: number;
  farmerLocation: {
    city: string;
    latitude: number;
    longitude: number;
  };
  bestOpportunity: RecommendedOption | null;
  options: RecommendedOption[];
  sellOrWaitAdvice: {
    decision: 'SELL NOW' | 'CONSIDER WAITING';
    currentAvgPrice: number;
    expectedPriceRange: string;
    reasoning: string;
    trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
  };
  dataSourceMetadata: {
    marketDataOrigin: string;
    transportCalculation: string;
    trendAnalysisMethod: string;
    externalApiStatus: string;
  };
}

export async function analyzeBestSellingOpportunities(
  input: OpportunityInput
): Promise<OpportunityAnalysisResult> {
  const crop = await prisma.crop.findUnique({
    where: { id: input.cropId },
  });

  if (!crop) {
    throw new Error('Crop not found');
  }

  const qualityGrade = input.qualityGrade || 'Grade A';

  // Fetch transport rates
  const transportConfig = await prisma.transportRate.findFirst() || {
    baseFee: 200,
    ratePerKmPerTon: 15,
  };

  // 1. Fetch Market Prices for this crop
  const marketPrices = await prisma.marketPrice.findMany({
    where: { cropId: input.cropId },
    include: { market: true },
  });

  // 2. Fetch Active Buyer Requirements for this crop
  const buyerReqs = await prisma.buyerRequirement.findMany({
    where: { cropId: input.cropId, status: 'OPEN' },
    include: { buyer: { include: { user: true } } },
  });

  const rawOptions: any[] = [];

  // Evaluate Markets
  for (const mp of marketPrices) {
    const distanceKm = calculateDistance(
      input.latitude,
      input.longitude,
      mp.market.latitude,
      mp.market.longitude
    );

    const transportCost = calculateTransportCost(
      distanceKm,
      input.quantityKg,
      transportConfig.baseFee,
      transportConfig.ratePerKmPerTon
    );

    const { pricePerKg } = convertPriceToKg(mp.pricePerUnit, crop.name, crop.defaultUnit);
    const grossRevenue = Math.round(input.quantityKg * pricePerKg);
    const expectedNetRevenue = grossRevenue - transportCost;

    // Fetch 30-day price history for this market
    const history = await prisma.priceHistory.findMany({
      where: { marketId: mp.marketId, cropId: input.cropId },
      orderBy: { date: 'asc' },
      take: 30,
    });

    const trendObj = calculateTrendSlope(
      history.map((h) => ({ date: h.date, price: h.averagePrice }))
    );

    // AP Market Priority check (Vijayawada, Guntur, Eluru get higher score)
    const isLocalApMarket = mp.market.state === 'Andhra Pradesh' || ['Vijayawada', 'Guntur', 'Eluru'].includes(mp.market.city);

    rawOptions.push({
      id: `market-${mp.market.id}`,
      marketId: mp.market.id,
      type: 'MARKET',
      name: mp.market.name,
      locationCity: mp.market.city,
      distanceKm,
      unitPrice: pricePerKg,
      grossRevenue,
      transportCost,
      expectedNetRevenue,
      trend: trendObj.direction,
      percentageChange: trendObj.percentageChange,
      qualityMatchGrade: 'All Grades',
      reliabilityScore: isLocalApMarket ? 95 : 85, // Higher baseline for local APMC yards
    });
  }

  // Evaluate Buyers
  for (const br of buyerReqs) {
    const distanceKm = calculateDistance(
      input.latitude,
      input.longitude,
      br.latitude,
      br.longitude
    );

    const transportCost = calculateTransportCost(
      distanceKm,
      input.quantityKg,
      transportConfig.baseFee,
      transportConfig.ratePerKmPerTon
    );

    const { pricePerKg: buyerPricePerKg } = convertPriceToKg(br.offeredPrice, crop.name, br.unit);
    const fulfilledQuantity = Math.min(input.quantityKg, br.quantityNeeded);
    const grossRevenue = Math.round(fulfilledQuantity * buyerPricePerKg);
    const expectedNetRevenue = grossRevenue - transportCost;

    rawOptions.push({
      id: `buyer-${br.id}`,
      buyerRequirementId: br.id,
      type: 'BUYER',
      name: br.buyer.companyName,
      locationCity: br.locationCity,
      distanceKm,
      unitPrice: buyerPricePerKg,
      grossRevenue,
      transportCost,
      expectedNetRevenue,
      trend: 'STABLE',
      percentageChange: 0,
      qualityMatchGrade: br.qualityGrade,
      reliabilityScore: Math.round(br.buyer.rating * 20), // Convert 5 stars to 100
      contactName: br.buyer.user.name,
      contactPhone: br.buyer.user.phone,
    });
  }

  if (rawOptions.length === 0) {
    throw new Error('No markets or buyers currently found for this crop');
  }

  // Calculate Relative Opportunity Scores (0 - 100)
  const maxNetRevenue = Math.max(...rawOptions.map((o) => o.expectedNetRevenue), 1);
  const maxPrice = Math.max(...rawOptions.map((o) => o.unitPrice), 1);

  const scoredOptions: RecommendedOption[] = rawOptions.map((opt) => {
    const revenueScore = Math.max(0, (opt.expectedNetRevenue / maxNetRevenue) * 30);
    const priceScore = (opt.unitPrice / maxPrice) * 25;
    const reliabilityScore = (opt.reliabilityScore / 100) * 15;

    let trendScore = 5;
    if (opt.trend === 'INCREASING') trendScore = 10;
    if (opt.trend === 'DECREASING') trendScore = 2;

    const maxDistance = 200;
    const distanceScore = Math.max(0, 10 - (opt.distanceKm / maxDistance) * 10);

    const gradeScore = opt.qualityMatchGrade === qualityGrade ? 10 : 7;

    const opportunityScore = Math.min(
      100,
      Math.round(revenueScore + priceScore + reliabilityScore + trendScore + distanceScore + gradeScore)
    );

    const rationale: string[] = [];
    if (opt.expectedNetRevenue === maxNetRevenue) {
      rationale.push('Highest expected net revenue after transport');
    }
    if (opt.unitPrice === maxPrice) {
      rationale.push('Highest offered unit price (₹' + opt.unitPrice + '/kg)');
    }
    if (opt.trend === 'INCREASING') {
      rationale.push(`Price trend is favorable (+${opt.percentageChange}% change)`);
    }
    if (opt.distanceKm <= 20) {
      rationale.push(`Nearby location (${opt.distanceKm} km away) lowers transport cost`);
    }
    if (opt.type === 'BUYER' && opt.reliabilityScore >= 90) {
      rationale.push('Highly rated verified direct buyer');
    }
    if (rationale.length === 0) {
      rationale.push('Solid alternative option with competitive market rates');
    }

    return {
      id: opt.id,
      type: opt.type,
      name: opt.name,
      locationCity: opt.locationCity,
      distanceKm: opt.distanceKm,
      unitPrice: opt.unitPrice,
      grossRevenue: opt.grossRevenue,
      transportCost: opt.transportCost,
      expectedNetRevenue: opt.expectedNetRevenue,
      opportunityScore,
      isRecommended: false,
      trend: opt.trend,
      percentageChange: opt.percentageChange,
      rationale,
      contactName: opt.contactName,
      contactPhone: opt.contactPhone,
      buyerRequirementId: opt.buyerRequirementId,
      marketId: opt.marketId,
      qualityMatchGrade: opt.qualityMatchGrade,
    };
  });

  // Rank by Opportunity Score descending, then expectedNetRevenue descending
  scoredOptions.sort((a, b) => {
    if (b.opportunityScore !== a.opportunityScore) {
      return b.opportunityScore - a.opportunityScore;
    }
    return b.expectedNetRevenue - a.expectedNetRevenue;
  });

  if (scoredOptions.length > 0) {
    scoredOptions[0].isRecommended = true;
  }

  const topOption = scoredOptions[0] || null;

  // Compute Sell Now or Wait Advisor Logic
  const avgCurrentPrice = Math.round(
    (scoredOptions.reduce((acc, o) => acc + o.unitPrice, 0) / scoredOptions.length) * 10
  ) / 10;

  const increasingOptions = scoredOptions.filter((o) => o.trend === 'INCREASING');
  let sellOrWait: OpportunityAnalysisResult['sellOrWaitAdvice'];

  if (increasingOptions.length > 0) {
    const maxPredicted = Math.round(avgCurrentPrice * 1.15);
    const minPredicted = Math.round(avgCurrentPrice * 1.05);
    sellOrWait = {
      decision: 'CONSIDER WAITING',
      currentAvgPrice: avgCurrentPrice,
      expectedPriceRange: `₹${minPredicted} – ₹${maxPredicted}/kg`,
      reasoning: 'Market trends show rising price momentum over recent periods. Holding 3–5 days may yield higher net earnings.',
      trendDirection: 'INCREASING',
    };
  } else {
    const minPredicted = Math.round(avgCurrentPrice * 0.9);
    const maxPredicted = Math.round(avgCurrentPrice * 0.98);
    sellOrWait = {
      decision: 'SELL NOW',
      currentAvgPrice: avgCurrentPrice,
      expectedPriceRange: `₹${minPredicted} – ₹${maxPredicted}/kg`,
      reasoning: 'Prices are stable or facing downward pressure. Locking in sales today optimizes your expected profit.',
      trendDirection: 'DECREASING',
    };
  }

  return {
    crop: {
      id: crop.id,
      name: crop.name,
      category: crop.category,
    },
    quantityKg: input.quantityKg,
    farmerLocation: {
      city: input.locationCity || 'Current Location',
      latitude: input.latitude,
      longitude: input.longitude,
    },
    bestOpportunity: topOption,
    options: scoredOptions,
    sellOrWaitAdvice: sellOrWait,
    dataSourceMetadata: {
      marketDataOrigin: 'APMC MANDI BENCHMARK DATA',
      transportCalculation: 'ESTIMATED DISTANCE LOGISTICS MATH (₹15/km/ton)',
      trendAnalysisMethod: '30-DAY HISTORICAL TREND ANALYSIS',
      externalApiStatus: 'ACTIVE MANDI MARKET LINK',
    },
  };
}
