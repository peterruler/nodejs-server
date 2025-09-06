# Docker Deployment Guide

Eine umfassende Anleitung zur Containerisierung und Bereitstellung der nodejs-server Anwendung mit Docker.

## 📋 Übersicht

Diese Dokumentation beschreibt, wie Sie die gesamte nodejs-server Anwendung (Backend, Frontend und Datenbank) mit Docker containerisieren und bereitstellen können.

---

## 🐳 Docker Setup

### Voraussetzungen

- **Docker** (Version 20.x oder höher)
- **Docker Compose** (Version 2.x oder höher)

> 📋 **Docker-Installationsanweisungen** für alle Betriebssysteme finden Sie in [`backend/README.md`](./backend/README.md#docker-installation)

### Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │◄──►│   Backend       │◄──►│   PostgreSQL    │
│   (React/Vite)  │    │   (NestJS)      │    │   Database      │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5432    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 Schnellstart mit Docker Compose

### 1. Docker Compose Datei

Erstellen Sie eine `docker-compose.yml` im Root-Verzeichnis:

```yaml
version: '3.8'

services:
  # PostgreSQL Datenbank
  database:
    image: postgres:15-alpine
    container_name: nodejs-server-db
    environment:
      POSTGRES_DB: issuetracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: foobert99
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: nodejs-server-backend
    environment:
      NODE_ENV: production
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: issuetracker
      DB_USER: postgres
      DB_PASSWORD: foobert99
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      database:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: nodejs-server-frontend
    environment:
      VITE_API_URL: http://localhost:3000
    ports:
      - "5173:5173"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 2. Anwendung starten

```bash
# Alle Services starten
docker-compose up -d

# Logs verfolgen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

### 3. Anwendung stoppen

```bash
# Services stoppen
docker-compose down

# Services stoppen und Volumes löschen
docker-compose down -v
```

---

## 📁 Dockerfile Konfigurationen

### Backend Dockerfile

Erstellen Sie `backend/Dockerfile`:

```dockerfile
# Multi-stage build für optimale Image-Größe
FROM node:18-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package files kopieren
COPY package*.json ./
COPY tsconfig*.json ./

# Dependencies installieren
RUN npm ci --only=production && npm cache clean --force

# Source code kopieren
COPY src/ ./src/

# Application bauen
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Security: Non-root user erstellen
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Nur Production dependencies installieren
RUN npm ci --only=production && npm cache clean --force

# Built application kopieren
COPY --from=builder /app/dist ./dist

# Ownership ändern
RUN chown -R nestjs:nodejs /app
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Port freigeben
EXPOSE 3000

# Application starten
CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile

Erstellen Sie `frontend/Dockerfile`:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci

# Source code kopieren
COPY . .

# Application bauen
RUN npm run build

# Production stage mit nginx
FROM nginx:alpine AS production

# Built files kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx Konfiguration
COPY nginx.conf /etc/nginx/nginx.conf

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]
```

### Frontend nginx.conf

Erstellen Sie `frontend/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (optional)
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

---

## 🔧 Environment Configuration

### .env.docker

Erstellen Sie eine `.env.docker` Datei für Docker-spezifische Umgebungsvariablen:

```bash
# Database
DB_HOST=database
DB_PORT=5432
DB_NAME=issuetracker
DB_USER=postgres
DB_PASSWORD=foobert99

# Backend
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000

# Docker
COMPOSE_PROJECT_NAME=nodejs-server
```

### Docker Compose mit .env

```yaml
# docker-compose.yml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    env_file:
      - .env.docker
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    # ... rest of configuration
```

---

## 🛠️ Entwicklung mit Docker

### Development Setup

Erstellen Sie `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    container_name: nodejs-server-db-dev
    environment:
      POSTGRES_DB: issuetracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: foobert99
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  backend-dev:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: nodejs-server-backend-dev
    environment:
      NODE_ENV: development
      DB_HOST: database
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run start:debug
    depends_on:
      - database

  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: nodejs-server-frontend-dev
    environment:
      VITE_API_URL: http://localhost:3000
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev -- --host 0.0.0.0

volumes:
  postgres_dev_data:
```

### Development Dockerfile

`backend/Dockerfile.dev`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3000 9229

CMD ["npm", "run", "start:debug"]
```

---

## 📊 Monitoring & Logging

### Docker Compose mit Monitoring

```yaml
version: '3.8'

services:
  # ... existing services ...

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

### Logging Configuration

```bash
# Docker logs mit Rotation
docker-compose --log-driver json-file --log-opt max-size=10m --log-opt max-file=3 up -d

# Logs verfolgen
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

---

## 🔒 Security Best Practices

### Production Security

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    # ... configuration ...
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID

  frontend:
    # ... configuration ...
    security_opt:
      - no-new-privileges:true
    read_only: true
```

### Secrets Management

```bash
# Docker secrets für sensible Daten
echo "your-super-secret-jwt-key" | docker secret create jwt_secret -
echo "foobert99" | docker secret create db_password -
```

---

## 🚀 Deployment Strategien

### 1. Einzelserver Deployment

```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Health checks
docker-compose ps
curl http://localhost:3000/health
curl http://localhost:5173
```

### 2. Docker Swarm

```bash
# Swarm initialisieren
docker swarm init

# Stack deployen
docker stack deploy -c docker-compose.yml nodejs-server

# Services skalieren
docker service scale nodejs-server_backend=3
```

### 3. Kubernetes

Beispiel `k8s-deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-server-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: nodejs-server/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          value: postgres-service
```

---

## 🔧 Troubleshooting

### Häufige Probleme

#### 1. Container startet nicht

```bash
# Logs prüfen
docker-compose logs backend

# Container debuggen
docker-compose exec backend sh

# Health check manuell
docker-compose exec backend curl http://localhost:3000/health
```

#### 2. Datenbank-Verbindung

```bash
# Database container prüfen
docker-compose exec database psql -U postgres -d issuetracker

# Netzwerk testen
docker-compose exec backend ping database
```

#### 3. Port-Konflikte

```bash
# Verwendete Ports prüfen
docker-compose ps
netstat -tulpn | grep :3000

# Alternative Ports verwenden
# In docker-compose.yml: "3001:3000"
```

#### 4. Volume-Probleme

```bash
# Volumes auflisten
docker volume ls

# Volume-Inhalt prüfen
docker run --rm -v nodejs-server_postgres_data:/data alpine ls -la /data

# Volumes neu erstellen
docker-compose down -v
docker-compose up -d
```

---

## 📈 Performance Optimierung

### 1. Multi-stage Builds

```dockerfile
# Optimierte Image-Größe
FROM node:18-alpine AS deps
# ... dependencies only

FROM node:18-alpine AS builder
# ... build process

FROM node:18-alpine AS runner
# ... runtime only
```

### 2. Caching

```dockerfile
# Layer caching optimieren
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### 3. Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 📚 Useful Commands

### Docker Compose Commands

```bash
# Services starten
docker-compose up -d

# Bestimmten Service starten
docker-compose up -d backend

# Services neu bauen
docker-compose build

# Services neustarten
docker-compose restart

# Logs anzeigen
docker-compose logs -f

# Container shell
docker-compose exec backend sh

# Services skalieren
docker-compose up -d --scale backend=3

# Clean up
docker-compose down -v --remove-orphans
```

### Docker Commands

```bash
# Images auflisten
docker images

# Container auflisten
docker ps -a

# Image bauen
docker build -t nodejs-server/backend ./backend

# Container ausführen
docker run -d -p 3000:3000 nodejs-server/backend

# System bereinigen
docker system prune -a
```

---

*Dokumentation erstellt am: 6. September 2025*  
*Docker Version: 24.x*  
*Docker Compose Version: 2.x*  
*Status: Production Ready*
