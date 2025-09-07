# CutFast

A local-first text shortcut platform that boosts productivity with intelligent text shortcuts. Create, manage, and use custom shortcuts across all your favorite apps and websites for instantaneous, offline-capable text expansion.

## Overview

CutFast is designed to enhance productivity by providing a seamless text expansion experience. The platform separates the operational path (typing and expanding text) from the synchronization path (background sync), ensuring that text expansion is never blocked by network latency.

Key components:
- **Web Dashboard**: Next.js-based management interface for CRUD operations on shortcuts and categories
- **Browser Extension**: Vite + React extension that handles text detection and expansion
- **Local Storage**: Dexie-powered IndexedDB for offline functionality
- **Authentication**: Dual authentication strategy using better-auth for both web and extension access

## Features

### Core Features
- **Instant Text Expansion**: Trigger shortcuts with patterns like `/msg-2` for immediate replacement
- **Offline Capability**: Local database ensures functionality without internet connection
- **Cross-Platform**: Works across all websites and apps that support text input
- **Secure Sync**: Background synchronization with row-level security
- **User Management**: Categories and shortcuts with per-user scoping
- **Modern UI**: Clean, responsive dashboard built with Next.js and React

### Advanced Features
- **Admin Dashboard**: Complete administrative control with user management, signup limits, and system configuration
- **Signup Control**: Enable/disable user registration and set maximum user limits
- **Self-Hosting Support**: Custom API endpoint configuration for self-deployed instances
- **Data Portability**: Full import/export functionality for shortcuts with JSON format
- **One-Click Build**: Automated build script for Firefox and Chrome extensions
- **Automated Deployment**: GitHub Actions workflow for extension releases
- **Database Automation**: Docker-based PostgreSQL setup for development and production

### Security & Access Control
- **Role-Based Access**: Admin users with elevated permissions
- **Login Prevention**: Configurable signup restrictions
- **User Limits**: Enforceable maximum user count
- **Row-Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication for extensions

## Architecture

The system is organized into four logical planes:

- **Management Plane**: Web Dashboard (Next.js 15) for user interface
- **Control Plane**: Backend API (Next.js Route Handlers) with authentication
- **Data Plane**: PostgreSQL database for persistent storage
- **Execution Plane**: Browser Extension for text expansion functionality

## Technology Stack

- **Web Dashboard**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes, better-auth, tRPC
- **Web Database**: PostgreSQL with Drizzle ORM
- **Extension Database**: Dexie (IndexedDB wrapper)
- **Sync**: REST API synchronization
- **Extension**: Vite, React, Manifest V3
- **Styling**: Tailwind CSS, shadcn/ui components
- **Build Tools**: pnpm, Vite

## Getting Started

### Prerequisites

- Node.js (latest LTS)
- pnpm package manager
- PostgreSQL database (or Docker for automated setup)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/HimanshuKumarDutt094/cutfast.git
   cd cutfast
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `src/web/.env.example` to `src/web/.env`
   - Copy `src/extension/.env.example` to `src/extension/.env`
   - Configure database connection and authentication settings

4. **Set up the database (Automated)**
   ```bash
   cd src/web
   ./start-database.sh
   ```

5. **Run the development servers**
   ```bash
   # Web dashboard (in one terminal)
   cd src/web
   pnpm dev

   # Extension (in another terminal)
   cd src/extension
   pnpm dev
   ```

6. **Build the extension (One-Click)**
   ```bash
   cd src/extension
   ./build.sh all
   ```

### Admin Setup

After installation, create your first admin user:

1. Visit the web dashboard at `http://localhost:3000`
2. Sign up for an account
3. Access the admin panel at `/dashboard/admin`
4. Configure system settings like user limits and signup controls

### Self-Hosting

For production deployment:

1. **Database**: Use PostgreSQL (managed or self-hosted)
2. **Web App**: Deploy to Vercel, Netlify, or any Node.js hosting
3. **Extensions**: Use the automated build script and GitHub releases
4. **Custom Endpoints**: Configure extension to use your custom API URL

### Extension Installation

**Development:**
- Firefox: Load `src/extension/dist-firefox` as temporary add-on
- Chrome: Load `src/extension/dist-chrome` as unpacked extension

**Production:**
- Download pre-built extensions from GitHub releases
- Follow browser-specific installation instructions

## Project Structure

```
cutfast/
├── src/
│   ├── web-new/          # Next.js web dashboard
│   │   ├── src/app/      # App router pages and API routes
│   │   ├── src/components/ # React components
│   │   └── src/server/   # Server-side utilities
│   └── extension/        # Browser extension
│       ├── src/
│       │   ├── background/ # Service worker
│       │   ├── content-scripts/ # DOM interaction
│       │   └── ui/       # Extension UI components
│       └── manifest.json
├── SPECIFICATION.md      # Technical specification
└── README.md            # This file
```

## Admin Features

CutFast includes a comprehensive admin dashboard for system management:

### User Management
- **User Overview**: View all registered users with email verification status
- **User Limits**: Set maximum number of users allowed on the platform
- **Signup Control**: Enable/disable new user registration
- **Admin Access**: Role-based access control for administrative functions

### System Configuration
- **Database Management**: Automated PostgreSQL setup with Docker
- **Environment Setup**: Streamlined configuration for development and production
- **Build Automation**: One-click build scripts for extensions

### Security Features
- **Access Control**: Admin-only access to sensitive system settings
- **Audit Trail**: User registration and activity monitoring
- **Data Export**: Administrative data export capabilities

## Self-Hosting & Deployment

### Database Setup
CutFast includes automated database setup:

```bash
# Automated PostgreSQL setup with Docker
cd src/web
./start-database.sh
```

This script:
- Checks for Docker/Podman availability
- Creates a PostgreSQL container with proper configuration
- Generates secure random passwords
- Handles port conflicts and existing containers

### Custom API Endpoints
For self-hosted deployments, configure custom API URLs:

1. **Extension Configuration**: Set custom API endpoint in extension settings
2. **Environment Variables**: Configure `VITE_PUBLIC_API_URL` for custom deployments
3. **CORS Setup**: Ensure proper cross-origin resource sharing configuration

### Build & Release Automation
One-click build system for extensions:

```bash
# Build both Firefox and Chrome extensions
cd src/extension
./build.sh all

# Build specific browser
./build.sh firefox
./build.sh chrome
```

### GitHub Actions Deployment
Automated release workflow:
- Triggered by git tags (e.g., `v1.0.0`)
- Builds extensions for both browsers
- Creates GitHub releases with installation instructions
- Generates browser-specific download links

## API Endpoints

The backend provides RESTful API endpoints for shortcuts and categories:

### Shortcuts
- `GET/POST /api/shortcuts` - List and create shortcuts
- `GET/PUT/DELETE /api/shortcuts/{id}` - Manage individual shortcuts
- `GET /api/shortcuts/export` - Export shortcuts to JSON
- `POST /api/shortcuts/import` - Import shortcuts from JSON

### Categories
- `GET/POST /api/categories` - List and create categories
- `PUT/DELETE /api/categories/{id}` - Manage individual categories

### Admin
- `GET/POST /api/admin/config` - Get/update system configuration
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/admin/signup-toggle` - Enable/disable user registration

## Authentication

- **Web Dashboard**: Cookie-based sessions with better-auth
- **Extension**: JWT tokens with automatic refresh mechanism
- **Security**: Row-level security enforced through authorizing proxy
- **Admin Access**: Role-based permissions for system administration

## Contributing

1. Follow the existing code style and patterns
2. Test your changes thoroughly
3. Submit a pull request with a clear description

## License

This project is open source. See LICENSE file for details.

## Author

**Himanshu Kumar Dutt**

- **GitHub**: [github.com/HimanshuKumarDutt094](https://github.com/HimanshuKumarDutt094)
- **LinkedIn**: [linkedin.com/in/himanshu-dutt-77](https://linkedin.com/in/himanshu-dutt-77)
- **Portfolio**: [v0-himanshu-portfolio-peach.vercel.app](https://v0-himanshu-portfolio-peach.vercel.app/)
- **Email**: adasimobenio@gmail.com
