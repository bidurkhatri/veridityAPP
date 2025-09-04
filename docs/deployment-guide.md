# Veridity Deployment Guide

## Production Deployment for Enterprise Zero-Knowledge Identity Platform

This guide covers deploying Veridity's complete enterprise platform including the web application, mobile apps, and enterprise SDK.

### Table of Contents
1. [Prerequisites](#prerequisites)
2. [Web Application Deployment](#web-application-deployment)
3. [Mobile App Deployment](#mobile-app-deployment)
4. [Enterprise SDK Distribution](#enterprise-sdk-distribution)
5. [Database Setup](#database-setup)
6. [Security Configuration](#security-configuration)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Scaling & Performance](#scaling--performance)

---

## Prerequisites

### System Requirements
- **Node.js**: 18+ 
- **PostgreSQL**: 14+
- **Redis**: 6+ (for session management and caching)
- **Docker**: 20+ (optional, for containerized deployment)
- **SSL Certificate**: Required for production
- **Domain**: Configured with proper DNS

### Development Tools
- **Circom**: For ZK circuit compilation
- **SnarkJS**: For proof generation and verification
- **Android Studio**: For Android app builds
- **Xcode**: For iOS app builds (macOS only)

## Web Application Deployment

### 1. Environment Configuration

Create production environment file:

```bash
# Production Environment (.env.production)
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/veridity_prod
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=veridity_user
PGPASSWORD=secure_password
PGDATABASE=veridity_prod

# Authentication
SESSION_SECRET=your-super-secure-session-secret-64-chars-minimum
ISSUER_URL=https://replit.com/oidc
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.com,api.your-domain.com

# ZK Circuits
CIRCUITS_DIR=/opt/veridity/circuits
TRUSTED_SETUP_DIR=/opt/veridity/setup

# External Services
NEPAL_GOV_API_KEY=your-nepal-government-api-key
NEPAL_BANKING_API_KEY=your-banking-integration-key
NEPAL_EDUCATION_API_KEY=your-education-ministry-key

# Security
WEBHOOK_SECRET=your-webhook-secret-for-enterprise-integrations
API_RATE_LIMIT=1000
MAX_PROOF_SIZE=10MB

# Monitoring
ANALYTICS_ENABLED=true
ERROR_REPORTING_URL=https://your-error-tracking-service.com
```

### 2. Build and Deploy

```bash
# Install dependencies
npm ci --production

# Build circuits for production
npm run circuits:build

# Database migration
npm run db:push

# Build application
npm run build

# Start production server
npm run start:prod
```

### 3. Docker Deployment (Recommended)

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS production

RUN apk add --no-cache circom snarkjs

WORKDIR /app
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  veridity-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/veridity
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=veridity
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - veridity-app
    restart: unless-stopped

volumes:
  postgres_data:
```

## Mobile App Deployment

### 1. Android Deployment

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Generate release keystore
keytool -genkey -v -keystore android/app/my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Configure gradle.properties
echo "MYAPP_RELEASE_STORE_FILE=my-release-key.keystore" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_ALIAS=my-key-alias" >> android/gradle.properties
echo "MYAPP_RELEASE_STORE_PASSWORD=****" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_PASSWORD=****" >> android/gradle.properties

# Build release APK
cd android
./gradlew assembleRelease

# Generate AAB for Play Store
./gradlew bundleRelease
```

### 2. iOS Deployment

```bash
# Install iOS dependencies
cd mobile/ios
pod install

# Open in Xcode
open VeridityMobile.xcworkspace

# Configure signing and provisioning profiles in Xcode
# Build for release
# Archive and upload to App Store Connect
```

### 3. Mobile Configuration

```javascript
// mobile/config/production.js
export const config = {
  API_BASE_URL: 'https://api.veridity.com',
  WEBSOCKET_URL: 'wss://api.veridity.com/ws',
  
  // Nepal-specific configuration
  SUPPORTED_LANGUAGES: ['en', 'np'],
  DEFAULT_LANGUAGE: 'np',
  
  // Offline capabilities
  OFFLINE_STORAGE_LIMIT: '100MB',
  SYNC_INTERVAL: 30000, // 30 seconds
  
  // Biometric settings
  BIOMETRIC_TIMEOUT: 30, // seconds
  MAX_BIOMETRIC_ATTEMPTS: 3,
  
  // Push notifications
  FCM_SENDER_ID: 'your-fcm-sender-id',
  
  // Analytics
  ANALYTICS_ENABLED: true,
  CRASH_REPORTING_ENABLED: true
};
```

## Enterprise SDK Distribution

### 1. NPM Package Publishing

```bash
# Build SDK for distribution
cd server/sdk
npm run build

# Create package.json for SDK
cat > package.json << EOF
{
  "name": "@veridity/enterprise-sdk",
  "version": "1.0.0",
  "description": "Enterprise SDK for Veridity Zero-Knowledge Identity Platform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist/", "examples/"],
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "keywords": ["zero-knowledge", "identity", "privacy", "nepal", "enterprise"],
  "author": "Veridity Team",
  "license": "MIT",
  "dependencies": {
    "ws": "^8.0.0",
    "node-fetch": "^3.0.0"
  }
}
EOF

# Publish to NPM
npm publish
```

### 2. SDK Documentation

```bash
# Generate TypeScript documentation
npx typedoc --out docs/sdk server/sdk/veridity-enterprise-sdk.ts

# Create integration examples
mkdir -p examples/integrations
cp server/sdk/example-integration.ts examples/integrations/
```

## Database Setup

### 1. Production Database Configuration

```sql
-- Create production database
CREATE DATABASE veridity_prod;
CREATE USER veridity_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE veridity_prod TO veridity_user;

-- Enable required extensions
\c veridity_prod;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_proofs_user_id ON proofs(user_id);
CREATE INDEX CONCURRENTLY idx_proofs_created_at ON proofs(created_at);
CREATE INDEX CONCURRENTLY idx_verifications_organization_id ON verifications(organization_id);
CREATE INDEX CONCURRENTLY idx_audit_logs_created_at ON audit_logs(created_at);
```

### 2. Database Migration and Backup

```bash
# Run migrations
npm run db:push

# Setup automated backups
cat > /etc/cron.d/veridity-backup << EOF
0 2 * * * postgres pg_dump veridity_prod | gzip > /backups/veridity_$(date +\%Y\%m\%d).sql.gz
EOF

# Restore from backup
gunzip -c /backups/veridity_20240101.sql.gz | psql veridity_prod
```

## Security Configuration

### 1. SSL/TLS Setup

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.veridity.com;
    
    ssl_certificate /etc/nginx/ssl/veridity.crt;
    ssl_certificate_key /etc/nginx/ssl/veridity.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://veridity-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /ws {
        proxy_pass http://veridity-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 2. Firewall Configuration

```bash
# UFW firewall rules
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 10.0.0.0/8 to any port 5432  # Database access
ufw enable
```

## Monitoring & Analytics

### 1. Application Monitoring

```javascript
// server/monitoring/health-check.ts
export const healthCheck = {
  database: async () => {
    try {
      await db.raw('SELECT 1');
      return { status: 'healthy', latency: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },
  
  circuits: async () => {
    const status = await zkService.getCircuitStatus();
    return { status: status.ready ? 'healthy' : 'degraded', circuits: status };
  },
  
  websocket: () => {
    return { status: 'healthy', connections: wsServer.clients.size };
  }
};
```

### 2. Logging Configuration

```javascript
// server/logging/winston-config.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'veridity-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## Scaling & Performance

### 1. Load Balancer Configuration

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  veridity-app:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/veridity
    depends_on:
      - db
      - redis

  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - veridity-app
```

### 2. Caching Strategy

```javascript
// server/cache/redis-config.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true
});

// Cache verification results
export const cacheVerification = async (proofId: string, result: any) => {
  await redis.setex(`verification:${proofId}`, 3600, JSON.stringify(result));
};
```

### 3. Database Optimization

```sql
-- Partitioning for large tables
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Read replicas for analytics
-- Configure streaming replication to separate analytics database

-- Connection pooling
-- Use PgBouncer for connection management
```

---

## Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations tested
- [ ] ZK circuits compiled and tested
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Backup strategy implemented

### Deployment
- [ ] Deploy to staging environment first
- [ ] Run end-to-end tests
- [ ] Deploy to production with zero downtime
- [ ] Verify all services are healthy
- [ ] Test critical user journeys
- [ ] Monitor error rates and performance

### Post-Deployment
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Test disaster recovery procedures
- [ ] Document operational procedures
- [ ] Train support team
- [ ] Monitor user adoption and feedback

For additional support or enterprise deployment assistance, contact the Veridity team at enterprise@veridity.com