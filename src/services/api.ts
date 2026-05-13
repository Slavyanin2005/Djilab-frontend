// src/services/api.ts
import axios from 'axios';
import type { Service, Order, RegisterData, User, AuthResponse } from '../types';
import { MOCK_SERVICES } from '../mocks/services';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Интерцептор для CSRF токена
api.interceptors.request.use((config) => {
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
  useMock: false,

  getServices: async (params?: { search?: string }): Promise<Service[]> => {
    if (apiService.useMock) {
      if (!params?.search) return MOCK_SERVICES;
      const query = params.search.toLowerCase();
      return MOCK_SERVICES.filter(
        (s) => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)
      );
    }
    const response = await api.get('/services/', { params });
    return response.data;
  },

  getService: async (id: number): Promise<Service> => {
    if (apiService.useMock) {
      const service = MOCK_SERVICES.find((s) => s.id === id);
      if (!service) throw new Error('Service not found');
      return service;
    }
    const response = await api.get(`/services/${id}/`);
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    if (apiService.useMock) return [];
    const response = await api.get('/orders/');
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  getCartIcon: async (): Promise<{ id: number | null; items_count: number }> => {
    if (apiService.useMock) return { id: null, items_count: 0 };
    const response = await api.get('/orders/cart_icon/');
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    if (apiService.useMock) return { message: 'OK', username: data.username };
    const response = await api.post('/profiles/register/', data);
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    if (apiService.useMock) return { message: 'OK', username, id: 1, is_staff: false };
    const response = await api.post('/profiles/login/', { username, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (apiService.useMock) return;
    await api.post('/profiles/logout/');
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (apiService.useMock) return null;
    try {
      const response = await api.get('/profiles/me/');
      return response.data;
    } catch {
      return null;
    }
  },

  addToOrder: async (serviceId: number, quantity: number = 1): Promise<Order> => {
    if (apiService.useMock) {
      alert(`Товар ${serviceId} добавлен в корзину (mock)`);
      return {} as Order;
    }
    const response = await api.post(`/services/${serviceId}/add_to_order/`, { quantity });
    return response.data;
  },

  updateQuantity: async (
    orderId: number,
    itemId: number,
    action: 'increase' | 'decrease'
  ): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    const response = await api.post(`/orders/${orderId}/update_item_legacy/`, {
      item_id: itemId,
      action,
    });
    return response.data;
  },

  removeItemFromOrder: async (orderId: number, itemId: number): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    const response = await api.post(`/orders/${orderId}/remove_item/`, { item_id: itemId });
    return response.data;
  },

  deleteOrder: async (orderId: number): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    const response = await api.post(`/orders/${orderId}/delete/`);
    return response.data;
  },
};
