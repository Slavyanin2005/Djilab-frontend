import { Link } from 'react-router-dom';
import { useCartContext } from '../hooks/useCartContext';

export const Header: React.FC = () => {
  const { cartCount } = useCartContext();

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            DJI<span>Lab</span>
          </Link>
          <div className="nav-links">
            <Link to="/">Каталог</Link>
            <Link to="/orders/history">Заявки</Link>
          </div>
          <Link to="/cart" className="cart-btn">
            Корзина ({cartCount})
          </Link>
        </nav>
      </div>
    </header>
  );
};
