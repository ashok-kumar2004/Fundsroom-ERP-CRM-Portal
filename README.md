# Fundsroom Mini ERP & CRM Operations Portal

A full-stack enterprise Operations Portal built for wholesale/distribution companies to manage Customers (CRM), Products & Inventory, Sales Delivery Challans, and Printable Tax Invoices.

![System License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/Node.js-v20+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.7+-blue.svg)
![React](https://img.shields.io/badge/React-v18+-indigo.svg)
![Prisma](https://img.shields.io/badge/Prisma-v7.9-teal.svg)

---

## 📌 Project Overview & Architecture Summary

The **Fundsroom Operations Portal** streamlines real-world business workflows across internal departments (Sales, Warehouse, Accounts, Admin):

### Architectural Decisions
- **Backend Architecture (Node.js + Express + TypeScript)**: Built using a modular controller-route-middleware layer. TypeScript ensures end-to-end type safety, while Zod handles request payload validation to guarantee valid data at the API boundary.
- **Database & ORM Layer (Prisma ORM + PostgreSQL / SQLite)**: Uses Prisma ORM with dynamic provider resolution. Works seamlessly with SQLite (`dev.db`) for offline local development and PostgreSQL (Supabase / Neon) for cloud production.
- **Frontend Architecture (React + Vite + TailwindCSS)**: Formed as a Single Page Application (SPA) with Executive Light aesthetic design tokens, Lucide SVG icon system, client-side routing, and real-time inline input validation.
- **Print Engine (CSS @media print)**: 1-Click A4 PDF Corporate Tax Invoice & Delivery Note document generator built using pure CSS `@media print` directives without bloated heavy PDF dependencies.

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
- **Frontend Hosting**: Vercel
- **Backend Web Service**: Render
- **Database Hosting**: Supabase / Neon PostgreSQL

---

## 📁 Folder Structure

```text
Fundsroom-ERP-CRM-Portal/
├── DEPLOYMENT.md                  <- Free-tier hosting deployment manual
├── CHECKLIST.md                   <- PDF Case Study compliance matrix
├── postman_collection.json        <- Exported Postman API test collection
├── README.md                      <- Main documentation
├── .gitignore                     <- Git ignore patterns for env and binaries
├── backend/
│   ├── .env.example               <- Backend environment variable template
│   ├── .gitignore                 <- Backend git ignore rules
│   ├── package.json               <- Build, start scripts
│   ├── prisma.config.ts           <- Prisma 7 configuration
│   ├── tsconfig.json              <- TypeScript compiler configuration
│   ├── prisma/
│   │   ├── schema.prisma          <- Active database schema
│   │   ├── schema.postgresql.prisma <- Supabase PostgreSQL schema
│   │   ├── schema.sqlite.prisma   <- Local SQLite schema
│   │   └── seed.ts                <- 4-role user & inventory seed script
│   └── src/
│       ├── config/
│       │   └── db.ts              <- Dynamic database adapter (Pg & SQLite)
│       ├── controllers/
│       │   ├── auth.controller.ts     <- Auth login & profile controller
│       │   ├── customer.controller.ts <- Customer CRM & notes controller
│       │   ├── product.controller.ts  <- Inventory & stock movement controller
│       │   ├── challan.controller.ts  <- Sales delivery challan controller
│       │   └── dashboard.controller.ts<- Analytics dashboard controller
│       ├── middleware/
│       │   ├── auth.ts            <- JWT Auth & role authorization middleware
│       │   ├── errorHandler.ts    <- Global Express error handler
│       │   └── validate.ts        <- Zod request body validation middleware
│       ├── routes/
│       │   ├── auth.routes.ts     <- Auth REST API routes
│       │   ├── customer.routes.ts <- Customer CRM REST API routes
│       │   ├── product.routes.ts  <- Product & Stock REST API routes
│       │   ├── challan.routes.ts  <- Sales Challan REST API routes
│       │   ├── dashboard.routes.ts<- Dashboard statistics routes
│       │   └── health.routes.ts   <- Health check GET /health endpoint
│       └── index.ts               <- Express App Entry with production CORS
└── frontend/
    ├── .env.example               <- Local Vite env template
    ├── .env.production.example    <- Vercel deployment env template
    ├── package.json               <- Frontend dependencies & scripts
    ├── vercel.json                <- SPA routing rewrite rules
    ├── index.html                 <- HTML entry point
    └── src/
        ├── api/
        │   ├── axios.config.ts    <- Axios base URL configuration
        │   ├── auth.api.ts        <- Auth REST API client methods
        │   ├── customer.api.ts    <- Customer CRM REST API client methods
        │   ├── product.api.ts     <- Inventory REST API client methods
        │   └── challan.api.ts     <- Challan REST API client methods
        ├── components/
        │   ├── Layout.tsx         <- Main sidebar navigation layout
        │   ├── ProtectedRoute.tsx <- Auth & Role guard wrapper
        │   ├── SearchBar.tsx      <- Search bar with quick filter pills
        │   ├── HighlightText.tsx  <- Yellow search term highlight renderer
        │   └── Icons.tsx          <- Lucide SVG Icon Component Library
        ├── context/
        │   └── AuthContext.tsx    <- Global Auth & User State provider
        ├── pages/
        │   ├── LoginPage.tsx          <- Login form & quick demo preset buttons
        │   ├── DashboardPage.tsx      <- Analytics dashboard page
        │   ├── CustomersPage.tsx      <- Customer CRM directory page
        │   ├── CustomerDetailPage.tsx  <- Customer profile & notes timeline
        │   ├── ProductsPage.tsx       <- Inventory catalog & stock alerts
        │   ├── ProductDetailPage.tsx   <- Stock metrics & IN/OUT audit trail
        │   ├── ChallansPage.tsx       <- Delivery challans list page
        │   ├── CreateChallanPage.tsx   <- Multi-item challan creation form
        │   └── ChallanDetailPage.tsx  <- A4 Tax Invoice PDF print document
        ├── types/
        │   ├── auth.types.ts      <- Auth TypeScript interfaces
        │   ├── customer.types.ts  <- Customer CRM interfaces
        │   ├── product.types.ts   <- Product & Stock Movement interfaces
        │   └── challan.types.ts   <- Challan & Line Item interfaces
        ├── App.tsx                <- Router & Role-Protected Routes
        ├── index.css              <- Executive Light Design Tokens
        └── main.tsx               <- React Entry Point
```

---

## 🔑 Test Login Credentials (All 4 Roles)

Password for all test accounts is: **`Test@123`**

| Role | Email Address | Password | Workspace Access |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@test.com` | `Test@123` | Full System Access (All Modules) |
| 💼 **Sales** | `sales@test.com` | `Test@123` | Customers CRM, Inventory, Create Challans |
| 📦 **Warehouse** | `warehouse@test.com` | `Test@123` | Inventory Catalog, Stock IN/OUT Adjustments, Challans |
| 🧾 **Accounts** | `accounts@test.com` | `Test@123` | Customer CRM, Invoices, Read-only Challans |

*(Note: The login page includes 1-click preset buttons to instantly log in as any role.)*

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
| `FRONTEND_URL` | Allowed frontend origin for CORS policy | `https://fundsroom-erp.vercel.app` |

### Frontend Environment Variables (`frontend/.env.production`)

| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base REST API URL of backend server | `https://fundsroom-backend.onrender.com` |

---

## 📬 API Documentation

A complete, pre-configured Postman API Collection is included in the repository root at [**`postman_collection.json`**](./postman_collection.json).

### What It Covers:
- **Authentication**: `POST /auth/login` (with automatic JWT token extraction test script), `GET /auth/me`
- **Customer CRM**: `GET /customers`, `POST /customers`, `GET /customers/:id`, `POST /customers/:id/notes`
- **Products & Inventory**: `GET /products`, `POST /products`, `POST /products/:id/stock`, `GET /products/:id/history`
- **Sales Challans**: `GET /challans`, `POST /challans`, `POST /challans/:id/confirm`, `POST /challans/:id/cancel`
- **Dashboard & Health**: `GET /dashboard/stats`, `GET /health`

### How to Use:
1. Open Postman → Click **Import** → Select [`postman_collection.json`](./postman_collection.json).
2. Set the `baseUrl` collection variable:
   - **Local**: `http://localhost:5000`
   - **Live Production**: `https://fundsroom-erp-crm-portal-p9ja.onrender.com`
3. Send the **Login** request. The test script will automatically store the `{{token}}` variable for all subsequent requests!

---

## 🚀 Live Deployment Instructions

Full step-by-step deployment instructions for free-tier hosting on **Supabase / Neon + Render + Vercel** are available in [**`DEPLOYMENT.md`**](./DEPLOYMENT.md).

### Live Production Endpoints:
- **Live Frontend (Vercel)**: `https://fundsroom-erp.vercel.app` *(or your Vercel deployment link)*
- **Live Backend API (Render)**: `https://fundsroom-erp-crm-portal-p9ja.onrender.com`
- **Health Check Endpoint**: `https://fundsroom-erp-crm-portal-p9ja.onrender.com/health`

---

## 📝 Known Limitations & Incomplete Optional Features

To maintain complete transparency:
1. **AWS S3 Image Upload (Optional Bonus)**: Product images are currently represented as styled Lucide product badges and category tags. Physical S3 file uploads were skipped to avoid requiring paid AWS S3 bucket credentials.
2. **Docker Setup (Optional Bonus)**: The project runs natively via Node.js / npm scripts. Dockerfile setup was omitted to focus on native Render & Vercel serverless deployment.
3. **Print Engine**: Invoice PDF export is handled via pure A4 `@media print` directives (`window.print()`) which can be saved as PDF in 1 click. Server-side PDF binary streaming is not implemented.

---

## 📌 Assumptions Made During Development

1. **GST Tax Rate**: Fixed at a standard 18% corporate GST rate (9% CGST + 9% SGST) for itemized tax invoice generation.
2. **Challan Status Flow**: Challans start in `DRAFT` status and can be updated to `CONFIRMED` or `CANCELLED`. Once `CONFIRMED`, inventory stock is atomically decremented. If `CANCELLED`, previously deducted stock is automatically reversed back into inventory.
3. **Price Snapshotting**: Product unit prices and names are snapshotted onto line items at the time of challan creation so historical invoices remain unaffected by future product price changes.
