import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface HeaderProps {
  onLogout: () => void;
  onAuthRequired?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onAuthRequired }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { itemsCount } = useSelector((state: RootState) => state.cart);

  const handleLogout = async () => {
    await onLogout();
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
              Корзина ({itemsCount})
            </Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* ✅ Имя пользователя — ссылка на профиль */}
                <Link
                  to="/profile"
                  style={{
                    color: 'var(--dark)',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--dji-blue)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--dark)')}
                >
                  👤 {user.username}
                  {user.is_staff && (
                    <span
                      style={{
                        background: 'var(--dji-blue)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </Link>
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
