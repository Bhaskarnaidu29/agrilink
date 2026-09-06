import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { createProduceListing, updateProduceListing, getFarmerProduceListings, getAllProduceListings, deleteProduceListing, updateFarmerProfile } from '../controllers/farmerController';
import { createBuyerRequirement, updateBuyerRequirement, deleteBuyerRequirement, getBuyerRequirements, getAllBuyerRequirements, updateBuyerProfile } from '../controllers/buyerController';
import { getMarkets, getCrops, getMarketPrices, getPriceHistory } from '../controllers/marketController';
import { calculateBestOpportunities } from '../controllers/priceDiscoveryController';
import { matchFarmersForRequirement } from '../controllers/matchingController';
import { createOffer, getUserOffers, counterOffer, respondOfferStatus } from '../controllers/offerController';
import { getUserTransactions, updateTransactionStatus, createReview } from '../controllers/transactionController';
import { getAdminAnalytics, updateMarketPrice } from '../controllers/adminController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { prisma } from '../config/db';

const router = Router();

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateJWT, getMe);

// Farmers & Profiles
router.put('/farmers/profile', authenticateJWT, authorizeRoles('FARMER', 'ADMIN'), updateFarmerProfile);

// Produce Listings
router.post('/farmers/produce', authenticateJWT, authorizeRoles('FARMER', 'ADMIN'), createProduceListing);
router.put('/farmers/produce/:id', authenticateJWT, authorizeRoles('FARMER', 'ADMIN'), updateProduceListing);
router.get('/farmers/produce', authenticateJWT, getFarmerProduceListings);
router.delete('/farmers/produce/:id', authenticateJWT, deleteProduceListing);
router.get('/marketplace/produce', getAllProduceListings);

// Buyers & Profiles
router.put('/buyers/profile', authenticateJWT, authorizeRoles('BUYER', 'ADMIN'), updateBuyerProfile);

// Sourcing Requirements
router.post('/requirements', authenticateJWT, authorizeRoles('BUYER', 'ADMIN'), createBuyerRequirement);
router.put('/requirements/:id', authenticateJWT, authorizeRoles('BUYER', 'ADMIN'), updateBuyerRequirement);
router.delete('/requirements/:id', authenticateJWT, authorizeRoles('BUYER', 'ADMIN'), deleteBuyerRequirement);
router.get('/requirements', authenticateJWT, getBuyerRequirements);
router.get('/marketplace/requirements', getAllBuyerRequirements);

// Mandi Markets & Crops
router.get('/markets', getMarkets);
router.get('/crops', getCrops);
router.get('/markets/prices', getMarketPrices);
router.get('/price-discovery/history', getPriceHistory);

// ⭐ CORE PRICE DISCOVERY ENGINE
router.post('/price-discovery', calculateBestOpportunities);

// Smart Matching Engine
router.post('/matching/farmers', authenticateJWT, matchFarmersForRequirement);

// Offers & Real-Time Negotiation
router.post('/offers', authenticateJWT, createOffer);
router.get('/offers', authenticateJWT, getUserOffers);
router.put('/offers/:id/counter', authenticateJWT, counterOffer);
router.put('/offers/:id/status', authenticateJWT, respondOfferStatus);

// Deals & Transactions
router.get('/transactions', authenticateJWT, getUserTransactions);
router.put('/transactions/:id/status', authenticateJWT, updateTransactionStatus);
router.post('/reviews', authenticateJWT, createReview);

// Notifications
router.get('/notifications', authenticateJWT, async (req: any, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json({ notifications });
});

router.put('/notifications/read-all', authenticateJWT, async (req: any, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ message: 'All marked as read' });
});

router.put('/notifications/:id/read', authenticateJWT, async (req: any, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json({ message: 'Marked as read' });
});

// Admin Control Panel
router.get('/admin/analytics', authenticateJWT, authorizeRoles('ADMIN'), getAdminAnalytics);
router.post('/admin/market-prices', authenticateJWT, authorizeRoles('ADMIN'), updateMarketPrice);

export default router;
