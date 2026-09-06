import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { z } from 'zod';
import { analyzeCropImageQuality } from '../services/qualityAssessmentService';
import { calculateAgriTrustScore } from '../utils/agriTrust';

const createProduceSchema = z.object({
  cropId: z.string(),
  variety: z.string().default('Standard'),
  quantity: z.number().positive(),
  unit: z.string().default('kg'),
  qualityGrade: z.enum(['Grade A', 'Grade B', 'Grade C']).default('Grade A'),
  harvestDate: z.string().or(z.date()),
  sellingDate: z.string().or(z.date()),
  locationCity: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  locationAccuracy: z.number().optional().default(15.0),
  minPrice: z.number().positive(),
  description: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
});

const updateFarmerProfileSchema = z.object({
  farmName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function createProduceListing(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!farmerProfile) {
      return res.status(400).json({ message: 'Farmer profile required to add produce' });
    }

    const data = createProduceSchema.parse(req.body);

    const crop = await prisma.crop.findUnique({ where: { id: data.cropId } });
    const cropName = crop?.name || 'Produce';

    // AI-Assisted Visual Quality Assessment
    const aiResult = analyzeCropImageQuality({
      cropName,
      declaredGrade: data.qualityGrade,
      images: data.images,
    });

    const listing = await prisma.produceListing.create({
      data: {
        farmerId: farmerProfile.id,
        cropId: data.cropId,
        variety: data.variety,
        quantity: data.quantity,
        unit: data.unit,
        qualityGrade: data.qualityGrade,
        harvestDate: new Date(data.harvestDate),
        sellingDate: new Date(data.sellingDate),
        locationCity: data.locationCity,
        latitude: data.latitude,
        longitude: data.longitude,
        locationAccuracy: data.locationAccuracy,
        minPrice: data.minPrice,
        description: data.description,
        images: data.images,
        imageUrl: data.images.length > 0 ? data.images[0] : null,
        aiEstimatedGrade: aiResult.aiEstimatedGrade,
        aiConfidence: aiResult.aiConfidence,
        imageConsistency: aiResult.imageConsistency,
        aiAssessmentStatus: aiResult.aiAssessmentStatus,
        aiObservations: aiResult.aiObservations,
        status: 'ACTIVE',
      },
      include: { crop: true },
    });

    res.status(201).json({
      message: 'Produce listing created successfully',
      produce: listing,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create produce listing' });
  }
}

export async function updateProduceListing(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    const data = createProduceSchema.partial().parse(req.body);

    const updated = await prisma.produceListing.update({
      where: { id },
      data: {
        ...(data.cropId && { cropId: data.cropId }),
        ...(data.variety && { variety: data.variety }),
        ...(data.quantity && { quantity: data.quantity }),
        ...(data.unit && { unit: data.unit }),
        ...(data.qualityGrade && { qualityGrade: data.qualityGrade }),
        ...(data.harvestDate && { harvestDate: new Date(data.harvestDate) }),
        ...(data.sellingDate && { sellingDate: new Date(data.sellingDate) }),
        ...(data.locationCity && { locationCity: data.locationCity }),
        ...(data.latitude && { latitude: data.latitude }),
        ...(data.longitude && { longitude: data.longitude }),
        ...(data.minPrice && { minPrice: data.minPrice }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: { crop: true },
    });

    res.json({ message: 'Produce listing updated successfully', produce: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update produce listing' });
  }
}

export async function getFarmerProduceListings(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!farmerProfile) {
      return res.json({ listings: [] });
    }

    const listings = await prisma.produceListing.findMany({
      where: { farmerId: farmerProfile.id },
      include: {
        crop: true,
        offers: {
          include: { sender: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch produce listings' });
  }
}

export async function getAllProduceListings(req: AuthRequest, res: Response) {
  try {
    const { cropId, city, qualityGrade, minQty } = req.query;

    const listings = await prisma.produceListing.findMany({
      where: {
        status: 'ACTIVE',
        ...(cropId && { cropId: String(cropId) }),
        ...(city && { locationCity: { contains: String(city) } }),
        ...(qualityGrade && { qualityGrade: String(qualityGrade) }),
        ...(minQty && { quantity: { gte: Number(minQty) } }),
      },
      include: {
        crop: true,
        farmer: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute AgriTrust score for each farmer listing based on real DB history
    const enrichedListings = await Promise.all(
      listings.map(async (item) => {
        let agriTrust = null;
        if (item.farmer) {
          const completedDealsCount = await prisma.transaction.count({
            where: { farmerId: item.farmer.id, status: 'COMPLETED' },
          });

          const reviews = await prisma.review.findMany({
            where: { revieweeId: item.farmer.userId },
          });

          const avgRating =
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 4.5;

          agriTrust = calculateAgriTrustScore({
            verified: item.farmer.verified,
            completedTransactionsCount: completedDealsCount,
            averageRating: avgRating,
            totalReviewsCount: reviews.length,
            qualityMatchRate: item.aiAssessmentStatus === 'INCONSISTENT' ? 70 : 95,
          });
        }

        return {
          ...item,
          farmer: item.farmer
            ? {
                ...item.farmer,
                agriTrust,
              }
            : null,
        };
      })
    );

    res.json({ listings: enrichedListings });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch marketplace produce' });
  }
}

export async function deleteProduceListing(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.produceListing.delete({ where: { id } });
    res.json({ message: 'Produce listing removed successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to delete listing' });
  }
}

export async function updateFarmerProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const data = updateFarmerProfileSchema.parse(req.body);

    const updatedProfile = await prisma.farmerProfile.update({
      where: { userId: req.user.id },
      data,
    });

    res.json({ message: 'Farmer profile updated successfully', profile: updatedProfile });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update farmer profile' });
  }
}
