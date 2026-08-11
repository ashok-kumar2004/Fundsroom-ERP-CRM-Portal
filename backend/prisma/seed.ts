import bcrypt from 'bcryptjs';
import prisma from '../src/config/db';

export const Role = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTS: 'ACCOUNTS',
} as const;

export const CustomerType = {
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  DISTRIBUTOR: 'DISTRIBUTOR',
} as const;

export const CustomerStatus = {
  LEAD: 'LEAD',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

async function main() {
  const passwordHash = await bcrypt.hash('Test@123', 10);

  // 1. Create 4 Users (One for each role)
  const usersData = [
    { id: 'usr-admin-1', name: 'Admin User', email: 'admin@test.com', role: Role.ADMIN },
    { id: 'usr-sales-1', name: 'Sales Executive', email: 'sales@test.com', role: Role.SALES },
    { id: 'usr-warehouse-1', name: 'Warehouse Manager', email: 'warehouse@test.com', role: Role.WAREHOUSE },
    { id: 'usr-accounts-1', name: 'Accounts Officer', email: 'accounts@test.com', role: Role.ACCOUNTS },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role, name: u.name },
      create: { id: u.id, name: u.name, email: u.email, passwordHash, role: u.role },
    });
  }

  // 2. Create 3 Sample Products with Stock
  const productsData = [
    {
      id: 'prod-yarn-101',
      name: 'Organic Cotton Yarn Bales',
      sku: 'YARN-COTTON-01',
      category: 'Textiles',
      unitPrice: 450.00,
      currentStock: 120,
      minStockAlert: 20,
      location: 'Warehouse Section A1',
    },
    {
      id: 'prod-denim-202',
      name: 'Heavyweight Indigo Denim Fabric (Meters)',
      sku: 'FABRIC-DENIM-02',
      category: 'Fabrics',
      unitPrice: 320.50,
      currentStock: 350,
      minStockAlert: 50,
      location: 'Warehouse Section B3',
    },
    {
      id: 'prod-button-303',
      name: 'Brass Metallic Apparel Buttons (Gross)',
      sku: 'ACC-BUTTON-03',
      category: 'Accessories',
      unitPrice: 85.00,
      currentStock: 15, // Low stock alert sample
      minStockAlert: 25,
      location: 'Warehouse Section C2',
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        unitPrice: p.unitPrice,
        currentStock: p.currentStock,
        minStockAlert: p.minStockAlert,
        location: p.location,
      },
      create: p,
    });
  }

  // 3. Create Sample Customer
  await prisma.customer.upsert({
    where: { id: 'cust-acme-01' },
    update: {},
    create: {
      id: 'cust-acme-01',
      name: 'Acme Textile Distributors',
      mobile: '+91 9876543210',
      email: 'orders@acmetextile.com',
      businessName: 'Acme Global Traders',
      gstNumber: '27AAAPA1234A1Z5',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.ACTIVE,
      address: 'Plot 45, Industrial Zone, Mumbai',
      notes: 'Key distributor for West region.',
    },
  });

  console.log('✅ Database seed completed: Created 4 role users (password: Test@123), 3 sample products with stock, and sample customer.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
