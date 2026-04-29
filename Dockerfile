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
