// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import type { Service } from '../types';
import { DEFAULT_IMAGE, MEDIA_URL } from '../mocks/services';

interface ProductCardProps {
  service: Service;
  onAddToCart: (serviceId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ service, onAddToCart }) => {
  const imageUrl = service.image_key ? `${MEDIA_URL}${service.image_key}` : DEFAULT_IMAGE;

  return (
    <Link to={`/product/${service.id}`} className="product-card">
      <img
        src={imageUrl}
        alt={service.name}
        className="product-img"
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
        }}
      />
      <div className="product-info">
        <h3 className="product-title">{service.name}</h3>
        <div className="product-price">{service.price} ₽</div>
        <button
          className="add-btn"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(service.id);
          }}
        >
          В корзину
        </button>
      </div>
    </Link>
  );
};
