#!/bin/bash

# LMS Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
ENV_FILE=".env.${ENVIRONMENT}"

echo -e "${GREEN}🚀 Starting LMS deployment for ${ENVIRONMENT} environment${NC}"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file $ENV_FILE not found${NC}"
    echo -e "${YELLOW}💡 Copy .env.${ENVIRONMENT}.example to $ENV_FILE and configure it${NC}"
    exit 1
fi

# Check if Docker Compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Docker Compose file $COMPOSE_FILE not found${NC}"
    exit 1
fi

# Load environment variables
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

echo -e "${GREEN}✅ Environment file loaded${NC}"

# Pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check if required environment variables are set
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs backups ssl monitoring scripts
chmod +x scripts/*.sh

# Backup current database (if in production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}💾 Creating database backup...${NC}"
    
    # Check if database is running
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump \
            -U "$POSTGRES_USER" \
            -d "$POSTGRES_DB" \
            > "backups/pre-deploy-backup-$(date +%Y%m%d-%H%M%S).sql"
        echo -e "${GREEN}✅ Database backup created${NC}"
    else
        echo -e "${YELLOW}⚠️  Database not running, skipping backup${NC}"
    fi
fi

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" pull

# Stop services gracefully
echo -e "${YELLOW}🛑 Stopping services...${NC}"
docker-compose -f "$COMPOSE_FILE" down --remove-orphans

# Start database and Redis first
echo -e "${YELLOW}🗄️  Starting database and Redis...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d postgres redis

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
timeout=60
counter=0
while ! docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ Database failed to start within $timeout seconds${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done
echo -e "\n${GREEN}✅ Database is ready${NC}"

# Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker-compose -f "$COMPOSE_FILE" run --rm backend npx prisma migrate deploy

# Start backend
echo -e "${YELLOW}🔧 Starting backend service...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d backend

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
timeout=60
counter=0
while ! curl -f http://localhost:5000/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ Backend failed to start within $timeout seconds${NC}"
        docker-compose -f "$COMPOSE_FILE" logs backend
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done
echo -e "\n${GREEN}✅ Backend is ready${NC}"

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend service...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d frontend

# Wait for frontend to be ready
echo -e "${YELLOW}⏳ Waiting for frontend to be ready...${NC}"
timeout=30
counter=0
frontend_port=$([ "$ENVIRONMENT" = "production" ] && echo "80" || echo "8080")
while ! curl -f http://localhost:$frontend_port/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ Frontend failed to start within $timeout seconds${NC}"
        docker-compose -f "$COMPOSE_FILE" logs frontend
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done
echo -e "\n${GREEN}✅ Frontend is ready${NC}"

# Clean up old images and containers
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker system prune -f

# Final health check
echo -e "${YELLOW}🏥 Running final health checks...${NC}"

# Check all services
services=("postgres" "redis" "backend" "frontend")
for service in "${services[@]}"; do
    if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not running${NC}"
        docker-compose -f "$COMPOSE_FILE" logs "$service"
        exit 1
    fi
done

# Test API endpoints
echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    exit 1
fi

if curl -f http://localhost:$frontend_port > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    exit 1
fi

# Display service status
echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "\n${YELLOW}📊 Service Status:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

# Display access URLs
echo -e "\n${YELLOW}🌐 Access URLs:${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "Frontend: ${GREEN}http://localhost${NC}"
    echo -e "Backend API: ${GREEN}http://localhost:5000${NC}"
else
    echo -e "Frontend: ${GREEN}http://localhost:8080${NC}"
    echo -e "Backend API: ${GREEN}http://localhost:5001${NC}"
fi

echo -e "\n${GREEN}✨ LMS deployment completed successfully!${NC}"

# Optional: Send notification (uncomment and configure as needed)
# if [ -n "$SLACK_WEBHOOK_URL" ]; then
#     curl -X POST -H 'Content-type: application/json' \
#         --data "{\"text\":\"🚀 LMS $ENVIRONMENT deployment completed successfully!\"}" \
#         "$SLACK_WEBHOOK_URL"
# fi
