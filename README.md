# 🌱 AgriLink — Intelligent Market Linkage & Price Discovery Platform

**SIH 2026 Problem Statement 26132** — Strengthening market linkages and price discovery for farmers.

---

## 🍃 MongoDB & MongoDB Atlas Setup Guide

AgriLink uses **MongoDB** as its primary database powered by **Prisma ORM**. No local database installation (like MySQL) is required on new laptops if you use **MongoDB Atlas** (Free Cloud Database).

---

## 🛠️ Prerequisites for New Laptop Setup

1. **Node.js (v18 or v20 LTS)**: [https://nodejs.org/](https://nodejs.org/)
2. **Git** *(Optional if using ZIP download)*: [https://git-scm.com/](https://git-scm.com/)
3. **MongoDB Connection URL**: Either a free **MongoDB Atlas** cloud URL or local **MongoDB Community Server**.

---

## ☁️ Setting Up MongoDB Atlas (Free Cloud Database)

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** and sign up for a free account.
2. Create a **Free Shared Cluster (M0)**.
3. Under **Database Access**, create a database user (e.g., `agrilink_user`) and password.
4. Under **Network Access**, click **Add IP Address** $\rightarrow$ Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** $\rightarrow$ Choose **Drivers** $\rightarrow$ Copy the Connection String:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/agrilink?retryWrites=true&w=majority
   ```

---

## 🚀 Complete Step-by-Step Setup Guide

### Step 1: Get the Code
Clone or download the project folder:
```bash
git clone https://github.com/Bhaskarnaidu29/agrilink.git
cd agrilink
```

---

### Step 2: Backend Setup (`server`)

1. Navigate into the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file inside `server/` directory:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set your MongoDB Atlas connection string:*
   ```env
   PORT=5000
   DATABASE_URL="mongodb+srv://agrilink_user:YOUR_PASSWORD@cluster0.xxx.mongodb.net/agrilink?retryWrites=true&w=majority"
   JWT_SECRET="agrilink_super_secret_jwt_key_2026_sih"
   NODE_ENV="development"
   ```

4. Generate Prisma Client for MongoDB:
   ```bash
   npx prisma generate
   ```

5. Push Collections & Indexes to MongoDB:
   ```bash
   npx prisma db push
   ```

6. Seed Database with APMC Mandis, Crops & Historical Prices:
   ```bash
   npx prisma db seed
   ```

7. Start Backend Server:
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:5000`.*

---

### Step 3: Frontend Setup (`client`)

1. Open a new Terminal window and navigate into the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Frontend Development Server:
   ```bash
   npm run dev
   ```
   *The client will start at `http://localhost:5173` (or `http://localhost:3000`).*

---

### 🧪 Step 4: Run Verification Tests

To verify that MongoDB database, Prisma ORM, Auth JWT, Price Engine, and All 10 User Flows work properly:

```bash
cd server
npx ts-node src/utils/testMongoFlow.ts
```

To run the 14-step Tomato Produce Demonstration:
```bash
npx ts-node src/utils/runFarmerTomatoFlow.ts
```

---

## 📁 Repository Structure

```text
agrilink/
├── client/                # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/    # Navigation, Modals, Badges
│   │   ├── pages/         # Dashboards, Price Discovery, Offers
│   │   └── types/         # TypeScript interfaces
│   └── package.json
├── server/                # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma  # MongoDB Prisma Database Schema
│   │   └── seed.ts        # APMC Data Seed Script
│   ├── src/
│   │   ├── controllers/   # Auth, Farmer, Buyer, Transaction logic
│   │   ├── middleware/    # Auth JWT fail-safe & Rate Limiter
│   │   ├── recommendation/# Price Discovery Intelligence Engine
│   │   └── routes/        # REST API endpoints
│   └── package.json
└── README.md
```
