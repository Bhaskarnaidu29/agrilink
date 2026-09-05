import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { z } from 'zod';

const createReviewSchema = z.object({
  transactionId: z.string(),
  revieweeId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3),
});

export async function getUserTransactions(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
    });
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const farmerId = farmerProfile?.id;
    const buyerId = buyerProfile?.id;

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          ...(farmerId ? [{ farmerId }] : []),
          ...(buyerId ? [{ buyerId }] : []),
        ],
      },
      include: {
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        produceListing: { include: { crop: true } },
        buyerRequirement: { include: { crop: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ transactions });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch transactions' });
  }
}

export async function updateTransactionStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    const tx = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: {
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
      },
    });

    res.json({ message: 'Transaction status updated', transaction: tx });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update transaction status' });
  }
}

export async function createReview(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const data = createReviewSchema.parse(req.body);

    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Reviews can only be submitted for COMPLETED transactions.' });
    }

    const review = await prisma.review.create({
      data: {
        transactionId: data.transactionId,
        reviewerId: req.user.id,
        revieweeId: data.revieweeId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to submit review' });
  }
}
