import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { z } from 'zod';

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
  minPrice: z.number().positive(),
  description: z.string().optional(),
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
        minPrice: data.minPrice,
        description: data.description,
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

    res.json({ listings });
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
