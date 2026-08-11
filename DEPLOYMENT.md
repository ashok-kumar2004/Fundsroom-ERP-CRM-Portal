# Deployment Guide: Free-Tier Hosting (Neon/Supabase + Render + Vercel)

This document provides complete, step-by-step instructions to deploy the **Fundsroom Mini ERP & CRM Operations Portal** onto free-tier hosting services:
- **Database**: Neon or Supabase (PostgreSQL)
- **Backend Service**: Render (Node.js Web Service)
- **Frontend App**: Vercel (Static Web App)

---

## 1. Environment Variables Configuration

### Backend Environment Variables (`backend/.env.example`)
```env
# ----------------------------------------------------
# DATABASE CONNECTION
# ----------------------------------------------------
# For Supabase / Neon Connection Pooling (Render):
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"

# ----------------------------------------------------
# SECURITY & CORS
# ----------------------------------------------------
JWT_SECRET="supersecretjwtkey_replace_in_production"
PORT=5000

# Production Deployed Frontend Origin (Only allow this URL for CORS)
FRONTEND_URL="https://fundsroom-erp.vercel.app"
```

### Frontend Production Environment Variables (`frontend/.env.production.example`)
```env
# Production Deployed Backend API URL on Render
VITE_API_URL="https://fundsroom-backend.onrender.com"
```

---

## 2. Step-by-Step Deployment Instructions

### Step A: Setup Live PostgreSQL Database (Neon or Supabase)

#### Option 1: Supabase PostgreSQL (Recommended)
1. Sign up at [supabase.com](https://supabase.com) and click **New Project**.
2. Name your project (e.g. `fundsroom-erp`), set a strong database password, and choose a region.
3. Once created, navigate to **Project Settings** → **Database**.
4. Copy the **URI Connection String** under *Connection string*:
   - **Direct Connection** (for migrations):
     `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - **Connection Pooler** (for Render deployment):
     `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true`

#### Option 2: Neon PostgreSQL
1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Copy the **PostgreSQL Connection String** from the dashboard:
   `postgres://[USER]:[PASSWORD]@[HOST]/[DB_NAME]?sslmode=require`

---

### Step B: Deploy Backend Service to Render

1. Sign up at [render.com](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub Repository containing the project code.
3. Configure the Web Service settings:
   - **Name**: `fundsroom-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your database region (e.g. Singapore or Frankfurt)
   - **Branch**: `main`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && npm start`
   - **Health Check Path**: `/health`

4. Add Environment Variables under **Environment** tab:
   - `DATABASE_URL` = Your Supabase/Neon connection string
   - `JWT_SECRET` = A strong secret string (e.g. `super_secret_jwt_fundsroom_2026`)
   - `FRONTEND_URL` = Your Vercel frontend URL (e.g. `https://fundsroom-erp.vercel.app`)
   - `NODE_ENV` = `production`

5. Click **Create Web Service**. Wait for the build to finish.

6. **Seed Initial Demo Data (Run Once)**:
   In Render dashboard, open the **Shell** tab for your service and run:
   ```bash
   npx tsx prisma/seed.ts
   ```
   *This seeds the 4 role accounts (`admin@test.com`, `sales@test.com`, etc.), products, and initial customers.*

---

### Step C: Deploy Frontend Web App to Vercel

1. Sign up at [vercel.com](https://vercel.com) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. Configure the Framework settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your live Render backend URL (e.g. `https://fundsroom-backend.onrender.com`)
5. Click **Deploy**. Vercel will build and assign your live production URL (e.g., `https://fundsroom-erp.vercel.app`).

---

## 3. Health Check Endpoint

Render will automatically ping the built-in health check endpoint:
- **Endpoint**: `GET /health`
- **Render Health Check Path**: `/health`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Server is healthy and DB is connected",
    "timestamp": "2026-08-11T19:58:37.000Z"
  }
  ```

---

## 4. Live Post-Deployment Manual Sanity Testing Checklist

After deploying both Frontend (Vercel) and Backend (Render), run this manual test checklist on your live Vercel URL:

- [ ] **1. Health Check Ping**: Open `https://your-backend.onrender.com/health` in browser and confirm `status: true` response.
- [ ] **2. Role Login Sanity Check**:
  - Test login with `admin@test.com` (Password: `Test@123`). Confirm dashboard loads.
  - Log out and test login with `sales@test.com` (Password: `Test@123`).
  - Log out and test login with `warehouse@test.com` (Password: `Test@123`).
  - Log out and test login with `accounts@test.com` (Password: `Test@123`).
- [ ] **3. Customer CRM Module Test**:
  - Log in as Sales (`sales@test.com`).
  - Go to **Customers Directory** → Click **+ Add Customer**.
  - Add a customer named `Test Live Partner` (Mobile: `9876543210`). Save and confirm it appears in table.
  - Search for `Test Live Partner` in the search bar and verify yellow search text highlighting.
- [ ] **4. Product Inventory Catalog Test**:
  - Log in as Admin or Warehouse (`warehouse@test.com`).
  - Go to **Inventory Catalog** → Click **+ Add Product**.
  - Add a product named `Silk Yarn Roll` (SKU: `SILK-YARN-99`, Price: `500`, Stock: `50`).
  - Confirm it appears in the catalog.
- [ ] **5. Sales Delivery Challan & Automatic Stock Deduction Test**:
  - Log in as Sales (`sales@test.com`).
  - Go to **Create Sales Challan** (`/challans/new`).
  - Select customer `Test Live Partner`.
  - Add item `Silk Yarn Roll` with quantity `10`.
  - Click **Generate & Confirm Challan**.
  - Verify auto-generated Challan Number (`CH-2026-xxxx`) and `CONFIRMED` status badge.
  - Go to **Inventory Catalog** and verify `Silk Yarn Roll` stock count was automatically reduced from `50` to `40 pcs`.
  - Open `Silk Yarn Roll` detail page and verify the **Stock Movement OUT** audit entry.
- [ ] **6. Invoice PDF Export Test**:
  - Open the confirmed Challan detail page.
  - Click **🖨️ Export / Print PDF Invoice**.
  - Verify browser print preview displays the formatted A4 Tax Invoice document.
