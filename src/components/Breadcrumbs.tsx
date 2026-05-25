// src/components/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';
import '../index.css';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <Link to="/">Главная</Link>
      {pathnames.map((name, index) => {
        const isLast = index === pathnames.length - 1;

        // 📦 Каталог
        if (name === 'product') {
          return (
            <span key="product" className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              <Link to="/">Каталог</Link>
            </span>
          );
        }
        // 🛒 Корзина
        else if (name === 'cart') {
          return (
            <span key="cart" className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Корзина</span>
            </span>
          );
        }
        // 📋 Заявки
        else if (name === 'orders') {
          // Если это НЕ последний элемент (есть /:id после) — делаем ссылкой
          if (!isLast) {
            return (
              <span key="orders" className="breadcrumb-item">
                <span className="breadcrumb-separator">/</span>
                <Link to="/orders/history">Заявки</Link>
              </span>
            );
          }
          // Иначе — просто текст
          return (
            <span key="orders" className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Заявки</span>
            </span>
          );
        }
        // Пропускаем "history"
        else if (name === 'history') {
          return null;
        }
        // Числовой ID заявки — показываем как #23
        else if (!isNaN(Number(name))) {
          return (
            <span key={name} className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">#{name}</span>
            </span>
          );
        }
        // Остальные случаи
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
