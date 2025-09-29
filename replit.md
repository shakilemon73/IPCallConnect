# VoiceLink - IP-Based Calling System

## Overview

VoiceLink is a comprehensive web application for IP-based calling, similar to Bangladeshi VoIP services. The application enables secure voice and video calling with support for app-to-app calls (free) and PSTN/mobile calls to Bangladesh numbers at low rates. Built as a full-stack TypeScript application with React frontend and Express backend, it integrates Twilio for telecommunications capabilities and uses PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

**Key Design Patterns:**
- Component-based architecture with reusable UI primitives
- Custom hooks for cross-cutting concerns (auth, language, theme, WebSocket)
- Context-based language and theme providers for i18n and dark mode support
- Tab-based navigation (Dialer, Contacts, History, Wallet) in main app interface

**Authentication Flow:**
- Uses Replit Auth (OpenID Connect) as primary authentication mechanism
- Auto-creates user accounts on first login
- Session-based authentication with HTTP-only cookies
- Fallback signup mechanism with phone/NID verification

**Multilingual Support:**
- English and Bengali (Bangla) language support
- Translation system via custom `useLanguage` hook
- Language preference persisted in localStorage

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Drizzle ORM for type-safe database operations
- **Database Driver**: Neon serverless PostgreSQL driver
- **Authentication**: Passport.js with OpenID Connect strategy
- **Session Store**: PostgreSQL-backed sessions via connect-pg-simple
- **WebSocket**: Native WebSocket server for real-time notifications

**API Structure:**
- RESTful API endpoints under `/api` prefix
- Authentication middleware protecting sensitive routes
- Separation of concerns: routes, storage layer, external services

**Key Services:**
- **TwilioService**: Handles voice SDK integration, token generation, OTP verification
- **Storage Layer**: Abstraction over database operations with interface-driven design
- Database operations for users, contacts, call history, transactions, and call rates

**WebSocket Implementation:**
- Real-time push notifications for incoming calls
- User-based connection tracking with userId mapping
- Automatic reconnection logic on client side

### Data Storage

**Database**: PostgreSQL (via Neon serverless)

**Schema Design:**
1. **sessions**: Session storage for authentication (required by Replit Auth)
2. **users**: Core user data including phone, NID, balance, Twilio identity
3. **contacts**: User contacts with VoiceLink user detection
4. **call_history**: Call logs with type, duration, cost tracking
5. **transactions**: Wallet transactions for recharges and call costs
6. **call_rates**: Country/prefix-based call rate configuration

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Migration files in `/migrations` directory
- Schema defined in TypeScript (`shared/schema.ts`)

**Data Validation:**
- Zod schemas for runtime validation
- Type inference from Drizzle schemas for compile-time safety

### External Dependencies

**Twilio Integration:**
- **Programmable Voice SDK**: For voice calling capabilities
- **Verify API**: For OTP-based phone verification
- **Access Tokens**: JWT-based client authentication using API keys
- **TwiML**: Call flow configuration (though app SID is referenced)
- Configuration via environment variables:
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_API_KEY
  - TWILIO_API_SECRET
  - TWILIO_APP_SID
  - TWILIO_VERIFY_SID
  - TWILIO_PHONE_NUMBER

**Replit Services:**
- **Replit Auth**: OpenID Connect authentication provider
- **Database**: Managed PostgreSQL database
- **Environment Variables**: REPL_ID, REPLIT_DOMAINS, ISSUER_URL, SESSION_SECRET

**Payment Integration (Planned):**
- bKash SDK/API for Bangladesh mobile money recharges
- Nagad support mentioned in requirements
- Stripe integration (@stripe/react-stripe-js, @stripe/stripe-js dependencies present)

**Development Tools:**
- **Vite Plugins**: Runtime error overlay, cartographer, dev banner (Replit-specific)
- **WebSocket**: ws library for server-side WebSocket implementation

**UI Component Libraries:**
- Comprehensive Radix UI primitives for accessible components
- Lucide React for icons
- date-fns for date formatting
- class-variance-authority and clsx for conditional styling

**Compliance Considerations:**
- BTRC IPTSP guidelines mentioned (Bangladesh Telecommunication Regulatory Commission)
- KYC requirements via NID verification
- End-to-end encryption references (SRTP, TLS) for secure calling
- GDPR-like privacy policy requirements