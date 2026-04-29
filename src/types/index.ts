export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  status: 'active' | 'deleted';
  image_key: string;
  video_key: string | null;
  image_key_2: string | null;
  image_key_3: string | null;
  image_key_4: string | null;
  image_key_5: string | null;
  category: string;
  manufacturer: string;
  created_at: string;
  updated_at: string;
}

// ✅ Новый интерфейс для регистрации
export interface RegisterData {
  username: string;
  password: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// ✅ Интерфейс ответа авторизации
export interface AuthResponse {
  message: string;
  token?: string;
}

export interface OrderItem {
  id: number;
  order: number;
  service: Service;
  service_id: number;
  quantity: number;
  position: number;
  is_main: boolean;
  subtotal: string;
}

export interface Order {
  id: number;
  status: 'draft' | 'formed' | 'completed' | 'rejected' | 'deleted';
  status_display: string;
  creator: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
  formed_at: string | null;
  completed_at: string | null;
  moderator: unknown | null;
  total: string;
  items_count: number;
  comment: string;
  items: OrderItem[];
}

export interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  phone: string;
  company: string;
  position: string;
  created_at: string;
}

export type CartContextType = {
  cartCount: number;
  draftOrder: Order | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
};
