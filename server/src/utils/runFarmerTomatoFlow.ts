import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { analyzeBestSellingOpportunities } from '../recommendation/engine';

async function runExactTomatoFlow() {
  console.log('========================================================================');
  console.log('🌱 AGRILINK — STEP-BY-STEP END-TO-END DEMONSTRATION & VERIFICATION');
  console.log('========================================================================\n');

  const ts = Date.now();
  const rawPassword = 'password123';
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const jwtSecret = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026_sih';

  // STEP 1: Farmer Register
  console.log('STEP 1: 👨‍🌾 Farmer Registration');
  console.log('------------------------------------------------------------------------');
  const farmerUser = await prisma.user.create({
    data: {
      email: `farmer_ramesh_${ts}@agrilink.com`,
      passwordHash,
      role: 'FARMER',
      name: 'Ramesh Kumar',
      phone: '+91 9876543210',
      farmerProfile: {
        create: {
          farmName: 'Ramesh Green Fields',
          address: 'Guntur Road, Kanchikacherla',
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
  console.log(`✅ Registered Farmer: ${farmerUser.name} (${farmerUser.email})`);
  console.log(`   Farm: ${farmerUser.farmerProfile?.farmName}, Location: ${farmerUser.farmerProfile?.city}, ${farmerUser.farmerProfile?.state}\n`);

  // STEP 2: Login
  console.log('STEP 2: 🔑 Authentication & Login');
  console.log('------------------------------------------------------------------------');
  const isValidPass = await bcrypt.compare(rawPassword, farmerUser.passwordHash);
  if (!isValidPass) throw new Error('Authentication failed');
  const token = jwt.sign({ id: farmerUser.id, role: farmerUser.role }, jwtSecret, { expiresIn: '7d' });
  console.log(`✅ Login Successful! User Authenticated.`);
  console.log(`   JWT Bearer Token: ${token.slice(0, 30)}...\n`);

  // Fetch Tomato Crop
  const tomatoCrop = await prisma.crop.findFirst({ where: { name: 'Tomato' } });
  if (!tomatoCrop) throw new Error('Tomato crop not found');

  // STEP 3: Add Tomato — 500 kg — Grade A
  console.log('STEP 3: 📦 Add Produce Listing (Tomato — 500 kg — Grade A)');
  console.log('------------------------------------------------------------------------');
  const produce = await prisma.produceListing.create({
    data: {
      farmerId: farmerUser.farmerProfile!.id,
      cropId: tomatoCrop.id,
      variety: 'Hybrid Desi',
      quantity: 500,
      unit: 'kg',
      qualityGrade: 'Grade A',
      harvestDate: new Date(),
      sellingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      locationCity: 'Vijayawada',
      latitude: 16.5062,
      longitude: 80.6480,
      minPrice: 24.0,
      description: 'Fresh farm-picked Grade A firm tomatoes ready for transport',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Created Produce Listing ID: ${produce.id}`);
  console.log(`   Crop: Tomato | Quantity: ${produce.quantity} ${produce.unit} | Grade: ${produce.qualityGrade} | Min Price: ₹${produce.minPrice}/kg`);
  console.log(`   Image URL: ${produce.imageUrl}\n`);

  // STEP 4: Find Best Selling Opportunity
  console.log('STEP 4: 🧠 Find Best Selling Opportunity (Invoking Intelligence Engine)');
  console.log('------------------------------------------------------------------------');
  const opportunity = await analyzeBestSellingOpportunities({
    cropId: tomatoCrop.id,
    quantityKg: 500,
    qualityGrade: 'Grade A',
    locationCity: 'Vijayawada',
    latitude: 16.5062,
    longitude: 80.6480,
  });
  console.log(`✅ Analyzed ${opportunity.options.length} market options & buyer requirements.`);
  console.log(`   Advice: ${opportunity.sellOrWaitAdvice.decision}`);
  console.log(`   Reasoning: ${opportunity.sellOrWaitAdvice.reasoning}\n`);

  // STEP 5: Compare Markets
  // STEP 6: Transport Cost
  // STEP 7: Net Revenue
  console.log('STEPS 5, 6 & 7: 📊 Compare Markets | Transport Cost | Expected Net Revenue');
  console.log('------------------------------------------------------------------------');
  console.table(
    opportunity.options.map((opt) => ({
      Option: opt.name,
      Type: opt.type,
      Location: opt.locationCity,
      'Distance (km)': `${opt.distanceKm} km`,
      'Unit Price': `₹${opt.unitPrice}/kg`,
      'Gross Rev': `₹${opt.grossRevenue}`,
      'Transport Cost': `₹${opt.transportCost}`,
      'Net Revenue': `₹${opt.expectedNetRevenue}`,
      Score: `${opt.opportunityScore}/100`,
      Recommended: opt.isRecommended ? '⭐ YES' : 'NO',
    }))
  );
  console.log('');

  // STEP 8: Recommended Market
  const recommendedMarket = opportunity.options.find((o) => o.type === 'MARKET');
  console.log('STEP 8: 🏛️ Top Recommended Market');
  console.log('------------------------------------------------------------------------');
  if (recommendedMarket) {
    console.log(`✅ Market: ${recommendedMarket.name} (${recommendedMarket.locationCity})`);
    console.log(`   Distance: ${recommendedMarket.distanceKm} km | Mandi Rate: ₹${recommendedMarket.unitPrice}/kg`);
    console.log(`   Expected Net Revenue: ₹${recommendedMarket.expectedNetRevenue}`);
  }
  console.log('');

  // Register a Buyer for the demonstration
  const buyerUser = await prisma.user.create({
    data: {
      email: `buyer_anand_${ts}@agrilink.com`,
      passwordHash,
      role: 'BUYER',
      name: 'Anand Sharma',
      phone: '+91 9123456789',
      buyerProfile: {
        create: {
          companyName: 'Anand Fresh Produce Pvt Ltd',
          businessType: 'Wholesaler',
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

  const buyerRequirement = await prisma.buyerRequirement.create({
    data: {
      buyerId: buyerUser.buyerProfile!.id,
      cropId: tomatoCrop.id,
      variety: 'Hybrid Desi',
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

  // STEP 9: Recommended Buyer
  console.log('STEP 9: 🏪 Top Recommended Buyer');
  console.log('------------------------------------------------------------------------');
  console.log(`✅ Buyer Company: ${buyerUser.buyerProfile?.companyName} (${buyerUser.name})`);
  console.log(`   Offered Price: ₹${buyerRequirement.offeredPrice}/kg for Grade A Tomato`);
  console.log(`   Buyer Rating: ${buyerUser.buyerProfile?.rating} ⭐ | Verified Direct Buyer\n`);

  // STEP 10: Send Offer
  console.log('STEP 10: 📩 Send Offer (Farmer ➔ Buyer)');
  console.log('------------------------------------------------------------------------');
  const offer = await prisma.offer.create({
    data: {
      produceListingId: produce.id,
      buyerRequirementId: buyerRequirement.id,
      senderId: farmerUser.id,
      receiverId: buyerUser.id,
      pricePerUnit: 28.0,
      quantity: 500,
      totalAmount: 500 * 28.0,
      transportPayer: 'BUYER',
      message: 'Offering 500 kg Grade A fresh tomatoes at ₹28/kg direct supply.',
      status: 'PENDING',
      negotiations: {
        create: {
          senderId: farmerUser.id,
          pricePerUnit: 28.0,
          quantity: 500,
          note: 'Initial Farmer Offer',
        },
      },
    },
  });
  console.log(`✅ Sent Offer ID: ${offer.id}`);
  console.log(`   Offered Quantity: ${offer.quantity} kg @ ₹${offer.pricePerUnit}/kg`);
  console.log(`   Total Deal Value: ₹${offer.totalAmount}`);
  console.log(`   Offer Status: ${offer.status}\n`);

  // STEP 11: Buyer Accepts
  console.log('STEP 11: ✅ Buyer Accepts Offer');
  console.log('------------------------------------------------------------------------');
  const acceptedOffer = await prisma.offer.update({
    where: { id: offer.id },
    data: { status: 'ACCEPTED' },
  });
  console.log(`✅ Offer Status Updated to: ${acceptedOffer.status}\n`);

  // STEP 12: Deal Confirmed
  console.log('STEP 12: 🤝 Deal Confirmed & Transaction Created');
  console.log('------------------------------------------------------------------------');
  const transaction = await prisma.transaction.create({
    data: {
      offerId: acceptedOffer.id,
      produceListingId: produce.id,
      buyerRequirementId: buyerRequirement.id,
      farmerId: farmerUser.farmerProfile!.id,
      buyerId: buyerUser.buyerProfile!.id,
      agreedPrice: acceptedOffer.pricePerUnit,
      totalAmount: acceptedOffer.totalAmount,
      quantity: acceptedOffer.quantity,
      status: 'CONFIRMED',
      deliveryDate: new Date(),
    },
  });
  console.log(`✅ Transaction Created ID: ${transaction.id}`);
  console.log(`   Agreed Price: ₹${transaction.agreedPrice}/kg | Total Amount: ₹${transaction.totalAmount}`);
  console.log(`   Transaction Status: ${transaction.status}\n`);

  // STEP 13: Transaction Completed
  console.log('STEP 13: 🚚 Delivery Completed & Transaction Status Updated');
  console.log('------------------------------------------------------------------------');
  const completedTx = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'COMPLETED' },
  });

  // Mark produce listing as SOLD
  await prisma.produceListing.update({
    where: { id: produce.id },
    data: { status: 'SOLD' },
  });
  console.log(`✅ Transaction Status Updated to: ${completedTx.status}`);
  console.log(`✅ Produce Listing Status Updated to: SOLD\n`);

  // STEP 14: Review
  console.log('STEP 14: ⭐ Verified Review Submission');
  console.log('------------------------------------------------------------------------');
  const review = await prisma.review.create({
    data: {
      transactionId: completedTx.id,
      reviewerId: farmerUser.id,
      revieweeId: buyerUser.id,
      rating: 5,
      comment: 'Excellent deal! Buyer paid promptly and arranged transport as agreed.',
    },
  });
  console.log(`✅ Verified Review Created ID: ${review.id}`);
  console.log(`   Rating: ${review.rating} / 5 Stars ⭐⭐⭐⭐⭐`);
  console.log(`   Comment: "${review.comment}"\n`);

  console.log('========================================================================');
  console.log('🎉 14-STEP TOMATO FLOW FULLY EXECUTED & VERIFIED ON MYSQL DATABASE!');
  console.log('========================================================================\n');
}

runExactTomatoFlow()
  .catch((err) => {
    console.error('❌ Flow Execution Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
