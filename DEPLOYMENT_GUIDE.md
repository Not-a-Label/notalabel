# Not a Label Platform - Deployment Guide

## Overview

This guide covers the complete deployment of the Not a Label platform, including frontend, backend, and all supporting services. The platform is designed to run on not-a-label.art with comprehensive music industry features.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │────│   (Express)     │────│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────│     Redis       │─────────────┘
                        │   (Cache)       │
                        │   Port: 6379    │
                        └─────────────────┘
```

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Redis 6.x or higher
- Docker and Docker Compose (optional)
- Kubernetes cluster (for production)

### Domain Setup
- Domain: `not-a-label.art`
- API subdomain: `api.not-a-label.art`
- SSL/TLS certificates

## Environment Configuration

### Backend Environment Variables

Create `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/not_a_label
REDIS_URL=redis://localhost:6379

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_MASTER_KEY=your-32-byte-encryption-key-here

# API Keys
OPENAI_API_KEY=your-openai-api-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
APPLE_MUSIC_API_KEY=your-apple-music-api-key

# Blockchain (Optional)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your-project-id

# Email
SMTP_HOST=smtp.not-a-label.art
SMTP_PORT=587
SMTP_USER=noreply@not-a-label.art
SMTP_PASS=your-email-password

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=not-a-label-storage

# Payment Processing
STRIPE_SECRET_KEY=sk_test_or_live_key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key

# Feature Flags
ENABLE_NFT_FEATURES=true
ENABLE_LIVE_STREAMING=true
ENABLE_AI_FEATURES=true
```

### Frontend Environment Variables

Create `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=https://api.not-a-label.art
NEXT_PUBLIC_GRAPHQL_URL=https://api.not-a-label.art/graphql
NEXT_PUBLIC_WS_URL=wss://api.not-a-label.art
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Database Setup

### PostgreSQL Schema

```sql
-- Create database
CREATE DATABASE not_a_label;

-- Create user
CREATE USER not_a_label_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE not_a_label TO not_a_label_user;

-- Connect to database
\c not_a_label;

-- Run migrations
-- The backend will handle schema creation automatically
```

### Redis Configuration

```redis
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Local Development

### Quick Start

```bash
# Clone repository
git clone https://github.com/not-a-label/platform.git
cd platform

# Install dependencies
npm install

# Setup database
npm run db:setup

# Start services
npm run dev
```

### Individual Services

```bash
# Backend
cd not-a-label-backend
npm install
npm run dev

# Frontend
cd not-a-label-frontend
npm install
npm run dev

# Start Redis
redis-server

# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start
```

## Docker Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./not-a-label-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build: ./not-a-label-backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/not_a_label
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=not_a_label
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

## Kubernetes Deployment

### Apply Configurations

```bash
# Create namespace
kubectl apply -f k8s/base/namespace.yaml

# Deploy database
kubectl apply -f k8s/base/database.yaml

# Deploy Redis
kubectl apply -f k8s/base/redis.yaml

# Deploy backend
kubectl apply -f k8s/base/deployment.yaml

# Deploy frontend
kubectl apply -f k8s/base/frontend.yaml

# Setup ingress
kubectl apply -f k8s/base/ingress.yaml
```

### SSL/TLS Setup

```bash
# Install cert-manager
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.8.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@not-a-label.art
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Monitoring Setup

```bash
# Deploy Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack

# Deploy Grafana dashboards
kubectl apply -f k8s/monitoring/grafana-dashboards.yaml
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Domain DNS configured
- [ ] SSL certificates obtained
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Environment variables secured
- [ ] API rate limits configured
- [ ] CDN configured for static assets
- [ ] Error logging configured

### Deployment Script

```bash
#!/bin/bash
set -e

echo "Starting Not a Label Platform Deployment"

# Build frontend
cd not-a-label-frontend
npm ci --production
npm run build
npm run export

# Build backend
cd ../not-a-label-backend
npm ci --production
npm run build

# Run database migrations
npm run migrate

# Deploy to Kubernetes
kubectl apply -f ../k8s/production/

# Wait for deployment
kubectl rollout status deployment/not-a-label-backend
kubectl rollout status deployment/not-a-label-frontend

# Run health checks
kubectl get pods -l app=not-a-label-backend
kubectl get pods -l app=not-a-label-frontend

echo "Deployment completed successfully!"
```

## Configuration Management

### Secrets Management

```bash
# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="${JWT_SECRET}" \
  --from-literal=encryption-key="${ENCRYPTION_MASTER_KEY}"

kubectl create secret generic database-secret \
  --from-literal=url="${DATABASE_URL}"

kubectl create secret generic redis-secret \
  --from-literal=url="${REDIS_URL}"
```

### ConfigMaps

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: "production"
  ENABLE_NFT_FEATURES: "true"
  ENABLE_LIVE_STREAMING: "true"
  ENABLE_AI_FEATURES: "true"
```

## Monitoring and Observability

### Health Checks

The platform includes comprehensive health checks:

- `GET /api/health` - Basic health check
- `GET /api/health/ready` - Readiness check
- `GET /api/health/live` - Liveness check

### Metrics Endpoints

- `GET /api/metrics` - Prometheus metrics
- `GET /api/status` - Detailed system status

### Logging Configuration

```yaml
# Fluentd configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
    </source>
    
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name not-a-label
    </match>
```

## Backup and Recovery

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="not_a_label_backup_${DATE}.sql"

pg_dump ${DATABASE_URL} > ${BACKUP_FILE}
aws s3 cp ${BACKUP_FILE} s3://not-a-label-backups/database/
rm ${BACKUP_FILE}
```

### File Storage Backups

```bash
# S3 sync for user uploads
aws s3 sync s3://not-a-label-storage s3://not-a-label-backups/storage/ --delete
```

## Security Considerations

### Network Security

- Use HTTPS everywhere
- Implement proper CORS policies
- Configure CSP headers
- Use security middleware (helmet.js)

### Authentication & Authorization

- JWT tokens with short expiration
- Refresh token rotation
- Rate limiting on auth endpoints
- Multi-factor authentication for admin

### Data Protection

- Encrypt sensitive data at rest
- Use secure communication channels
- Implement proper input validation
- Regular security audits

## Performance Optimization

### Caching Strategy

- Redis for session storage
- API response caching
- CDN for static assets
- Database query optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_streams_created_at ON streams(created_at);
CREATE INDEX idx_revenue_events_timestamp ON revenue_events(timestamp);
```

### Frontend Optimization

- Code splitting
- Image optimization
- Service workers for offline support
- Progressive Web App features

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL status
   kubectl logs deployment/postgresql
   
   # Test connection
   psql ${DATABASE_URL} -c "SELECT 1;"
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis status
   kubectl logs deployment/redis
   
   # Test connection
   redis-cli -u ${REDIS_URL} ping
   ```

3. **API Timeouts**
   ```bash
   # Check backend logs
   kubectl logs deployment/not-a-label-backend
   
   # Check resource usage
   kubectl top pods
   ```

### Debug Commands

```bash
# View all pods
kubectl get pods

# Describe pod for detailed info
kubectl describe pod <pod-name>

# Get logs from specific container
kubectl logs <pod-name> -c <container-name>

# Execute commands in pod
kubectl exec -it <pod-name> -- /bin/bash

# Port forward for local debugging
kubectl port-forward svc/not-a-label-backend 4000:4000
```

## Scaling

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: not-a-label-backend
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

- Read replicas for query distribution
- Connection pooling (PgBouncer)
- Database sharding for large datasets

## Maintenance

### Regular Tasks

- Database maintenance and VACUUM
- Log rotation and cleanup
- Security updates
- Dependency updates
- Performance monitoring

### Update Process

```bash
# Rolling update
kubectl set image deployment/not-a-label-backend backend=not-a-label/backend:v2.0.0
kubectl rollout status deployment/not-a-label-backend

# Rollback if needed
kubectl rollout undo deployment/not-a-label-backend
```

## Support and Documentation

### API Documentation
- Swagger UI: `https://api.not-a-label.art/docs`
- GraphQL Playground: `https://api.not-a-label.art/graphql`

### Monitoring Dashboards
- Grafana: `https://monitoring.not-a-label.art`
- Prometheus: `https://prometheus.not-a-label.art`

### Contact Information
- Technical Support: tech@not-a-label.art
- Emergency Contact: +1-555-NOT-LABEL

---

This deployment guide provides comprehensive instructions for setting up and maintaining the Not a Label platform. For additional support or questions, please refer to the API documentation or contact the technical team.