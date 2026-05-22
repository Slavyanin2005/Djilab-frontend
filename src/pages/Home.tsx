import { useEffect, useCallback, useRef, type SyntheticEvent } from 'react'; // ✅ Добавляем useRef
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchServices,
  setSearch,
  setMinPrice,
  setMaxPrice,
  resetFilters,
} from '../store/slices/servicesSlice';
import { addToCart } from '../store/slices/cartSlice';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { Service } from '../types';
import '../index.css';

interface HomeProps {
  onAuthRequired: (action?: () => Promise<void>) => void;
}

export const Home: React.FC<HomeProps> = ({ onAuthRequired }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { services, loading, filters } = useSelector((state: RootState) => state.services);

  // ✅ Реф для пропуска первого вызова в useEffect фильтров
  const isInitialMount = useRef(true);

  // Загрузка товаров при монтировании
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // ✅ НОВЫЙ useEffect: перезагружает товары при изменении фильтров
  useEffect(() => {
    // Пропускаем первый рендер (уже загружено выше)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Debounce: ждём 300мс после изменения фильтра
    const timer = setTimeout(() => {
      dispatch(fetchServices());
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, filters.search, filters.minPrice, filters.maxPrice]);

  const handleAddToCart = useCallback(
    async (serviceId: number) => {
      const addToCartAction = async () => {
        await dispatch(addToCart({ serviceId, quantity: 1 }));
      };

      if (!user) {
        onAuthRequired(addToCartAction);
        return;
      }
      await addToCartAction();
    },
    [user, dispatch, onAuthRequired]
  );

  const handleSearch = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(fetchServices());
  };

  const hasActiveFilters = filters.search || filters.minPrice || filters.maxPrice;

  return (
    <>
      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs />
      </div>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Профессиональное оборудование
            <br />
            для химических лабораторий
          </h1>
          <p>Надёжные и точные приборы от ведущих производителей</p>
          <a href="#catalog" className="btn-primary">
            Смотреть каталог
          </a>
        </div>
      </section>
      <main className="container">
        <h2 className="section-title" id="catalog">
          Каталог
        </h2>
        <div className="search-wrapper">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Найти товар..."
              value={filters.search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
            />
            <button type="submit" className="search-btn" aria-label="Найти">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>
        <div className="price-filters">
          <input
            type="number"
            className="filter-input"
            placeholder="От, ₽"
            value={filters.minPrice}
            onChange={(e) => dispatch(setMinPrice(e.target.value))}
            min="0"
            step="100"
          />
          <span className="separator">—</span>
          <input
            type="number"
            className="filter-input"
            placeholder="До, ₽"
            value={filters.maxPrice}
            onChange={(e) => dispatch(setMaxPrice(e.target.value))}
            min="0"
            step="100"
          />
          {hasActiveFilters && (
            <button onClick={() => dispatch(resetFilters())} className="btn-secondary">
              Сбросить
            </button>
          )}
        </div>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '60px' }}>Загрузка...</p>
        ) : services.length > 0 ? (
          <div className="products-grid">
            {services.map((service: Service) => (
              <ProductCard key={service.id} service={service} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="search-no-results">
            <p>Ничего не найдено по выбранным фильтрам</p>
            <button onClick={() => dispatch(resetFilters())} className="btn-secondary">
              Сбросить фильтры
            </button>
          </div>
        )}
      </main>
    </>
  );
};
