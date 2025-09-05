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

- **Instant Text Expansion**: Trigger shortcuts with patterns like `/msg-2` for immediate replacement
- **Offline Capability**: Local database ensures functionality without internet connection
- **Cross-Platform**: Works across all websites and apps that support text input
- **Secure Sync**: Background synchronization with row-level security
- **User Management**: Categories and shortcuts with per-user scoping
- **Modern UI**: Clean, responsive dashboard built with Next.js and React

## Architecture

The system is organized into four logical planes:

- **Management Plane**: Web Dashboard (Next.js 15) for user interface
- **Control Plane**: Backend API (Next.js Route Handlers) with authentication
- **Data Plane**: PostgreSQL database for persistent storage
- **Execution Plane**: Browser Extension for text expansion functionality

## Technology Stack

- **Web Dashboard**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes, better-auth
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
- PostgreSQL database
- Git

### Installation

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
   - Copy `.env.example` to `.env` in both `src/web-new` and `src/extension`
   - Configure database connection and authentication settings

4. **Set up the database**
   ```bash
   cd src/web-new
   ./start-database.sh
   ```

5. **Run the development servers**
   ```bash
   # Web dashboard
   cd src/web-new
   pnpm dev

   # Extension (in another terminal)
   cd src/extension
   pnpm dev
   ```

6. **Build the extension**
   ```bash
   cd src/extension
   pnpm build
   ```

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

## API Endpoints

The backend provides RESTful API endpoints for shortcuts and categories:

- `GET/POST /api/shortcuts` - List and create shortcuts
- `GET/PUT/DELETE /api/shortcuts/{id}` - Manage individual shortcuts
- `GET/POST /api/categories` - List and create categories
- `PUT/DELETE /api/categories/{id}` - Manage individual categories

## Authentication

- **Web Dashboard**: Cookie-based sessions
- **Extension**: JWT tokens with refresh mechanism
- **Security**: Row-level security enforced through authorizing proxy

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

## Acknowledgments

Built with modern web technologies to provide a seamless productivity experience.
