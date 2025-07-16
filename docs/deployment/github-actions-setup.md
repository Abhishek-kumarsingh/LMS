# GitHub Actions Setup Guide

## 🔐 Required Secrets

To fix your GitHub Actions deployment issues, you need to configure the following secrets in your GitHub repository.

### Setting Up Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

### 🔑 Required Secrets

#### **Environment URLs**
```
REACT_APP_API_URL
Value: https://api.yourdomain.com/api

REACT_APP_SOCKET_URL  
Value: https://api.yourdomain.com

STAGING_URL
Value: https://staging.yourdomain.com

PRODUCTION_URL
Value: https://yourdomain.com
```

#### **Server Access (Production)**
```
PRODUCTION_HOST
Value: your-production-server-ip

PRODUCTION_USER
Value: lms

PRODUCTION_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
[Your private SSH key content]
-----END OPENSSH PRIVATE KEY-----
```

#### **Server Access (Staging)**
```
STAGING_HOST
Value: your-staging-server-ip

STAGING_USER
Value: lms

STAGING_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
[Your private SSH key content]
-----END OPENSSH PRIVATE KEY-----
```

#### **Notifications**
```
SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

#### **Code Coverage (Optional)**
```
CODECOV_TOKEN
Value: your-codecov-token
```

## 🔧 Fixing Current Issues

### Issue 1: Maven Image Not Found
**Problem**: Your Dockerfile is trying to use Maven for a Node.js project

**Solution**: The updated Dockerfile now uses Node.js instead of Maven:
```dockerfile
FROM node:18-alpine as builder
# ... Node.js build process
```

### Issue 2: Slack Webhook Error
**Problem**: Using wrong parameter name for Slack action

**Solution**: Updated GitHub Actions workflow uses correct parameter:
```yaml
- name: Notify Slack on success
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: "✅ Deployment successful!"
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🚀 Updated CI/CD Pipeline

The new pipeline includes:

### ✅ **Test Stage**
- Runs PostgreSQL and Redis services
- Installs dependencies
- Runs database migrations
- Executes backend and frontend tests
- Uploads coverage reports

### ✅ **Build Stage**
- Builds frontend and backend applications
- Uploads build artifacts
- Prepares for Docker image creation

### ✅ **Docker Stage**
- Builds Docker images for frontend and backend
- Pushes to GitHub Container Registry
- Uses proper Node.js base images

### ✅ **Deploy Stage**
- Deploys to staging (develop branch)
- Deploys to production (main branch)
- Runs health checks
- Sends notifications

## 📝 Environment Files

### Production Environment (.env.production)
```env
# Copy from .env.production.example and configure
GITHUB_REPOSITORY=your-username/lms
POSTGRES_PASSWORD=secure-password
JWT_SECRET=secure-jwt-secret-32-chars-min
# ... other variables
```

### Staging Environment (.env.staging)
```env
# Similar to production but with staging values
POSTGRES_DB=lms_staging
FRONTEND_URL=https://staging.yourdomain.com
# ... other variables
```

## 🐳 Docker Configuration

### Frontend Dockerfile
- Multi-stage build with Node.js
- Nginx for serving static files
- Proper security headers
- Health checks included

### Backend Dockerfile
- Multi-stage build with Node.js
- Production optimizations
- Non-root user for security
- Health checks included

## 🔄 Deployment Process

### Automatic Deployment
1. **Push to `develop`** → Deploys to staging
2. **Push to `main`** → Deploys to production
3. **Pull Request** → Runs tests only

### Manual Deployment
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

## 🔍 Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```bash
# Test SSH connection
ssh -i ~/.ssh/your-key user@your-server

# Check SSH key format (should be OpenSSH format)
ssh-keygen -p -m OpenSSH -f ~/.ssh/your-key
```

#### 2. Docker Build Failed
```bash
# Check Dockerfile syntax
docker build -t test-image .

# Check for missing files
ls -la Dockerfile* docker-compose*.yml
```

#### 3. Health Check Failed
```bash
# Check service logs
docker-compose logs backend
docker-compose logs frontend

# Test endpoints manually
curl http://localhost:5000/health
curl http://localhost:3000/health
```

#### 4. Database Migration Failed
```bash
# Check database connection
docker-compose exec postgres psql -U lms_user -d lms_production

# Run migrations manually
docker-compose exec backend npx prisma migrate deploy
```

## 📊 Monitoring Deployment

### GitHub Actions
- Check **Actions** tab in your repository
- Review logs for each step
- Monitor deployment status

### Server Monitoring
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats
```

### Health Checks
```bash
# Backend health
curl http://your-domain.com:5000/health

# Frontend health  
curl http://your-domain.com/health

# Database health
docker-compose exec postgres pg_isready
```

## 🔐 Security Best Practices

### SSH Keys
- Use separate SSH keys for staging and production
- Rotate keys regularly
- Use strong passphrases

### Secrets Management
- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

### Docker Security
- Use non-root users in containers
- Keep base images updated
- Scan images for vulnerabilities

## 📞 Getting Help

If deployment still fails:

1. **Check GitHub Actions logs** for specific error messages
2. **Verify all secrets** are correctly configured
3. **Test SSH connections** to your servers
4. **Check server resources** (disk space, memory)
5. **Review Docker logs** on the server

### Support Checklist
- [ ] All required secrets configured
- [ ] SSH keys in correct format
- [ ] Server accessible via SSH
- [ ] Docker and Docker Compose installed on server
- [ ] Environment files configured
- [ ] Domain names pointing to correct servers

This setup provides a robust, secure, and automated deployment pipeline for your LMS application!
