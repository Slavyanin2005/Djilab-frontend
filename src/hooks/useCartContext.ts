import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import type { CartContextType } from '../types';

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
