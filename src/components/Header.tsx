import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../hooks/useCartContext';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

export const Header: React.FC = () => {
  const { cartCount } = useCartContext();
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            window.location.reload(); // Перезагрузка для обновления UI
          }}
        />
      )}

      <div className="container">
        <nav className="nav">
          {/* 1. ЛЕВАЯ ЧАСТЬ: Лого + Ссылки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link to="/" className="logo">
              DJI<span>Lab</span>
            </Link>
            <div className="nav-links">
              <Link to="/">Каталог</Link>
              <Link to="/orders/history">Заявки</Link>
            </div>
          </div>

          {/* 2. ПРАВАЯ ЧАСТЬ: Корзина + Вход */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/cart" className="cart-btn">
              Корзина ({cartCount})
            </Link>

            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--dark)', fontWeight: 500, fontSize: '0.95rem' }}>
                  {user.username}
                  {user.is_staff && (
                    <span
                      style={{
                        background: 'var(--dji-blue)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        marginLeft: '6px',
                        verticalAlign: 'middle',
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '999px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: 'var(--gray)',
                  }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary" // Используем глобальный класс кнопки
                style={{ padding: '10px 24px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Войти
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
