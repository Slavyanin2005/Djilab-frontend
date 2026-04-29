import axios from 'axios';
import type { AxiosError } from 'axios';
import type { Service, Order, UserProfile, RegisterData, AuthResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Перехватчик для добавления CSRF-токена
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export const apiService = {
  // ==================== УСЛУГИ ====================

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

  // ==================== ЗАЯВКИ (ОСНОВНЫЕ) ====================

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

  // ==================== КОРЗИНА ====================

  getCartIcon: async (): Promise<{ id: number | null; items_count: number }> => {
    const response = await api.get('/orders/cart_icon/');
    return response.data;
  },

  // ==================== ПОЗИЦИИ ЗАЯВКИ (M2M без PK) ====================

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

  updateItemInOrder: async (orderId: number, itemId: number, quantity: number): Promise<Order> => {
    const action = quantity > 1 ? 'increase' : 'decrease';
    const response = await api.post(`/orders/${orderId}/update_item/`, {
      item_id: itemId,
      action,
    });
    return response.data;
  },

  removeItemFromOrder: async (orderId: number, itemId: number): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/remove_item/`, {
      item_id: itemId,
    });
    return response.data;
  },

  // ==================== СТАТУСЫ ЗАЯВКИ ====================

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

  // ==================== ПОЛЬЗОВАТЕЛЬ ====================

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

  login: async (username: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/profiles/login/', { username });
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

  // ==================== 🔙 ОБРАТНАЯ СОВМЕСТИМОСТЬ (алиасы) ====================

  createOrder: async (): Promise<Order> => {
    return { id: null as unknown as number, items_count: 0, status: 'draft', total: '0' } as Order;
  },

  addToOrder: async (_orderId: number, serviceId: number, quantity: number = 1): Promise<Order> => {
    const response = await api.post(`/services/${serviceId}/add_to_order/`, { quantity });
    return response.data;
  },

  updateQuantity: async (
    orderId: number,
    itemId: number,
    action: 'increase' | 'decrease'
  ): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/update_item/`, {
      item_id: itemId,
      action,
    });
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
