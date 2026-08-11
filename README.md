# Fundsroom Mini ERP + CRM Operations Portal

Full-stack Mini ERP/CRM operations portal for a wholesale and distribution business built with **Node.js, Express, TypeScript, Prisma ORM, React, and TailwindCSS**.

---

## 🌟 Live Local Services
- **Frontend App**: `http://localhost:5173/`
- **Backend REST API**: `http://localhost:5000/`

---

## 🔑 Test Login Credentials (RBAC Matrix)

All accounts share password: `Password123!`

| Role | Email | Permissions / Accessible Modules |
|---|---|---|
| 👑 **ADMIN** | `admin@test.com` | Full system access to all CRM, Product, Stock & Sales Challan modules. |
| 📈 **SALES** | `sales@test.com` | Customer CRM (Add/Edit/Follow-ups), Product catalog view, Create & view Sales Challans. |
| 🏭 **WAREHOUSE** | `warehouse@test.com` | Product & Inventory management, Manual Stock IN/OUT adjustments, Confirm Sales Challans. |
| 💳 **ACCOUNTS** | `accounts@test.com` | View Customers, View Product Catalog & Inventory levels, View Sales Challans/Invoices. |

---

## 🏗️ Architecture & Core Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication**: Secure stateless tokens issued upon login.
- **Middleware Guards**: Route level protection enforcing authentication (`authenticate`) and role authorization (`authorize(...roles)`).
- **One-Click Quick Login Pills**: Provided on the frontend login page for easy testing across all 4 roles.

### 2. Customer CRM Module (`/customers`)
- **Fields**: Name, Mobile, Email, Business Name, GST Number, Customer Type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), Status (`LEAD`, `ACTIVE`, `INACTIVE`), Follow-up Date, Notes.
- **Features**: Add customer, edit customer, search by name/mobile/email, filter by status and type, pagination (`page`, `limit`), customer detail view with timeline history of follow-up notes.

### 3. Product & Inventory Module (`/products`)
- **Fields**: Product Name, SKU/Code (Unique), Category, Unit Price, Current Stock, Minimum Stock Alert, Location/Warehouse.
- **Features**: Add/Edit product, search/filter, low stock alert filter (`currentStock <= minStockAlert`).
- **Atomic Stock Movements**: Manual Stock IN/OUT adjustments running inside database transactions, automatically logging creator user, quantity change, movement type, timestamp, and reason.

### 4. Sales Challan Module (`/challans`)
- **Fields**: Auto-generated Challan Number (`CHAL-YYYYMMDD-XXXX`), Customer relation, Line item snapshot array (`productNameSnapshot`, `productSkuSnapshot`, `unitPriceSnapshot`, `quantity`), Total Quantity, Status (`DRAFT`, `CONFIRMED`).
- **Core Business Logic**:
  - Stock validation prevents confirmation if requested quantity exceeds `currentStock` (returns HTTP 400 error).
  - Confirming a challan atomically deducts product stock and logs `OUT` stock movement records inside a database transaction (`prisma.$transaction`).
  - Invoice document detail view with print / PDF export styling (`window.print()`).

---

## 🚀 How to Run the Project Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup (`/backend`)
```bash
cd backend
npm install
npm run dev
```
*Note: The database is pre-configured with SQLite (`backend/prisma/dev.db`) and automatically seeded with all role test accounts.*

### 2. Frontend Setup (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```

---

## 📑 API Endpoint Documentation

### Authentication APIs
- `POST /auth/login` - Authenticates user credentials and returns JWT token.
- `GET /auth/me` - Verifies token and returns current user session profile.

### Customer CRM APIs
- `GET /customers` - Query customers with parameters `page`, `limit`, `search`, `status`, `customerType`.
- `POST /customers` - Create customer record.
- `GET /customers/:id` - Get customer profile and follow-up timeline.
- `PUT /customers/:id` - Update customer record.
- `POST /customers/:id/follow-ups` - Add follow-up note linked to customer.

### Product & Inventory APIs
- `GET /products` - Query catalog with parameters `page`, `limit`, `search`, `category`, `lowStockOnly`.
- `POST /products` - Add product (enforces unique SKU).
- `GET /products/:id` - Get product details and stock movement logs.
- `PUT /products/:id` - Edit product details.
- `POST /products/:id/stock-movement` - Perform manual Stock IN/OUT adjustment.

### Sales Challan APIs
- `GET /challans` - Query sales challans with `page`, `limit`, `search`, `status`.
- `POST /challans` - Generate sales challan (`DRAFT` or `CONFIRMED`).
- `GET /challans/:id` - Get single sales challan with invoice line items.
- `PUT /challans/:id/confirm` - Confirm a draft challan (triggers atomic stock reduction).

---

## 🌐 Deployment Instructions (Free Hosting Platforms)

- **Frontend Deployment**: Connect repo to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) pointing root directory to `/frontend`.
- **Backend Deployment**: Deploy `/backend` to [Render](https://render.com), [Railway](https://railway.app), or [Fly.io].
- **Database Options**: Supabase Postgres, Neon Postgres, or Render Postgres (Set `DATABASE_URL` environment variable).
