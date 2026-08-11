# Fundsroom Mini ERP & CRM Operations Portal

A full-stack enterprise Operations Portal built for wholesale/distribution companies to manage Customers (CRM), Products & Inventory, Sales Delivery Challans, and Printable Tax Invoices.

![System License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/Node.js-v20+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.7+-blue.svg)
![React](https://img.shields.io/badge/React-v18+-indigo.svg)
![Prisma](https://img.shields.io/badge/Prisma-v7.9-teal.svg)

---

## 🔗 Live Production URLs & GitHub Links

- 🌐 **Live Frontend Application (Vercel)**: [https://fundsroom-erp-crm-portal-delta.vercel.app](https://fundsroom-erp-crm-portal-delta.vercel.app)
- ⚡ **Live Backend REST API (Render)**: [https://fundsroom-erp-crm-portal-p9ja.onrender.com](https://fundsroom-erp-crm-portal-p9ja.onrender.com)
- 🟢 **Backend Health Check Endpoint**: [https://fundsroom-erp-crm-portal-p9ja.onrender.com/health](https://fundsroom-erp-crm-portal-p9ja.onrender.com/health)
- 📂 **GitHub Repository**: [https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal](https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal)

---

## 🔑 Test Login Credentials (All 4 Roles)

Password for all test accounts is: **`Test@123`**

| Role | Email Address | Password | Access Level & Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@test.com` | `Test@123` | Full system access across CRM, Inventory, Challans, and Dashboard. |
| 💼 **Sales** | `sales@test.com` | `Test@123` | Can manage Customers, view Inventory, create & manage Sales Challans. |
| 📦 **Warehouse** | `warehouse@test.com` | `Test@123` | Can manage Product Inventory, execute Stock IN/OUT movements, and view Challans. |
| 🧾 **Accounts** | `accounts@test.com` | `Test@123` | Can view Customers, inspect Invoices, and access read-only Sales Challans. |

*(Note: The login screen includes one-click preset buttons to instantly log in as any role.)*

---

## 📌 Project Overview & Architecture Summary

The **Fundsroom Operations Portal** streamlines real-world business workflows across internal departments (Sales, Warehouse, Accounts, Admin):

### Architectural Decisions
- **Backend Architecture (Node.js + Express + TypeScript)**: Built using a modular controller-route-middleware layer. TypeScript ensures end-to-end type safety, while Zod handles request payload validation to guarantee valid data at the API boundary.
- **Database & ORM Layer (Prisma ORM + PostgreSQL / SQLite)**: Uses Prisma ORM with dynamic provider resolution. Works seamlessly with SQLite (`dev.db`) for offline local development and PostgreSQL (Supabase / Neon) for cloud production.
- **Frontend Architecture (React + Vite + TailwindCSS)**: Formed as a Single Page Application (SPA) with Executive Light aesthetic design tokens, custom Lucide SVG icon system, client-side routing, and real-time inline input validation.
- **Print Engine (CSS @media print)**: 1-Click A4 PDF Corporate Tax Invoice & Delivery Note document generator built using pure CSS `@media print` directives without bloated heavy PDF dependencies.

---

## 🔐 API Access & Authorization Workflow

```text
[Client / Postman / Frontend]
        │
        │ 1. GET /health (Public - Ping Health Status)
        ▼
   [200 OK Response]

        │
        │ 2. POST /auth/login { email, password }
        ▼
[Backend Auth Controller] ──▶ Verifies Bcrypt Password Hash
        │
        ▼ (Returns 200 OK + JWT Bearer Token)
   [JWT Payload: { userId, email, role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS' }]

        │
        │ 3. Protected API Requests (Header: Authorization: Bearer <token>)
        ▼
[Express Auth Middleware (auth.ts)]
        │
        ├──▶ Verifies JWT Token Signature & Expiry
        ├──▶ Enforces Role Permissions (authorize('ADMIN', 'SALES'))
        └──▶ Passes Verified User to Route Controller
```

### Role Access Control Matrix:
- **`ADMIN`**: Unrestricted full access to all endpoints (CRM, Inventory, Stock Adjustments, Challans, Reports).
- **`SALES`**: Access to Customer CRM (`GET/POST /customers`), Inventory view (`GET /products`), and Challans (`POST /challans`).
- **`WAREHOUSE`**: Access to Inventory Catalog (`GET/POST/PUT /products`), Stock Movements (`POST /products/:id/stock`), and Challans.
- **`ACCOUNTS`**: Access to Customer CRM, Tax Invoices, and Read-only Challans.

### API Endpoints & Response Payloads Matrix:

| Module | HTTP Method & Route | Access Level | Description & Response Payload Summary |
| :--- | :--- | :--- | :--- |
| **Health** | `GET /health` | Public | Returns `{ "success": true, "message": "Server is healthy and DB is connected" }`. |
| **Auth** | `POST /auth/login` | Public | Body: `{ email, password }`. Returns JWT token & user profile object. |
| | `GET /auth/me` | Authenticated | Returns current authenticated user details and role permissions. |
| **CRM** | `GET /customers` | Admin, Sales, Accounts | Returns paginated list of customers matching search & filter query params. |
| | `POST /customers` | Admin, Sales | Body: `{ name, mobile, email, businessName, customerType, status }`. |
| | `GET /customers/:id` | Admin, Sales, Accounts | Returns single customer record with timeline of all follow-up call notes. |
| | `POST /customers/:id/notes` | Admin, Sales, Accounts | Body: `{ note }`. Adds a new follow-up call note to customer history. |
| **Products** | `GET /products` | All Roles | Returns product catalog list with computed `isLowStock` alert indicator. |
| | `POST /products` | Admin, Warehouse | Body: `{ name, sku, category, unitPrice, initialStock, minStockAlert }`. |
| | `POST /products/:id/stock` | Admin, Warehouse | Body: `{ quantityChanged, movementType: 'IN'/'OUT', reason }`. Atomic stock adjustment. |
| | `GET /products/:id/history` | All Roles | Returns historical audit log list of all Stock IN/OUT movements for item. |
| **Challans** | `GET /challans` | All Roles | Returns list of delivery challans. |
| | `POST /challans` | Admin, Sales | Body: `{ customerId, status: 'DRAFT', items: [...] }`. Creates challan with price snapshot. |
| | `GET /challans/:id` | All Roles | Returns single challan + price snapshots (used to render A4 Tax Invoice PDF). |
| | `POST /challans/:id/confirm` | Admin, Sales, Warehouse | Atomically decrements stock from DB. Returns HTTP 400 error if stock is insufficient. |
| | `POST /challans/:id/cancel` | Admin, Sales, Warehouse | Cancels order and automatically reverses previously deducted stock back to inventory. |
| **Dashboard** | `GET /dashboard/stats` | All Roles | Returns system count metrics (`totalCustomers`, `totalProducts`, `lowStockCount`, etc.). |

---

## 🛠️ Tech Stack List

### Backend
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript (v5.7+)
- **Framework**: Express.js (v5)
- **Database ORM**: Prisma ORM (v7.9)
- **Databases**: Supabase / Neon PostgreSQL (Production), SQLite (Local Offline Dev)
- **Validation**: Zod (v4)
- **Authentication**: JWT (`jsonwebtoken`) & Bcrypt (`bcryptjs`)

### Frontend
- **Framework**: React 18 (Vite 8)
- **Language**: TypeScript
- **Styling**: Vanilla TailwindCSS (Executive Light Palette)
- **Icons**: Custom Lucide-Style SVG Icon Library
- **HTTP Client**: Axios (with Bearer token interceptor)
- **Routing**: React Router DOM (v6)

### DevOps & Hosting
- **Frontend Hosting**: Vercel (`https://fundsroom-erp-crm-portal-delta.vercel.app`)
- **Backend Web Service**: Render (`https://fundsroom-erp-crm-portal-p9ja.onrender.com`)
- **Database Hosting**: Supabase PostgreSQL

---

## 📁 Folder Structure

```text
fundsoom/
├── SUBMISSION.md                  <- Final case study submission summary package
├── DEPLOYMENT.md                  <- Free-tier hosting deployment manual
├── CHECKLIST.md                   <- PDF Case Study compliance matrix
├── postman_collection.json        <- Exported Postman API test collection
├── README.md                      <- Main documentation
├── backend/
│   ├── .env.example               <- Backend environment variable template
│   ├── package.json               <- Build, start scripts
│   ├── prisma.config.ts           <- Prisma 7 configuration
│   ├── prisma/
│   │   ├── schema.prisma          <- Active database schema
│   │   ├── schema.postgresql.prisma <- Supabase PostgreSQL schema
│   │   ├── schema.sqlite.prisma   <- Local SQLite schema
│   │   └── seed.ts                <- 4-role user & inventory seed script
│   └── src/
│       ├── config/db.ts           <- Dynamic database adapter
│       ├── controllers/           <- Auth, Customer, Product, Challan, Dashboard
│       ├── middleware/            <- JWT Auth, Error Handler, Zod Validation
│       ├── routes/                <- Express REST API routes & Health Check
│       └── index.ts               <- Express App Entry with production CORS
└── frontend/
    ├── .env.example               <- Local Vite env template
    ├── .env.production.example    <- Vercel deployment env template
    ├── package.json               <- Frontend dependencies & scripts
    ├── vercel.json                <- SPA routing rewrite rules
    └── src/
        ├── api/                   <- Axios REST API client methods
        ├── components/            <- Layout, SearchBar, HighlightText, Lucide Icons
        ├── context/               <- AuthContext state provider
        ├── pages/                 <- CRM, Inventory, Challans, Detail & Login Pages
        ├── types/                 <- TypeScript interfaces
        ├── App.tsx                <- Router & Role-Protected Routes
        ├── index.css              <- Executive Light Design Tokens
        └── main.tsx               <- React Entry Point
```

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

   # Initialize Local Database & Run Seed Data
   npx prisma db push
   npx tsx prisma/seed.ts

   # Start Backend Development Server
   npm run dev
   ```
   *Backend will start on `http://localhost:5000`.*

3. **Setup & Run Frontend**:
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend will start on `http://localhost:5173`.*

4. **Access the Portal**:
   Open `http://localhost:5173` in your browser and click any demo account button to log in!

---

## 🌐 Environment Variables Explanation

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL or SQLite database connection string | `postgresql://user:pass@host:5432/db` or `file:./dev.db` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | `supersecretjwtkey` |
| `PORT` | Port number for Express server | `5000` |
| `FRONTEND_URL` | Allowed frontend origin for CORS policy | `https://fundsroom-erp-crm-portal-delta.vercel.app` |

### Frontend Environment Variables (`frontend/.env.production`)

| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base REST API URL of backend server | `https://fundsroom-erp-crm-portal-p9ja.onrender.com` |

---

## 🚀 Live Deployment Instructions

Full step-by-step deployment instructions for free-tier hosting on **Supabase / Neon + Render + Vercel** are available in [**`DEPLOYMENT.md`**](./DEPLOYMENT.md).

---

## 📝 Known Limitations & Incomplete Optional Features

To maintain complete transparency against the case study's optional bonus feature list:

1. 📄 **Export Invoice as PDF (Bonus Feature)**: **IMPLEMENTED**. 1-Click A4 Tax Invoice & Delivery Note document generator formatted with pure CSS `@media print` styling (`window.print()`).
2. 🖼️ **Upload Product Image to AWS S3 (Bonus Feature)**: **SKIPPED**. Omitted to avoid requiring paid AWS S3 credentials. Products utilize styled Lucide category badges and SKU tags.
3. 🐳 **Docker Setup (Bonus Feature)**: **SKIPPED**. The project relies on native Node.js runtime scripts and automatic Git-integrated platform builds on Vercel and Render.
4. ⚙️ **GitHub Actions CI/CD (Bonus Feature)**: **SKIPPED**. Direct GitHub repository integrations on Render and Vercel automatically trigger build pipelines on every git push, rendering extra CI/CD pipelines redundant.

---

## 📌 Assumptions Made During Development

1. **GST Tax Rate**: Fixed at a standard 18% corporate GST rate (9% CGST + 9% SGST) for itemized tax invoice generation.
2. **Challan Status Flow**: Challans start in `DRAFT` status and can be updated to `CONFIRMED` or `CANCELLED`. Once `CONFIRMED`, inventory stock is atomically decremented. If `CANCELLED`, previously deducted stock is automatically reversed back into inventory.
3. **Price Snapshotting**: Product unit prices and names are snapshotted onto line items at the time of challan creation so historical invoices remain unaffected by future product price changes.
