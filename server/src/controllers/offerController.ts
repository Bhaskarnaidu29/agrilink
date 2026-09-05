import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { z } from 'zod';

const createOfferSchema = z.object({
  produceListingId: z.string().optional(),
  buyerRequirementId: z.string().optional(),
  receiverId: z.string(),
  pricePerUnit: z.number().positive(),
  quantity: z.number().positive(),
  transportPayer: z.enum(['BUYER', 'FARMER', 'SHARED']).default('BUYER'),
  message: z.string().optional(),
});

const counterOfferSchema = z.object({
  pricePerUnit: z.number().positive(),
  quantity: z.number().positive(),
  note: z.string().optional(),
});

export async function createOffer(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const data = createOfferSchema.parse(req.body);

    const totalAmount = Math.round(data.quantity * data.pricePerUnit);

    const offer = await prisma.offer.create({
      data: {
        senderId: req.user.id,
        receiverId: data.receiverId,
        produceListingId: data.produceListingId,
        buyerRequirementId: data.buyerRequirementId,
        pricePerUnit: data.pricePerUnit,
        quantity: data.quantity,
        transportPayer: data.transportPayer,
        totalAmount,
        message: data.message,
        status: 'PENDING',
        negotiations: {
          create: {
            senderId: req.user.id,
            pricePerUnit: data.pricePerUnit,
            quantity: data.quantity,
            note: data.message || 'Initial Offer Sent',
          },
        },
      },
      include: {
        sender: true,
        receiver: true,
        produceListing: { include: { crop: true } },
        buyerRequirement: { include: { crop: true } },
        negotiations: true,
      },
    });

    // Create Notification for receiver
    await prisma.notification.create({
      data: {
        userId: data.receiverId,
        title: 'New Offer Received 📩',
        message: `${req.user.name} sent an offer for ₹${data.pricePerUnit}/kg (${data.quantity} kg).`,
        type: 'OFFER',
        link: '/offers',
      },
    });

    res.status(201).json({
      message: 'Offer sent successfully',
      offer,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create offer' });
  }
}

export async function getUserOffers(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const offers = await prisma.offer.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
      },
      include: {
        sender: true,
        receiver: true,
        produceListing: { include: { crop: true, farmer: true } },
        buyerRequirement: { include: { crop: true, buyer: true } },
        negotiations: { orderBy: { createdAt: 'desc' } },
        transaction: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ offers });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch offers' });
  }
}

export async function counterOffer(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const data = counterOfferSchema.parse(req.body);

    const existingOffer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!existingOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const totalAmount = Math.round(data.quantity * data.pricePerUnit);

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        pricePerUnit: data.pricePerUnit,
        quantity: data.quantity,
        totalAmount,
        status: 'COUNTERED',
        negotiations: {
          create: {
            senderId: req.user.id,
            pricePerUnit: data.pricePerUnit,
            quantity: data.quantity,
            note: data.note || `Counter offer: ₹${data.pricePerUnit}/kg`,
          },
        },
      },
      include: {
        sender: true,
        receiver: true,
        negotiations: { orderBy: { createdAt: 'desc' } },
      },
    });

    const otherUser = req.user.id === existingOffer.senderId ? existingOffer.receiverId : existingOffer.senderId;

    await prisma.notification.create({
      data: {
        userId: otherUser,
        title: 'Counter Offer Received 🔄',
        message: `${req.user.name} countered with ₹${data.pricePerUnit}/kg for ${data.quantity} kg.`,
        type: 'OFFER',
        link: '/offers',
      },
    });

    res.json({ message: 'Counter offer submitted', offer: updatedOffer });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to counter offer' });
  }
}

export async function respondOfferStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const { status } = req.body; // ACCEPTED or REJECTED

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be ACCEPTED or REJECTED' });
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        produceListing: { include: { farmer: true } },
        buyerRequirement: { include: { buyer: true } },
        sender: { include: { farmerProfile: true, buyerProfile: true } },
        receiver: { include: { farmerProfile: true, buyerProfile: true } },
      },
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { status },
    });

    if (status === 'ACCEPTED') {
      // Determine Farmer & Buyer profiles
      let farmerProfileId = offer.sender.farmerProfile?.id || offer.receiver.farmerProfile?.id;
      let buyerProfileId = offer.sender.buyerProfile?.id || offer.receiver.buyerProfile?.id;

      if (farmerProfileId && buyerProfileId) {
        await prisma.transaction.create({
          data: {
            offerId: offer.id,
            produceListingId: offer.produceListingId,
            buyerRequirementId: offer.buyerRequirementId,
            farmerId: farmerProfileId,
            buyerId: buyerProfileId,
            agreedPrice: offer.pricePerUnit,
            totalAmount: offer.totalAmount,
            quantity: offer.quantity,
            status: 'CONFIRMED',
            deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    const recipientId = req.user.id === offer.senderId ? offer.receiverId : offer.senderId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: status === 'ACCEPTED' ? 'Deal Confirmed! 🎉' : 'Offer Declined ❌',
        message: `Your offer for ₹${offer.pricePerUnit}/kg has been ${status.toLowerCase()}.`,
        type: 'DEALS',
        link: '/deals',
      },
    });

    res.json({ message: `Offer ${status.toLowerCase()} successfully`, offer: updatedOffer });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update offer status' });
  }
}
