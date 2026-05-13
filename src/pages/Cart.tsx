// src/pages/Cart.tsx
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Order, OrderItem, User } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import '../index.css';

interface CartProps {
  user: User | null;
  cartCount: number;
  onLogout: () => Promise<void>;
  onCartChange?: () => Promise<void>;
}

export const Cart: React.FC<CartProps> = ({ user, cartCount, onLogout, onCartChange }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const cartInfo = await apiService.getCartIcon();
      if (cartInfo.id) {
        const orderData = await apiService.getOrder(cartInfo.id);
        setOrder(orderData);
        setItems(orderData.items || []);
      } else {
        setOrder(null);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setOrder(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = async (itemId: number, action: 'increase' | 'decrease') => {
    if (!order) return;
    try {
      await apiService.updateQuantity(order.id, itemId, action);
      await loadCart();
      await onCartChange?.();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!order) return;
    try {
      await apiService.removeItemFromOrder(order.id, itemId);
      await loadCart();
      await onCartChange?.();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const deleteOrder = async () => {
    if (!order) return;
    if (confirm('Вы уверены, что хотите удалить заявку?')) {
      try {
        await apiService.deleteOrder(order.id);
        setOrder(null);
        setItems([]);
        await onCartChange?.();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Header user={user} cartCount={cartCount} onLogout={onLogout} />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Загрузка...
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !order) {
    return (
      <div>
        <Header user={user} cartCount={cartCount} onLogout={onLogout} />
        <div className="container" style={{ paddingTop: '20px' }}>
          <Breadcrumbs />
        </div>
        <main className="container">
          <div className="cart-page">
            <h1 className="section-title">Корзина</h1>
            <div className="cart-empty">
              <div className="cart-empty-icon">📋</div>
              <h2>Нет активной заявки</h2>
              <p>
                {user
                  ? 'У вас нет заявки в статусе "Черновик". Добавьте товар в корзину, чтобы создать новую заявку.'
                  : 'Пожалуйста, войдите, чтобы просмотреть корзину.'}
              </p>
              <a href="/" className="btn-primary">
                Перейти в каталог
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <Header user={user} cartCount={cartCount} onLogout={onLogout} />
        <div className="container" style={{ paddingTop: '20px' }}>
          <Breadcrumbs />
        </div>
        <main className="container">
          <div className="cart-page">
            <h1 className="section-title">Корзина</h1>
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h2>Ваша корзина пуста</h2>
              <p>Добавьте товары из каталога, чтобы оформить заказ</p>
              <a href="/" className="btn-primary">
                Вернуться в каталог
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header user={user} cartCount={cartCount} onLogout={onLogout} />
      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs />
      </div>
      <main className="container">
        <div className="cart-page">
          <h1 className="section-title">Корзина</h1>
          <div className="cart-content">
            <div className="cart-grid">
              <div className="cart-items">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Услуга</th>
                      <th>Цена</th>
                      <th>Кол-во</th>
                      <th>Итого</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="item-info">
                            <img
                              src={`http://localhost:9000/djilab-products/${item.service.image_key}`}
                              alt={item.service.name}
                              className="item-img"
                            />
                            <div>
                              <h3>{item.service.name}</h3>
                              <small>{item.service.category}</small>
                            </div>
                          </div>
                        </td>
                        <td className="item-price">{item.service.price} ₽</td>
                        <td>
                          <div className="quantity-control">
                            <button
                              onClick={() => updateQuantity(item.id, 'decrease')}
                              type="button"
                            >
                              −
                            </button>
                            <input type="number" value={item.quantity} readOnly />
                            <button
                              onClick={() => updateQuantity(item.id, 'increase')}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="item-total">{item.subtotal} ₽</td>
                        <td>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="remove-btn"
                            title="Удалить"
                            type="button"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <a href="/" className="continue-shopping">
                  ← Продолжить выбор
                </a>
              </div>
              <div className="cart-summary">
                <h2>Итого</h2>
                <div className="summary-row">
                  <span>Товары ({order.items_count} шт.)</span>
                  <span>{order.total} ₽</span>
                </div>
                <div className="summary-total">
                  <span>Всего</span>
                  <span>{order.total} ₽</span>
                </div>
                <button
                  onClick={deleteOrder}
                  className="checkout-btn"
                  style={{ background: 'var(--error)' }}
                >
                  Удалить заявку
                </button>
                <p className="secure-note">🔒 Безопасное оформление</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
