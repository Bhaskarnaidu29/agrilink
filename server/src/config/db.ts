import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

prisma.$connect()
  .then(() => console.log('🍃 Prisma connected to MongoDB Atlas successfully.'))
  .catch((err) => console.error('❌ Prisma MongoDB connection error:', err));
