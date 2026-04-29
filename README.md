# DJILab Frontend

Клиентская часть платформы для продажи лабораторного оборудования. Построена на **React 19** + **TypeScript** + **Vite** с использованием современных инструментов разработки.

---

## Содержание

- [Описание](#описание)
- [Структура проекта](#структура-проекта)
- [Технологии](#технологии)
- [Установка и запуск](#установка-и-запуск)
- [Переменные окружения](#переменные-окружения)
- [Code Style](#code-style)
- [Docker](#docker)
- [Pre-commit хуки](#pre-commit-хуки)

---

## Описание

Frontend предоставляет:
- **Современный UI** с адаптивным дизайном
- **Интерактивный каталог** товаров с поиском и фильтрацией
- **Корзину** с управлением заказами
- **Историю заявок** с отслеживанием статусов
- **REST API интеграцию** с backend (Django REST Framework)
- **Горячую перезагрузку** (HMR) через Vite

---

## Структура проекта

```
frontend/
├── node_modules/                       # Зависимости npm
├── public/                             # Статические файлы
│   └── vite.svg                        # Фавикон
├── src/                                # Исходный код
│   ├── components/                     # React компоненты
│   │   ├── Footer.tsx                  # Подвал сайта
│   │   ├── Header.tsx                  # Шапка сайта
│   │   └── ProductCard.tsx             # Карточка товара
│   ├── context/                        # React Context
│   │   ├── CartContext.context.ts      # Контекст корзины
│   │   └── CartContext.tsx             # Провайдер корзины
│   ├── hooks/                          # Кастомные хуки
│   │   ├── useCart.ts                  # Хук для счёта корзины
│   │   └── useCartContext.ts           # Хук для доступа к контексту
│   ├── pages/                          # Страницы приложения
│   │   ├── Cart.tsx                    # Корзина
│   │   ├── Home.tsx                    # Главная (каталог)
│   │   ├── OrdersHistory.tsx           # История заявок
│   │   └── Product.tsx                 # Страница товара
│   ├── services/                       # API сервисы
│   │   └── api.ts                      # Axios клиент
│   ├── types/                          # TypeScript типы
│   │   └── index.ts                    # Интерфейсы
│   ├── App.tsx                         # Корневой компонент
│   ├── index.css                       # Глобальные стили
│   ├── main.tsx                        # Точка входа
│   └── vite-env.d.ts                   # Типы Vite
├── .env                                # Переменные окружения (не коммитить!)
├── .env.example                        # Пример переменных
├── .gitignore                          # Git ignore файл
├── .prettierrc                         # Конфигурация Prettier
├── .prettierignore                     # Игнорирование для Prettier
├── Dockerfile                          # Docker образ
├── eslint.config.js                    # Конфигурация ESLint
├── index.html                          # HTML шаблон
├── package.json                        # Зависимости и скрипты
├── package-lock.json                   # Lock файл зависимостей
├── tsconfig.json                       # TypeScript конфигурация
├── tsconfig.app.json                   # TypeScript app конфигурация
├── tsconfig.node.json                  # TypeScript node конфигурация
├── vite.config.ts                      # Vite конфигурация
└── README.md                           # Описание проекта
```

---

## Технологии

| Технология | Версия | Назначение | Документация |
|------------|--------|------------|--------------|
| **React** | 19.2.0 | UI библиотека | [react.dev](https://react.dev/) |
| **TypeScript** | 5.9.3 | Типизация JavaScript | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) |
| **Vite** | 7.3.1 | Сборщик и dev-сервер | [vite.dev](https://vite.dev/) |
| **React Router DOM** | 7.13.1 | Маршрутизация | [reactrouter.com](https://reactrouter.com/) |
| **Axios** | 1.13.6 | HTTP клиент | [axios-http.com/docs](https://axios-http.com/docs/intro) |
| **ESLint** | 9.39.1 | Линтер кода | [eslint.org/docs](https://eslint.org/docs/) |
| **Prettier** | 3.8.1 | Форматтер кода | [prettier.io/docs](https://prettier.io/docs/) |
| **TypeScript ESLint** | 8.48.0 | Линтер для TypeScript | [typescript-eslint.io](https://typescript-eslint.io/) |
| **ESLint Plugin React Hooks** | 7.0.1 | Проверка хуков React | [github.com/facebook/react](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks) |
| **ESLint Plugin React Refresh** | 0.4.24 | Проверка Fast Refresh | [github.com/vitejs/vite-plugin-react](https://github.com/vitejs/vite-plugin-react) |

---

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/Slavyanin2005/DJILAB-project.git
cd DJILAB-project/frontend
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

```bash
# Скопируйте пример
copy .env.example .env

# Отредактируйте .env под вашу конфигурацию
```

### 4. Запуск dev-сервера

```bash
npm run dev
```

**Сервер доступен по адресу:** http://localhost:5173/

### 5. Сборка для production

```bash
npm run build
```

### 6. Preview production сборки

```bash
npm run preview
```

---

## Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `VITE_API_URL` | URL backend API | `http://localhost:8000/api` |

---

## Code Style

### Именование

| Тип | Стиль | Пример |
|-----|-------|--------|
| Переменные | `camelCase` | `cartCount`, `userName` |
| Функции | `camelCase` | `handleAddToCart()`, `loadServices()` |
| Компоненты | `PascalCase` | `ProductCard`, `OrderHistory` |
| Файлы компонентов | `PascalCase.tsx` | `ProductCard.tsx`, `Header.tsx` |
| Файлы утилит | `camelCase.ts` | `api.ts`, `utils.ts` |
| Константы | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_ITEMS` |
| Типы/Интерфейсы | `PascalCase` | `Service`, `OrderItem` |

### Инструменты

| Инструмент | Назначение | Команда |
|------------|------------|---------|
| **ESLint** | Линтинг TypeScript/React кода | `npm run lint` |
| **Prettier** | Форматирование кода | `npm run format` |

### Конфигурация

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**.prettierignore:**
```
node_modules
dist
build
coverage
*.min.js
package-lock.json
```

**eslint.config.js:**
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'prettier/prettier': 'error',
      'react-refresh/only-export-components': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
```

---

## Docker

### Сборка и запуск

```bash
# Сборка образа
docker-compose build frontend

# Запуск контейнера
docker-compose up -d frontend

# Просмотр логов
docker-compose logs frontend
```

### Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

EXPOSE 5173

# Запускаем Vite в режиме разработки с доступом извне
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## Pre-commit хуки

### Установка

```bash
# Установить pre-commit (в корне проекта)
pip install pre-commit

# Инициализировать хуки
pre-commit install
```

### Доступные хуки для Frontend

| Хук | Описание |
|-----|----------|
| `prettier-frontend` | Форматирование TypeScript/JS/CSS кода |
| `eslint-frontend` | Линтинг TypeScript/React кода |

### Запуск вручную

```bash
# Проверить все файлы
pre-commit run --all-files

# Проверить только изменённые файлы
pre-commit run
```

### Форматирование и линтинг

```bash
# Отформатировать все файлы
npm run format

# Проверить форматирование (без изменений)
npm run format:check

# Проверить код линтером
npm run lint
```

---

## API Интеграция

### Базовый URL

```
http://localhost:8000/api/
```

### Основные endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/services/` | Список всех услуг |
| `GET` | `/services/{id}/` | Детальная информация |
| `GET` | `/orders/` | Список заказов |
| `POST` | `/orders/` | Создать заказ |
| `POST` | `/orders/{id}/add_item/` | Добавить позицию |

### Пример запроса (api.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const apiService = {
  getServices: async () => {
    const response = await api.get('/services/');
    return response.data;
  },
  // ... другие методы
};
```

---

## Контакты

- **Email**: ostafinskijvadim@gmail.com
- **Телефон**: +7 (905) 978-65-14
- **Адрес репозитория**: https://github.com/Slavyanin2005/DJILAB-project

---

## Лицензия

Проект создан в учебных целях для курсовой работы.
