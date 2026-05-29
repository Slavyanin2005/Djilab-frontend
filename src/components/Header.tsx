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

  const hasDraftOrder = itemsCount > 0;

  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="nav-left">
            <Link to="/" className="logo">
              DJI<span>Lab</span>
            </Link>
            <div className="nav-links">
              <Link to="/">Каталог</Link>
              <Link to="/orders/history">Заявки</Link>
            </div>
          </div>

          <div className="nav-right">
            <Link
              to="/cart"
              className={`cart-btn ${!hasDraftOrder ? 'cart-btn-disabled' : ''}`}
              onClick={(e) => {
                if (!hasDraftOrder) {
                  e.preventDefault();
                  if (!user) {
                    onAuthRequired?.();
                  }
                }
              }}
              title={
                !hasDraftOrder
                  ? user
                    ? 'Нет активной заявки'
                    : 'Войдите, чтобы создать заявку'
                  : 'Перейти в корзину'
              }
            >
              Корзина ({itemsCount})
            </Link>

            {user ? (
              <div className="user-menu">
                <Link to="/profile" className="user-link">
                  {user.username}
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Выйти
                </button>
              </div>
            ) : (
              <button onClick={() => onAuthRequired?.()} className="btn-login">
                Войти
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
