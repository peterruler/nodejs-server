# ==============================================
# nodejs-server Docker Makefile
# ==============================================

# Variables
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = nodejs-server

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Default target
.PHONY: help
help: ## Show this help message
	@echo "$(GREEN)nodejs-server Docker Commands$(NC)"
	@echo "=============================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================
# Main Commands
# ==============================================

.PHONY: up
up: ## Start all services
	@echo "$(GREEN)Starting nodejs-server services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Services started!$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"
	@echo "Health:   http://localhost:3000/health"

.PHONY: down
down: ## Stop all services
	@echo "$(YELLOW)Stopping nodejs-server services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Services stopped!$(NC)"

.PHONY: restart
restart: down up ## Restart all services

# ==============================================
# Development Commands
# ==============================================

.PHONY: dev
dev: ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Development environment started!$(NC)"

.PHONY: build
build: ## Build all images
	@echo "$(YELLOW)Building all images...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Images built!$(NC)"

.PHONY: rebuild
rebuild: ## Rebuild all images from scratch
	@echo "$(YELLOW)Rebuilding all images from scratch...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Images rebuilt!$(NC)"

# ==============================================
# Database Commands
# ==============================================

.PHONY: db
db: ## Access database shell
	@echo "$(GREEN)Connecting to database...$(NC)"
	docker-compose exec db psql -U postgres -d issuetracker

.PHONY: db-reset
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)⚠️  WARNING: This will destroy all data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker-compose up -d db
	@echo "$(GREEN)✅ Database reset!$(NC)"

.PHONY: db-backup
db-backup: ## Backup database
	@echo "$(YELLOW)Creating database backup...$(NC)"
	docker-compose exec db pg_dump -U postgres issuetracker > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backup created!$(NC)"

# ==============================================
# Logs & Monitoring
# ==============================================

.PHONY: logs
logs: ## Show logs for all services
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: logs-backend
logs-backend: ## Show backend logs
	docker-compose -f $(COMPOSE_FILE) logs -f backend

.PHONY: logs-frontend
logs-frontend: ## Show frontend logs
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

.PHONY: logs-db
logs-db: ## Show database logs
	docker-compose -f $(COMPOSE_FILE) logs -f db

.PHONY: status
status: ## Show service status
	@echo "$(GREEN)Service Status:$(NC)"
	docker-compose -f $(COMPOSE_FILE) ps

.PHONY: health
health: ## Check service health
	@echo "$(GREEN)Health Checks:$(NC)"
	@echo "Backend Health:"
	@curl -s http://localhost:3000/health || echo "$(RED)❌ Backend unhealthy$(NC)"
	@echo "\nFrontend:"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:5173 || echo "$(RED)❌ Frontend unreachable$(NC)"

# ==============================================
# Cleanup Commands
# ==============================================

.PHONY: clean
clean: ## Remove containers and networks
	@echo "$(YELLOW)Cleaning up containers and networks...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down --remove-orphans
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

.PHONY: clean-all
clean-all: ## Remove everything (containers, networks, volumes, images)
	@echo "$(RED)⚠️  WARNING: This will remove all data and images!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker-compose -f $(COMPOSE_FILE) down --rmi all
	@echo "$(GREEN)✅ Complete cleanup done!$(NC)"

.PHONY: prune
prune: ## Remove unused Docker objects
	@echo "$(YELLOW)Pruning unused Docker objects...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✅ Pruning complete!$(NC)"

# ==============================================
# Shell Access
# ==============================================

.PHONY: shell-backend
shell-backend: ## Access backend container shell
	docker-compose exec backend sh

.PHONY: shell-frontend
shell-frontend: ## Access frontend container shell
	docker-compose exec frontend sh

.PHONY: shell-db
shell-db: ## Access database container shell
	docker-compose exec db sh

# ==============================================
# Testing
# ==============================================

.PHONY: test
test: ## Run tests in containers
	@echo "$(GREEN)Running tests...$(NC)"
	docker-compose exec backend npm test
	docker-compose exec frontend npm test
	@echo "$(GREEN)✅ Tests completed!$(NC)"

.PHONY: test-backend
test-backend: ## Run backend tests
	docker-compose exec backend npm test

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	docker-compose exec frontend npm test

# ==============================================
# Production Commands
# ==============================================

.PHONY: prod
prod: ## Start production environment
	@echo "$(GREEN)Starting production environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Production environment started!$(NC)"

.PHONY: deploy
deploy: build prod ## Build and deploy production

# ==============================================
# Utility Commands
# ==============================================

.PHONY: env
env: ## Create .env from example
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✅ .env file created from example$(NC)"; \
		echo "$(YELLOW)⚠️  Please review and update .env file$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env file already exists$(NC)"; \
	fi

.PHONY: update
update: ## Pull latest images and restart
	@echo "$(YELLOW)Updating images...$(NC)"
	docker-compose -f $(COMPOSE_FILE) pull
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Update complete!$(NC)"

# ==============================================
# Information Commands
# ==============================================

.PHONY: info
info: ## Show system information
	@echo "$(GREEN)System Information:$(NC)"
	@echo "Docker version: $$(docker --version)"
	@echo "Docker Compose version: $$(docker-compose --version)"
	@echo "Project: $(PROJECT_NAME)"
	@echo "Compose file: $(COMPOSE_FILE)"
	@echo ""
	@echo "$(GREEN)Container Status:$(NC)"
	@make status

.PHONY: ports
ports: ## Show port mappings
	@echo "$(GREEN)Port Mappings:$(NC)"
	@echo "Frontend:  http://localhost:5173"
	@echo "Backend:   http://localhost:3000"
	@echo "Database:  localhost:5432"
	@echo "Health:    http://localhost:3000/health"
