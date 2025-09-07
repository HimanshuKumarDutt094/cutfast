#!/bin/bash

# CutFast Extension Build Script
# This script automates the build process for Firefox and Chrome extensions

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_nodejs() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18.0.0 or higher."
        print_info "Installation instructions: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v | sed 's/v//')
    REQUIRED_VERSION="18.0.0"

    if ! [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_error "Node.js version $NODE_VERSION is not supported. Please upgrade to Node.js 18.0.0 or higher."
        exit 1
    fi

    print_success "Node.js version: $NODE_VERSION"
}

# Function to check npm
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed. Please install Node.js which includes npm."
        print_info "Installation instructions: https://nodejs.org/"
        exit 1
    fi

    NPM_VERSION=$(npm -v)
    print_success "npm version: $NPM_VERSION"
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    if [ ! -d "node_modules" ]; then
        npm ci
        print_success "Dependencies installed successfully"
    else
        print_info "Dependencies already installed"
    fi
}

# Function to build for Firefox
build_firefox() {
    print_info "Building Firefox extension..."
    npm run build:firefox
    print_success "Firefox extension built successfully in dist-firefox/"

    # Create zip file for Firefox
    if command_exists zip; then
        cd dist-firefox
        zip -r ../cutfast-firefox-extension.zip .
        cd ..
        print_success "Firefox extension packaged as cutfast-firefox-extension.zip"
    else
        print_warning "zip command not found. Skipping packaging."
    fi
}

# Function to build for Chrome
build_chrome() {
    print_info "Building Chrome extension..."
    npm run build:chrome
    print_success "Chrome extension built successfully in dist-chrome/"

    # Create zip file for Chrome
    if command_exists zip; then
        cd dist-chrome
        zip -r ../cutfast-chrome-extension.zip .
        cd ..
        print_success "Chrome extension packaged as cutfast-chrome-extension.zip"
    else
        print_warning "zip command not found. Skipping packaging."
    fi
}

# Function to clean build directories
clean_build() {
    print_info "Cleaning previous builds..."
    rm -rf dist-chrome dist-firefox
    rm -f cutfast-firefox-extension.zip cutfast-chrome-extension.zip
    print_success "Build directories cleaned"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [firefox|chrome|all|clean]"
    echo ""
    echo "Commands:"
    echo "  firefox    Build Firefox extension only"
    echo "  chrome     Build Chrome extension only"
    echo "  all        Build both Firefox and Chrome extensions"
    echo "  clean      Clean build directories and packages"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 firefox    # Build Firefox extension"
    echo "  $0 chrome     # Build Chrome extension"
    echo "  $0 all        # Build both extensions"
}

# Main script logic
main() {
    local target="$1"

    print_info "CutFast Extension Build Script"
    print_info "=============================="

    # Check prerequisites
    check_nodejs
    check_npm

    # Change to script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR"

    case "$target" in
        firefox)
            install_dependencies
            clean_build
            build_firefox
            ;;
        chrome)
            install_dependencies
            clean_build
            build_chrome
            ;;
        all)
            install_dependencies
            clean_build
            build_firefox
            build_chrome
            ;;
        clean)
            clean_build
            ;;
        help|--help|-h)
            show_usage
            exit 0
            ;;
        *)
            print_error "Invalid target: $target"
            echo ""
            show_usage
            exit 1
            ;;
    esac

    print_success "Build process completed successfully!"
    print_info "Built extensions are ready for installation."
}

# Run main function with all arguments
main "$@"
