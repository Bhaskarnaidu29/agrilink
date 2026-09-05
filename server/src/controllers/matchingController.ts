import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { calculateDistance } from '../utils/math';

export async function matchFarmersForRequirement(req: Request, res: Response) {
  try {
    const { requirementId } = req.body;

    const requirement = await prisma.buyerRequirement.findUnique({
      where: { id: requirementId },
      include: { crop: true },
    });

    if (!requirement) {
      return res.status(404).json({ message: 'Buyer requirement not found' });
    }

    const listings = await prisma.produceListing.findMany({
      where: {
        cropId: requirement.cropId,
        status: 'ACTIVE',
      },
      include: {
        farmer: {
          include: { user: true },
        },
        crop: true,
      },
    });

    const matches = listings.map((listing) => {
      // Compatibility weights
      // Crop Match: 30%
      // Quantity Match: 20%
      // Quality Match: 20%
      // Distance: 15%
      // Price: 15%

      const cropMatchScore = 30;

      const qtyRatio = Math.min(listing.quantity / requirement.quantityNeeded, requirement.quantityNeeded / listing.quantity);
      const qtyScore = Math.round(qtyRatio * 20);

      const qualityScore = listing.qualityGrade === requirement.qualityGrade ? 20 : 14;

      const distanceKm = calculateDistance(
        requirement.latitude,
        requirement.longitude,
        listing.latitude,
        listing.longitude
      );
      const distanceScore = Math.max(0, 15 - Math.round((distanceKm / 150) * 15));

      const priceDiff = requirement.offeredPrice - listing.minPrice;
      const priceScore = priceDiff >= 0 ? 15 : Math.max(0, 15 - Math.abs(priceDiff));

      const compatibilityPercent = Math.min(100, Math.round(cropMatchScore + qtyScore + qualityScore + distanceScore + priceScore));

      const rationale: string[] = [];
      if (listing.qualityGrade === requirement.qualityGrade) rationale.push('Exact quality grade match (' + listing.qualityGrade + ')');
      if (listing.minPrice <= requirement.offeredPrice) rationale.push(`Price compatible (Asking ₹${listing.minPrice}/kg vs Offered ₹${requirement.offeredPrice}/kg)`);
      if (distanceKm <= 30) rationale.push(`Nearby farm (${distanceKm} km)`);

      return {
        farmer: {
          id: listing.farmer.id,
          name: listing.farmer.user.name,
          farmName: listing.farmer.farmName,
          phone: listing.farmer.user.phone,
          city: listing.farmer.city,
        },
        listing,
        distanceKm,
        compatibilityPercent,
        rationale,
      };
    });

    matches.sort((a, b) => b.compatibilityPercent - a.compatibilityPercent);

    res.json({
      requirement,
      matches,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Matching process failed' });
  }
}
