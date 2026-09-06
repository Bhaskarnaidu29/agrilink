import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { convertPriceToKg } from '../utils/unitConversion';

export async function getMarkets(req: Request, res: Response) {
  try {
    const markets = await prisma.market.findMany({
      include: {
        marketPrices: {
          include: { crop: true },
        },
      },
    });
    res.json({ markets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch markets' });
  }
}

export async function getCrops(req: Request, res: Response) {
  try {
    const crops = await prisma.crop.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ crops });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch crops' });
  }
}

export async function getMarketPrices(req: Request, res: Response) {
  try {
    const { cropId, marketId } = req.query;

    const pricesData = await prisma.marketPrice.findMany({
      where: {
        ...(cropId && { cropId: String(cropId) }),
        ...(marketId && { marketId: String(marketId) }),
      },
      include: {
        market: true,
        crop: true,
      },
      orderBy: { date: 'desc' },
    });

    const prices = pricesData.map((p) => {
      const conv = convertPriceToKg(p.pricePerUnit, p.crop?.name, p.crop?.defaultUnit);
      return {
        ...p,
        pricePerKg: conv.pricePerKg,
        pricePerUnit: conv.pricePerKg, // Ensure consistent per-kg display
        originalPrice: conv.originalPrice,
        originalUnit: conv.originalUnit,
        isConverted: conv.isConverted,
      };
    });

    res.json({ prices });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch market prices' });
  }
}

export async function getPriceHistory(req: Request, res: Response) {
  try {
    const { cropId, marketId, days } = req.query;

    const daysCount = Number(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const histories = await prisma.priceHistory.findMany({
      where: {
        ...(cropId && { cropId: String(cropId) }),
        ...(marketId && { marketId: String(marketId) }),
        date: { gte: startDate },
      },
      include: {
        market: true,
        crop: true,
      },
      orderBy: { date: 'asc' },
    });

    res.json({ histories });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch price history' });
  }
}
