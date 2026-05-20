FROM node:20-alpine

WORKDIR /app

# Копируем только manifest-файлы
COPY package*.json ./

# Удаляем lock-файл и ставим зависимости
RUN rm -f package-lock.json && npm install --production=false

# Копируем исходный код (node_modules игнорируется через .dockerignore)
COPY . .

# Открываем порт для Vite
EXPOSE 5173

# Запускаем dev-сервер с хостом 0.0.0.0 для доступа извне
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
