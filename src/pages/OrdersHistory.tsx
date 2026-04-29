import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Order } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCartContext } from '../hooks/useCartContext';
import '../index.css';

export const OrdersHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCartContext();

  // ✅ Оборачиваем loadOrders в useCallback
  const loadOrders = useCallback(async () => {
    try {
      const data = await apiService.getOrders();
      setOrders(data);
      await refreshCart();
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]); // ← Зависимость: refreshCart

  useEffect(() => {
    loadOrders();
  }, [loadOrders]); // ← Теперь зависимость стабильная

  const getStatusClass = (status: string): string => {
    const classes: { [key: string]: string } = {
      draft: 'order-status draft',
      formed: 'order-status formed',
      completed: 'order-status completed',
      rejected: 'order-status rejected',
      deleted: 'order-status deleted',
    };
    return classes[status] || 'order-status';
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

  return (
    <div>
      <Header />

      <main className="container">
        <div className="cart-page">
          <h1 className="section-title">Мои заявки</h1>

          {orders.length > 0 ? (
            <div className="cart-content">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>№ Заявки</th>
                    <th>Дата создания</th>
                    <th>Статус</th>
                    <th>Товаров</th>
                    <th>Сумма</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>{new Date(order.created_at).toLocaleString('ru-RU')}</td>
                      <td>
                        <span className={getStatusClass(order.status)}>
                          {order.status_display || order.status}
                        </span>
                      </td>
                      <td>{order.items_count} шт.</td>
                      <td>
                        <strong>{order.total} ₽</strong>
                      </td>
                      <td>
                        {order.status === 'draft' ? (
                          <a
                            href="/cart"
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                          >
                            Открыть
                          </a>
                        ) : (
                          <span style={{ color: 'var(--light-gray)', fontSize: '0.9rem' }}>
                            Просмотр
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a href="/" className="continue-shopping">
                ← Вернуться в каталог
              </a>
            </div>
          ) : (
            <div className="cart-empty">
              <div className="cart-empty-icon">📋</div>
              <h2>У вас пока нет заявок</h2>
              <p>Добавьте товары из каталога, чтобы создать первую заявку</p>
              <a href="/" className="btn-primary">
                Перейти в каталог
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
