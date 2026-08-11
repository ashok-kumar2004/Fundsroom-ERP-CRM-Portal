export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface FollowUpNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  CustomerNotes?: FollowUpNote[];
  FollowUps?: FollowUpNote[];
  _count?: {
    CustomerNotes?: number;
    FollowUps?: number;
  };
}

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: CustomerType;
  address?: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
