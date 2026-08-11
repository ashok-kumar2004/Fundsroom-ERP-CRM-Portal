import api from './axios.config';
import type { LoginPayload, AuthResponse, User } from '../types/auth.types';

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getMeApi = async (): Promise<{ success: boolean; user: User }> => {
  const response = await api.get<{ success: boolean; user: User }>('/auth/me');
  return response.data;
};
