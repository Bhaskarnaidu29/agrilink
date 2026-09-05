import { Request, Response } from 'express';
import { analyzeBestSellingOpportunities } from '../recommendation/engine';
import { z } from 'zod';

const priceDiscoverySchema = z.object({
  cropId: z.string(),
  quantityKg: z.number().positive(),
  qualityGrade: z.string().optional(),
  locationCity: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export async function calculateBestOpportunities(req: Request, res: Response) {
  try {
    const input = priceDiscoverySchema.parse(req.body);
    const result = await analyzeBestSellingOpportunities(input);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Price discovery calculation failed' });
  }
}
