# Overview

This is a Stage Timer Pro application - a professional timer system designed for presentations, events, and stage management. The application features a master-client architecture where one master controller can manage multiple display screens over a network connection. It supports both countdown and stopwatch modes, with real-time synchronization between master and client displays. The system includes preset timers, custom time settings, message broadcasting, and selective UI element visibility control for professional stage management scenarios.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript**: Modern React application with TypeScript for type safety
- **Vite**: Fast build tool and development server with hot module replacement
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with pre-built component library
- **Component Structure**: Modular components including Timer display, Controls, Settings, Network status, Master controls, and Message overlays
- **Hooks Pattern**: Custom hooks for timer logic (`useTimer`), network communication (`useNetworkTimer`), and master control (`useMasterControl`)

## Backend Architecture
- **Express.js**: RESTful API server with middleware for logging and error handling
- **WebSocket Server**: Real-time bidirectional communication using `ws` library for timer synchronization
- **Modular Route System**: Separated route registration and storage abstraction
- **Development Integration**: Vite middleware integration for seamless development experience

## Data Storage
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Schema Definition**: Centralized schema in `shared/schema.ts` with Zod validation
- **Storage Abstraction**: Interface-based storage system with in-memory implementation for development
- **Database Migrations**: Automated migration system using Drizzle Kit

## State Management
- **Network State Synchronization**: Master-client architecture with WebSocket-based real-time updates
- **Timer State**: Centralized timer state management with automatic synchronization across clients
- **Connection Management**: Automatic reconnection, ping/pong health checks, and client connection tracking
- **Message Broadcasting**: Support for global and targeted message delivery to specific screens

## Authentication & Authorization
- **Basic User System**: Simple username/password authentication with user creation capabilities
- **Session Management**: Ready for session-based authentication implementation
- **No Current Auth**: Authentication system is scaffolded but not actively implemented in timer functionality

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database via `@neondatabase/serverless`
- **Connection**: Configured through `DATABASE_URL` environment variable

## UI Components
- **shadcn/ui**: Complete UI component library built on Radix UI primitives
- **Radix UI**: Low-level accessible UI primitives for complex components
- **React Hook Form**: Form state management with Zod validation integration
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Replit Integration**: Built-in Replit development environment support with runtime error overlay
- **ESBuild**: Fast bundling for production builds
- **TypeScript**: Full type safety across frontend, backend, and shared code

## Runtime Dependencies
- **TanStack Query**: Data fetching and caching (installed but not actively used)
- **Date-fns**: Date manipulation utilities for time formatting
- **Class Variance Authority**: Utility for conditional CSS class management
- **CLSX**: Conditional class name utility for dynamic styling

## WebSocket Communication
- **ws**: WebSocket server implementation for real-time timer synchronization
- **connect-pg-simple**: PostgreSQL session store for Express sessions (configured but not actively used)

## Build & Development
- **Vite**: Development server and build tool with React plugin
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **TSX**: TypeScript execution for development server