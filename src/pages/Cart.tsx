import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Order, OrderItem } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCartContext } from '../hooks/useCartContext';
import '../index.css';

export const Cart: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCartContext();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      // ✅ Используем специальный эндпоинт для иконки корзины
      const cartInfo = await apiService.getCartIcon();

      if (cartInfo.id) {
        // Черновик есть — загружаем полную информацию о заказе
        const order = await apiService.getOrder(cartInfo.id);
        setOrder(order);
        setItems(order.items || []);
      } else {
        // Черновика нет — сбрасываем состояние
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
  };

  const updateQuantity = async (itemId: number, action: 'increase' | 'decrease') => {
    if (!order) return;
    try {
      await apiService.updateQuantity(order.id, itemId, action);
      await loadCart();
      await refreshCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!order) return;
    try {
      // ✅ Находим service_id по itemId, затем удаляем по service_id
      const item = order.items.find((i) => i.id === itemId);
      if (!item) throw new Error('Item not found');

      await apiService.removeItemFromOrder(order.id, item.service_id);
      await loadCart();
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const deleteOrder = async () => {
    if (!order) return;
    if (confirm('Вы уверены, что хотите удалить заявку?')) {
      try {
        await apiService.deleteOrder(order.id);
        // После удаления — перезагружаем данные и возвращаемся на главную
        await refreshCart();
        setOrder(null);
        setItems([]);
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Загрузка...
        </div>
        <Footer />
      </div>
    );
  }

  // 🔹 Случай 1: Черновика заказа НЕТ — показываем "Нет активной заявки"
  if (!order) {
    return (
      <div>
        <Header />
        <main className="container">
          <div className="cart-page">
            <h1 className="section-title">Корзина</h1>
            <div className="cart-empty">
              <div className="cart-empty-icon">📋</div>
              <h2>Нет активной заявки</h2>
              <p>
                У вас нет заявки в статусе "Черновик". Добавьте товар в корзину, чтобы создать новую
                заявку.
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

  // 🔹 Случай 2: Черновик есть, но товаров в нём НЕТ — показываем "Корзина пуста"
  if (items.length === 0) {
    return (
      <div>
        <Header />
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

  // 🔹 Случай 3: Черновик есть и в нём есть товары — показываем таблицу
  return (
    <div>
      <Header />

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
                <p className="secure-note">🔒︎ Безопасное оформление</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
