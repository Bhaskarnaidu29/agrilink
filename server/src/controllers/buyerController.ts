import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { z } from 'zod';

const createRequirementSchema = z.object({
  cropId: z.string(),
  variety: z.string().default('Standard'),
  quantityNeeded: z.number().positive(),
  unit: z.string().default('kg'),
  qualityGrade: z.enum(['Grade A', 'Grade B', 'Grade C']).default('Grade A'),
  offeredPrice: z.number().positive(),
  requiredDate: z.string().or(z.date()),
  locationCity: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

const updateBuyerProfileSchema = z.object({
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  gstNumber: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function createBuyerRequirement(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!buyerProfile) {
      return res.status(400).json({ message: 'Buyer profile required to post requirement' });
    }

    const data = createRequirementSchema.parse(req.body);

    const requirement = await prisma.buyerRequirement.create({
      data: {
        buyerId: buyerProfile.id,
        cropId: data.cropId,
        variety: data.variety,
        quantityNeeded: data.quantityNeeded,
        unit: data.unit,
        qualityGrade: data.qualityGrade,
        offeredPrice: data.offeredPrice,
        requiredDate: new Date(data.requiredDate),
        locationCity: data.locationCity,
        latitude: data.latitude,
        longitude: data.longitude,
        status: 'OPEN',
      },
      include: { crop: true },
    });

    res.status(201).json({
      message: 'Buyer requirement posted successfully',
      requirement,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to post requirement' });
  }
}

export async function updateBuyerRequirement(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    const data = createRequirementSchema.partial().parse(req.body);

    const updated = await prisma.buyerRequirement.update({
      where: { id },
      data: {
        ...(data.cropId && { cropId: data.cropId }),
        ...(data.variety && { variety: data.variety }),
        ...(data.quantityNeeded && { quantityNeeded: data.quantityNeeded }),
        ...(data.unit && { unit: data.unit }),
        ...(data.qualityGrade && { qualityGrade: data.qualityGrade }),
        ...(data.offeredPrice && { offeredPrice: data.offeredPrice }),
        ...(data.requiredDate && { requiredDate: new Date(data.requiredDate) }),
        ...(data.locationCity && { locationCity: data.locationCity }),
        ...(data.latitude && { latitude: data.latitude }),
        ...(data.longitude && { longitude: data.longitude }),
      },
      include: { crop: true },
    });

    res.json({ message: 'Buyer requirement updated successfully', requirement: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update requirement' });
  }
}

export async function deleteBuyerRequirement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.buyerRequirement.delete({ where: { id } });
    res.json({ message: 'Buyer requirement deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to delete requirement' });
  }
}

export async function getBuyerRequirements(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!buyerProfile) {
      return res.json({ requirements: [] });
    }

    const requirements = await prisma.buyerRequirement.findMany({
      where: { buyerId: buyerProfile.id },
      include: {
        crop: true,
        offers: {
          include: { sender: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requirements });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch requirements' });
  }
}

export async function getAllBuyerRequirements(req: AuthRequest, res: Response) {
  try {
    const { cropId, city, qualityGrade } = req.query;

    const requirements = await prisma.buyerRequirement.findMany({
      where: {
        status: 'OPEN',
        ...(cropId && { cropId: String(cropId) }),
        ...(city && { locationCity: { contains: String(city) } }),
        ...(qualityGrade && { qualityGrade: String(qualityGrade) }),
      },
      include: {
        crop: true,
        buyer: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requirements });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch marketplace requirements' });
  }
}

export async function updateBuyerProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const data = updateBuyerProfileSchema.parse(req.body);

    const updatedProfile = await prisma.buyerProfile.update({
      where: { userId: req.user.id },
      data,
    });

    res.json({ message: 'Buyer profile updated successfully', profile: updatedProfile });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update buyer profile' });
  }
}
