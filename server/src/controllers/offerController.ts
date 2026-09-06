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
    let targetReceiverId = data.receiverId;

    if (data.produceListingId) {
      const listing = await prisma.produceListing.findUnique({
        where: { id: data.produceListingId },
        include: { farmer: { include: { user: true } } },
      });
      if (!listing) {
        return res.status(404).json({ message: 'Target produce listing not found' });
      }
      if (listing.farmer?.userId) {
        targetReceiverId = listing.farmer.userId;
      }
      if (req.user.id === targetReceiverId) {
        return res.status(400).json({ message: 'Cannot make an offer to your own listing' });
      }
    } else if (data.buyerRequirementId) {
      const requirement = await prisma.buyerRequirement.findUnique({
        where: { id: data.buyerRequirementId },
        include: { buyer: { include: { user: true } } },
      });
      if (!requirement) {
        return res.status(404).json({ message: 'Target buyer requirement not found' });
      }
      if (requirement.buyer?.userId) {
        targetReceiverId = requirement.buyer.userId;
      }
      if (req.user.id === targetReceiverId) {
        return res.status(400).json({ message: 'Cannot make an offer to your own requirement' });
      }
    }

    const totalAmount = Math.round(data.quantity * data.pricePerUnit);

    const offer = await prisma.offer.create({
      data: {
        senderId: req.user.id,
        receiverId: targetReceiverId,
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
      include: {
        negotiations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!existingOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (req.user.id !== existingOffer.senderId && req.user.id !== existingOffer.receiverId) {
      return res.status(403).json({ message: 'You are not a participant in this offer' });
    }

    if (['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(existingOffer.status)) {
      return res.status(400).json({ message: `This offer is already ${existingOffer.status.toLowerCase()} and cannot be modified` });
    }

    const latestSenderId = existingOffer.negotiations?.[0]?.senderId || existingOffer.senderId;
    if (req.user.id === latestSenderId) {
      return res.status(403).json({ message: 'You cannot counter your own offer/counter. Please wait for the recipient response.' });
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

    const recipientId = req.user.id === existingOffer.senderId ? existingOffer.receiverId : existingOffer.senderId;

    await prisma.notification.create({
      data: {
        userId: recipientId,
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
        negotiations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (req.user.id !== offer.senderId && req.user.id !== offer.receiverId) {
      return res.status(403).json({ message: 'You are not a participant in this offer' });
    }

    if (['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(offer.status)) {
      return res.status(400).json({ message: `This offer is already ${offer.status.toLowerCase()} and cannot be modified` });
    }

    const latestSenderId = offer.negotiations?.[0]?.senderId || offer.senderId;
    if (req.user.id === latestSenderId) {
      return res.status(403).json({ message: 'You cannot accept or reject your own offer/counter. Please wait for recipient response.' });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { status },
    });

    if (status === 'ACCEPTED') {
      const existingTx = await prisma.transaction.findUnique({
        where: { offerId: offer.id },
      });

      if (!existingTx) {
        let farmerUser = offer.sender.role === 'FARMER' ? offer.sender : (offer.receiver.role === 'FARMER' ? offer.receiver : null);
        let buyerUser = offer.sender.role === 'BUYER' ? offer.sender : (offer.receiver.role === 'BUYER' ? offer.receiver : null);

        if (!farmerUser && offer.produceListing?.farmer?.userId) {
          farmerUser = offer.senderId === offer.produceListing.farmer.userId ? offer.sender : offer.receiver;
        }
        if (!buyerUser && offer.buyerRequirement?.buyer?.userId) {
          buyerUser = offer.senderId === offer.buyerRequirement.buyer.userId ? offer.sender : offer.receiver;
        }

        if (!farmerUser) farmerUser = offer.produceListing ? offer.receiver : offer.sender;
        if (!buyerUser) buyerUser = farmerUser.id === offer.senderId ? offer.receiver : offer.sender;

        let farmerProf = await prisma.farmerProfile.findUnique({ where: { userId: farmerUser.id } });
        if (!farmerProf) {
          farmerProf = await prisma.farmerProfile.create({
            data: {
              userId: farmerUser.id,
              farmName: `${farmerUser.name}'s Farm`,
              address: 'Vijayawada, Andhra Pradesh',
              city: 'Vijayawada',
              state: 'Andhra Pradesh',
              latitude: 16.5062,
              longitude: 80.6480,
              verified: true,
            },
          });
        }

        let buyerProf = await prisma.buyerProfile.findUnique({ where: { userId: buyerUser.id } });
        if (!buyerProf) {
          buyerProf = await prisma.buyerProfile.create({
            data: {
              userId: buyerUser.id,
              companyName: `${buyerUser.name} Sourcing`,
              businessType: 'Wholesaler',
              city: 'Vijayawada',
              state: 'Andhra Pradesh',
              latitude: 16.5193,
              longitude: 80.6305,
              verified: true,
              rating: 4.5,
            },
          });
        }

        await prisma.transaction.create({
          data: {
            offerId: offer.id,
            produceListingId: offer.produceListingId,
            buyerRequirementId: offer.buyerRequirementId,
            farmerId: farmerProf.id,
            buyerId: buyerProf.id,
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
