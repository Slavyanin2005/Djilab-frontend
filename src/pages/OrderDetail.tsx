import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  fetchOrderDetails,
  updateOrderStatus,
  addOrderComment,
  clearCurrentOrder,
} from '../store/slices/ordersSlice';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { Order, OrderItem } from '../types';
import '../index.css';

interface OrderDetailProps {
  onAuthRequired?: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ onAuthRequired }) => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { currentOrder, loading, error } = useSelector((state: RootState) => state.orders);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(parseInt(id)));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  const isModerator = user?.is_staff;
  const isCreator = currentOrder?.creator?.id === user?.id;

  if (!isModerator && !isCreator) {
    return (
      <div>
        <Header onLogout={() => {}} onAuthRequired={onAuthRequired} />
        <main className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
          <h2>🔒 Доступ запрещён</h2>
          <p>Вы не можете просматривать эту заявку</p>
          <Link
            to="/orders/history"
            className="btn-primary"
            style={{ marginTop: '20px', display: 'inline-block' }}
          >
            ← Вернуться к списку
          </Link>
        </main>
      </div>
    );
  }

  if (loading && !currentOrder) {
    return (
      <div>
        <Header onLogout={() => {}} onAuthRequired={onAuthRequired} />
        <main className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
          Загрузка...
        </main>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div>
        <Header onLogout={() => {}} onAuthRequired={onAuthRequired} />
        <main className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
          <h2>❌ Ошибка</h2>
          <p>{error || 'Заявка не найдена'}</p>
          <Link
            to="/orders/history"
            className="btn-primary"
            style={{ marginTop: '20px', display: 'inline-block' }}
          >
            ← Вернуться к списку
          </Link>
        </main>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: Order['status']) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateOrderStatus({ id: currentOrder.id, status: newStatus })).unwrap();
    } catch (err) {
      alert('Ошибка при обновлении статуса: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(addOrderComment({ id: currentOrder.id, comment: newComment.trim() })).unwrap();
      setNewComment('');
    } catch (err) {
      alert('Ошибка при добавлении комментария: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: Order['status']): string => {
    const labels: Record<Order['status'], string> = {
      draft: 'Черновик',
      formed: 'Сформирован',
      completed: 'Завершён',
      rejected: 'Отклонён',
      deleted: 'Удалён',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: Order['status']): string => {
    const colors: Record<Order['status'], string> = {
      draft: 'var(--warning)',
      formed: 'var(--dji-blue)',
      completed: 'var(--success)',
      rejected: 'var(--error)',
      deleted: 'var(--light-gray)',
    };
    return colors[status] || 'var(--gray)';
  };

  const availableTransitions: Record<Order['status'], Order['status'][]> = {
    draft: ['formed', 'deleted'],
    formed: ['completed', 'rejected'],
    completed: ['formed'],
    rejected: ['formed'],
    deleted: [],
  };

  const canChangeStatus = isModerator;
  const canAddComment = isModerator || isCreator;

  const getModeratorDisplay = (): string => {
    const mod = currentOrder.moderator;
    if (!mod) return 'Не назначен';
    if (typeof mod === 'number') return `#${mod}`;
    return 'Неизвестно';
  };

  const renderComments = () => {
    if (!currentOrder.comment) return null;
    const lines = currentOrder.comment.split('\n').filter((line: string) => line.trim());
    if (lines.length === 0) return null;

    return (
      <div
        style={{
          background: 'white',
          padding: '16px',
          borderRadius: 'var(--radius)',
          marginBottom: '16px',
          borderLeft: '4px solid var(--dji-blue)',
          maxHeight: '200px',
          overflowY: 'auto',
        }}
      >
        <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Комментарии:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lines.reverse().map((line: string, idx: number) => (
            <div
              key={idx}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-alt)',
                borderRadius: 'var(--radius)',
                borderLeft: '3px solid var(--border)',
              }}
            >
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{line}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header onLogout={() => {}} onAuthRequired={onAuthRequired} />

      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs />
      </div>

      <main className="container" style={{ padding: '40px 0 100px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Заявка #{currentOrder.id}</h1>
            <p style={{ color: 'var(--gray)' }}>
              Создана: {new Date(currentOrder.created_at).toLocaleString('ru-RU')}
              {currentOrder.formed_at &&
                ` • Сформирована: ${new Date(currentOrder.formed_at).toLocaleString('ru-RU')}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                background: getStatusColor(currentOrder.status),
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {getStatusLabel(currentOrder.status)}
            </span>
            <Link
              to="/orders/history"
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              ← Назад
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Товары */}
            <section
              style={{
                background: 'var(--bg-alt)',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>📦 Товары в заявке</h3>
              {currentOrder.items.length > 0 ? (
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Услуга</th>
                      <th>Категория</th>
                      <th>Цена</th>
                      <th>Кол-во</th>
                      <th>Итого</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrder.items.map((item: OrderItem) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.service.name}</strong>
                          {item.is_main && (
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '0.8rem',
                                color: 'var(--dji-blue)',
                              }}
                            >
                              • Главная
                            </span>
                          )}
                        </td>
                        <td>{item.service.category}</td>
                        <td>{item.service.price} ₽</td>
                        <td>{item.quantity} шт.</td>
                        <td>
                          <strong>{item.subtotal} ₽</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>
                        Итого:{' '}
                      </td>
                      <td>
                        <strong>{currentOrder.total} ₽</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '20px' }}>
                  В заявке нет товаров
                </p>
              )}
            </section>

            {canAddComment && (
              <section
                style={{
                  background: 'var(--bg-alt)',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                }}
              >
                <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>💬 Комментарий</h3>

                {renderComments()}

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Добавить комментарий..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '1rem',
                      minHeight: '80px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting || !newComment.trim()}
                    style={{ padding: '12px 24px', alignSelf: 'flex-end' }}
                  >
                    {isSubmitting ? '...' : 'Отправить'}
                  </button>
                </form>
              </section>
            )}
          </div>

          <aside>
            <section
              style={{
                background: 'var(--bg-alt)',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                position: 'sticky',
                top: '96px',
              }}
            >
              <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>⚙️ Управление</h3>

              <div
                style={{
                  marginBottom: '24px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '4px' }}>
                  Создатель:
                </p>
                <p style={{ fontWeight: 600 }}>
                  {currentOrder.creator?.username || 'Неизвестно'}
                  {currentOrder.creator?.email && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--gray)',
                        fontWeight: 400,
                      }}
                    >
                      {currentOrder.creator.email}
                    </span>
                  )}
                </p>
              </div>

              {canChangeStatus && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '12px' }}>
                    Изменить статус:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableTransitions[currentOrder.status].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={isSubmitting}
                        style={{
                          padding: '12px 16px',
                          background: getStatusColor(status),
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          fontWeight: 600,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.6 : 1,
                          transition: 'transform 0.1s ease',
                        }}
                        onMouseOver={(e) =>
                          !isSubmitting && (e.currentTarget.style.transform = 'translateY(-1px)')
                        }
                        onMouseOut={(e) =>
                          !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')
                        }
                      >
                        → {getStatusLabel(status)}
                      </button>
                    ))}
                    {availableTransitions[currentOrder.status].length === 0 && (
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--light-gray)',
                          fontStyle: 'italic',
                        }}
                      >
                        Нет доступных переходов
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--light-gray)' }}>
                <p>
                  <strong>ID:</strong> {currentOrder.id}
                </p>
                <p>
                  <strong>Товаров:</strong> {currentOrder.items_count}
                </p>
                <p>
                  <strong>Сумма:</strong> {currentOrder.total} ₽
                </p>
                <p>
                  <strong>Модератор:</strong> {getModeratorDisplay()}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};
