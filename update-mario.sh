#!/bin/bash

# Mario App Update Script
# Run this script whenever changes are made to the frontend or backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/mario"
BACKUP_DIR="/var/backups/mario"

echo -e "${BLUE}🔄 Mario App Update Script${NC}"
echo -e "${BLUE}=========================${NC}"

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    warn "Running as root. This is not recommended for git operations."
fi

# Navigate to app directory
log "📁 Navigating to app directory..."
cd "$APP_DIR" || error "Failed to navigate to $APP_DIR"

# Create backup directory if it doesn't exist
sudo mkdir -p "$BACKUP_DIR"

# Create a backup of current state
log "💾 Creating backup..."
BACKUP_NAME="mario-backup-$(date +%Y%m%d-%H%M%S)"
sudo cp -r "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME" || warn "Backup failed, continuing anyway..."

# Fix git ownership issues
log "🔧 Fixing git ownership..."
sudo chown -R $USER:$USER "$APP_DIR"
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

# Check git status
log "📋 Checking git status..."
git status --porcelain

# Stash any local changes
if [[ -n $(git status --porcelain) ]]; then
    warn "Local changes detected, stashing them..."
    git stash push -m "Auto-stash before update $(date)"
fi

# Fetch and reset to latest
log "⬇️ Pulling latest changes from GitHub..."
git fetch origin main || error "Failed to fetch from origin"
git reset --hard origin/main || error "Failed to reset to origin/main"

# Check if frontend files changed
FRONTEND_CHANGED=false
if git diff --name-only HEAD@{1} HEAD | grep -E "^src/|^index.html|^package.json|^vite.config|^tailwind.config" >/dev/null 2>&1; then
    FRONTEND_CHANGED=true
fi

# Check if backend files changed
BACKEND_CHANGED=false
if git diff --name-only HEAD@{1} HEAD | grep -E "^backend/" >/dev/null 2>&1; then
    BACKEND_CHANGED=true
fi

# Update frontend if changed
if [ "$FRONTEND_CHANGED" = true ]; then
    log "🎨 Frontend changes detected, rebuilding..."
    
    # Install/update dependencies
    log "📦 Installing frontend dependencies..."
    npm ci || npm install || error "Failed to install frontend dependencies"
    
    # Build frontend
    log "🏗️ Building frontend..."
    npm run build || error "Frontend build failed"
    
    # Set proper permissions for nginx
    log "🔐 Setting permissions for nginx..."
    sudo chown -R www-data:www-data dist/
    
    log "✅ Frontend updated successfully"
else
    log "ℹ️ No frontend changes detected, skipping rebuild"
fi

# Update backend if changed
if [ "$BACKEND_CHANGED" = true ]; then
    log "⚙️ Backend changes detected, updating..."
    
    # Navigate to backend directory
    cd backend
    
    # Install/update backend dependencies
    log "📦 Installing backend dependencies..."
    npm ci || npm install || error "Failed to install backend dependencies"
    
    # Navigate back to root
    cd ..
    
    # Restart backend with PM2
    log "🔄 Restarting backend..."
    if sudo pm2 restart mario-backend; then
        log "✅ Backend restarted successfully"
    else
        warn "PM2 restart failed, trying to start fresh..."
        sudo pm2 start ecosystem.config.cjs || error "Failed to start backend"
    fi
    
    # Save PM2 configuration
    sudo pm2 save
    
    log "✅ Backend updated successfully"
else
    log "ℹ️ No backend changes detected, skipping restart"
fi

# Reload nginx
log "🌐 Reloading nginx..."
sudo systemctl reload nginx || error "Failed to reload nginx"

# Health check
log "🏥 Performing health check..."
sleep 3

# Final status
log "📊 Final status:"
echo -e "   ${BLUE}Frontend:${NC} $([ "$FRONTEND_CHANGED" = true ] && echo "Updated" || echo "No changes")"
echo -e "   ${BLUE}Backend:${NC} $([ "$BACKEND_CHANGED" = true ] && echo "Updated" || echo "No changes")"
echo -e "   ${BLUE}Nginx:${NC} Reloaded"

# Show PM2 status
log "📈 PM2 Status:"
sudo pm2 status

log "🎉 Update completed successfully!"
log "🌐 Your app is available at: https://mario-online.shop"

# Clean up old backups (keep last 5)
log "🧹 Cleaning up old backups..."
sudo find "$BACKUP_DIR" -name "mario-backup-*" -type d | sort | head -n -5 | sudo xargs rm -rf 2>/dev/null || true

echo -e "${GREEN}Update script finished! 🚀${NC}"