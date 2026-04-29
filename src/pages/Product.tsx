import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Service } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCartContext } from '../hooks/useCartContext';
import '../index.css';

export const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { refreshCart } = useCartContext();

  useEffect(() => {
    if (id) {
      loadService(parseInt(id));
    }
  }, [id]);

  const loadService = async (serviceId: number) => {
    try {
      const data = await apiService.getService(serviceId);
      setService(data);
    } catch (error) {
      console.error('Failed to load service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!service) return;
    try {
      const orders = await apiService.getOrders();
      let order = orders.find((o) => o.status === 'draft');

      if (!order) {
        order = await apiService.createOrder();
      }

      await apiService.addToOrder(order.id, service.id, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const updateQuantity = (change: number) => {
    setQuantity((prev) => {
      const newValue = prev + change;
      return Math.max(1, Math.min(99, newValue));
    });
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Загрузка...
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Товар не найден
        </div>
        <Footer />
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
      <Header />

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
            <div className="availability">В наличии • Гарантия 24 мес. • Доставка 2–5 дней</div>
            <ul dangerouslySetInnerHTML={{ __html: service.description }} />

            <div className="actions">
              <div className="quantity-control">
                <button type="button" className="qty-minus" onClick={() => updateQuantity(-1)}>
                  −
                </button>
                <input type="number" id="quantity" value={quantity} min={1} max={99} readOnly />
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
      </main>

      <Footer />
    </div>
  );
};
