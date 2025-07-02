# MBSPro - AI Receptionist Dashboard

## Overview

MBSPro is a healthcare management web application built for Australian general practice clinics to manage AI-powered phone reception services. The system integrates with ElevenLabs' AI voice agent to handle patient phone calls and provides a dashboard for clinic staff to review, approve, and manage these interactions.

The application features a modern, clean interface designed specifically for healthcare professionals, with real-time call monitoring, transcript review, and patient management capabilities.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React 18 with TypeScript, using Vite for development and build tooling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state and caching

### Monorepo Structure
The application follows a monorepo pattern with shared types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common TypeScript types and database schemas
- `migrations/` - Database migration files

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query for server state management with 30-second auto-refresh

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Session-based authentication (infrastructure in place)
- **External Integration**: ElevenLabs API integration for call data synchronization

### Database Schema
The application uses two main entities:
- **Users**: Basic user management with username/password authentication
- **Calls**: Comprehensive call records including:
  - Patient information (name, phone, verification status)
  - Call metadata (timestamp, reason, outcome)
  - AI decision tracking and attention flags
  - Rich transcript data with speaker identification and keywords
  - Status workflow (pending → approved → completed)

## Data Flow

### Call Management Workflow
1. **Data Ingestion**: ElevenLabs API calls are fetched and synchronized to local database
2. **Real-time Updates**: Frontend polls for new calls every 30 seconds
3. **Review Process**: Staff can view detailed call transcripts and AI decisions
4. **Action Management**: Calls can be approved, flagged for callback, or marked complete
5. **Escalation**: Complex cases can be escalated to GPs with attention flags

### State Management
- Server state managed by TanStack Query with optimistic updates
- Local UI state handled by React hooks
- Form state managed by React Hook Form with Zod schema validation
- Real-time updates through polling (30-second intervals)

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Backend**: Express.js, Node.js with ES modules
- **Database**: PostgreSQL via Neon serverless, Drizzle ORM
- **Validation**: Zod for runtime type checking and form validation

### UI and Styling
- **Component Library**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

### External Services
- **ElevenLabs Integration**: API integration for AI call agent data
- **Database**: Neon PostgreSQL serverless database
- **Development**: Replit platform with built-in PostgreSQL

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module in Replit
- **Development Server**: Concurrent frontend (Vite) and backend (tsx) processes
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend

### Production Build
- **Frontend**: Vite production build with static asset optimization
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema management
- **Deployment**: Replit autoscale deployment target

### Configuration
- Environment variables for database connection and ElevenLabs API key
- TypeScript path mapping for clean imports
- Replit-specific optimizations and error handling

## Recent Changes
- June 25, 2025: Enhanced settings interface with explicit save buttons for First Message and System Prompt submissions to ElevenLabs
- June 25, 2025: Added refresh button to call table with spinning animation and manual data refresh capability
- June 25, 2025: Removed actions column from call table for cleaner, simplified interface
- June 25, 2025: Fixed double "Dr." prefix issue in doctor name display
- June 25, 2025: Fixed call display issue - changed default date filter from "today" to "all" to show recent calls from last 24 hours
- June 25, 2025: Updated ElevenLabs field mapping from "Appointment_Reason" to "Reason" and added new "Doctor" field display
- June 25, 2025: Added "Back to Dashboard" navigation button to settings page for improved user flow
- June 24, 2025: Made application fully responsive for mobile, tablet, and desktop devices
- June 24, 2025: Integrated custom MBSPro logomark from provided website with medical cross design
- June 24, 2025: Removed user information from navigation for cleaner interface
- June 24, 2025: Rebranded application to "MBSPro" with "AI receptionist" subheading
- June 24, 2025: Fixed knowledge base editing functionality with proper ElevenLabs content loading
- June 24, 2025: Added comprehensive settings interface for ElevenLabs Support Agent configuration
- June 24, 2025: Integrated real patient data extraction from ElevenLabs conversation analysis
- June 24, 2025: Enhanced dashboard table with appointment types, dates, and patient information display
- June 23, 2025: Initial setup with call dashboard and ElevenLabs API integration

## User Preferences

Preferred communication style: Simple, everyday language.