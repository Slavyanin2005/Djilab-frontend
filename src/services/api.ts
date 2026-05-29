import { axiosInstance } from './axios';
import type { Service, Order, User, RegisterData, UserProfile } from '../types';
import { MOCK_SERVICES } from '../mocks/services';

const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 120000;

async function cachedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = cache[key];

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const data = await requestFn();
  cache[key] = { data, timestamp: now };
  return data;
}

const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const isNetworkError = (error: any): boolean => {
  return (
    !error.response ||
    error.response?.status >= 404 ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNREFUSED' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('Request failed with status code 404')
  );
};

export const api = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      const response = await axiosInstance.post<{
        message?: string;
        username?: string;
        id?: number;
        is_staff?: boolean;
        csrfToken?: string;
      }>('/profiles/login/', {
        username,
        password,
      });

      const { data } = response;

      // Гарантированно сохраняем токен из ответа
      if (data.csrfToken) {
        localStorage.setItem('csrftoken', data.csrfToken);
        console.log(
          '[api] Saved csrfToken to localStorage:',
          data.csrfToken.substring(0, 10) + '...'
        );
      }

      // Также пробуем сохранить из заголовков (на всякий случай)
      const setCookie = response.headers?.['set-cookie'];
      if (setCookie) {
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const cookie of cookies) {
          if (cookie.startsWith('csrftoken=')) {
            const token = cookie.split(';')[0].split('=')[1];
            if (token) {
              localStorage.setItem('csrftoken', token);
              console.log('[api] Saved csrfToken from set-cookie header');
            }
            break;
          }
        }
      }

      const { csrfToken, ...userData } = data;
      return userData as User;
    } catch (error: any) {
      if (isNetworkError(error)) {
        await delay();
        return {
          id: 1,
          username,
          email: `${username}@example.com`,
          is_staff: username === 'admin',
        };
      }
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    try {
      const { data: res } = await axiosInstance.post<User>('/profiles/register/', data);
      return res;
    } catch (error: any) {
      if (isNetworkError(error)) {
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
        await delay();
        return {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_staff: false,
        };
      }
      return null;
    }
  },

  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data } = await axiosInstance.get<UserProfile>('/profiles/me/');
      return data;
    } catch (error: any) {
      if (isNetworkError(error)) {
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
          await delay();

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
        await delay();
        throw new Error('Order not found in mock data');
      }
      throw error;
    }
  },
};

export const apiService = api;
