# Installation Guide

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   ```bash
   # Check version
   node --version
   npm --version
   ```
   Download from: https://nodejs.org/

2. **PostgreSQL** (v13.0 or higher)
   ```bash
   # Check version
   psql --version
   ```
   Download from: https://www.postgresql.org/download/

3. **Git**
   ```bash
   # Check version
   git --version
   ```
   Download from: https://git-scm.com/

### Optional Software

4. **Redis** (v6.0 or higher) - For caching and sessions
   ```bash
   # Check version
   redis-server --version
   ```

5. **Docker** - For containerized development
   ```bash
   # Check version
   docker --version
   docker-compose --version
   ```

## 🚀 Quick Installation

### Option 1: Automated Setup (Recommended)

#### Windows
```bash
# Run the automated setup script
start-lms.bat
```

#### macOS/Linux
```bash
# Make script executable
chmod +x start-lms.sh

# Run the setup script
./start-lms.sh
```

### Option 2: Docker Setup
```bash
# Clone repository
git clone <repository-url>
cd lms-application

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

## 🔧 Manual Installation

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd lms-application
```

### Step 2: Database Setup

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lms_db;

# Create user (optional)
CREATE USER lms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;

# Exit PostgreSQL
\q
```

#### Alternative: Using pgAdmin
1. Open pgAdmin
2. Create new database named `lms_db`
3. Note connection details for configuration

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

#### Backend Environment Configuration (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Email (optional - for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@yourlms.com"
FROM_NAME="Your LMS"

# File Upload (optional)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

#### Generate JWT Secrets
```bash
# Generate secure random strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed
```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local file
nano .env.local
```

#### Frontend Environment Configuration (.env.local)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# App Configuration
REACT_APP_APP_NAME="Your LMS"
REACT_APP_APP_VERSION="1.0.0"

# External Services (optional)
REACT_APP_GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
REACT_APP_SENTRY_DSN="your-sentry-dsn"

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_STREAMING=true
REACT_APP_ENABLE_MOBILE_APP=true
```

#### Start Frontend Server
```bash
# Development mode
npm start

# Production build
npm run build
npm run serve
```

### Step 5: Mobile App Setup (Optional)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios
pod install
cd ..

# Start Metro bundler
npx react-native start

# Run on iOS (macOS only)
npx react-native run-ios

# Run on Android
npx react-native run-android
```

## ✅ Verification

### 1. Check Services
```bash
# Backend health check
curl http://localhost:5000/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}
```

### 2. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database Studio**: `npx prisma studio` (from backend directory)

### 3. Test Connection
1. Go to http://localhost:3000/debug/connection-test
2. All tests should show green checkmarks
3. If any tests fail, check the troubleshooting section

### 4. Create Test Account
1. Go to http://localhost:3000/register
2. Create a new account
3. Login with your credentials
4. Explore the dashboard

## 🔧 Configuration Options

### Database Configuration

#### PostgreSQL Settings
```sql
-- Recommended PostgreSQL settings for development
-- Add to postgresql.conf

max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Connection Pooling
```env
# In .env file
DATABASE_URL="postgresql://username:password@localhost:5432/lms_db?connection_limit=20&pool_timeout=20"
```

### Performance Optimization

#### Backend Optimization
```env
# In backend/.env
NODE_ENV="production"
LOG_LEVEL="warn"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Optimization
```env
# In .env.local
GENERATE_SOURCEMAP=false
REACT_APP_ENABLE_ANALYTICS=true
```

## 🐳 Docker Installation

### Using Docker Compose

#### 1. Create docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: lms_db
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: lms_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://lms_user:lms_password@postgres:5432/lms_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### 2. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Containers

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 Troubleshooting Installation

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3000 or 5000
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (macOS/Linux)
kill -9 <process_id>
```

#### Database Connection Failed
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d lms_db

# Check if PostgreSQL is running
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

#### Node.js Version Issues
```bash
# Install Node Version Manager (nvm)
# Windows: Download from https://github.com/coreybutler/nvm-windows
# macOS/Linux: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18
```

#### Permission Issues
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use npm prefix
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Getting Help

If you encounter issues during installation:

1. **Check Prerequisites**: Ensure all required software is installed
2. **Review Logs**: Check console output for error messages
3. **Verify Configuration**: Double-check environment variables
4. **Test Connections**: Use the connection test page
5. **Check Documentation**: Review troubleshooting guides

## 📞 Support

For installation support:
- Check the [Troubleshooting Guide](./troubleshooting/installation.md)
- Use the connection test at `/debug/connection-test`
- Review server logs for error messages
- Ensure all prerequisites are met
