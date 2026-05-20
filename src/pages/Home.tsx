// src/pages/Home.tsx
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Service, User } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AuthModal } from '../components/AuthModal';
import '../index.css';

interface HomeProps {
  user: User | null;
  cartCount: number;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (data: { username: string; email: string; password: string }) => Promise<void>;
  onLogout: () => Promise<void>;
  onCartChange?: () => Promise<void>;
}

export const Home: React.FC<HomeProps> = ({
  user,
  cartCount,
  onLogin,
  onRegister,
  onLogout,
  onCartChange,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingServiceId, setPendingServiceId] = useState<number | null>(null);

  const loadServices = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (minPrice) {
        params.min_price = parseFloat(minPrice);
      }

      if (maxPrice) {
        params.max_price = parseFloat(maxPrice);
      }

      const data = await apiService.getServices(params);
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, minPrice, maxPrice]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const executeAddToCart = async (serviceId: number): Promise<void> => {
    try {
      await apiService.addToOrder(serviceId, 1);
      await onCartChange?.();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleAddToCart = async (serviceId: number): Promise<void> => {
    if (!user) {
      setPendingServiceId(serviceId);
      setShowAuthModal(true);
      return;
    }
    await executeAddToCart(serviceId);
  };

  const handleAuthSuccess = async (): Promise<void> => {
    if (pendingServiceId !== null) {
      await executeAddToCart(pendingServiceId);
      setPendingServiceId(null);
    }
    setShowAuthModal(false);
    await onCartChange?.();
  };

  const handleAuthRequired = (): void => {
    setShowAuthModal(true);
  };

  const resetFilters = (): void => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = searchQuery.trim() || minPrice || maxPrice;

  return (
    <div>
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingServiceId(null);
          }}
          onSuccess={handleAuthSuccess}
          onLogin={onLogin}
          onRegister={onRegister}
        />
      )}

      <Header
        user={user}
        cartCount={cartCount}
        onLogout={onLogout}
        onAuthRequired={handleAuthRequired}
      />

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
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="search-input"
              placeholder="Найти товар..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            step="100"
          />
          <span className="separator">—</span>
          <input
            type="number"
            className="filter-input"
            placeholder="До, ₽"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            step="100"
          />

          {hasActiveFilters && (
            <button onClick={resetFilters} className="btn-secondary">
              Сбросить
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '60px' }}>Загрузка...</p>
        ) : services.length > 0 ? (
          <div className="products-grid">
            {services.map((service) => (
              <ProductCard key={service.id} service={service} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="search-no-results">
            <p>Ничего не найдено по выбранным фильтрам</p>
            <button onClick={resetFilters} className="btn-secondary">
              Сбросить фильтры
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
