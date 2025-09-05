# Backend - NestJS Issue Tracker API

Ein NestJS TypeScript Backend für ein Issue Tracking System mit PostgreSQL Datenbank.

## Voraussetzungen

- **Node.js** (Version 18 oder höher)
- **npm** (normalerweise mit Node.js installiert)
- **Docker** (für die PostgreSQL Datenbank)

### Docker Installation

#### macOS

**Option 1: Docker Desktop (empfohlen)**
1. Besuchen Sie [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Laden Sie Docker Desktop für Mac herunter
3. Öffnen Sie die `.dmg` Datei und ziehen Sie Docker in den Applications Ordner
4. Starten Sie Docker Desktop aus dem Applications Ordner
5. Folgen Sie den Setup-Anweisungen

**Option 2: Homebrew**
```bash
# Docker Desktop über Homebrew installieren
brew install --cask docker

# Oder nur Docker Engine (ohne GUI)
brew install docker
brew install docker-compose
```

#### Windows

**Option 1: Docker Desktop (empfohlen)**
1. Besuchen Sie [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Laden Sie Docker Desktop für Windows herunter
3. Führen Sie die `.exe` Datei aus und folgen Sie dem Installer
4. Starten Sie nach der Installation Docker Desktop
5. WSL 2 wird automatisch konfiguriert (falls nicht bereits installiert)

**Systemanforderungen:**
- Windows 10 64-bit (Version 1909 oder höher) oder Windows 11
- WSL 2 Feature aktiviert
- Hyper-V aktiviert (für Windows 10 Home: WSL 2 Backend)

#### Linux (Ubuntu/Debian)

**Option 1: Über APT Repository (empfohlen)**
```bash
# Alte Docker Versionen entfernen
sudo apt-get remove docker docker-engine docker.io containerd runc

# System aktualisieren
sudo apt-get update

# Abhängigkeiten installieren
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Docker's GPG Key hinzufügen
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Repository hinzufügen
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine installieren
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker ohne sudo verwenden (optional)
sudo usermod -aG docker $USER
# Logout und Login erforderlich oder:
newgrp docker

# Installation testen
docker run hello-world
```

**Option 2: Convenience Script**
```bash
# Docker's convenience script herunterladen und ausführen
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose installieren
sudo apt-get install docker-compose-plugin

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
```

#### Linux (CentOS/RHEL/Fedora)

**CentOS/RHEL:**
```bash
# Alte Docker Versionen entfernen
sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# Repository hinzufügen
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Docker installieren
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker starten und aktivieren
sudo systemctl start docker
sudo systemctl enable docker

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
```

**Fedora:**
```bash
# Repository hinzufügen
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo

# Docker installieren
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker starten und aktivieren
sudo systemctl start docker
sudo systemctl enable docker

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
```

#### Docker Installation überprüfen

Nach der Installation können Sie Docker testen:

```bash
# Docker Version anzeigen
docker --version

# Docker Compose Version anzeigen
docker compose version

# Test-Container ausführen
docker run hello-world
```

## Installation

### 1. Dependencies installieren

```bash
npm install
```

### 2. Datenbank Setup

#### PostgreSQL mit Docker starten

Das Projekt enthält ein Installationsskript für die Datenbank:

```bash
./install-postgres.sh
```

Dieses Skript startet einen PostgreSQL Docker Container mit folgenden Einstellungen:
- **Container Name**: `nodejs-server-db`
- **Datenbank**: `issuetracker`
- **Port**: `5432`
- **Passwort**: `foobert99`
- **Persistente Daten**: `pgdata` Volume

#### Manuelle Docker-Installation (alternative)

Wenn das Skript nicht funktioniert, können Sie den Container manuell starten:

```bash
docker run --name nodejs-server-db \
  -e POSTGRES_DB=issuetracker \
  -e POSTGRES_PASSWORD=foobert99 \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -d postgres
```

### 3. Umgebungsvariablen (optional)

Das System verwendet standardmäßig die folgenden Datenbankeinstellungen:
- Host: `localhost`
- Port: `5432`
- Datenbank: `issuetracker`
- Benutzer: `postgres`
- Passwort: `foobert99`

Falls Sie andere Einstellungen verwenden möchten, können Sie eine `.env` Datei erstellen:

```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=issuetracker
DB_USER=postgres
DB_PASSWORD=foobert99
PORT=3000
```

## Anwendung starten

### Entwicklungsmodus

```bash
npm run start:dev
```

Die Anwendung startet auf `http://localhost:3000` mit automatischem Neuladen bei Dateiänderungen.

### Debug-Modus

```bash
npm run start:debug
```

### Produktionsmodus

```bash
# Build erstellen
npm run build

# Anwendung starten
npm start
```

## Datenbank Management

### Datenbank erstellen/löschen

```bash
# Datenbank erstellen
npm run db:create

# Datenbank löschen
npm run db:drop
```

### Daten seeden

```bash
# Beispieldaten hinzufügen
npm run seed

# Datenbank zurücksetzen und neu seeden
npm run seed:reset
```

### Komplettes Backend Reset

```bash
npm run reset:backend
```

Dieser Befehl:
1. Löscht die Datenbank
2. Erstellt sie neu
3. Fügt Beispieldaten hinzu
4. Erstellt einen neuen Build

## API Endpoints

Die Anwendung stellt folgende Hauptendpunkte bereit:

- **Health Check**: `GET /health`
- **Projekte**: 
  - `GET /projects` - Alle Projekte auflisten
  - `POST /projects` - Neues Projekt erstellen
  - `PUT /projects/:id` - Projekt aktualisieren
  - `DELETE /projects/:id` - Projekt löschen
- **Issues**:
  - `GET /issues` - Alle Issues auflisten
  - `POST /issues` - Neues Issue erstellen
  - `PUT /issues/:id` - Issue aktualisieren
  - `DELETE /issues/:id` - Issue löschen

## Entwicklung

### Tests ausführen

```bash
# Unit Tests
npm test

# Tests mit Watch-Modus
npm run test:watch

# Test Coverage
npm run test:cov

# End-to-End Tests
npm run test:e2e
```

### Code-Qualität

```bash
# Linting
npm run lint

# Code-Formatierung
npm run format
```

## Docker Container Management

### Container Status prüfen

```bash
docker ps
```

### Container stoppen

```bash
docker stop nodejs-server-db
```

### Container starten (wenn gestoppt)

```bash
docker start nodejs-server-db
```

### Container und Daten komplett entfernen

```bash
docker stop nodejs-server-db
docker rm nodejs-server-db
docker volume rm pgdata
```

## Postman Collection

Das Projekt enthält eine Postman Collection unter `postman/` für API-Tests:
- `IssueTracker.postman_collection.json`
- `Local_Environment.postman_environment.json`

## Troubleshooting

### Häufige Probleme

1. **Port 5432 bereits belegt**
   ```bash
   # Anderen PostgreSQL Service stoppen
   brew services stop postgresql
   # oder anderen Port verwenden
   ```

2. **Docker Container läuft nicht**
   ```bash
   docker logs nodejs-server-db
   ```

3. **Datenbank-Verbindungsfehler**
   - Prüfen Sie, ob der Docker Container läuft
   - Überprüfen Sie die Umgebungsvariablen
   - Stellen Sie sicher, dass PostgreSQL erreichbar ist

4. **Node.js Version**
   ```bash
   node --version  # sollte >= 18 sein
   ```

## Architektur

Das Backend verwendet:
- **NestJS**: TypeScript Framework
- **TypeORM**: ORM für Datenbankoperationen
- **PostgreSQL**: Relationale Datenbank
- **Class Validator**: Input-Validierung
- **Jest**: Testing Framework

## Datenmodell

- **Project**: Projekte mit Namen und Status
- **Issue**: Issues mit Titel, Priorität, Fälligkeitsdatum und Projektzuordnung
