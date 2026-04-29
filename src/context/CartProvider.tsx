import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { Order } from '../types';
import { CartContext } from './CartContext';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    try {
      // ✅ Используем специальный эндпоинт для получения черновика
      const cartInfo = await apiService.getCartIcon();

      if (cartInfo.id) {
        // Если есть черновик — загружаем его полные данные
        const draft = await apiService.getOrder(cartInfo.id);
        setDraftOrder(draft);
        setCartCount(cartInfo.items_count);
      } else {
        // Черновика нет
        setDraftOrder(null);
        setCartCount(0);
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      setCartCount(0);
      setDraftOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, draftOrder, loading, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
