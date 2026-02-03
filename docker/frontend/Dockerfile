# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos manifests primero para cache
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copiamos el código del frontend
COPY frontend/ ./

# Build producción (Vite)
RUN npm run build

# ---------- Runtime stage (Nginx) ----------
FROM nginx:1.27-alpine

# Nginx config (SPA + reverse proxy /api)
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build de Vite al docroot de nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
