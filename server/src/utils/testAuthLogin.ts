import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../middleware/auth';

async function testAuthLogin() {
  console.log('🔍 Testing Auth Login with Seeded Farmer Credentials...');
  try {
    const email = 'ramesh@farmer.com';
    const password = 'password123';

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    if (!user) {
      console.error('❌ User not found for email:', email);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name} (${user.role})`);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.error('❌ Password comparison failed');
      process.exit(1);
    }

    const secret = getJwtSecret();
    const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' });

    console.log('✅ Password matched successfully!');
    console.log(`✅ JWT Token Generated: ${token.slice(0, 30)}...`);
    console.log('🎉 LOGIN VERIFICATION SUCCESSFUL WITH ZERO ERRORS!\n');
  } catch (err: any) {
    console.error('❌ Login Error Trace:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthLogin();
