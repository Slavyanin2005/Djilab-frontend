import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useCart = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadCartCount = async () => {
      try {
        const orders = await apiService.getOrders();
        const draftOrder = orders.find((o) => o.status === 'draft');
        if (isMounted) {
          setCartCount(draftOrder?.items_count || 0);
        }
      } catch (error) {
        console.error('Failed to load cart count:', error);
        if (isMounted) {
          setCartCount(0);
        }
      }
    };

    loadCartCount();

    return () => {
      isMounted = false;
    };
  }, []);

  return { cartCount, setCartCount };
};
