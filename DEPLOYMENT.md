# Deployment Guide: Free-Tier Hosting (Supabase PostgreSQL + Render + Vercel)

This document provides complete, step-by-step instructions to deploy the **Fundsroom Mini ERP & CRM Operations Portal** onto free-tier hosting services:
- **Database**: Supabase PostgreSQL (`aws-0-ap-southeast-1.pooler.supabase.com`)
- **Backend Service**: Render Node.js Web Service (`https://fundsroom-erp-crm-portal-p9ja.onrender.com`)
- **Frontend App**: Vercel Static Web App (`https://fundsroom-erp-crm-portal-delta.vercel.app`)

---

## 1. Environment Variables Configuration

### Backend Environment Variables (`backend/.env.example`)
```env
# Database Connection (Supabase IPv4 Pooler URL):
DATABASE_URL="postgresql://postgres.lvklxdfzjtxihecrkogs:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Security & CORS:
JWT_SECRET="supersecretjwtkey"
PORT=5000

# Deployed Frontend Origin (Only allow this URL for CORS)
FRONTEND_URL="https://fundsroom-erp-crm-portal-delta.vercel.app"
```

### Frontend Production Environment Variables (`frontend/.env.production.example`)
```env
# Deployed Backend API URL on Render
VITE_API_URL="https://fundsroom-erp-crm-portal-p9ja.onrender.com"
```

---

## 2. Step-by-Step Deployment Instructions

### Step A: Setup Supabase PostgreSQL Database
1. Sign up at [supabase.com](https://supabase.com) and create a project (e.g. `Fundsroom-ERP-CRM-Portal`).
2. Go to **Project Settings** → **Database** → **Connection String** → **Pooler**.
3. Copy the IPv4 Pooler connection string:
   `postgresql://postgres.lvklxdfzjtxihecrkogs:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

### Step B: Deploy Backend Web Service to Render
1. Sign up at [render.com](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal`.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && npm start`
   - **Health Check Path**: `/health`
4. Add Environment Variables:
   - `DATABASE_URL` = `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
   - `JWT_SECRET` = `supersecretjwtkey`
   - `FRONTEND_URL` = `https://fundsroom-erp-crm-portal-delta.vercel.app`
   - `PORT` = `5000`
5. Click **Create Web Service**.

### Step C: Deploy Frontend Web App to Vercel
1. Sign up at [vercel.com](https://vercel.com) and click **Add New** → **Project**.
2. Import repository `ashok-kumar2004/Fundsroom-ERP-CRM-Portal`.
3. Configure settings:
   - **Framework**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://fundsroom-erp-crm-portal-p9ja.onrender.com`
5. Click **Deploy**.

---

## 3. Health Check Endpoint
- Path: `GET /health`
- Live URL: `https://fundsroom-erp-crm-portal-p9ja.onrender.com/health`
- Response: `{"success": true, "message": "Server is healthy and DB is connected"}`
