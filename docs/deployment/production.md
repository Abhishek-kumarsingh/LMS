# Production Deployment Guide

## 🚀 Overview

This guide covers deploying the LMS application to production environments with best practices for security, performance, and reliability.

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] **Server Specifications**
  - Minimum 4 CPU cores, 8GB RAM
  - 100GB SSD storage
  - Ubuntu 20.04 LTS or similar

- [ ] **Database Server**
  - PostgreSQL 15+ with dedicated server
  - Minimum 4GB RAM, 50GB storage
  - Automated backups configured

- [ ] **Redis Server**
  - Redis 7+ for caching and sessions
  - Minimum 2GB RAM
  - Persistence enabled

- [ ] **Domain and SSL**
  - Domain name configured
  - SSL certificate (Let's Encrypt or commercial)
  - DNS records properly set

### Security Checklist
- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key-based authentication
- [ ] Non-root user for application
- [ ] Database access restricted
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] Security headers configured

## 🏗️ Infrastructure Setup

### 1. Server Preparation

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

#### Install Node.js
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

#### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Database Setup

#### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### Configure Database
```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE lms_production;
CREATE USER lms_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE lms_production TO lms_user;
ALTER USER lms_user CREATEDB;
\q
```

#### Secure PostgreSQL
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Update these settings:
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Redis Setup

#### Install Redis
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### Configure Redis
```bash
sudo nano /etc/redis/redis.conf

# Update these settings:
bind 127.0.0.1
requirepass your_redis_password_here
maxmemory 1gb
maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
```

## 📦 Application Deployment

### 1. Application Setup

#### Create Application User
```bash
sudo adduser lms
sudo usermod -aG sudo lms
su - lms
```

#### Clone Repository
```bash
cd /home/lms
git clone <your-repository-url> lms-app
cd lms-app
```

#### Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

#### Backend Environment (.env)
```bash
cd backend
cp .env.example .env
nano .env
```

```env
# Production Environment Variables
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="postgresql://lms_user:secure_password_here@localhost:5432/lms_production"

# JWT Secrets (generate secure 32+ character strings)
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
FRONTEND_URL="https://yourdomain.com"
BACKEND_URL="https://api.yourdomain.com"

# Redis
REDIS_URL="redis://:your_redis_password_here@localhost:6379"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="Your LMS"

# File Upload
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="warn"

# Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# Push Notifications
FCM_SERVER_KEY="your-fcm-server-key"
```

#### Frontend Environment (.env.production)
```bash
cd ..
cp .env.example .env.production
nano .env.production
```

```env
# Production Frontend Environment
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_SOCKET_URL=https://api.yourdomain.com
REACT_APP_APP_NAME="Your LMS"
REACT_APP_ENVIRONMENT=production

# External Services
REACT_APP_GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
REACT_APP_SENTRY_DSN="your-sentry-dsn"

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_STREAMING=true
```

### 3. Database Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 4. Build Applications

#### Build Backend
```bash
cd backend
npm run build
```

#### Build Frontend
```bash
cd ..
npm run build
```

## 🔧 Process Management with PM2

### 1. PM2 Configuration

#### Create ecosystem.config.js
```javascript
module.exports = {
  apps: [
    {
      name: 'lms-backend',
      script: './backend/dist/server.js',
      cwd: '/home/lms/lms-app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

### 2. Start Application
```bash
# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs
```

## 🌐 Nginx Configuration

### 1. SSL Certificate Setup

#### Using Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### 2. Nginx Configuration

#### Create site configuration
```bash
sudo nano /etc/nginx/sites-available/lms
```

```nginx
# Frontend (yourdomain.com)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    root /home/lms/lms-app/build;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API (api.yourdomain.com)
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration (same as above)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CORS Headers
    add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Enable site and restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Security Hardening

### 1. Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### 2. Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. System Updates
```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring and Logging

### 1. Log Management
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/lms
```

```
/home/lms/lms-app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 lms lms
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. System Monitoring
```bash
# Install htop for system monitoring
sudo apt install -y htop

# Monitor PM2 processes
pm2 monit

# Check system resources
htop
df -h
free -h
```

### 3. Application Monitoring
```bash
# PM2 monitoring commands
pm2 status
pm2 logs --lines 100
pm2 show lms-backend
```

## 🔄 Deployment Automation

### 1. Deployment Script
```bash
nano deploy.sh
```

```bash
#!/bin/bash

# Deployment script for LMS application
set -e

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install
cd backend && npm install && cd ..

# Build applications
echo "Building applications..."
npm run build
cd backend && npm run build && cd ..

# Run database migrations
echo "Running database migrations..."
cd backend && npx prisma migrate deploy && cd ..

# Restart application
echo "Restarting application..."
pm2 restart ecosystem.config.js

echo "Deployment completed successfully!"
```

```bash
chmod +x deploy.sh
```

### 2. Zero-Downtime Deployment
```bash
# Use PM2 reload for zero-downtime deployment
pm2 reload ecosystem.config.js
```

## 🔧 Maintenance Tasks

### 1. Database Backup
```bash
# Create backup script
nano backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/lms/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="lms_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U lms_user -d lms_production > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

```bash
chmod +x backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/lms/backup-db.sh
```

### 2. SSL Certificate Renewal
```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. System Updates
```bash
# Regular system maintenance script
nano maintenance.sh
```

```bash
#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean package cache
sudo apt autoremove -y
sudo apt autoclean

# Update Node.js packages
npm update
cd backend && npm update && cd ..

# Restart services
pm2 restart all
sudo systemctl restart nginx

echo "Maintenance completed!"
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs

# Check system resources
free -h
df -h

# Check database connection
sudo -u postgres psql -d lms_production -c "SELECT 1;"
```

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart all

# Check for memory leaks
pm2 show lms-backend
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

This production deployment guide ensures a secure, scalable, and maintainable LMS deployment suitable for production use.
