import type { Service } from '../types';

export const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    name: 'pH-метр лабораторный HI2211',
    description:
      '<li>Точность: ±0.01 pH</li><li>Диапазон: -2.00 to 16.00 pH</li><li>Автокомпенсация температуры</li>',
    price: '45000.00',
    status: 'active',
    image_key: '',
    video_key: null,
    image_key_2: null,
    image_key_3: null,
    image_key_4: null,
    image_key_5: null,
    category: 'pH-метры',
    manufacturer: 'Hanna Instruments',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Аналитические весы OHAUS Pioneer',
    description:
      '<li>Предел взвешивания: 220 г</li><li>Точность: 0.001 г</li><li>Калибровка внутренняя</li>',
    price: '128500.00',
    status: 'active',
    image_key: 'scales_pioneer.jpg',
    video_key: 'scales_demo.mp4',
    image_key_2: null,
    image_key_3: null,
    image_key_4: null,
    image_key_5: null,
    category: 'Весы',
    manufacturer: 'OHAUS',
    created_at: '2024-02-10T12:00:00Z',
    updated_at: '2024-02-10T12:00:00Z',
  },
  {
    id: 3,
    name: 'Спектрофотометр УФ-видимый',
    description:
      '<li>Диапазон длин волн: 190–1100 нм</li><li>Фотометрическая точность: ±0.003 Abs</li><li>Автокалибровка</li>',
    price: '215000.00',
    status: 'active',
    image_key: '',
    video_key: null,
    image_key_2: null,
    image_key_3: null,
    image_key_4: null,
    image_key_5: null,
    category: 'Спектрофотометры',
    manufacturer: 'Shimadzu',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
];

// src/mocks/services.ts
export const DEFAULT_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f7" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EНет изображения%3C/text%3E%3C/svg%3E';
export const MEDIA_URL = 'http://localhost:9000/djilab-products/';
