# 🌱 AgriLink — B2B Agricultural Marketplace & Price Discovery Platform

**AgriLink** connects farmers directly with nearby buyers, wholesalers, retailers, and local APMC markets. It empowers farmers to compare offered prices, calculate estimated transport logistics costs, and select the buyers that maximize their net revenue in hand.

---

## 🏗️ Architecture Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (Deployed on Vercel)
- **Backend**: Node.js + Express + TypeScript (Deployed on Render)
- **Database**: MongoDB Atlas (Cloud Cluster)
- **ORM**: Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with role-based authorization (`FARMER`, `BUYER`, `ADMIN`)

---

## 🚀 Live Production URLs

- **Frontend**: `https://agrilink-inky.vercel.app`
- **Backend API**: `https://agrilink-fo3a.onrender.com`
- **Health Check**: `https://agrilink-fo3a.onrender.com/health`

---

## 🔑 Key Features

### For Farmers:
- **Produce Listing Wizard**: 4-step crop listing (Crop, Quantity, Quality Grade, Min Price, Location).
- **Nearby Buyers & Net Revenue Math**: Ranks buyers by net profit after estimated transport costs (`Gross Revenue - Transport Cost`).
- **Distance Filters**: Filter buyers within 10 km, 25 km, 50 km, or 100 km.
- **Buyer Comparison Tool**: Compare up to 4 buyers side-by-side on Price, Distance, Transport, and Net Earning.
- **Direct Offers & Negotiation**: Counter-offer timeline and status tracking (`Pending`, `Countered`, `Accepted`, `Rejected`).

### For Buyers:
- **Sourcing Requirement Posting**: Post crop demand with required quantity, quality grade, offer price, and max sourcing radius.
- **Farmers Near You**: Browse active farmer produce listings nearby and send direct offers.
- **Direct Trade Contact**: Instant phone call & WhatsApp communication links for verified deals.
- **Ratings & Reviews**: Leave star ratings and feedback after completed transactions.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18 or v20 LTS
- **MongoDB Atlas Connection String**: Free Cloud MongoDB database

---

### 2. Backend Setup (`server`)

1. Navigate to server directory:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL="mongodb+srv://agrilink_user:YOUR_PASSWORD@cluster0.xxx.mongodb.net/agrilink?retryWrites=true&w=majority"
   JWT_SECRET="agrilink_super_secret_jwt_key_2026"
   NODE_ENV="development"
   ```

3. Generate Prisma client & push schema:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. Run backend development server:
   ```bash
   npm run dev
   ```

---

### 3. Frontend Setup (`client`)

1. Navigate to client directory:
   ```bash
   cd client
   npm install
   ```

2. Configure environment variables in `client/.env`:
   ```env
   VITE_API_BASE_URL="http://localhost:5000/api"
   ```

3. Run frontend development server:
   ```bash
   npm run dev
   ```

---

## 📁 Repository Structure

```text
agrilink/
├── client/                # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/    # Navigation, Modals, Badges, Charts
│   │   ├── context/       # Auth Context
│   │   ├── pages/         # Farmer, Buyer, Offers, Deals, Admin pages
│   │   └── types/         # TypeScript interfaces
│   └── package.json
├── server/                # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma  # MongoDB Prisma Schema
│   │   └── seed.ts        # APMC Mandi Data Seed Script
│   ├── src/
│   │   ├── controllers/   # Auth, Farmer, Buyer, Transaction logic
│   │   ├── middleware/    # Auth JWT & Role protection
│   │   └── routes/        # REST API endpoints
│   └── package.json
└── README.md
```
