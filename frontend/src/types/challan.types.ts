export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  productSkuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
  };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    mobile: string;
    businessName?: string | null;
    address?: string | null;
    gstNumber?: string | null;
  };
  user?: {
    id: string;
    name: string;
    role: string;
    email?: string;
  };
  items?: ChallanItem[];
  ChallanItems?: ChallanItem[];
  _count?: {
    items?: number;
    ChallanItems?: number;
  };
}

export interface CreateChallanPayload {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  status: 'DRAFT' | 'CONFIRMED';
}

export interface ChallanListResponse {
  success: boolean;
  data: Challan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
