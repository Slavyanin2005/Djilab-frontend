import type { Service } from '../types';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  service: Service;
  onAddToCart: (serviceId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ service, onAddToCart }) => {
  return (
    <Link to={`/product/${service.id}`} className="product-card">
      <img
        src={`http://localhost:9000/djilab-products/${service.image_key}`}
        alt={service.name}
        className="product-img"
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
