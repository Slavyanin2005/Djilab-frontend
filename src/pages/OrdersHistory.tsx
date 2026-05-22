import { useEffect, useRef } from 'react'; // ✅ Добавляем useRef
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { fetchOrders, clearOrders } from '../store/slices/ordersSlice';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { User } from '../types';
import '../index.css';

export const OrdersHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, loading } = useSelector((state: RootState) => state.orders);

  // ✅ Реф для хранения ID интервала polling
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 🔹 Основной эффект: загрузка при изменении пользователя
  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
    } else {
      dispatch(clearOrders());
    }
  }, [dispatch, user]);

  // 🔹 Short polling: обновляем список каждые 30 секунд ТОЛЬКО для модератора
  useEffect(() => {
    // Запускаем polling только если пользователь — модератор
    if (user?.is_staff) {
      // ✅ Сразу делаем первый запрос, чтобы не ждать 30 секунд
      dispatch(fetchOrders());

      // ✅ Устанавливаем интервал
      pollingIntervalRef.current = setInterval(() => {
        dispatch(fetchOrders());
      }, 30000); // 30 секунд
    }

    // ✅ Очистка интервала при размонтировании или смене пользователя
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [dispatch, user?.is_staff]); // ✅ Зависим только от is_staff

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
      <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <>
      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs />
      </div>
      <main className="container">
        <div className="cart-page">
          <h1 className="section-title">
            {(user as User | null)?.is_staff ? 'Все заявки системы' : 'Мои заявки'}
          </h1>
          {orders.length > 0 ? (
            <div className="cart-content">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>№ Заявки</th>
                    <th>Дата создания</th>
                    <th>Создатель</th>
                    <th>Статус</th>
                    <th>Товаров</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          to={`/orders/${order.id}`}
                          style={{
                            color: 'var(--dji-blue)',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                          #{order.id}
                        </Link>
                      </td>
                      <td>{new Date(order.created_at).toLocaleString('ru-RU')}</td>
                      <td>{order.creator ? order.creator.username : 'Неизвестно'}</td>
                      <td>
                        <span className={getStatusClass(order.status)}>
                          {order.status_display || order.status}
                        </span>
                      </td>
                      <td>{order.items_count} шт.</td>
                      <td>
                        <strong>{order.total} ₽</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link to="/" className="continue-shopping">
                ← Вернуться в каталог
              </Link>
            </div>
          ) : (
            <div className="cart-empty">
              <div className="cart-empty-icon">📋</div>
              <h2>У вас пока нет заявок</h2>
              <p>Добавьте товары из каталога, чтобы создать первую заявку</p>
              <Link to="/" className="btn-primary">
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
};
