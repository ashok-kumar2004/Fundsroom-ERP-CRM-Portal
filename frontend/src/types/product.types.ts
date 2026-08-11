export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason?: string | null;
  createdBy: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string | null;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  isLowStock?: boolean;
  StockMovements?: StockMovement[];
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  category?: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location?: string;
}

export interface StockMovementPayload {
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
