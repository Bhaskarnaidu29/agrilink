# 🌱 AgriLink — Intelligent Market Linkage & Price Discovery Platform

**SIH 2026 Problem Statement 26132** — Strengthening market linkages and price discovery for farmers.

---

## 🛠️ Prerequisites for New Laptop Setup

Before setting up AgriLink on a new laptop, ensure you have installed:

1. **Git**: [https://git-scm.com/](https://git-scm.com/)
2. **Node.js (v18 or v20 LTS)**: [https://nodejs.org/](https://nodejs.org/)
3. **MySQL Server (v8.0 or v8.4)**: [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/) *(or MySQL running via Docker/XAMPP)*

---

## 🚀 Complete Step-by-Step Setup Guide

### Step 1: Clone Repository from GitHub
Open Terminal / PowerShell on your new laptop and clone the project:

```bash
git clone https://github.com/Bhaskarnaidu29/agrilink.git
cd agrilink
```

---

### Step 2: Database Setup (MySQL)

1. Make sure your local **MySQL Server** is running on port `3306`.
2. Open MySQL Workbench or terminal and create the database:
   ```sql
   CREATE DATABASE agrilink;
   ```

---

### Step 3: Backend Setup (Server)

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
   *Edit `.env` and set your MySQL username and password:*
   ```env
   PORT=5000
   DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/agrilink"
   JWT_SECRET="agrilink_super_secret_jwt_key_2026_sih"
   NODE_ENV="development"
   ```

4. Push Prisma Schema to MySQL Database:
   ```bash
   npx prisma db push
   ```

5. Seed Database with APMC Mandis, Crops & Historical Prices:
   ```bash
   npx prisma db seed
   ```

6. Start Backend Server:
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:5000`.*

---

### Step 4: Frontend Setup (Client)

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

### 🧪 Step 5: Run Verification Test Suite

To verify that MySQL database, Prisma ORM, Auth JWT, Price Engine, and All 10 User Flows work properly:

```bash
cd server
npx ts-node src/utils/testMySQLFlow.ts
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
│   │   ├── schema.prisma  # MySQL Database Schema
│   │   └── seed.ts        # APMC Data Seed Script
│   ├── src/
│   │   ├── controllers/   # Auth, Farmer, Buyer, Transaction logic
│   │   ├── middleware/    # Auth JWT fail-safe & Rate Limiter
│   │   ├── recommendation/# Price Discovery Intelligence Engine
│   │   └── routes/        # REST API endpoints
│   └── package.json
└── README.md
```
