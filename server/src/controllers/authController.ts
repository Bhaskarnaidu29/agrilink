import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['FARMER', 'BUYER', 'ADMIN']),
  name: z.string().min(2),
  phone: z.string().min(10),
  // Role specific fields
  farmName: z.string().optional(),
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: AuthRequest, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        name: data.name,
        phone: data.phone,
        ...(data.role === 'FARMER' && {
          farmerProfile: {
            create: {
              farmName: data.farmName || `${data.name}'s Farm`,
              address: `${data.city || 'Vijayawada'}, ${data.state || 'Andhra Pradesh'}`,
              city: data.city || 'Vijayawada',
              state: data.state || 'Andhra Pradesh',
              latitude: data.latitude || 16.5062,
              longitude: data.longitude || 80.6480,
              verified: true,
            },
          },
        }),
        ...(data.role === 'BUYER' && {
          buyerProfile: {
            create: {
              companyName: data.companyName || `${data.name} Trading Co.`,
              businessType: data.businessType || 'Wholesaler',
              city: data.city || 'Vijayawada',
              state: data.state || 'Andhra Pradesh',
              latitude: data.latitude || 16.5193,
              longitude: data.longitude || 80.6305,
              verified: true,
              rating: 4.5,
            },
          },
        }),
      },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    const jwtSecret = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026_sih';
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone,
        farmerProfile: newUser.farmerProfile,
        buyerProfile: newUser.buyerProfile,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026_sih';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Login failed' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch user' });
  }
}
