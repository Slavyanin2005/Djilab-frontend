import { axiosInstance } from './axios';
import type { Service, Order, User, RegisterData, UserProfile } from '../types';

// Простой кэш в памяти ключ → { данные, время_сохранения }
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 120000; // 2 минуты в миллисекундах

// получить из кэша или запросить
async function cachedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = cache[key];

  // Если есть в кэше и не устарел то возвращаем
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`CACHE HIT (frontend): ${key}`);
    return cached.data as T;
  }

  // Иначе  запрос к бэкенду + сохранение в кэш
  console.log(`CACHE MISS (frontend): ${key}`);
  const data = await requestFn();
  cache[key] = { data, timestamp: now };
  return data;
}

export const api = {
  login: async (username: string, password: string): Promise<User> => {
    const { data } = await axiosInstance.post<User>('/profiles/login/', {
      username,
      password,
    });
    return data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const { data: res } = await axiosInstance.post<User>('/profiles/register/', data);
    return res;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/profiles/logout/');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await axiosInstance.get<User>('/profiles/me/');
      return data;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return null;
      }
      console.warn('Auth check failed:', error.message);
      return null;
    }
  },

  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data } = await axiosInstance.get<UserProfile>('/profiles/me/');
      return data;
    } catch {
      return null;
    }
  },

  updateUserProfile: async (
    data: Partial<Pick<UserProfile, 'phone' | 'company' | 'position'>>
  ): Promise<UserProfile> => {
    const { data: res } = await axiosInstance.put<UserProfile>('/profiles/me/', data);
    return res;
  },

  changeUserPassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.put('/profiles/me/change_password/', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // КЭШИРОВАНИЕ список услуг
  getServices: async (params?: {
    search?: string;
    min_price?: string;
    max_price?: string;
    category?: string;
  }): Promise<Service[]> => {
    // Уникальный ключ для каждого набора фильтров
    const cacheKey = `services:${JSON.stringify(params || {})}`;

    return cachedRequest(cacheKey, async () => {
      const { data } = await axiosInstance.get<Service[]>('/services/', { params });
      return data;
    });
  },

  getService: async (id: number): Promise<Service> => {
    const { data } = await axiosInstance.get<Service>(`/services/${id}/`);
    return data;
  },

  getSimilarServices: async (id: number, limit = 4): Promise<Service[]> => {
    const { data } = await axiosInstance.get<Service[]>(`/services/${id}/similar/`, {
      params: { limit },
    });
    return data;
  },

  getCartIcon: async (): Promise<{ id: number | null; items_count: number }> => {
    const { data } = await axiosInstance.get('/orders/cart_icon/');
    return data;
  },

  addToOrder: async (serviceId: number, quantity = 1): Promise<Order> => {
    const { data } = await axiosInstance.post<Order>(`/services/${serviceId}/add_to_order/`, {
      quantity,
    });
    return data;
  },

  getOrders: async (params?: {
    status?: 'draft' | 'formed' | 'completed' | 'rejected' | 'deleted';
    date_from?: string;
    date_to?: string;
  }): Promise<Order[]> => {
    const { data } = await axiosInstance.get<Order[]>('/orders/', { params });
    return data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const { data } = await axiosInstance.get<Order>(`/orders/${id}/`);
    return data;
  },

  updateOrderItem: async (orderId: number, serviceId: number, quantity: number): Promise<Order> => {
    const { data } = await axiosInstance.put<Order>(`/orders/${orderId}/update_item/`, {
      service_id: serviceId,
      quantity,
    });
    return data;
  },

  removeItemFromOrder: async (orderId: number, serviceId: number): Promise<Order> => {
    const { data } = await axiosInstance.delete<Order>(`/orders/${orderId}/items/${serviceId}/`);
    return data;
  },

  deleteOrder: async (id: number): Promise<Order> => {
    const { data } = await axiosInstance.post<Order>(`/orders/${id}/delete/`);
    return data;
  },

  formOrder: async (id: number): Promise<Order> => {
    const { data } = await axiosInstance.put<Order>(`/orders/${id}/form/`);
    return data;
  },

  changeOrderStatus: async (
    id: number,
    status: 'draft' | 'formed' | 'completed' | 'rejected' | 'deleted'
  ): Promise<Order> => {
    const { data } = await axiosInstance.patch<Order>(`/orders/${id}/`, { status });
    return data;
  },

  addOrderComment: async (id: number, comment: string): Promise<Order> => {
    const { data } = await axiosInstance.patch<Order>(`/orders/${id}/`, { comment });
    return data;
  },

  getOrderDetails: async (id: number): Promise<Order> => {
    const { data } = await axiosInstance.get<Order>(`/orders/${id}/`);
    return data;
  },
};

export const apiService = api;
