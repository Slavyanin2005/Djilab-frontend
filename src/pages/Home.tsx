import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Service } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCartContext } from '../hooks/useCartContext';
import '../index.css';

export const Home: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { refreshCart } = useCartContext();

  useEffect(() => {
    loadServices();
  }, []);

  // ✅ Оборачиваем filterServices в useCallback
  const filterServices = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );
    setFilteredServices(filtered);
  }, [searchQuery, services]); // ← Зависимости

  useEffect(() => {
    filterServices();
  }, [filterServices]); // ← Теперь зависимость стабильная

  const loadServices = async () => {
    try {
      const data = await apiService.getServices();
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (serviceId: number) => {
    try {
      const orders = await apiService.getOrders();
      let order = orders.find((o) => o.status === 'draft');

      if (!order) {
        order = await apiService.createOrder();
      }

      await apiService.addToOrder(order.id, serviceId, 1);
      await refreshCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div>
      <Header />

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

        {loading ? (
          <p style={{ textAlign: 'center', padding: '60px' }}>Загрузка...</p>
        ) : filteredServices.length > 0 ? (
          <div className="products-grid">
            {filteredServices.map((service) => (
              <ProductCard key={service.id} service={service} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="search-no-results">
            <p>Ничего не найдено по запросу «{searchQuery}»</p>
            <button onClick={() => setSearchQuery('')} className="btn-secondary">
              Сбросить поиск
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
