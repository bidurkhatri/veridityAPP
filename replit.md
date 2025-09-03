# Veridity - Privacy-First Digital Identity Platform

## Overview

Veridity is a privacy-first digital identity platform designed specifically for Nepal. It leverages Zero-Knowledge Proofs (ZKP) to enable users to prove specific identity attributes (such as age, citizenship, education, income) without revealing sensitive personal data. The platform is built as a full-stack web application with React frontend and Express backend, designed to work reliably in low-connectivity environments typical of Nepal's rural areas.

The system allows users to generate cryptographic proofs for various identity attributes and enables organizations to verify these proofs without accessing the underlying personal data. This creates a trustless verification system that prioritizes user privacy while maintaining security and reliability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React with Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Internationalization**: Custom i18n system supporting English and Nepali languages

The frontend is structured with clear separation of concerns:
- Pages for main application views (Dashboard, ProofGeneration, Verification, Admin)
- Reusable UI components built on Radix UI primitives
- Custom hooks for authentication and mobile responsiveness
- Type-safe API communication with the backend

### Backend Architecture
The backend follows a RESTful API design using Express.js:

- **Framework**: Express.js with TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit's OpenID Connect integration with session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **ZKP Service**: Mock implementation for Zero-Knowledge Proof generation and verification

Key architectural decisions:
- **Separation of Concerns**: Clear separation between routes, storage, and services
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Modular Design**: Separate modules for authentication, storage, and ZKP operations
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Database Design
The system uses PostgreSQL with the following key entities:

- **Users**: Store basic user information from OIDC authentication
- **Proof Types**: Define available proof categories (age, citizenship, education, etc.)
- **Proofs**: Store generated proofs with metadata and status
- **Verifications**: Track proof verification attempts and results
- **Organizations**: Manage entities that can verify proofs
- **Audit Logs**: Track all system activities for security and compliance
- **Sessions**: Secure session storage for authentication

The schema is designed with privacy in mind - actual personal data is never stored, only cryptographic proofs and metadata.

### Security Architecture
Security is implemented at multiple layers:

- **Authentication**: OpenID Connect with Replit for secure user authentication
- **Session Management**: Secure, HTTP-only cookies with proper expiration
- **Data Privacy**: Zero-knowledge approach where personal data never leaves the user's device
- **API Security**: Authenticated endpoints with proper authorization checks
- **Database Security**: Parameterized queries through Drizzle ORM to prevent SQL injection

### Mobile-First Design
The application is designed mobile-first to serve Nepal's predominantly mobile user base:

- **Responsive Design**: Tailwind CSS classes ensure proper rendering on all screen sizes
- **Touch-Friendly**: Large touch targets and gesture-friendly interactions
- **Offline Capability**: Designed for intermittent connectivity scenarios
- **Progressive Enhancement**: Core functionality works with minimal JavaScript

## External Dependencies

### Cloud Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit**: Development and hosting platform with integrated authentication

### Frontend Libraries
- **React Ecosystem**: React 18 with TypeScript for the main application framework
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **TanStack Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight routing solution for single-page application navigation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### Backend Libraries
- **Express.js**: Web application framework for Node.js
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **OpenID Connect**: Standard authentication protocol implementation
- **Express Session**: Session middleware with PostgreSQL storage

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tools

### Authentication & Security
- **Replit OpenID Connect**: Federated authentication service
- **Connect-PG-Simple**: PostgreSQL session store for Express sessions
- **Secure Session Management**: HTTP-only cookies with proper security headers

The architecture prioritizes type safety, developer experience, and user privacy while maintaining the flexibility to scale and adapt to Nepal's unique digital infrastructure challenges.