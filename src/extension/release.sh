#!/bin/bash

# CutFast Extension Release Script
# This script updates version numbers and builds extensions for release

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

# Function to validate version format
validate_version() {
    local version="$1"
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Please use semantic versioning (e.g., 1.0.1)"
        exit 1
    fi
}

# Function to update version in package.json
update_package_json() {
    local version="$1"
    local file="package.json"

    if [ ! -f "$file" ]; then
        print_error "package.json not found!"
        exit 1
    fi

    # Update version using sed
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$version\"/" "$file"
    print_success "Updated $file to version $version"
}

# Function to update version in manifest files
update_manifest() {
    local version="$1"
    local file="$2"

    if [ ! -f "$file" ]; then
        print_error "$file not found!"
        exit 1
    fi

    # Update version using sed
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$version\"/" "$file"
    print_success "Updated $file to version $version"
}

# Function to check if git working directory is clean
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Working directory is not clean. Uncommitted changes detected."
        echo "Please commit or stash your changes before releasing."
        git status --short
        exit 1
    fi
}

# Function to create git tag
create_git_tag() {
    local version="$1"
    local tag="v$version"

    if git rev-parse "$tag" >/dev/null 2>&1; then
        print_warning "Git tag $tag already exists"
        return 0
    fi

    git tag -a "$tag" -m "Release version $version"
    print_success "Created git tag $tag"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <version> [options]"
    echo ""
    echo "Arguments:"
    echo "  version    Version number in semantic format (e.g., 1.0.1)"
    echo ""
    echo "Options:"
    echo "  --build    Build extensions after updating versions"
    echo "  --tag      Create git tag after updating versions"
    echo "  --push     Push changes and tags to remote repository"
    echo "  --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 1.0.1                           # Update versions only"
    echo "  $0 1.0.1 --build                   # Update versions and build"
    echo "  $0 1.0.1 --build --tag             # Update, build, and create tag"
    echo "  $0 1.0.1 --build --tag --push      # Full release process"
}

# Main script logic
main() {
    local version=""
    local should_build=false
    local should_tag=false
    local should_push=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build)
                should_build=true
                shift
                ;;
            --tag)
                should_tag=true
                shift
                ;;
            --push)
                should_push=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [ -z "$version" ]; then
                    version="$1"
                else
                    print_error "Multiple versions specified"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Validate version
    if [ -z "$version" ]; then
        print_error "Version number is required"
        show_usage
        exit 1
    fi

    validate_version "$version"

    print_info "CutFast Extension Release Script"
    print_info "================================"
    print_info "Releasing version: $version"

    # Check git status if tagging or pushing
    if [ "$should_tag" = true ] || [ "$should_push" = true ]; then
        check_git_status
    fi

    # Update version in package.json
    update_package_json "$version"

    # Update version in Chrome manifest
    update_manifest "$version" "src/manifest.json"

    # Update version in Firefox manifest
    update_manifest "$version" "src/manifest.firefox.json"

    # Build extensions if requested
    if [ "$should_build" = true ]; then
        print_info "Building extensions..."
        if ! ./build.sh all; then
            print_error "Build failed!"
            exit 1
        fi
        print_success "Extensions built successfully"
    fi

    # Create git tag if requested
    if [ "$should_tag" = true ]; then
        create_git_tag "$version"
    fi

    # Push changes if requested
    if [ "$should_push" = true ]; then
        print_info "Pushing changes to remote repository..."
        git push origin main
        if [ "$should_tag" = true ]; then
            git push origin "v$version"
        fi
        print_success "Changes pushed to remote repository"
    fi

    print_success "Release process completed successfully!"
    print_info "Version $version is ready for distribution."

    if [ "$should_build" = true ]; then
        print_info "Built files are available in:"
        print_info "  - dist-chrome/ (Chrome extension)"
        print_info "  - dist-firefox/ (Firefox extension)"
        print_info "  - cutfast-chrome-extension.zip"
        print_info "  - cutfast-firefox-extension.zip"
    fi
}

# Run main function with all arguments
main "$@"
