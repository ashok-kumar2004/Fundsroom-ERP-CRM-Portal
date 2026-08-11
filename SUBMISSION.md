# Case Study Submission Package

**Project**: Fundsroom Mini ERP & CRM Operations Portal  
**Candidate**: Ashok Kumar  

---

## 1. GitHub Repository Link
- **Repository URL**: [https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal](https://github.com/ashok-kumar2004/Fundsroom-ERP-CRM-Portal)

---

## 2. Live Frontend URL
- **Production Web Application**: [https://fundsroom-erp-crm-portal-delta.vercel.app](https://fundsroom-erp-crm-portal-delta.vercel.app)
- **Status**: Live, accessible, and fully connected to the production backend REST API.

---

## 3. Live Backend API URL
- **Production Base API**: [https://fundsroom-erp-crm-portal-p9ja.onrender.com](https://fundsroom-erp-crm-portal-p9ja.onrender.com)
- **Health Check Endpoint**: [https://fundsroom-erp-crm-portal-p9ja.onrender.com/health](https://fundsroom-erp-crm-portal-p9ja.onrender.com/health)
- **Note on Free-Tier Hosting**: The backend is hosted on Render's free tier. If inactive for more than 15 minutes, the web service enters a spin-down state and the initial HTTP request may experience a ~30-second cold-start delay while the instance boots up.

---

## 4. Test Login Credentials (All Roles)

Password for all test accounts is: **`Test@123`**

| Role | Email Address | Password | Access Level & Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@test.com` | `Test@123` | Full system access across all CRM, Inventory, Challans, and Dashboard modules. |
| 💼 **Sales** | `sales@test.com` | `Test@123` | Can manage Customers, view Inventory, create & manage Sales Challans. |
| 📦 **Warehouse** | `warehouse@test.com` | `Test@123` | Can manage Product Inventory, execute Stock IN/OUT movements, and view Challans. |
| 🧾 **Accounts** | `accounts@test.com` | `Test@123` | Can view Customers, inspect Invoices, and access read-only Sales Challans. |

*(Note: The login page includes one-click preset buttons to instantly populate and log in as any role.)*

---

## 5. Postman Collection / API Documentation
- **Collection File**: [`postman_collection.json`](./postman_collection.json)
- **Usage Instructions**:
  1. Open Postman, click **Import**, and select [`postman_collection.json`](./postman_collection.json).
  2. The collection includes pre-configured collection variables: `baseUrl` (defaults to `https://fundsroom-erp-crm-portal-p9ja.onrender.com`) and `token`.
  3. Execute the `Authentication -> Login (Admin User)` request. The included test script will automatically extract the returned JWT token and save it into the collection-level `token` variable for all subsequent authenticated endpoint calls.

---

## 6. README Reference
- **Root Documentation**: [`README.md`](./README.md)
- **Summary**: Comprehensive guide detailing project architecture, tech stack, folder layout, local development setup (backend + frontend + DB seed), environment variable definitions, deployment steps, and development assumptions.

---

## 7. Architecture Explanation (Short Summary)
The application is built as a full-stack TypeScript project featuring a Node.js and Express REST API backend coupled with Prisma ORM. For data persistence, it uses a live Supabase PostgreSQL database in production and local SQLite for offline development. The frontend is a React Single Page Application (SPA) styled with an Executive Light theme and a Lucide SVG icon library. Authentication is implemented using JWT tokens with 4 role-based access levels (Admin, Sales, Warehouse, Accounts), with request data strictly validated via Zod schemas and hosted on Render and Vercel.

---

## 8. Known Limitations & Bonus Feature Status

To ensure complete transparency against the case study's optional bonus feature list:

1. 📄 **Export Invoice as PDF (Bonus Feature)**: **IMPLEMENTED**. 1-Click A4 Tax Invoice & Delivery Note document generator formatted with pure CSS `@media print` styling (`window.print()`).
2. 🖼️ **Upload Product Image to AWS S3 (Bonus Feature)**: **SKIPPED**. Omitted to avoid requiring paid AWS S3 credentials. Products utilize styled Lucide category badges and SKU tags.
3. 🐳 **Docker Setup (Bonus Feature)**: **SKIPPED**. The project relies on native Node.js runtime scripts and automatic Git-integrated platform builds on Vercel and Render.
4. ⚙️ **GitHub Actions CI/CD (Bonus Feature)**: **SKIPPED**. Direct GitHub repository integrations on Render and Vercel automatically trigger build pipelines on every git push, rendering extra CI/CD pipelines redundant.
