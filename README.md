# Veridity - Enterprise Privacy-First Digital Identity Platform

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/veridity/platform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/veridity/platform/actions)
[![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen.svg)](https://codecov.io/gh/veridity/platform)
[![Security Score](https://img.shields.io/badge/security-A+-brightgreen.svg)](https://snyk.io/test/github/veridity/platform)
[![Enterprise Ready](https://img.shields.io/badge/enterprise-ready-success.svg)](https://veridity.com/enterprise)

## Table of Contents

- [Overview](#overview)
- [Enterprise Features](#enterprise-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Authentication & RBAC](#authentication--rbac)
- [Role-Based Dashboards](#role-based-dashboards)
- [Secure QR System](#secure-qr-system)
- [API Documentation](#api-documentation)
- [Security & Compliance](#security--compliance)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Veridity is a **production-grade, enterprise-ready** privacy-first digital identity verification platform designed for global markets with initial focus on Nepal. The platform leverages Zero-Knowledge Proofs (ZKP) to enable users to prove specific identity attributes (age, citizenship, education, income) without revealing sensitive personal data.

### 🎯 Mission

To create a trustless verification system that prioritizes user privacy while maintaining enterprise-grade security, reliability, and compliance with global data protection regulations.

### ✨ Key Principles

- **🔒 Privacy by Design**: Zero-knowledge architecture ensures personal data never leaves user control
- **🌍 Global Compliance**: GDPR, CCPA, PIPL, and regional regulation compliance built-in
- **🏢 Enterprise Ready**: Production-grade infrastructure with 99.9% uptime SLA
- **📱 Mobile First**: Optimized for mobile devices and low-connectivity environments in Nepal
- **🚀 Developer Friendly**: Comprehensive APIs, SDKs, and webhooks for seamless integration

## Enterprise Features

### 🔐 Production-Grade Authentication & RBAC

- **Multi-Provider Authentication**: Email/Password, WebAuthn passkeys, OAuth (Google, GitHub, Microsoft, Apple)
- **Server-Side RBAC**: Role-based access control with fine-grained permissions
- **Session Management**: Secure, HTTP-only cookies with PostgreSQL session storage
- **Biometric Integration**: WebAuthn, Touch ID, Face ID, and Windows Hello support
- **Multi-Factor Authentication**: SMS OTP, TOTP apps, and hardware security keys

### 🎛️ Role-Based Dashboard System

**Customer Dashboard** (End Users)
- Proof management and generation
- QR code sharing for secure verification
- Verification history and audit trail
- Privacy controls and consent management

**Organization Admin Dashboard** (Enterprise Clients)
- API key management with usage analytics
- Webhook configuration and monitoring
- Real-time verification analytics
- Team member access control

**System Admin Dashboard** (Platform Operations)
- System health monitoring and alerts
- User management and role assignment
- Security incident response center
- Compliance reporting and audit trails

### 🔒 Secure QR Code System

- **Cryptographic Security**: Digital signatures prevent QR code tampering
- **Replay Protection**: Nonce-based system prevents code reuse
- **Expiry Management**: Time-based expiration with configurable limits
- **Deep Link Support**: `/verify/:token` URLs for seamless mobile integration
- **Rate Limiting**: Enterprise-grade protection against abuse

### 🎨 Accessibility & UX

- **Global Theme System**: Light, dark, and system preference modes
- **WCAG 2.1 AA Compliance**: Screen reader support and keyboard navigation
- **Multi-Language Support**: English and Nepali with easy expansion framework
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Progressive Web App**: Offline capabilities and native app experience

### 🛡️ Enterprise Security

- **End-to-End Encryption**: AES-256 encryption for all sensitive data
- **Audit Logging**: Comprehensive activity tracking with forensic capabilities
- **Rate Limiting**: Redis-backed protection with configurable policies
- **Error Boundaries**: Graceful error handling with detailed monitoring
- **Security Headers**: CSRF protection, HSTS, and content security policies

## Architecture

### System Overview

Veridity follows a production-grade microservices architecture with enterprise security and scalability:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client Applications                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Customer App   │  Org Admin App  │   System Admin App          │
│  (End Users)    │  (Enterprise)   │   (Platform Ops)            │
└─────────┬───────┴─────────┬───────┴─────────┬───────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
    ┌──────────────────────────────────────────────────────────────┐
    │                 API Gateway & Router                         │
    │    ✓ Authentication  ✓ RBAC  ✓ Rate Limiting               │
    └─────────────────────┬────────────────────────────────────────┘
                          │
    ┌──────────────────────────────────────────────────────────────┐
    │                   Core Services                              │
    ├─────────────┬─────────────┬─────────────┬────────────────────┤
    │ZK Proof     │QR Security  │Fraud        │Government API      │
    │Service      │Service      │Detection    │Integration         │
    └─────────────┴─────────────┴─────────────┴────────────────────┘
                          │
    ┌──────────────────────────────────────────────────────────────┐
    │                Enterprise Services                           │
    ├─────────────┬─────────────┬─────────────┬────────────────────┤
    │API Key      │Webhook      │Analytics    │Compliance          │
    │Management   │Manager      │Engine       │Manager             │
    └─────────────┴─────────────┴─────────────┴────────────────────┘
                          │
    ┌──────────────────────────────────────────────────────────────┐
    │               Infrastructure Layer                           │
    ├─────────────┬─────────────┬─────────────┬────────────────────┤
    │PostgreSQL   │Redis Cache  │File Storage │Message Queue       │
    │Database     │& Sessions   │(Replit)     │(Bull/Redis)        │
    └─────────────┴─────────────┴─────────────┴────────────────────┘
```

### Role-Based Architecture

#### 🏠 Customer Dashboard (End Users)
- **Identity Verification**: Streamlined proof generation workflows
- **Proof Management**: View, share, and manage verification proofs
- **QR Code Generation**: Secure proof sharing via tamper-proof QR codes
- **Privacy Controls**: Granular consent and data management
- **Verification History**: Complete audit trail with timestamps

#### 🏢 Organization Admin Dashboard (Enterprise Clients)
- **API Key Management**: Secure key generation, rotation, and monitoring
- **Webhook Configuration**: Event subscription with delivery monitoring
- **Usage Analytics**: Real-time API usage and billing metrics
- **Team Management**: Role-based access for organization members
- **Integration Tools**: SDK documentation and testing environments

#### ⚙️ System Admin Dashboard (Platform Operations)
- **System Health**: Real-time infrastructure monitoring and alerts
- **User Management**: User administration and role assignment
- **Security Center**: Fraud detection and incident response
- **Compliance Dashboard**: GDPR/regulatory compliance tracking
- **Audit Trail**: Comprehensive forensic activity logging

## Technology Stack

### Frontend
- **React 18**: Modern React with TypeScript for type safety
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible, unstyled UI primitives for enterprise components
- **TanStack Query**: Server state management with intelligent caching
- **Wouter**: Lightweight client-side routing with role-based guards
- **React Hook Form**: Performance-focused forms with Zod validation

### Backend
- **Node.js 18+**: Runtime environment with full TypeScript support
- **Express.js**: Production-grade web application framework
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL
- **PostgreSQL**: Primary database with Neon cloud hosting
- **Redis**: Caching, sessions, and rate limiting
- **Bull**: Robust job queue processing
- **Winston**: Structured logging with multiple transports

### Authentication & Security
- **Replit Auth**: OpenID Connect integration with session management
- **WebAuthn**: Hardware security keys and biometric authentication
- **bcryptjs**: Industry-standard password hashing
- **Express Session**: Secure session management with PostgreSQL storage
- **Rate Limiting**: Redis-backed protection with configurable policies

### Cryptography & Zero-Knowledge
- **Circom**: Zero-knowledge circuit compiler for proof generation
- **SnarkJS**: JavaScript library for zkSNARKs verification
- **AES Encryption**: Secure QR code payload encryption
- **Digital Signatures**: HMAC-SHA256 for tamper protection
- **Nonce Management**: Replay attack prevention

### Development & Operations
- **TypeScript**: End-to-end type safety
- **ESLint & Prettier**: Code quality and formatting
- **GitHub Actions**: CI/CD automation
- **Docker**: Containerization for consistent deployments
- **Error Monitoring**: Comprehensive error tracking and alerting

## Quick Start

### Prerequisites
- **Node.js 18+** with npm
- **PostgreSQL 14+** (or use Neon cloud database)
- **Redis 6+** for caching and sessions
- **Git** for version control

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/veridity/platform.git
   cd platform
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables (see Configuration section)
   ```

3. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start development**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Replit Deployment

1. **Import repository** into Replit
2. **Environment variables** are pre-configured
3. **Database** is provided via Neon PostgreSQL
4. **Click Run** to start the application

## Authentication & RBAC

### Supported Authentication Methods

#### 1. Email/Password Authentication
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### 2. OAuth Providers
- **Google**: OAuth 2.0 with OpenID Connect
- **GitHub**: GitHub OAuth integration
- **Microsoft**: Azure AD B2C integration
- **Apple**: Sign in with Apple

#### 3. WebAuthn Passkeys
- **Hardware Keys**: YubiKey, Titan, and other FIDO2 devices
- **Biometrics**: Touch ID, Face ID, Windows Hello
- **Platform Authenticators**: Built-in device security

### Role-Based Access Control (RBAC)

#### User Roles
- **`customer`**: End users who generate and share proofs
- **`client`**: Organization admins who verify proofs via API
- **`admin`**: Platform administrators with full system access

#### Permission Matrix
| Resource | Customer | Client | Admin |
|----------|----------|--------|--------|
| Generate Proofs | ✅ | ❌ | ✅ |
| Verify Proofs | ❌ | ✅ | ✅ |
| API Keys | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ✅ |

#### Server-Side Enforcement
```javascript
// All routes are protected with isAuthenticated middleware
app.get('/api/admin/*', isAuthenticated, checkRole('admin'), handler);
app.get('/api/org-admin/*', isAuthenticated, checkRole(['client', 'admin']), handler);
```

## Role-Based Dashboards

### Customer Dashboard Features

**Quick Actions**
- Generate new proofs with guided workflows
- Share proofs securely via QR codes
- View verification history and status

**Analytics & Insights**
- Total proofs generated
- Verification success rate
- Recent activity timeline

**Privacy Management**
- Granular data consent controls
- Proof expiry management
- Data deletion requests

### Organization Admin Dashboard Features

**API Management**
- Create and rotate API keys
- Monitor usage and rate limits
- Configure webhook endpoints

**Analytics & Reporting**
- Real-time verification metrics
- API usage analytics
- Revenue and billing insights

**Team Collaboration**
- Invite team members
- Assign roles and permissions
- Activity audit trails

### System Admin Dashboard Features

**System Monitoring**
- Real-time health metrics
- Performance monitoring
- Error rate tracking

**User Management**
- User account administration
- Role assignment and modification
- Bulk user operations

**Security Operations**
- Fraud detection alerts
- Security incident response
- Audit log analysis

## Secure QR System

### QR Code Security Features

#### Cryptographic Protection
- **Digital Signatures**: HMAC-SHA256 prevents tampering
- **AES Encryption**: Payload encryption for confidentiality
- **Nonce Generation**: 32-byte random nonces prevent replay attacks
- **Expiry Validation**: Time-based expiration with configurable limits

#### QR Payload Schema v1.0
```typescript
{
  version: "1.0",
  type: "proof_verification" | "identity_share" | "login_request",
  nonce: string, // 32-byte cryptographically secure random
  expiresAt: number, // Unix timestamp
  issuer: {
    id: string,
    name: string,
    domain?: string
  },
  payload: {
    proofTypes?: string[],
    requiredFields?: string[],
    sharedProofId?: string,
    sessionId?: string,
    redirectUrl?: string
  },
  signature: string, // HMAC-SHA256 signature
  metadata?: {
    timestamp: number,
    userAgent?: string,
    ipAddress?: string
  }
}
```

### QR Generation API

**Generate Secure QR Code**
```javascript
POST /api/qr/generate
{
  "type": "proof_verification",
  "expiryMinutes": 15,
  "payload": {
    "proofTypes": ["age_verification"],
    "requiredFields": ["minAge"]
  }
}

Response:
{
  "success": true,
  "qr": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "qrCodeUrl": "https://veridity.com/verify/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": 1705123456789,
    "deepLinkUrl": "/verify/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Verify QR Code**
```javascript
POST /api/qr/verify
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "checksum": "abc12345"
}

Response:
{
  "success": true,
  "payload": { /* Decrypted payload */ },
  "metadata": {
    "verifiedAt": 1705123456789,
    "timeToExpiry": 847,
    "issuerVerified": true,
    "nonceChecked": true
  }
}
```

### Deep Link Integration

**URL Format**
```
/verify/:token?c=:checksum
```

**Automatic Verification Flow**
1. User scans QR code with mobile camera
2. Deep link opens Veridity app
3. Token is automatically verified
4. User is redirected to verification result page
5. Success/error state is displayed with clear messaging

## API Documentation

### Authentication

All API endpoints require authentication via session cookies or API keys.

**Session Authentication**
```bash
curl -X POST https://api.veridity.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

**API Key Authentication**
```bash
curl -H "Authorization: Bearer vrd_your_api_key" \
  https://api.veridity.com/api/proofs
```

### Core Endpoints

#### Dashboard APIs

**User Dashboard Data**
```javascript
GET /api/user/dashboard

Response:
{
  "user": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com"
  },
  "stats": {
    "totalProofs": 15,
    "verifiedProofs": 14,
    "recentProofs": [...]
  }
}
```

**Organization Admin Dashboard**
```javascript
GET /api/org-admin/dashboard

Response:
{
  "organization": {
    "id": "org_123",
    "name": "Example Corp",
    "type": "enterprise",
    "isActive": true
  },
  "stats": {
    "todayVerifications": 145,
    "monthlyVerifications": 3420,
    "successRate": 98.5,
    "avgTime": 127
  },
  "apiKeys": [...],
  "webhooks": [...],
  "recentActivity": [...]
}
```

**System Admin Dashboard**
```javascript
GET /api/admin/dashboard

Response:
{
  "systemHealth": {
    "status": "healthy",
    "uptime": "99.9%",
    "responseTime": 145,
    "errorRate": 0.02
  },
  "userStats": {
    "total": 15420,
    "admins": 12,
    "clients": 89,
    "customers": 15319,
    "dailyActive": 2341
  },
  "systemStats": {...},
  "recentIncidents": [...],
  "securityEvents": [...]
}
```

#### Zero-Knowledge Proof APIs

**Generate Proof**
```javascript
POST /api/proofs/generate
{
  "proofType": "age_verification",
  "privateInputs": {
    "birthYear": 1990,
    "birthMonth": 5,
    "birthDay": 15
  },
  "publicInputs": {
    "minAge": 18
  }
}
```

**Verify Proof**
```javascript
POST /api/proofs/verify
{
  "proof": { /* zkSNARK proof object */ },
  "publicSignals": ["1", "0x..."],
  "verificationKey": { /* verification key */ }
}
```

### Enterprise APIs

#### API Key Management
```javascript
POST /api/enterprise/api-keys
{
  "name": "Production API Key",
  "permissions": ["proofs:read", "proofs:create"],
  "rateLimit": {
    "requests": 1000,
    "window": 3600
  }
}
```

#### Webhook Management
```javascript
POST /api/enterprise/webhooks
{
  "url": "https://your-app.com/webhooks/veridity",
  "events": ["proof.created", "verification.completed"],
  "headers": {
    "Authorization": "Bearer your_token"
  }
}
```

#### Usage Analytics
```javascript
GET /api/enterprise/analytics?timeRange=7d

Response:
{
  "totalRequests": 15420,
  "successfulRequests": 14856,
  "errorRequests": 564,
  "averageResponseTime": 127.5,
  "requestsByEndpoint": {
    "/api/proofs/generate": 8540,
    "/api/proofs/verify": 6880
  }
}
```

## Security & Compliance

### GDPR Compliance

#### Data Subject Rights Implementation

**Right to Access (Article 15)**
```javascript
GET /api/compliance/gdpr/access?userId=user_123

Response:
{
  "personalData": { /* user data */ },
  "processingActivities": [ /* how data is used */ ],
  "dataSharing": [ /* third-party sharing */ ],
  "retentionPeriods": [ /* how long data is kept */ ]
}
```

**Right to Erasure (Article 17)**
```javascript
POST /api/compliance/gdpr/erasure
{
  "userId": "user_123",
  "reason": "User requested account deletion"
}

Response:
{
  "deletedDataTypes": ["personal_identifiers", "verification_history"],
  "retainedDataTypes": ["audit_logs"],
  "retentionReasons": {
    "audit_logs": "Legal obligation for 7 years"
  }
}
```

**Data Portability (Article 20)**
```javascript
POST /api/compliance/gdpr/portability
{
  "userId": "user_123",
  "format": "json"
}

Response:
{
  "data": { /* portable user data */ },
  "format": "json",
  "exportedAt": "2024-01-15T10:30:00Z",
  "dataIntegrity": "sha256:abc123..."
}
```

### Security Architecture

#### Multi-Layer Security
- **Application Layer**: RBAC, input validation, output encoding
- **Transport Layer**: TLS 1.3, HSTS, certificate pinning
- **Data Layer**: AES-256 encryption, field-level encryption
- **Infrastructure Layer**: WAF, DDoS protection, network segmentation

#### Audit & Monitoring
```javascript
// Comprehensive audit logging
{
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_123",
  "action": "proof_generation",
  "resource": "age_verification",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "outcome": "success",
  "riskScore": 15,
  "metadata": { /* additional context */ }
}
```

#### Fraud Detection
- **Real-time Scoring**: Machine learning models with <100ms response
- **Behavioral Analysis**: Mouse patterns, typing cadence, navigation flow
- **Device Fingerprinting**: 15+ device characteristics analysis
- **Network Intelligence**: IP reputation, geolocation anomalies
- **Document Verification**: OCR, image analysis, forgery detection

## Configuration

### Environment Variables

#### Core Configuration
```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database & Cache
DATABASE_URL=postgresql://user:pass@host:5432/veridity
REDIS_URL=redis://localhost:6379

# Authentication & Security
SESSION_SECRET=your_cryptographically_secure_session_secret
QR_SIGNING_SECRET=your_qr_signing_secret_key
QR_ENCRYPTION_KEY=your_32_byte_encryption_key

# Replit Integration
REPLIT_DOMAINS=your-domain.replit.app
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id
```

#### Feature Flags
```env
# Enterprise Features
ENABLE_API_KEYS=true
ENABLE_WEBHOOKS=true
ENABLE_ANALYTICS=true
ENABLE_FRAUD_DETECTION=true

# Security Features
ENABLE_RATE_LIMITING=true
ENABLE_AUDIT_LOGGING=true
ENABLE_QR_SECURITY=true
ENABLE_BIOMETRIC_AUTH=true
```

#### Rate Limiting
```env
# API Rate Limits
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # 100 requests per window
QR_GENERATION_LIMIT=50    # 50 QR codes per hour
QR_VERIFICATION_LIMIT=500 # 500 verifications per hour
```

### Database Configuration

#### Schema Management
```bash
# Generate migrations
npm run db:generate

# Apply migrations  
npm run db:push

# Force schema sync (development only)
npm run db:push --force

# Seed initial data
npm run db:seed
```

#### Connection Pooling
```env
# PostgreSQL Connection Pool
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_ACQUIRE_TIMEOUT=60000
```

## Deployment

### Production Deployment

#### Replit Deployment (Recommended)
1. **Import repository** into Replit
2. **Configure environment variables** in Replit Secrets
3. **Deploy** using Replit Deployments
4. **Custom domain** configuration available

#### Docker Deployment
```bash
# Build production image
docker build -t veridity:latest .

# Run with environment variables
docker run -d \
  --name veridity \
  -p 5000:5000 \
  --env-file .env.production \
  veridity:latest
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=veridity
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:6-alpine
```

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
DEBUG=veridity:*
LOG_LEVEL=debug
ENABLE_HOT_RELOAD=true
```

#### Staging
```env
NODE_ENV=staging
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
```

#### Production
```env
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_COMPRESSION=true
ENABLE_SECURITY_HEADERS=true
ENABLE_MONITORING=true
```

### Monitoring & Health Checks

#### Health Endpoints
- **`/health`**: Basic application health
- **`/health/detailed`**: Comprehensive system status
- **`/metrics`**: Prometheus-compatible metrics
- **`/status`**: Real-time system status

#### Monitoring Integration
```env
# Application Performance Monitoring
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_key

# Infrastructure Monitoring  
PROMETHEUS_ENDPOINT=http://prometheus:9090
GRAFANA_URL=https://grafana.your-domain.com
```

## Contributing

### Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Setup environment**: Copy `.env.example` to `.env`
4. **Run database migrations**: `npm run db:push`
5. **Start development server**: `npm run dev`

### Code Style

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type checking
npm run type-check

# Run all checks
npm run check-all
```

### Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Implement changes** with tests
3. **Run all checks**: `npm run check-all`
4. **Submit PR** with detailed description
5. **Address review feedback**
6. **Merge** after approval

### Commit Convention

```
feat: add secure QR code generation
fix: resolve authentication session issue  
docs: update API documentation
test: add integration tests for RBAC
refactor: improve error handling
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support & Resources

- **Documentation**: [docs.veridity.com](https://docs.veridity.com)
- **API Reference**: [api.veridity.com](https://api.veridity.com)
- **Developer Portal**: [developers.veridity.com](https://developers.veridity.com)
- **Community Forum**: [community.veridity.com](https://community.veridity.com)
- **Enterprise Support**: [enterprise@veridity.com](mailto:enterprise@veridity.com)

---

**Built with ❤️ for privacy-first digital identity verification**