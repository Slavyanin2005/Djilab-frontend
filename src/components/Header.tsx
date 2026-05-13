// src/components/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  cartCount: number;
  onLogout: () => Promise<void>;
  onAuthRequired?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, cartCount, onLogout, onAuthRequired }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link to="/" className="logo">
              DJI<span>Lab</span>
            </Link>
            <div className="nav-links">
              <Link to="/">Каталог</Link>
              <Link to="/orders/history">Заявки</Link>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/cart" className="cart-btn">
              Корзина ({cartCount})
            </Link>
            {user ? (
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
                onClick={() => onAuthRequired?.()}
                className="btn-primary"
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
