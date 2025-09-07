# CutFast Browser Extension

A Firefox/Chrome extension for text shortcuts and instant text expansion built with React, TypeScript, and Vite.

## Overview

CutFast is a local-first text shortcut platform that allows users to create and manage text shortcuts for instant expansion across web pages. The extension provides a popup interface for managing shortcuts and a content script that handles text expansion.

## Public API

CutFast uses a companion web API for user authentication, shortcut synchronization, and data management. The extension is pre-configured to use our public API at `https://cutfast-extension.vercel.app`.

### Deploy Your Own API

For privacy, customization, or self-hosting, you can deploy your own instance of the CutFast API:

1. **Visit the API Repository**: Go to [https://cutfast-extension.vercel.app](https://cutfast-extension.vercel.app)
2. **Click "Deploy with Vercel"**: This will fork and deploy the API to your own Vercel account
3. **Set up Database**: The deployment includes Neon database setup instructions
4. **Configure Extension**: Update your extension to use your custom API URL

#### Using Custom API URL

After deploying your own API, configure the extension to use it:

1. Open the CutFast extension popup
2. Go to Settings
3. Enter your custom API URL (e.g., `https://your-api.vercel.app`)
4. Save the configuration

The extension will automatically use your custom API for all operations while maintaining local storage for offline functionality.

## Build Requirements

### Operating System
- Linux (Ubuntu 18.04+ recommended)
- macOS (10.15+)
- Windows (10+ with WSL for development)

### Software Prerequisites

#### Node.js
- **Version**: 18.0.0 or higher (LTS recommended)
- **Installation**:
  ```bash
  # Using Node Version Manager (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  source ~/.bashrc
  nvm install --lts
  nvm use --lts

  # Or download from https://nodejs.org/
  ```

#### pnpm Package Manager
- **Version**: 8.0.0 or higher
- **Installation**:
  ```bash
  npm install -g pnpm
  # Or using standalone installer
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  ```

#### Firefox Browser (for Firefox extension)
- **Version**: 109.0 or higher
- **Installation**: Download from https://www.mozilla.org/firefox/

#### Chrome Browser (for Chrome extension)
- **Version**: Latest stable
- **Installation**: Download from https://www.google.com/chrome/

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/HimanshuKumarDutt094/cutfast.git
cd cutfast
```

### 2. Install Dependencies
```bash
cd src/extension
pnpm install
```

### 3. Environment Setup
Copy the environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Development Build
```bash
# Start development server
pnpm run dev

# This will start Vite dev server with hot reload
```

## Build Instructions

### Manual Build Process

#### For Firefox Extension
```bash
cd src/extension

# Install dependencies
pnpm install

# Build for Firefox
pnpm run build:firefox

# The built extension will be in dist-firefox/
```

#### For Chrome Extension
```bash
cd src/extension

# Install dependencies
pnpm install

# Build for Chrome
pnpm run build:chrome

# The built extension will be in dist-chrome/
```

#### Build Both Browsers
```bash
cd src/extension

# Install dependencies
pnpm install

# Build for both browsers
pnpm run build:all

# Built extensions will be in dist-firefox/ and dist-chrome/
```

### Automated Build Script

Use the provided build script for automated building:

```bash
cd src/extension

# Make build script executable
chmod +x build.sh

# Build for Firefox
./build.sh firefox

# Build for Chrome
./build.sh chrome

# Build for both
./build.sh all
```

## Installation

### Firefox Extension
1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to `src/extension/dist-firefox/` and select `manifest.json`
6. The extension will be loaded temporarily

### Chrome Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Navigate to `src/extension/dist-chrome/` and select the folder
6. The extension will be loaded

## Project Structure

```
src/extension/
├── src/
│   ├── background/          # Background scripts
│   ├── content-scripts/     # Content scripts for web pages
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── ui/                 # Extension UI (popup, etc.)
│   ├── types/              # TypeScript type definitions
│   ├── zod/                # Zod validation schemas
│   ├── manifest.json       # Chrome manifest
│   ├── manifest.firefox.json # Firefox manifest
│   └── main.tsx            # Extension entry point
├── public/                 # Static assets
├── dist-chrome/            # Chrome build output
├── dist-firefox/           # Firefox build output
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Development Commands

```bash
# Development server
pnpm run dev

# Build for Chrome
pnpm run build:chrome

# Build for Firefox
pnpm run build:firefox

# Build for both browsers
pnpm run build:all

# Lint code
pnpm run lint

# Type checking
pnpm run check-types

# Preview build
pnpm run preview
```

## Technologies Used

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **State Management**: React hooks
- **Database**: Dexie (IndexedDB wrapper)
- **Linting**: Biome
- **Extension Plugin**: vite-plugin-web-extension

## Browser Permissions

The extension requires the following permissions:
- `storage`: For storing shortcuts locally
- `activeTab`: For accessing the current tab
- `<all_urls>`: For content script injection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `pnpm run lint`
5. Build and test the extension
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the Firefox extension documentation: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
