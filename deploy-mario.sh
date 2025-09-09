#!/bin/bash

# Mario Marketplace Deployment Script
# Usage: sudo ./deploy-mario.sh your-domain.com your-github-username repo-name

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"your-domain.com"}
GITHUB_USERNAME=${2:-"your-github-username"}
REPO_NAME=${3:-"mario-marketplace"}
APP_DIR="/var/www/mario"
DB_NAME="mario_db"
DB_USER="mario_user"
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

echo -e "${GREEN}🚀 Starting Mario Marketplace deployment...${NC}"
echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo -e "${YELLOW}GitHub: $GITHUB_USERNAME/$REPO_NAME${NC}"

# Update system
echo -e "${GREEN}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential packages
echo -e "${GREEN}🔧 Installing essential packages...${NC}"
apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js LTS (via NodeSource)
echo -e "${GREEN}📦 Installing Node.js LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt install -y nodejs

# Verify Node.js installation
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"

# Install PostgreSQL
echo -e "${GREEN}🗄️ Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Install Nginx
echo -e "${GREEN}🌐 Installing Nginx...${NC}"
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Install Certbot for Let's Encrypt
echo -e "${GREEN}🔒 Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# Install PM2 globally
echo -e "${GREEN}⚡ Installing PM2...${NC}"
npm install -g pm2

# Create application directory
echo -e "${GREEN}📁 Creating application directory...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository
echo -e "${GREEN}📥 Cloning repository...${NC}"
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git .

# Setup PostgreSQL database
echo -e "${GREEN}🗃️ Setting up PostgreSQL database...${NC}"
sudo -u postgres psql <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

# Create database tables
echo -e "${GREEN}🏗️ Creating database schema...${NC}"
sudo -u postgres psql -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar VARCHAR(500),
    bio TEXT,
    location VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    specialization VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(100),
    location VARCHAR(255),
    images TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
\q
EOF

# Setup backend environment
echo -e "${GREEN}⚙️ Setting up backend environment...${NC}"
cd $APP_DIR/backend

# Create .env file
cat > .env <<EOF
PORT=3001
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=https://$DOMAIN
NODE_ENV=production
EOF

# Install backend dependencies
echo -e "${GREEN}📦 Installing backend dependencies...${NC}"
npm install

# Seed database with sample data
echo -e "${GREEN}🌱 Seeding database...${NC}"
npm run seed

# Setup frontend
echo -e "${GREEN}🎨 Setting up frontend...${NC}"
cd $APP_DIR

# Install frontend dependencies
npm install

# Create frontend environment file
cat > .env.production <<EOF
VITE_API_URL=https://$DOMAIN/api
EOF

# Build frontend
echo -e "${GREEN}🔨 Building frontend...${NC}"
npm run build

# Setup PM2 ecosystem
echo -e "${GREEN}⚡ Setting up PM2 configuration...${NC}"
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'mario-backend',
      cwd: '$APP_DIR/backend',
      script: 'src/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '$APP_DIR/logs/backend-error.log',
      out_file: '$APP_DIR/logs/backend-out.log',
      log_file: '$APP_DIR/logs/backend-combined.log'
    }
  ]
};
EOF

# Create logs directory
mkdir -p $APP_DIR/logs

# Setup Nginx configuration (Fixed cache headers)
echo -e "${GREEN}🌐 Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend (React build)
    root $APP_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Frontend routing (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

# Start backend with PM2
echo -e "${GREEN}🚀 Starting backend with PM2...${NC}"
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup SSL with Let's Encrypt
echo -e "${GREEN}🔒 Setting up SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# Setup automatic SSL renewal
echo -e "${GREEN}🔄 Setting up SSL auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Setup log rotation
echo -e "${GREEN}📝 Setting up log rotation...${NC}"
cat > /etc/logrotate.d/mario <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Setup firewall
echo -e "${GREEN}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Set correct permissions
echo -e "${GREEN}🔐 Setting permissions...${NC}"
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Create deployment script for updates
echo -e "${GREEN}📝 Creating update script...${NC}"
cat > /usr/local/bin/update-mario <<EOF
#!/bin/bash
cd $APP_DIR
git pull origin main
cd backend && npm install
cd .. && npm install && npm run build
pm2 restart mario-backend
echo "Mario marketplace updated successfully!"
EOF
chmod +x /usr/local/bin/update-mario

# Final setup information
echo -e "${GREEN}✅ Mario deployment completed!${NC}"
echo ""
echo -e "${YELLOW}🌟 Deployment Summary:${NC}"
echo -e "Domain: https://$DOMAIN"
echo -e "Application: $APP_DIR"
echo -e "Database: $DB_NAME"
echo -e "Database User: $DB_USER"
echo -e "Backend Port: 3001 (proxied via Nginx)"
echo ""
echo -e "${YELLOW}🔑 Database Credentials:${NC}"
echo -e "Username: $DB_USER"
echo -e "Password: $DB_PASSWORD"
echo -e "Database: $DB_NAME"
echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo -e "Update app: sudo update-mario"
echo -e "PM2 status: pm2 status"
echo -e "PM2 logs: pm2 logs mario-backend"
echo -e "Nginx status: systemctl status nginx"
echo -e "Restart backend: pm2 restart mario-backend"
echo ""
echo -e "${YELLOW}🔒 Test Credentials:${NC}"
echo -e "Email: marco.orefice@artigiani.it"
echo -e "Password: password123"
echo ""
echo -e "${GREEN}🎉 Your Mario is now live at: https://$DOMAIN${NC}"

# Save credentials to file
cat > $APP_DIR/deployment-info.txt <<EOF
Mario Marketplace Deployment Info
================================
Deployed: $(date)
Domain: https://$DOMAIN
Database User: $DB_USER
Database Password: $DB_PASSWORD
Database Name: $DB_NAME
JWT Secret: $JWT_SECRET

Test User:
Email: marco.orefice@artigiani.it
Password: password123

Management:
- Update: sudo update-mario
- PM2: pm2 status
- Logs: pm2 logs mario-backend
EOF

echo -e "${GREEN}💾 Deployment info saved to: $APP_DIR/deployment-info.txt${NC}"