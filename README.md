# Fundsroom Mini ERP & CRM Operations Portal

A full-stack enterprise Operations Portal built for wholesale/distribution companies to manage Customers (CRM), Products & Inventory, Sales Delivery Challans, and Printable Tax Invoices.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/Node.js-v20+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.7+-blue.svg)
![React](https://img.shields.io/badge/React-v18+-indigo.svg)
![Prisma](https://img.shields.io/badge/Prisma-v7.9-teal.svg)

---

## 📜 Official Case Study Submission Links & Details

| Requirement | Value / Live Link |
| :--- | :--- |
| **GitHub Repository** | [https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal](https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal) |
| **Live Frontend App** | [https://fundsroom-erp.vercel.app](https://fundsroom-erp.vercel.app) *(Vercel)* |
| **Live Backend API** | [https://fundsroom-erp-crm-portal-p9ja.onrender.com](https://fundsroom-erp-crm-portal-p9ja.onrender.com) *(Render)* |
| **Health Check API** | [https://fundsroom-erp-crm-portal-p9ja.onrender.com/health](https://fundsroom-erp-crm-portal-p9ja.onrender.com/health) |
| **Postman Collection** | [`postman_collection.json`](file:///c:/Users/ashok/OneDrive/Desktop/ashok/fundsoom/postman_collection.json) in repository root |

---

## 🔑 Test Login Credentials (All 4 Roles)

Password for all test accounts: **`Test@123`**

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@test.com` | `Test@123` | Unrestricted Access across all system modules |
| 💼 **Sales** | `sales@test.com` | `Test@123` | Customer CRM, Inventory view, Create Challans |
| 📦 **Warehouse** | `warehouse@test.com` | `Test@123` | Inventory CRUD, Stock IN/OUT audit logging |
| 🧾 **Accounts** | `accounts@test.com` | `Test@123` | Customer CRM, Read-only Challans, PDF Tax Invoices |

*(Note: The login screen includes 1-click preset demo buttons to instantly log in as any role.)*

---

## 📌 Architecture & Tech Stack

```text
       [ React 18 SPA (Vite) + TailwindCSS + Lucide Icons ]
                                │
                                ▼  (HTTP / REST APIs with JWT Bearer Auth)
                 [ Express 5 REST API (Node.js + TS) ]
                                │
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
  [ Zod Request Validation ]           [ Express Global Error Handler ]
             │                                     │
             └──────────────────┬──────────────────┘
                                ▼
                   [ Prisma ORM (v7.9) ]
                                │
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
  [ Supabase PostgreSQL ]                   [ Local SQLite ]
   (Cloud Production DB)                    (Offline Dev DB)
```

### Stack List
- **Backend**: Node.js, Express.js (v5), TypeScript, Prisma ORM (v7.9), Zod validation, JWT authentication (`jsonwebtoken`), Bcrypt password hashing (`bcryptjs`).
- **Database**: Supabase / Neon PostgreSQL (Production), SQLite (Local Offline Development).
- **Frontend**: React 18 (Vite 8), TypeScript, TailwindCSS (Executive Light Theme), Lucide SVG icons, Axios HTTP client, React Router DOM v6.
- **Print Engine**: Pure CSS `@media print` directives (`window.print()`) for 1-click A4 Tax Invoice PDF generation.

---

## 📋 Case Study Requirements Compliance Matrix

| Module | Requirement | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Authentication & Roles** | Role-based login (`Admin`, `Sales`, `Warehouse`, `Accounts`) | ✅ **Implemented** | JWT Auth with role payload, Bcrypt password hashing, and role middleware (`auth.ts`). |
| | Input validation & error handling | ✅ **Implemented** | Zod schema validation (`loginSchema`) with real-time field error indicators on UI. |
| **Customer CRM** | Customer Profile Fields (Name, Mobile, Email, Business Name, GST, Address, Status, Follow-up date, Notes) | ✅ **Implemented** | Managed via Prisma `Customer` model and Zod validation schemas. |
| | Features (Add, Edit, Search, Detail View, Follow-up Notes timeline) | ✅ **Implemented** | REST APIs (`/customers`), search keyword highlighting engine, and follow-up call notes timeline. |
| **Products & Inventory** | Product Fields (Name, SKU, Category, Unit Price, Current Stock, Min Stock Alert, Location) | ✅ **Implemented** | Managed via Prisma `Product` model. |
| | Features (Add, Edit, Low Stock Alerting, Stock Movement IN/OUT audit log) | ✅ **Implemented** | Atomic transactions for stock adjustments and `StockMovement` audit logs. |
| **Sales Challans** | Delivery Notes Creation (Customer selection, multi-item line items, auto challan number `CH-2026-xxx`) | ✅ **Implemented** | `POST /challans` API with pricing snapshotting and automatic number generation. |
| | Draft vs Confirmed Status & Automatic Stock Deduction | ✅ **Implemented** | `POST /challans/:id/confirm` atomically decrements inventory stock & prevents negative stock. |
| | Cancellation & Stock Reversal | ✅ **Implemented** | `POST /challans/:id/cancel` automatically reverses stock back to inventory if order was confirmed. |

---

## ⚡ How to Run Locally

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9 or v10+)

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal.git
   cd Fundsroom-ERP-CRM-Portal
   ```

2. **Setup & Run Backend**:
   ```bash
   cd backend
   npm install

   # Push Schema to Local SQLite & Run Seed Script
   npx prisma db push
   npx tsx prisma/seed.ts

   # Start Development Server
   npm run dev
   ```
   *Backend will run on `http://localhost:5000`.*

3. **Setup & Run Frontend**:
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`.*

---

## 🌐 Environment Variables Reference

### Backend (`backend/.env.example`)
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
JWT_SECRET="supersecretjwtkey"
PORT=5000
FRONTEND_URL="https://fundsroom-erp.vercel.app"
```

### Frontend (`frontend/.env.production.example`)
```env
VITE_API_URL="https://fundsroom-erp-crm-portal-p9ja.onrender.com"
```

---

## 🚀 Deployment Manual (Supabase + Render + Vercel)

### Step A: Database Setup (Supabase / Neon)
1. Get the connection string from Supabase (Database settings -> Connection Pooler).
2. Set `DATABASE_URL` in Render.

### Step B: Backend Web Service (Render)
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma db push && npm start`
- **Health Check Path**: `/health`
- **Environment Variables**: Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`.

### Step C: Frontend Web App (Vercel)
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: Set `VITE_API_URL` = `https://fundsroom-erp-crm-portal-p9ja.onrender.com`.

---

## 📝 Known Limitations & Development Assumptions

1. **Unit Price Snapshotting**: Product unit prices and names are snapshotted onto line items at the time of challan creation so historical invoices remain unaffected by future product price edits.
2. **Atomic Stock Deduction**: Order confirmation atomically decrements inventory stock via database transactions. Order cancellation automatically reverses previously deducted stock back into inventory.
3. **Print Engine**: Invoice PDF export is handled via pure A4 `@media print` directives (`window.print()`) which can be saved as PDF in 1 click.
4. **Skipped Bonus Items**: Physical AWS S3 image uploads were skipped to avoid requiring paid AWS S3 bucket credentials (products use Lucide category badges instead).
