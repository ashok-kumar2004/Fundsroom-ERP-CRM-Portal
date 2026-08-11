import api from './axios.config';
import type { Challan, CreateChallanPayload, ChallanListResponse } from '../types/challan.types';

export const getChallansApi = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<ChallanListResponse> => {
  const response = await api.get<ChallanListResponse>('/challans', { params });
  return response.data;
};

export const getChallanByIdApi = async (id: string): Promise<{ success: boolean; challan: Challan }> => {
  const response = await api.get<{ success: boolean; challan: Challan }>(`/challans/${id}`);
  return response.data;
};

export const createChallanApi = async (data: CreateChallanPayload): Promise<{ success: boolean; challan: Challan; message: string }> => {
  const response = await api.post<{ success: boolean; challan: Challan; message: string }>('/challans', data);
  return response.data;
};

export const confirmChallanApi = async (id: string): Promise<{ success: boolean; challan: Challan; message: string }> => {
  const response = await api.put<{ success: boolean; challan: Challan; message: string }>(`/challans/${id}/confirm`);
  return response.data;
};

export const cancelChallanApi = async (id: string): Promise<{ success: boolean; challan: Challan; message: string }> => {
  const response = await api.put<{ success: boolean; challan: Challan; message: string }>(`/challans/${id}/cancel`);
  return response.data;
};
