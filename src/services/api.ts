// src/services/api.ts
import type { Service, Order, RegisterData, User, AuthResponse } from '../types';
import { MOCK_SERVICES } from '../mocks/services';

const API_BASE_URL = '/api';

const CACHE_TTL_MS = 30_000; // 30 секунд для localStorage

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const getCachedData = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp < CACHE_TTL_MS) {
      console.log(`%c[FRONTEND CACHE] ✅ HIT: ${key}`, 'color: green; font-weight: bold');
      return data;
    } else {
      console.log(
        `%c[FRONTEND CACHE] ❌ MISS (expired): ${key}`,
        'color: orange; font-weight: bold'
      );
      localStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error(`[FRONTEND CACHE] ⚠️ Error reading cache for ${key}:`, error);
    return null;
  }
};

// Запись данных в кэш
const setCachedData = <T>(key: string, data: T): void => {
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cached));
    console.log(`%c[FRONTEND CACHE] 💾 SET: ${key}`, 'color: blue; font-weight: bold');
  } catch (error) {
    console.error(`[FRONTEND CACHE] ⚠️ Error writing cache for ${key}:`, error);
  }
};

// Очистка кэша по префиксу
const invalidateCache = (prefix: string): void => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
      console.log(`%c[FRONTEND CACHE] 🗑️ INVALIDATED: ${key}`, 'color: red; font-weight: bold');
    }
  });
};

const getCsrfToken = (): string | null => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    if (cookie.startsWith('djilab_csrftoken=')) {
      return cookie.split('=')[1];
    }
    if (cookie.startsWith('csrftoken=')) {
      return cookie.split('=')[1];
    }
  }
  return null;
};

const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers as HeadersInit);
  headers.set('Content-Type', 'application/json');

  if (options.method && options.method.toLowerCase() !== 'get') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const apiService = {
  useMock: false,

  getServices: async (params?: {
    search?: string;
    min_price?: number;
    max_price?: number;
    category?: string;
  }): Promise<Service[]> => {
    // Формируем ключ кэша на основе параметров
    const paramStr = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    ).toString();
    const cacheKey = `services_${paramStr || 'all'}`;

    // Проверяем фронтенд-кэш
    const cached = getCachedData<Service[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Кэш-мисс — делаем запрос
    if (apiService.useMock) {
      let services = [...MOCK_SERVICES];

      if (params?.search) {
        const query = params.search.toLowerCase();
        services = services.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.category.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query)
        );
      }

      if (params?.min_price !== undefined) {
        services = services.filter((s) => parseFloat(s.price) >= params.min_price!);
      }

      if (params?.max_price !== undefined) {
        services = services.filter((s) => parseFloat(s.price) <= params.max_price!);
      }

      if (params?.category) {
        services = services.filter((s) => s.category === params.category);
      }

      setCachedData(cacheKey, services);
      return services;
    }

    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    const data = await fetchApi<Service[]>(`/services/${query ? `?${query}` : ''}`);

    // 💾 Сохраняем в кэш
    setCachedData(cacheKey, data);

    return data;
  },

  getService: async (id: number): Promise<Service> => {
    if (apiService.useMock) {
      const service = MOCK_SERVICES.find((s) => s.id === id);
      if (!service) throw new Error('Service not found');
      return service;
    }
    return fetchApi<Service>(`/services/${id}/`);
  },

  getSimilarServices: async (id: number, limit: number = 4): Promise<Service[]> => {
    if (apiService.useMock) {
      return MOCK_SERVICES.filter((s) => s.id !== id).slice(0, limit);
    }
    return fetchApi<Service[]>(`/services/${id}/similar/?limit=${limit}`);
  },

  getOrders: async (): Promise<Order[]> => {
    if (apiService.useMock) return [];
    return fetchApi<Order[]>('/orders/');
  },

  getOrder: async (id: number): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    return fetchApi<Order>(`/orders/${id}/`);
  },

  getCartIcon: async (): Promise<{ id: number | null; items_count: number }> => {
    if (apiService.useMock) return { id: null, items_count: 0 };
    return fetchApi<{ id: number | null; items_count: number }>('/orders/cart_icon/');
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    if (apiService.useMock) return { message: 'OK', username: data.username };
    const result = await fetchApi<AuthResponse>('/profiles/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    invalidateCache('services_');
    return result;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    if (apiService.useMock) return { message: 'OK', username, id: 1, is_staff: false };
    const result = await fetchApi<AuthResponse>('/profiles/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    invalidateCache('services_');
    return result;
  },

  logout: async (): Promise<void> => {
    if (apiService.useMock) return;
    await fetchApi<void>('/profiles/logout/', {
      method: 'POST',
    });
    invalidateCache('services_');
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (apiService.useMock) return null;
    try {
      return fetchApi<User>('/profiles/me/');
    } catch {
      return null;
    }
  },

  addToOrder: async (serviceId: number, quantity: number = 1): Promise<Order> => {
    if (apiService.useMock) {
      alert(`Товар ${serviceId} добавлен в корзину (mock)`);
      return {} as Order;
    }
    const result = await fetchApi<Order>(`/services/${serviceId}/add_to_order/`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
    invalidateCache('services_');
    return result;
  },

  updateQuantity: async (
    orderId: number,
    itemId: number,
    action: 'increase' | 'decrease'
  ): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    return fetchApi<Order>(`/orders/${orderId}/update_item_legacy/`, {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, action }),
    });
  },

  removeItemFromOrder: async (orderId: number, itemId: number): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    return fetchApi<Order>(`/orders/${orderId}/remove_item/`, {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    });
  },

  deleteOrder: async (orderId: number): Promise<Order> => {
    if (apiService.useMock) return {} as Order;
    return fetchApi<Order>(`/orders/${orderId}/delete/`, {
      method: 'POST',
    });
  },
};
