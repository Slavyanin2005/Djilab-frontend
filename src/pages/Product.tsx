// src/pages/Product.tsx
import { findSimilarServices } from '../utils/embeddings';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { addToCart } from '../store/slices/cartSlice'; // ← addToCart, не addToOrder!
import { api } from '../services/api';
import type { Service } from '../types';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import '../index.css';

interface ProductProps {
  onAuthRequired?: () => void;
  onLogout: () => void;
}

export const Product: React.FC<ProductProps> = ({ onAuthRequired, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [service, setService] = useState<Service | null>(null);
  const [similarServices, setSimilarServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadService(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    const loadAllServices = async () => {
      try {
        const services = await api.getServices({});
        setAllServices(services);
      } catch (error) {
        console.error('Failed to load all services:', error);
      }
    };
    loadAllServices();
  }, []);

  useEffect(() => {
    if (service && allServices.length > 0) {
      loadSimilarServices();
    }
  }, [service, allServices]);

  const loadService = async (serviceId: number) => {
    try {
      const data = await api.getService(serviceId);
      setService(data);
    } catch (error) {
      console.error('Failed to load service:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarServices = async () => {
    if (!service || allServices.length === 0) {
      setLoadingSimilar(false);
      return;
    }
    setLoadingSimilar(true);
    let loaded = false;
    try {
      const response = await fetch(`/api/services/${service.id}/similar/?limit=4`);
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const similar = await response.json();
        if (similar.length > 0) {
          setSimilarServices(similar);
          loaded = true;
        }
      }
    } catch {}
    if (!loaded) {
      try {
        const similar = await findSimilarServices(service, allServices, 4);
        setSimilarServices(similar);
        loaded = true;
      } catch {}
    }
    if (!loaded && allServices.length > 0) {
      const random = allServices
        .filter((s) => s.id !== service.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setSimilarServices(random);
    }
    setLoadingSimilar(false);
  };

  const executeAddToCart = async () => {
    if (!service) return;
    try {
      await dispatch(
        addToCart({
          serviceId: service.id,
          quantity,
        })
      ).unwrap();

      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    await executeAddToCart();
  };

  const updateQuantity = (change: number) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + change)));
  };

  if (loading) {
    return (
      <div>
        <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div>
        <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Товар не найден
        </div>
      </div>
    );
  }

  const images = [
    service.image_key,
    service.image_key_2,
    service.image_key_3,
    service.image_key_4,
    service.image_key_5,
  ].filter(Boolean);
  const MEDIA_URL = 'http://localhost:9000/djilab-products/';

  return (
    <div>
      <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs />
      </div>
      <main className="container">
        <div className="product-detail">
          <div className="product-gallery">
            <div className="gallery-main">
              {service.video_key && (
                <div
                  className={`gallery-item ${activeImageIndex === 0 ? 'active' : ''}`}
                  data-type="video"
                >
                  <video className="detail-img" muted loop autoPlay controls>
                    <source src={`${MEDIA_URL}${service.video_key}`} type="video/mp4" />
                  </video>
                </div>
              )}
              {images.map((imgKey, index) => (
                <div
                  key={index}
                  className={`gallery-item ${activeImageIndex === (service.video_key ? index + 1 : index) ? 'active' : ''}`}
                  data-type="image"
                >
                  <img src={`${MEDIA_URL}${imgKey}`} alt={service.name} className="detail-img" />
                </div>
              ))}
              {images.length > 1 && (
                <>
                  <button
                    className="gallery-nav prev"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev > 0 ? prev - 1 : service.video_key ? images.length : images.length - 1
                      )
                    }
                  >
                    ‹
                  </button>
                  <button
                    className="gallery-nav next"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev < (service.video_key ? images.length : images.length - 1)
                          ? prev + 1
                          : 0
                      )
                    }
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            <div className="gallery-thumbs">
              {service.video_key && (
                <div
                  className={`thumb ${activeImageIndex === 0 ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(0)}
                >
                  <img src={`${MEDIA_URL}${service.image_key}`} alt="Видео превью" />
                  <span className="play-icon">▶</span>
                </div>
              )}
              {images.map((imgKey, index) => (
                <div
                  key={index}
                  className={`thumb ${activeImageIndex === (service.video_key ? index + 1 : index) ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(service.video_key ? index + 1 : index)}
                >
                  <img src={`${MEDIA_URL}${imgKey}`} alt={`Фото ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="detail">
            <h1>{service.name}</h1>
            <div className="detail-price">{service.price} ₽</div>
            <div className="availability">В наличии • Гарантия 24 мес.</div>
            <ul dangerouslySetInnerHTML={{ __html: service.description }} />
            <div className="actions">
              <div className="quantity-control">
                <button type="button" className="qty-minus" onClick={() => updateQuantity(-1)}>
                  −
                </button>
                <input type="number" value={quantity} min={1} max={99} readOnly />
                <button type="button" className="qty-plus" onClick={() => updateQuantity(1)}>
                  +
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary">
                В корзину
              </button>
            </div>
          </div>
        </div>
        <section className="similar-services" style={{ marginTop: '80px' }}>
          <h2 className="section-title">Похожие товары</h2>
          {loadingSimilar ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка похожих товаров...</p>
          ) : similarServices.length > 0 ? (
            <div className="products-grid">
              {similarServices.map((similarService) => (
                <ProductCard
                  key={similarService.id}
                  service={similarService}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Похожие товары не найдены
            </p>
          )}
        </section>
      </main>
    </div>
  );
};
