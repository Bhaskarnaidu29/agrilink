import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AgriLink Database Seeding (MongoDB)...');

  // Clean existing tables in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.negotiationHistory.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.buyerRequirement.deleteMany();
  await prisma.produceListing.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.market.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.transportRate.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Transport Rates
  await prisma.transportRate.create({
    data: {
      baseFee: 200,
      ratePerKmPerTon: 15,
      minDistance: 5,
    },
  });

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@agrilink.com',
      passwordHash,
      role: 'ADMIN',
      name: 'System Admin',
      phone: '+91 9876543210',
    },
  });

  const farmerUser1 = await prisma.user.create({
    data: {
      email: 'ramesh@farmer.com',
      passwordHash,
      role: 'FARMER',
      name: 'Ramesh Kumar',
      phone: '+91 9848012345',
      farmerProfile: {
        create: {
          farmName: 'Green Meadows Farm',
          address: 'Kanchikacherla Road',
          city: 'Vijayawada',
          state: 'Andhra Pradesh',
          latitude: 16.5062,
          longitude: 80.6480,
          verified: true,
        },
      },
    },
    include: { farmerProfile: true },
  });

  const farmerUser2 = await prisma.user.create({
    data: {
      email: 'suresh@farmer.com',
      passwordHash,
      role: 'FARMER',
      name: 'Suresh Patel',
      phone: '+91 9440156789',
      farmerProfile: {
        create: {
          farmName: 'Sunrise Agro Farms',
          address: 'Tenali Highway',
          city: 'Guntur',
          state: 'Andhra Pradesh',
          latitude: 16.3067,
          longitude: 80.4365,
          verified: true,
        },
      },
    },
    include: { farmerProfile: true },
  });

  const buyerUser1 = await prisma.user.create({
    data: {
      email: 'fresh@foods.com',
      passwordHash,
      role: 'BUYER',
      name: 'Anand Verma',
      phone: '+91 9123456789',
      buyerProfile: {
        create: {
          companyName: 'FreshFoods Wholesale Mandi',
          businessType: 'Wholesaler',
          gstNumber: '37AAAAA0000A1Z5',
          city: 'Vijayawada',
          state: 'Andhra Pradesh',
          latitude: 16.5193,
          longitude: 80.6305,
          verified: true,
          rating: 4.8,
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyerUser2 = await prisma.user.create({
    data: {
      email: 'metro@buyer.com',
      passwordHash,
      role: 'BUYER',
      name: 'Priya Sharma',
      phone: '+91 9988776655',
      buyerProfile: {
        create: {
          companyName: 'Metro Organics Retail',
          businessType: 'Retailer',
          gstNumber: '36BBBBB1111B1Z2',
          city: 'Hyderabad',
          state: 'Telangana',
          latitude: 17.3850,
          longitude: 78.4867,
          verified: true,
          rating: 4.6,
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyerUser3 = await prisma.user.create({
    data: {
      email: 'spice@craft.com',
      passwordHash,
      role: 'BUYER',
      name: 'Vikram Reddy',
      phone: '+91 9700112233',
      buyerProfile: {
        create: {
          companyName: 'SpiceCraft Food Processors',
          businessType: 'Food Processor',
          gstNumber: '37CCCCC2222C1Z9',
          city: 'Guntur',
          state: 'Andhra Pradesh',
          latitude: 16.3100,
          longitude: 80.4400,
          verified: true,
          rating: 4.9,
        },
      },
    },
    include: { buyerProfile: true },
  });

  console.log('✅ Created Auth Users & Profiles');

  // 3. Create Mandi Markets
  const marketsData = [
    { name: 'Vijayawada APMC Mandi', city: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5120, longitude: 80.6400, isApmc: true },
    { name: 'Guntur Vegetable & Chilli Yard', city: 'Guntur', state: 'Andhra Pradesh', latitude: 16.2990, longitude: 80.4500, isApmc: true },
    { name: 'Eluru Regional Mandi', city: 'Eluru', state: 'Andhra Pradesh', latitude: 16.7107, longitude: 81.1035, isApmc: true },
    { name: 'Hyderabad Rythu Bazaar', city: 'Hyderabad', state: 'Telangana', latitude: 17.4065, longitude: 78.4772, isApmc: true },
    { name: 'Kolar APMC Tomato Market', city: 'Kolar', state: 'Karnataka', latitude: 13.1367, longitude: 78.1292, isApmc: true },
    { name: 'Azadpur Wholesale Mandi', city: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025, isApmc: true },
  ];

  const markets = [];
  for (const m of marketsData) {
    const market = await prisma.market.create({ data: m });
    markets.push(market);
  }

  // 4. Create Crops
  const cropsData = [
    { name: 'Tomato', category: 'Vegetables', defaultUnit: 'kg', description: 'Fresh farm-harvested red tomatoes' },
    { name: 'Onion', category: 'Vegetables', defaultUnit: 'kg', description: 'Dry red onions with good shelf life' },
    { name: 'Red Chilli', category: 'Spices', defaultUnit: 'kg', description: 'High capsaicin premium Guntur red chilli' },
    { name: 'Cotton', category: 'Commercial', defaultUnit: 'quintal', description: 'Long staple white cotton' },
    { name: 'Potato', category: 'Vegetables', defaultUnit: 'kg', description: 'Fresh table potatoes' },
    { name: 'Paddy Rice', category: 'Grains', defaultUnit: 'kg', description: 'Sona Masoori raw paddy' },
    { name: 'Mango', category: 'Fruits', defaultUnit: 'kg', description: 'Banginapalli premium sweet mangoes' },
  ];

  const crops = [];
  for (const c of cropsData) {
    const crop = await prisma.crop.create({ data: c });
    crops.push(crop);
  }

  console.log('✅ Created Mandi Markets & Crops');

  // 5. Create Daily Prices & 90 Days Historical Price Data
  const basePrices: Record<string, number> = {
    'Tomato': 28,
    'Onion': 32,
    'Red Chilli': 180,
    'Cotton': 7200,
    'Potato': 22,
    'Paddy Rice': 26,
    'Mango': 65,
  };

  const today = new Date();
  const marketPriceRecords: any[] = [];
  const priceHistoryRecords: any[] = [];

  for (const crop of crops) {
    const basePrice = basePrices[crop.name] || 30;

    for (const market of markets) {
      const distanceFactor = (Math.abs(market.latitude - 16.5) + Math.abs(market.longitude - 80.6)) * 2;
      const currentPrice = Math.round((basePrice + (Math.sin(market.name.length) * 3) + distanceFactor) * 10) / 10;

      marketPriceRecords.push({
        marketId: market.id,
        cropId: crop.id,
        pricePerUnit: currentPrice,
        minPrice: Math.round((currentPrice * 0.9) * 10) / 10,
        maxPrice: Math.round((currentPrice * 1.12) * 10) / 10,
        date: today,
      });

      for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
        const histDate = new Date();
        histDate.setDate(today.getDate() - dayOffset);

        let trendBias = (90 - dayOffset) * 0.05;
        if (crop.name === 'Onion') trendBias = (90 - dayOffset) * -0.02;
        const noise = (Math.sin(dayOffset * 0.4) * 2.5) + (Math.cos(dayOffset * 0.2) * 1.8);
        const histPrice = Math.max(10, Math.round((basePrice + trendBias + noise) * 10) / 10);

        priceHistoryRecords.push({
          marketId: market.id,
          cropId: crop.id,
          date: histDate,
          averagePrice: histPrice,
          volume: 1200 + Math.round(noise * 80),
        });
      }
    }
  }

  await prisma.marketPrice.createMany({ data: marketPriceRecords });
  await prisma.priceHistory.createMany({ data: priceHistoryRecords });

  console.log('✅ Bulk Seeded Market Prices & 90-Day History Records into MySQL');

  // 6. Create Active Produce Listings for Farmers
  const tomatoCrop = crops.find(c => c.name === 'Tomato')!;
  const chilliCrop = crops.find(c => c.name === 'Red Chilli')!;
  const onionCrop = crops.find(c => c.name === 'Onion')!;

  const listing1 = await prisma.produceListing.create({
    data: {
      farmerId: farmerUser1.farmerProfile!.id,
      cropId: tomatoCrop.id,
      variety: 'Hybrid Red',
      quantity: 500,
      unit: 'kg',
      qualityGrade: 'Grade A',
      harvestDate: new Date(),
      sellingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      locationCity: 'Vijayawada',
      latitude: 16.5062,
      longitude: 80.6480,
      minPrice: 24,
      description: 'Freshly harvested firm Grade A hybrid tomatoes ready for immediate dispatch.',
      status: 'ACTIVE',
    },
  });

  const listing2 = await prisma.produceListing.create({
    data: {
      farmerId: farmerUser2.farmerProfile!.id,
      cropId: chilliCrop.id,
      variety: 'Teja 334',
      quantity: 1200,
      unit: 'kg',
      qualityGrade: 'Grade A',
      harvestDate: new Date(),
      sellingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      locationCity: 'Guntur',
      latitude: 16.3067,
      longitude: 80.4365,
      minPrice: 175,
      description: 'Sun-dried high capsaicin red chilli directly from Guntur farm.',
      status: 'ACTIVE',
    },
  });

  // 7. Create Buyer Requirements
  const req1 = await prisma.buyerRequirement.create({
    data: {
      buyerId: buyerUser1.buyerProfile!.id,
      cropId: tomatoCrop.id,
      variety: 'Hybrid Red',
      quantityNeeded: 1000,
      unit: 'kg',
      qualityGrade: 'Grade A',
      offeredPrice: 28.5,
      requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      locationCity: 'Vijayawada',
      latitude: 16.5193,
      longitude: 80.6305,
      status: 'OPEN',
    },
  });

  const req2 = await prisma.buyerRequirement.create({
    data: {
      buyerId: buyerUser3.buyerProfile!.id,
      cropId: chilliCrop.id,
      variety: 'Teja 334',
      quantityNeeded: 1500,
      unit: 'kg',
      qualityGrade: 'Grade A',
      offeredPrice: 185,
      requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      locationCity: 'Guntur',
      latitude: 16.3100,
      longitude: 80.4400,
      status: 'OPEN',
    },
  });

  const req3 = await prisma.buyerRequirement.create({
    data: {
      buyerId: buyerUser2.buyerProfile!.id,
      cropId: onionCrop.id,
      variety: 'Nashik Red',
      quantityNeeded: 800,
      unit: 'kg',
      qualityGrade: 'Grade B',
      offeredPrice: 31,
      requiredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      locationCity: 'Hyderabad',
      latitude: 17.3850,
      longitude: 78.4867,
      status: 'OPEN',
    },
  });

  console.log('✅ Created Listings & Buyer Requirements');

  // 8. Sample Offer, Transaction & Review
  const sampleOffer = await prisma.offer.create({
    data: {
      produceListingId: listing1.id,
      buyerRequirementId: req1.id,
      senderId: buyerUser1.id,
      receiverId: farmerUser1.id,
      pricePerUnit: 28,
      quantity: 500,
      transportPayer: 'BUYER',
      totalAmount: 14000,
      message: 'We will pick up 500 kg directly from your farm at ₹28/kg.',
      status: 'ACCEPTED',
    },
  });

  const sampleTx = await prisma.transaction.create({
    data: {
      offerId: sampleOffer.id,
      produceListingId: listing1.id,
      buyerRequirementId: req1.id,
      farmerId: farmerUser1.farmerProfile!.id,
      buyerId: buyerUser1.buyerProfile!.id,
      agreedPrice: 28,
      totalAmount: 14000,
      quantity: 500,
      status: 'COMPLETED',
      deliveryDate: new Date(),
    },
  });

  await prisma.review.create({
    data: {
      transactionId: sampleTx.id,
      reviewerId: farmerUser1.id,
      revieweeId: buyerUser1.id,
      rating: 5,
      comment: 'Prompt payment and clean pickup vehicle arrival. Excellent buyer!',
    },
  });

  await prisma.notification.create({
    data: {
      userId: farmerUser1.id,
      title: 'Welcome to AgriLink! 🌱',
      message: 'Discover high-net-revenue market opportunities and connect directly with verified buyers.',
      type: 'SYSTEM',
      isRead: false,
    },
  });

  console.log('🌱 AgriLink MongoDB Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
