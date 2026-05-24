import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { updateQuantity, removeItem, deleteOrder, formOrder } from '../store/slices/cartSlice';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { OrderItem } from '../types';
import '../index.css';

interface CartProps {
  onAuthRequired?: () => void;
  onLogout: () => void; // ✅ Добавляем
}

export const Cart: React.FC<CartProps> = ({ onAuthRequired, onLogout }) => {
  // ✅ Деструктуризируем
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { draftOrder, items, loading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    if (draftOrder) {
      // Опционально: можно сбросить локальные флаги
    }
  }, [draftOrder]);

  const handleUpdateQuantity = (itemId: number, action: 'increase' | 'decrease') => {
    if (draftOrder) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        dispatch(
          updateQuantity({
            orderId: draftOrder.id,
            serviceId: item.service.id,
            action,
            currentQty: item.quantity,
          })
        );
      }
    }
  };

  const handleRemoveItem = (itemId: number) => {
    if (draftOrder) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        dispatch(
          removeItem({
            orderId: draftOrder.id,
            serviceId: item.service.id,
          })
        );
      }
    }
  };

  const handleDeleteOrder = async () => {
    if (!draftOrder) return;
    if (!confirm('Вы уверены, что хотите удалить заявку?')) {
      return;
    }
    try {
      await dispatch(deleteOrder(draftOrder.id)).unwrap();
    } catch (err: any) {
      console.error('❌ Ошибка при удалении заявки:', err);
      alert('Не удалось удалить заявку: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const handleFormOrder = async () => {
    if (!draftOrder) return;
    try {
      await dispatch(formOrder(draftOrder.id)).unwrap();
      navigate('/orders/history');
    } catch (err) {
      alert('❌ Ошибка при оформлении: ' + (err as Error).message);
    }
  };

  if (loading && !draftOrder) {
    return (
      <div>
        {/* ✅ Передаём реальный onLogout */}
        <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!user || !draftOrder) {
    return (
      <div>
        {/* ✅ Передаём реальный onLogout */}
        <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
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
              <Link to="/" className="btn-primary">
                Перейти в каталог
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        {/* ✅ Передаём реальный onLogout */}
        <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
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
              <Link to="/" className="btn-primary">
                Вернуться в каталог
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      {/* ✅ Передаём реальный onLogout */}
      <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
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
                    {items.map((item: OrderItem) => (
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
                              onClick={() => handleUpdateQuantity(item.id, 'decrease')}
                              type="button"
                            >
                              −
                            </button>
                            <input type="number" value={item.quantity} readOnly />
                            <button
                              onClick={() => handleUpdateQuantity(item.id, 'increase')}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="item-total">{item.subtotal} ₽</td>
                        <td>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
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
                <Link to="/" className="continue-shopping">
                  ← Продолжить выбор
                </Link>
              </div>
              <div className="cart-summary">
                <h2>Итого</h2>
                <div className="summary-row">
                  <span>Товары ({draftOrder.items_count} шт.)</span>
                  <span>{draftOrder.total} ₽</span>
                </div>
                <div className="summary-total">
                  <span>Всего</span>
                  <span>{draftOrder.total} ₽</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={handleFormOrder}
                    className="checkout-btn"
                    style={{ background: 'var(--success)' }}
                  >
                    ✅ Оформить заказ
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    className="checkout-btn"
                    style={{ background: 'var(--error)' }}
                  >
                    🗑️ Удалить заявку
                  </button>
                </div>
                <p className="secure-note">🔒 Безопасное оформление</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
