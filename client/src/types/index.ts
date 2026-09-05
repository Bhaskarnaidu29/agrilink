export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  companyName: string;
  businessType: string;
  gstNumber?: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  rating: number;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  imageUrl?: string;
  description?: string;
}

export interface Market {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  isApmc: boolean;
}

export interface MarketPrice {
  id: string;
  marketId: string;
  cropId: string;
  pricePerUnit: number;
  minPrice: number;
  maxPrice: number;
  date: string;
  market: Market;
  crop: Crop;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  cropId: string;
  variety: string;
  quantity: number;
  unit: string;
  qualityGrade: string;
  harvestDate: string;
  sellingDate: string;
  locationCity: string;
  latitude: number;
  longitude: number;
  minPrice: number;
  imageUrl?: string;
  description?: string;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt: string;
  crop: Crop;
  farmer?: {
    id: string;
    farmName: string;
    city: string;
    user: { name: string; phone: string };
  };
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  cropId: string;
  variety: string;
  quantityNeeded: number;
  unit: string;
  qualityGrade: string;
  offeredPrice: number;
  requiredDate: string;
  locationCity: string;
  latitude: number;
  longitude: number;
  status: 'OPEN' | 'FULFILLED' | 'EXPIRED';
  createdAt: string;
  crop: Crop;
  buyer?: {
    id: string;
    companyName: string;
    businessType: string;
    rating: number;
    user: { name: string; phone: string };
  };
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
  crop: { id: string; name: string; category: string };
  quantityKg: number;
  farmerLocation: { city: string; latitude: number; longitude: number };
  bestOpportunity: RecommendedOption | null;
  options: RecommendedOption[];
  sellOrWaitAdvice: {
    decision: 'SELL NOW' | 'CONSIDER WAITING';
    currentAvgPrice: number;
    expectedPriceRange: string;
    reasoning: string;
    trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
  };
  dataSourceMetadata?: {
    marketDataOrigin: string;
    transportCalculation: string;
    trendAnalysisMethod: string;
    externalApiStatus: string;
  };
}

export interface Offer {
  id: string;
  produceListingId?: string;
  buyerRequirementId?: string;
  senderId: string;
  receiverId: string;
  pricePerUnit: number;
  quantity: number;
  transportPayer: string;
  totalAmount: number;
  message?: string;
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  sender: User;
  receiver: User;
  produceListing?: ProduceListing;
  buyerRequirement?: BuyerRequirement;
  negotiations: {
    id: string;
    senderId: string;
    pricePerUnit: number;
    quantity: number;
    note?: string;
    createdAt: string;
  }[];
}

export interface Transaction {
  id: string;
  agreedPrice: number;
  totalAmount: number;
  quantity: number;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  deliveryDate?: string;
  createdAt: string;
  farmer: { farmName: string; city: string; user: { name: string; phone: string } };
  buyer: { companyName: string; city: string; user: { name: string; phone: string } };
  produceListing?: { crop: Crop };
  buyerRequirement?: { crop: Crop };
  review?: { rating: number; comment: string };
}
