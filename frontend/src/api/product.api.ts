import api from './axios.config';
import type { Product, CreateProductPayload, ProductListResponse, StockMovementPayload, StockMovement } from '../types/product.types';

export const getProductsApi = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
  lowStockOnly?: boolean;
}): Promise<ProductListResponse> => {
  const response = await api.get<ProductListResponse>('/products', { params });
  return response.data;
};

export const getProductByIdApi = async (id: string): Promise<{ success: boolean; product: Product }> => {
  const response = await api.get<{ success: boolean; product: Product }>(`/products/${id}`);
  return response.data;
};

export const createProductApi = async (data: CreateProductPayload): Promise<{ success: boolean; product: Product }> => {
  const response = await api.post<{ success: boolean; product: Product }>('/products', data);
  return response.data;
};

export const updateProductApi = async (id: string, data: Partial<CreateProductPayload>): Promise<{ success: boolean; product: Product }> => {
  const response = await api.put<{ success: boolean; product: Product }>(`/products/${id}`, data);
  return response.data;
};

export const addStockMovementApi = async (
  id: string,
  data: StockMovementPayload
): Promise<{ success: boolean; product: Product; stockMovement: StockMovement }> => {
  const response = await api.post<{ success: boolean; product: Product; stockMovement: StockMovement }>(
    `/products/${id}/stock-movement`,
    data
  );
  return response.data;
};

export const getStockHistoryApi = async (
  id: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  success: boolean;
  data: StockMovement[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  const response = await api.get<{
    success: boolean;
    data: StockMovement[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>(`/products/${id}/stock-history`, { params: { page, limit } });
  return response.data;
};
