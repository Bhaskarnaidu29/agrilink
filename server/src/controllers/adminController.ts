import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function getAdminAnalytics(req: Request, res: Response) {
  try {
    const totalFarmers = await prisma.farmerProfile.count();
    const totalBuyers = await prisma.buyerProfile.count();
    const activeListings = await prisma.produceListing.count({ where: { status: 'ACTIVE' } });
    const openRequirements = await prisma.buyerRequirement.count({ where: { status: 'OPEN' } });
    const totalTransactions = await prisma.transaction.count();
    
    const completedTxs = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
    });

    const totalTradeVolume = completedTxs.reduce((acc, t) => acc + t.totalAmount, 0);

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      include: {
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        produceListing: { include: { crop: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      metrics: {
        totalFarmers,
        totalBuyers,
        activeListings,
        openRequirements,
        totalTransactions,
        totalTradeVolume,
      },
      recentTransactions,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch admin analytics' });
  }
}

export async function updateMarketPrice(req: Request, res: Response) {
  try {
    const { marketId, cropId, pricePerUnit, minPrice, maxPrice } = req.body;

    const existingPrice = await prisma.marketPrice.findFirst({
      where: { marketId, cropId },
    });

    let updatedPrice;
    if (existingPrice) {
      updatedPrice = await prisma.marketPrice.update({
        where: { id: existingPrice.id },
        data: {
          pricePerUnit: Number(pricePerUnit),
          minPrice: Number(minPrice),
          maxPrice: Number(maxPrice),
          date: new Date(),
        },
      });
    } else {
      updatedPrice = await prisma.marketPrice.create({
        data: {
          marketId,
          cropId,
          pricePerUnit: Number(pricePerUnit),
          minPrice: Number(minPrice),
          maxPrice: Number(maxPrice),
          date: new Date(),
        },
      });
    }

    // Add entry into PriceHistory
    await prisma.priceHistory.create({
      data: {
        marketId,
        cropId,
        date: new Date(),
        averagePrice: Number(pricePerUnit),
        volume: 1200,
      },
    });

    res.json({ message: 'Market price updated successfully', marketPrice: updatedPrice });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update market price' });
  }
}
