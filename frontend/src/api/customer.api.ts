import api from './axios.config';
import type { Customer, CreateCustomerPayload, CustomerListResponse, FollowUpNote } from '../types/customer.types';

export const getCustomersApi = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}): Promise<CustomerListResponse> => {
  const response = await api.get<CustomerListResponse>('/customers', { params });
  return response.data;
};

export const getCustomerByIdApi = async (id: string): Promise<{ success: boolean; customer: Customer }> => {
  const response = await api.get<{ success: boolean; customer: Customer }>(`/customers/${id}`);
  return response.data;
};

export const createCustomerApi = async (data: CreateCustomerPayload): Promise<{ success: boolean; customer: Customer }> => {
  const response = await api.post<{ success: boolean; customer: Customer }>('/customers', data);
  return response.data;
};

export const updateCustomerApi = async (id: string, data: CreateCustomerPayload): Promise<{ success: boolean; customer: Customer }> => {
  const response = await api.put<{ success: boolean; customer: Customer }>(`/customers/${id}`, data);
  return response.data;
};

export const addFollowUpApi = async (id: string, note: string): Promise<{ success: boolean; followUp: FollowUpNote }> => {
  const response = await api.post<{ success: boolean; followUp: FollowUpNote }>(`/customers/${id}/follow-ups`, { note });
  return response.data;
};
