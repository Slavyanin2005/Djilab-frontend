import { axiosInstance } from './axios';
import type { Service, Order, User, RegisterData, UserProfile } from '../types';
import { MOCK_SERVICES } from '../mocks/services';

// Простой кэш в памяти: ключ → { данные, время_сохранения }
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 120000; // 2 минуты в миллисекундах

async function cachedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = cache[key];

  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`CACHE HIT (frontend): ${key}`);
    return cached.data as T;
  }

  console.log(`CACHE MISS (frontend): ${key}`);
  const data = await requestFn();
  cache[key] = { data, timestamp: now };
  return data;
}

// ✅ Helper для имитации задержки сети (для моков)
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ Helper: проверяем, можно ли использовать fallback на мок
const isNetworkError = (error: any): boolean => {
  // Возвращаем true, если ошибка связана с сетью или бэкендом
  return (
    !error.response || // Нет ответа от сервера (таймаут, нет сети)
    error.response?.status >= 500 || // Ошибка сервера
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNREFUSED' ||
    error.message?.includes('Network Error')
  );
};

export const api = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      const { data } = await axiosInstance.post<User>('/profiles/login/', {
        username,
        password,
      });
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock login');
        await delay();
        return {
          id: 1,
          username,
          email: `${username}@example.com`,
          is_staff: username === 'admin',
        };
      }
      // Если ошибка не сетевая (например, 401), пробрасываем дальше
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    try {
      const { data: res } = await axiosInstance.post<User>('/profiles/register/', data);
      return res;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock register');
        await delay();
        return {
          id: Date.now(),
          username: data.username,
          email: data.email,
          is_staff: false,
        };
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/profiles/logout/');
    } catch (error: any) {
      if (!isNetworkError(error)) {
        throw error;
      }
      // Если бэкенд недоступен — просто завершаем "успешно"
      console.warn('⚠️ Backend unavailable, mock logout');
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await axiosInstance.get<User>('/profiles/me/');
      return data;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return null;
      }
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock user');
        await delay();
        return {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_staff: false,
        };
      }
      console.warn('Auth check failed:', error.message);
      return null;
    }
  },

  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data } = await axiosInstance.get<UserProfile>('/profiles/me/');
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock profile');
        await delay();
        return {
          id: 1,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
          phone: '+7 (999) 123-45-67',
          company: 'Test Lab',
          position: 'Лаборант',
          created_at: '2024-01-01T00:00:00Z',
        };
      }
      return null;
    }
  },

  updateUserProfile: async (
    data: Partial<Pick<UserProfile, 'phone' | 'company' | 'position'>>
  ): Promise<UserProfile> => {
    try {
      const { data: res } = await axiosInstance.put<UserProfile>('/profiles/me/', data);
      return res;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock profile update');
        await delay();
        return {
          id: 1,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
          phone: data.phone || '+7 (999) 123-45-67',
          company: data.company || 'Test Lab',
          position: data.position || 'Лаборант',
          created_at: '2024-01-01T00:00:00Z',
        };
      }
      throw error;
    }
  },

  changeUserPassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await axiosInstance.put('/profiles/me/change_password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error: any) {
      if (!isNetworkError(error)) {
        throw error;
      }
      console.warn('⚠️ Backend unavailable, mock password change');
    }
  },

  getServices: async (params?: {
    search?: string;
    min_price?: string;
    max_price?: string;
    category?: string;
  }): Promise<Service[]> => {
    const cacheKey = `services:${JSON.stringify(params || {})}`;

    return cachedRequest(cacheKey, async () => {
      try {
        const { data } = await axiosInstance.get<Service[]>('/services/', { params });
        return data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          console.warn('⚠️ Backend unavailable, using mock services');
          await delay();

          // Применяем фильтрацию к mock-данным
          let filtered = [...MOCK_SERVICES];

          if (params?.search) {
            const search = params.search.toLowerCase();
            filtered = filtered.filter(
              (s) =>
                s.name.toLowerCase().includes(search) ||
                s.description.toLowerCase().includes(search) ||
                s.category.toLowerCase().includes(search)
            );
          }

          if (params?.min_price) {
            filtered = filtered.filter((s) => parseFloat(s.price) >= parseFloat(params.min_price!));
          }

          if (params?.max_price) {
            filtered = filtered.filter((s) => parseFloat(s.price) <= parseFloat(params.max_price!));
          }

          if (params?.category) {
            filtered = filtered.filter((s) => s.category === params.category);
          }

          console.log(`MOCK: Found ${filtered.length} services`);
          return filtered;
        }
        throw error;
      }
    });
  },

  getService: async (id: number): Promise<Service> => {
    try {
      const { data } = await axiosInstance.get<Service>(`/services/${id}/`);
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn(`⚠️ Backend unavailable, using mock service ${id}`);
        await delay();
        const service = MOCK_SERVICES.find((s) => s.id === id);
        if (!service) {
          throw new Error(`Service ${id} not found in mock data`);
        }
        return service;
      }
      throw error;
    }
  },

  getSimilarServices: async (id: number, limit = 4): Promise<Service[]> => {
    try {
      const { data } = await axiosInstance.get<Service[]>(`/services/${id}/similar/`, {
        params: { limit },
      });
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock similar services');
        await delay();
        const others = MOCK_SERVICES.filter((s) => s.id !== id);
        return others.sort(() => 0.5 - Math.random()).slice(0, limit);
      }
      throw error;
    }
  },

  getCartIcon: async (): Promise<{ id: number | null; items_count: number }> => {
    try {
      const { data } = await axiosInstance.get('/orders/cart_icon/');
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock cart icon');
        await delay();
        return { id: null, items_count: 0 };
      }
      throw error;
    }
  },

  addToOrder: async (serviceId: number, quantity = 1): Promise<Order> => {
    try {
      const { data } = await axiosInstance.post<Order>(`/services/${serviceId}/add_to_order/`, {
        quantity,
      });
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock add to order');
        await delay();
        const service = MOCK_SERVICES.find((s) => s.id === serviceId);
        if (!service) {
          throw new Error(`Service ${serviceId} not found in mock data`);
        }

        return {
          id: Date.now(),
          status: 'draft',
          status_display: 'Черновик',
          creator: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
          },
          created_at: new Date().toISOString(),
          formed_at: null,
          completed_at: null,
          moderator: null,
          total: (parseFloat(service.price) * quantity).toString(),
          items_count: 1,
          comment: '',
          items: [
            {
              id: Date.now(),
              order: 1,
              service,
              service_id: serviceId,
              quantity,
              position: 0,
              is_main: true,
              subtotal: (parseFloat(service.price) * quantity).toString(),
            },
          ],
        };
      }
      throw error;
    }
  },

  getOrders: async (params?: {
    status?: 'draft' | 'formed' | 'completed' | 'rejected' | 'deleted';
    date_from?: string;
    date_to?: string;
  }): Promise<Order[]> => {
    try {
      const { data } = await axiosInstance.get<Order[]>('/orders/', { params });
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock orders');
        await delay();
        return [];
      }
      throw error;
    }
  },

  getOrder: async (id: number): Promise<Order> => {
    try {
      const { data } = await axiosInstance.get<Order>(`/orders/${id}/`);
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, using mock order');
        await delay();
        throw new Error('Order not found in mock data');
      }
      throw error;
    }
  },

  updateOrderItem: async (orderId: number, serviceId: number, quantity: number): Promise<Order> => {
    try {
      const { data } = await axiosInstance.put<Order>(`/orders/${orderId}/update_item/`, {
        service_id: serviceId,
        quantity,
      });
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, mock update order item');
        await delay();
        throw new Error('Not implemented in mock mode');
      }
      throw error;
    }
  },

  removeItemFromOrder: async (orderId: number, serviceId: number): Promise<Order> => {
    try {
      const { data } = await axiosInstance.delete<Order>(`/orders/${orderId}/items/${serviceId}/`);
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, mock remove item');
        await delay();
        throw new Error('Not implemented in mock mode');
      }
      throw error;
    }
  },

  deleteOrder: async (id: number): Promise<Order> => {
    try {
      const { data } = await axiosInstance.post<Order>(`/orders/${id}/delete/`);
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, mock delete order');
        await delay();
        throw new Error('Not implemented in mock mode');
      }
      throw error;
    }
  },

  formOrder: async (id: number): Promise<Order> => {
    try {
      const { data } = await axiosInstance.put<Order>(`/orders/${id}/form/`);
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, mock form order');
        await delay();
        throw new Error('Not implemented in mock mode');
      }
      throw error;
    }
  },

  changeOrderStatus: async (
    id: number,
    status: 'draft' | 'formed' | 'completed' | 'rejected' | 'deleted'
  ): Promise<Order> => {
    try {
      const { data } = await axiosInstance.patch<Order>(`/orders/${id}/`, { status });
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, mock change status');
        await delay();
        throw new Error('Not implemented in mock mode');
      }
      throw error;
    }
  },

  addOrderComment: async (id: number, comment: string): Promise<Order> => {
    try {
      const { data } = await axiosInstance.patch<Order>(`/orders/${id}/`, { comment });
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, mock add comment');
        await delay();
        throw new Error('Not implemented in mock mode');
      }
      throw error;
    }
  },

  getOrderDetails: async (id: number): Promise<Order> => {
    try {
      const { data } = await axiosInstance.get<Order>(`/orders/${id}/`);
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend unavailable, mock order details');
        await delay();
        throw new Error('Order not found in mock data');
      }
      throw error;
    }
  },
};

export const apiService = api;
