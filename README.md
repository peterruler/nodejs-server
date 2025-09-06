# nodejs-server

Ein TypeScript-basierter Fullstack Issue Tracker mit NestJS Backend und React Frontend.

## Screenshot
![Todo App Screenshot with Auth](_Project/Screenshot.png)

## Schnellstart

### 🐳 Mit Docker (Empfohlen)

```bash
# Gesamte Anwendung mit Docker Compose starten
docker-compose up -d

# Logs verfolgen
docker-compose logs -f

# Anwendung stoppen
docker-compose down
```

Die Anwendung ist verfügbar unter:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`

> 📋 **Detaillierte Docker-Anleitung** finden Sie in [`DOCKER.md`](./DOCKER.md)

### 💻 Lokale Entwicklung

### for development
- postgres : `docker run --name nodejs-server-db -e POSTGRES_DB=issuetracker -e POSTGRES_PASSWORD=foobert99 -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres`
- backend: `cd backend && npm i && npm run start:dev`
- frontend: `cd frontend && npm i && npm run dev`

### Voraussetzungen

- **Node.js** (Version 18 oder höher)
- **npm**
- **Docker** (für PostgreSQL Datenbank)

> 📋 **Detaillierte Docker-Installationsanweisungen** für alle Betriebssysteme finden Sie in [`backend/README.md`](./backend/README.md#docker-installation)

### Installation & Start

#### 1. Repository klonen
```bash
git clone <repository-url>
cd nodejs-server
```

#### 2. Backend Setup
```bash
cd backend

# Dependencies installieren
npm install

# PostgreSQL Datenbank starten (Docker)
./install-postgres.sh

# Datenbank initialisieren und Beispieldaten laden
npm run reset:backend

# Backend im Entwicklungsmodus starten
npm run start:dev
```

Das Backend läuft auf: `http://localhost:3000`

#### 3. Frontend Setup
```bash
cd frontend

# Dependencies installieren
npm install

# Frontend im Entwicklungsmodus starten
npm run dev
```

Das Frontend läuft auf: `http://localhost:5173`

### Backend Tests ausführen

```bash
cd backend

# Unit Tests einmalig
npm test

# Watch‑Modus
npm run test:watch

# Coverage‑Report
npm run test:cov
```

## Projektstruktur

```
nodejs-server/
├── backend/          # NestJS TypeScript API
│   ├── README.md     # Detaillierte Backend-Dokumentation
│   └── src/          # Backend Quellcode
└── frontend/         # React TypeScript Frontend
    ├── README.md     # Frontend-Dokumentation
    └── src/          # Frontend Quellcode
```

## Dokumentation

- **Backend**: Detaillierte Anleitung in [`backend/README.md`](./backend/README.md)
  - Docker Installation für alle Betriebssysteme
  - API Endpoints
  - Datenbank Management
  - Entwicklung & Tests

- **Frontend**: Anleitung in [`frontend/README.md`](./frontend/README.md)
  - React Komponenten
  - Entwicklung & Build
  - Tests

- **Authentication & Authorization**: Sicherheitskonzepte in [`AUTHENTICATION.md`](./AUTHENTICATION.md)
  - JWT Implementation Strategy
  - Role-based Access Control (RBAC)
  - Security Best Practices
  - Frontend Integration Guide

- **Docker Deployment**: Containerisierung in [`DOCKER.md`](./DOCKER.md)
  - Docker Compose Setup
  - Multi-stage Dockerfiles
  - Production Deployment
  - Monitoring & Security

## Technologie-Stack

### Backend
- **NestJS** - TypeScript Framework
- **TypeORM** - ORM für Datenbankoperationen
- **PostgreSQL** - Datenbank (Docker Container)
- **Class Validator** - Input-Validierung

### Frontend
- **React** - UI Framework
- **TypeScript** - Typisierung
- **Vite** - Build Tool & Dev Server
- **Jest** - Testing Framework

## API

Das Backend stellt eine REST API für Issue Tracking bereit:
- Projekte verwalten
- Issues erstellen und verwalten
- Health Check Endpoint

Detaillierte API-Dokumentation und Postman Collection finden Sie im Backend-Verzeichnis.
