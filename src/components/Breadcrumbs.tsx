// src/components/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';
import '../index.css';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Если мы на главной странице (/), хлебные крошки не нужны
  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <Link to="/">Главная</Link>
      {pathnames.map((name, index) => {
        const isLast = index === pathnames.length - 1;

        // Логика для разных страниц
        if (name === 'product') {
          // Для /product/1 показываем "Каталог" со ссылкой на главную
          return (
            <span key="product" className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              <Link to="/">Каталог</Link>
            </span>
          );
        } else if (name === 'cart') {
          return (
            <span key="cart" className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Корзина</span>
            </span>
          );
        } else if (name === 'orders') {
          // Для /orders/history показываем "Заявки" как КОНЕЧНЫЙ элемент (неактивный)
          return (
            <span key="orders" className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Заявки</span>
            </span>
          );
        } else if (name === 'history') {
          // Пропускаем "history" — не показываем в крошках
          return null;
        }

        // Для остальных случаев (например, ID товара)
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        return (
          <span key={routeTo} className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current" aria-current="page">
                {name}
              </span>
            ) : (
              <Link to={routeTo}>{name}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
