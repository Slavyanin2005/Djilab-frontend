import axios from 'axios';
import type { AxiosError } from 'axios';
import type { Service, Order, UserProfile, RegisterData, AuthResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Обязательно для отправки кук
});

api.interceptors.request.use((config) => {
  // Пробуем найти токен по имени из настроек Django
  const csrfToken =
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('djilab_csrftoken='))
      ?.split('=')[1] ||
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1];

  if (csrfToken && config.method?.toLowerCase() !== 'get') {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export const apiService = {
  getServices: async (params?: {
    search?: string;
    ordering?: string;
    category?: string;
  }): Promise<Service[]> => {
    const response = await api.get('/services/', { params });
    return response.data;
  },

  getService: async (id: number): Promise<Service> => {
    const response = await api.get(`/services/${id}/`);
    return response.data;
  },

  createService: async (formData: FormData): Promise<Service> => {
    const response = await api.post('/services/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getOrders: async (params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Order[]> => {
    const response = await api.get('/orders/', { params });
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  getCartIcon: async (): Promise<{ id: number | null; items_count: number }> => {
    const response = await api.get('/orders/cart_icon/');
    return response.data;
  },

  addItemToOrder: async (
    orderId: number,
    serviceId: number,
    quantity: number = 1
  ): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/add_item/`, {
      service_id: serviceId,
      quantity,
    });
    return response.data;
  },

  updateQuantity: async (
    orderId: number,
    itemId: number,
    action: 'increase' | 'decrease'
  ): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/update_item_legacy/`, {
      item_id: itemId,
      action,
    });
    return response.data;
  },

  removeItemFromOrder: async (orderId: number, itemId: number): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/remove_item_legacy/`, {
      item_id: itemId,
    });
    return response.data;
  },

  formOrder: async (orderId: number): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}/form/`);
    return response.data;
  },

  completeOrder: async (
    orderId: number,
    action: 'complete' | 'reject' = 'complete'
  ): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}/complete/`, { action });
    return response.data;
  },

  updateOrder: async (orderId: number, data: Partial<Pick<Order, 'comment'>>): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/`, data);
    return response.data;
  },

  deleteOrder: async (orderId: number): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/delete/`);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const response = await api.get('/profiles/');
      return response.data[0] || null;
    } catch {
      return null;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/profiles/register/', data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error('Registration error:', err.response?.data || err.message || error);
      throw error;
    }
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/profiles/login/', { username, password });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error('Login error:', err.response?.data || err.message || error);
      throw error;
    }
  },

  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/profiles/logout/');
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error('Logout error:', err.response?.data || err.message || error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('/profiles/me/');
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error('Get user error:', err.response?.data || err.message || error);
      throw error;
    }
  },

  createOrder: async (): Promise<Order> => {
    return { id: null as unknown as number, items_count: 0, status: 'draft', total: '0' } as Order;
  },

  addToOrder: async (_orderId: number, serviceId: number, quantity: number = 1): Promise<Order> => {
    const response = await api.post(`/services/${serviceId}/add_to_order/`, { quantity });
    return response.data;
  },

  _removeItemLegacy: async (orderId: number, itemId: number): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/remove_item/`, {
      item_id: itemId,
    });
    return response.data;
  },

  submitOrder: async (orderId: number): Promise<Order> => {
    return await apiService.formOrder(orderId);
  },
};
