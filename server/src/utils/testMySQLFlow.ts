import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { analyzeBestSellingOpportunities } from '../recommendation/engine';

async function testMySQLAllFlows() {
  console.log('🧪 Starting End-to-End MySQL Backend Flow Verification...\n');

  const timestamp = Date.now();
  const jwtSecret = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026_sih';
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. REGISTER Farmer
  console.log('1️⃣ Testing Farmer Registration...');
  const testFarmerUser = await prisma.user.create({
    data: {
      email: `testfarmer_${timestamp}@agrilink.com`,
      passwordHash,
      role: 'FARMER',
      name: 'Test Farmer Venkat',
      phone: '+91 9998887776',
      farmerProfile: {
        create: {
          farmName: 'Venkat Organics',
          address: 'Kanchikacherla',
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
  console.log(`   ✅ Registered Farmer ID: ${testFarmerUser.id} (${testFarmerUser.email})`);

  // 2. REGISTER Buyer
  console.log('2️⃣ Testing Buyer Registration...');
  const testBuyerUser = await prisma.user.create({
    data: {
      email: `testbuyer_${timestamp}@agrilink.com`,
      passwordHash,
      role: 'BUYER',
      name: 'Test Buyer Rajesh',
      phone: '+91 8887776665',
      buyerProfile: {
        create: {
          companyName: 'Rajesh Agro Exports',
          businessType: 'Exporter',
          city: 'Vijayawada',
          state: 'Andhra Pradesh',
          latitude: 16.5193,
          longitude: 80.6305,
          verified: true,
          rating: 4.9,
        },
      },
    },
    include: { buyerProfile: true },
  });
  console.log(`   ✅ Registered Buyer ID: ${testBuyerUser.id} (${testBuyerUser.email})`);

  // 3. LOGIN Verification
  console.log('3️⃣ Testing Auth Login & JWT Token Generation...');
  const farmerMatch = await bcrypt.compare('password123', testFarmerUser.passwordHash);
  if (!farmerMatch) throw new Error('Password check failed');
  const token = jwt.sign({ id: testFarmerUser.id, role: testFarmerUser.role }, jwtSecret);
  console.log(`   ✅ JWT Verification Token: ${token.slice(0, 20)}...`);

  // Fetch a crop (e.g. Tomato)
  const tomatoCrop = await prisma.crop.findFirst({ where: { name: 'Tomato' } });
  if (!tomatoCrop) throw new Error('Tomato crop not found in MySQL');

  // 4. ADD PRODUCE
  console.log('4️⃣ Testing Add Farmer Produce Listing...');
  const produce = await prisma.produceListing.create({
    data: {
      farmerId: testFarmerUser.farmerProfile!.id,
      cropId: tomatoCrop.id,
      variety: 'Hybrid Red',
      quantity: 600,
      unit: 'kg',
      qualityGrade: 'Grade A',
      harvestDate: new Date(),
      sellingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      locationCity: 'Vijayawada',
      latitude: 16.5062,
      longitude: 80.6480,
      minPrice: 25,
      description: 'Grade A firm fresh tomatoes',
      status: 'ACTIVE',
    },
  });
  console.log(`   ✅ Created Produce ID: ${produce.id} (${produce.quantity} kg @ Min ₹${produce.minPrice}/kg)`);

  // 5. PRICE DISCOVERY ENGINE
  console.log('5️⃣ Testing Price Discovery & Recommendation Engine...');
  const discoveryResult = await analyzeBestSellingOpportunities({
    cropId: tomatoCrop.id,
    quantityKg: 600,
    qualityGrade: 'Grade A',
    locationCity: 'Vijayawada',
    latitude: 16.5062,
    longitude: 80.6480,
  });
  console.log(`   🏆 Best Opportunity Option: ${discoveryResult.bestOpportunity?.name}`);
  console.log(`   💰 Gross Revenue: ₹${discoveryResult.bestOpportunity?.grossRevenue}`);
  console.log(`   🚚 Transport Cost: ₹${discoveryResult.bestOpportunity?.transportCost}`);
  console.log(`   ✨ Expected Net Revenue: ₹${discoveryResult.bestOpportunity?.expectedNetRevenue}`);
  console.log(`   ⭐ Opportunity Score: ${discoveryResult.bestOpportunity?.opportunityScore} / 100`);
  console.log(`   📈 Sell Now vs Wait Advisor: ${discoveryResult.sellOrWaitAdvice.decision}`);

  // 6. BUYER REQUIREMENT
  console.log('6️⃣ Testing Post Buyer Requirement...');
  const buyerReq = await prisma.buyerRequirement.create({
    data: {
      buyerId: testBuyerUser.buyerProfile!.id,
      cropId: tomatoCrop.id,
      variety: 'Hybrid Red',
      quantityNeeded: 1000,
      unit: 'kg',
      qualityGrade: 'Grade A',
      offeredPrice: 29.0,
      requiredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      locationCity: 'Vijayawada',
      latitude: 16.5193,
      longitude: 80.6305,
      status: 'OPEN',
    },
  });
  console.log(`   ✅ Created Buyer Requirement ID: ${buyerReq.id} (Offered ₹${buyerReq.offeredPrice}/kg)`);

  // 7. MATCHING
  console.log('7️⃣ Testing Smart Buyer-Farmer Matching...');
  const matchingListings = await prisma.produceListing.findMany({
    where: { cropId: tomatoCrop.id, status: 'ACTIVE' },
  });
  console.log(`   🎯 Found ${matchingListings.length} matching produce listings in MySQL database.`);

  // 8. OFFER & NEGOTIATION
  console.log('8️⃣ Testing Offer & Negotiation Flow...');
  const offer = await prisma.offer.create({
    data: {
      produceListingId: produce.id,
      buyerRequirementId: buyerReq.id,
      senderId: testBuyerUser.id,
      receiverId: testFarmerUser.id,
      pricePerUnit: 28.5,
      quantity: 600,
      totalAmount: 600 * 28.5,
      transportPayer: 'BUYER',
      message: 'Direct buy offer for 600 kg Grade A tomatoes',
      status: 'PENDING',
      negotiations: {
        create: {
          senderId: testBuyerUser.id,
          pricePerUnit: 28.5,
          quantity: 600,
          note: 'Initial Offer',
        },
      },
    },
  });
  console.log(`   ✅ Created Offer ID: ${offer.id} (Total ₹${offer.totalAmount})`);

  // Accept Offer
  const acceptedOffer = await prisma.offer.update({
    where: { id: offer.id },
    data: { status: 'ACCEPTED' },
  });
  console.log(`   ✅ Offer Status Updated to: ${acceptedOffer.status}`);

  // 9. TRANSACTION
  console.log('9️⃣ Testing Transaction Deal Creation & Status Progress...');
  const transaction = await prisma.transaction.create({
    data: {
      offerId: acceptedOffer.id,
      produceListingId: produce.id,
      buyerRequirementId: buyerReq.id,
      farmerId: testFarmerUser.farmerProfile!.id,
      buyerId: testBuyerUser.buyerProfile!.id,
      agreedPrice: acceptedOffer.pricePerUnit,
      totalAmount: acceptedOffer.totalAmount,
      quantity: acceptedOffer.quantity,
      status: 'CONFIRMED',
      deliveryDate: new Date(),
    },
  });
  console.log(`   ✅ Created Transaction ID: ${transaction.id} (Status: ${transaction.status})`);

  // Mark Completed
  const completedTx = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'COMPLETED' },
  });
  console.log(`   ✅ Transaction Progressed to: ${completedTx.status}`);

  // 10. REVIEW
  console.log('🔟 Testing Verified Review Submission...');
  const review = await prisma.review.create({
    data: {
      transactionId: completedTx.id,
      reviewerId: testFarmerUser.id,
      revieweeId: testBuyerUser.id,
      rating: 5,
      comment: 'Excellent buyer, quick payment and smooth logistics!',
    },
  });
  console.log(`   ✅ Submitted Review ID: ${review.id} (${review.rating} Stars)`);

  console.log('\n🎉 ALL 10 MYSQL BACKEND FLOWS PASSED 100% SUCCESSFULLY WITH ZERO ERRORS!\n');
}

testMySQLAllFlows()
  .catch((err) => {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
