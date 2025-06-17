# 🚀 Deployment Guide

This guide covers various deployment strategies for the Modern LMS platform.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring Setup](#monitoring-setup)
- [Backup & Recovery](#backup--recovery)

## Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 100 Mbps

**Recommended for Production:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 100GB+ SSD
- Network: 1 Gbps
- Load Balancer
- CDN

### Software Dependencies

- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.24+ (for K8s deployment)
- kubectl CLI
- Helm 3.0+ (optional)

## Environment Configuration

### 1. Environment Variables

Copy and configure the environment file:

```bash
cp .env.example .env
```

**Critical Production Variables:**

```bash
# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
SECURITY_REQUIRE_SSL=true

# Database
DB_HOST=your-database-host
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-db-password

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
MAIL_HOST=your-smtp-host
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password

# Monitoring
GRAFANA_PASSWORD=your-grafana-password
```

### 2. SSL Certificates

For production deployment, obtain SSL certificates:

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to ssl directory
mkdir -p ssl
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certificate.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/private.key
```

## Docker Deployment

### 1. Production Docker Compose

Use the production Docker Compose configuration:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Docker Swarm (Multi-node)

For multi-node deployment:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml lms-stack

# Check services
docker service ls
docker service logs lms-stack_backend
```

### 3. Health Checks

Verify deployment health:

```bash
# Backend health
curl http://localhost:8080/api/health

# Frontend health
curl http://localhost/health

# Database connectivity
docker exec lms-mysql-prod mysql -u lms_user -p -e "SELECT 1"
```

## Kubernetes Deployment

### 1. Cluster Setup

**Prerequisites:**
- Kubernetes cluster (EKS, GKE, AKS, or self-managed)
- kubectl configured
- Ingress controller (nginx-ingress)
- Cert-manager for SSL

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy databases
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/rabbitmq.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=mysql -n lms-system --timeout=300s

# Deploy applications
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# Check deployment status
kubectl get pods -n lms-system
kubectl get services -n lms-system
kubectl get ingress -n lms-system
```

### 3. Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n lms-system

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n lms-system

# Check HPA status
kubectl get hpa -n lms-system
```

### 4. Rolling Updates

```bash
# Update backend image
kubectl set image deployment/backend backend=ghcr.io/your-org/lms-backend:v1.1.0 -n lms-system

# Check rollout status
kubectl rollout status deployment/backend -n lms-system

# Rollback if needed
kubectl rollout undo deployment/backend -n lms-system
```

## Cloud Deployment

### AWS Deployment

#### Using EKS

```bash
# Create EKS cluster
eksctl create cluster --name lms-cluster --region us-west-2 --nodes 3

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name lms-cluster

# Deploy application
kubectl apply -f k8s/
```

#### Using ECS

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name lms-cluster

# Register task definitions
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create services
aws ecs create-service --cluster lms-cluster --service-name lms-backend --task-definition lms-backend
```

### Google Cloud Deployment

#### Using GKE

```bash
# Create GKE cluster
gcloud container clusters create lms-cluster --num-nodes=3 --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials lms-cluster --zone=us-central1-a

# Deploy application
kubectl apply -f k8s/
```

### Azure Deployment

#### Using AKS

```bash
# Create AKS cluster
az aks create --resource-group myResourceGroup --name lms-cluster --node-count 3

# Get credentials
az aks get-credentials --resource-group myResourceGroup --name lms-cluster

# Deploy application
kubectl apply -f k8s/
```

## Production Checklist

### Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] JWT secrets generated
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Firewall rules applied

### Performance Checklist

- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled
- [ ] Resource limits set
- [ ] Auto-scaling configured

### Monitoring Checklist

- [ ] Health checks configured
- [ ] Metrics collection enabled
- [ ] Log aggregation setup
- [ ] Alerting rules configured
- [ ] Dashboards created
- [ ] Uptime monitoring enabled

### Backup Checklist

- [ ] Database backup automated
- [ ] File storage backup configured
- [ ] Backup retention policy set
- [ ] Recovery procedures tested
- [ ] Disaster recovery plan documented

## Monitoring Setup

### Prometheus & Grafana

```bash
# Deploy monitoring stack
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/grafana.yaml

# Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n monitoring
```

### ELK Stack for Logging

```bash
# Deploy ELK stack
kubectl apply -f monitoring/elasticsearch.yaml
kubectl apply -f monitoring/logstash.yaml
kubectl apply -f monitoring/kibana.yaml
```

### Custom Alerts

Configure alerts in `monitoring/alert_rules.yml`:

```yaml
- alert: HighErrorRate
  expr: rate(http_server_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
```

## Backup & Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD modern_lms > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://lms-backups/
```

### File Storage Backup

```bash
# Backup uploaded files
rsync -av /app/uploads/ s3://lms-backups/uploads/
rsync -av /app/certificates/ s3://lms-backups/certificates/
```

### Recovery Procedures

```bash
# Database recovery
mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD modern_lms < backup_20240101_120000.sql

# File recovery
aws s3 sync s3://lms-backups/uploads/ /app/uploads/
aws s3 sync s3://lms-backups/certificates/ /app/certificates/
```

## Troubleshooting

### Common Issues

1. **Pod CrashLoopBackOff**
   ```bash
   kubectl describe pod <pod-name> -n lms-system
   kubectl logs <pod-name> -n lms-system
   ```

2. **Service Unavailable**
   ```bash
   kubectl get endpoints -n lms-system
   kubectl describe service <service-name> -n lms-system
   ```

3. **Database Connection Issues**
   ```bash
   kubectl exec -it <backend-pod> -n lms-system -- bash
   mysql -h mysql-service -u lms_user -p
   ```

### Performance Issues

1. **High CPU Usage**
   ```bash
   kubectl top pods -n lms-system
   kubectl describe hpa -n lms-system
   ```

2. **Memory Leaks**
   ```bash
   kubectl exec -it <pod-name> -n lms-system -- jstat -gc 1
   ```

3. **Slow Database Queries**
   ```sql
   SHOW PROCESSLIST;
   SHOW ENGINE INNODB STATUS;
   ```

## Maintenance

### Regular Tasks

- **Weekly**: Review logs and metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance optimization and capacity planning
- **Annually**: Disaster recovery testing and security audit

### Update Procedures

1. **Test in staging environment**
2. **Create backup before update**
3. **Deploy during maintenance window**
4. **Monitor post-deployment metrics**
5. **Rollback if issues detected**

---

For more detailed information, see the [Operations Runbook](OPERATIONS.md).
