#!/bin/bash

# Mario Complete Setup Script
# This script sets up the entire Mario application with PostgreSQL backend

set -e  # Exit on any error

echo "🚀 Setting up Mario - Complete Fiverr-style App"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "   Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create backend directory and files
echo "📁 Creating backend structure..."
mkdir -p backend/src/routes
mkdir -p backend/src/middleware
mkdir -p backend/src/db
mkdir -p backend/scripts

# Create package.json for backend
cat > backend/package.json << 'EOF'
{
  "name": "mario-backend",
  "version": "1.0.0",
  "description": "Backend for Mario marketplace app",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "setup": "npm install && npm run build",
    "seed": "node scripts/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/node": "^20.5.0",
    "@types/express": "^4.17.17",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/pg": "^8.10.2",
    "@types/multer": "^1.4.7",
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  }
}
EOF

# Create TypeScript config
cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create environment file
cat > backend/.env << 'EOF'
# Database
DATABASE_URL=postgresql://mario_user:mario_password@localhost:5432/mario_db

# JWT
JWT_SECRET=mario-super-secret-jwt-key-2024-development
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
EOF

echo "⚙️ Installing backend dependencies..."
cd backend
npm install
cd ..

echo "🗄️ Setting up PostgreSQL database..."

# Create database and user
psql -c "DROP DATABASE IF EXISTS mario_db;" postgres 2>/dev/null || true
psql -c "DROP USER IF EXISTS mario_user;" postgres 2>/dev/null || true
psql -c "CREATE USER mario_user WITH PASSWORD 'mario_password';" postgres
psql -c "CREATE DATABASE mario_db OWNER mario_user;" postgres
psql -c "GRANT ALL PRIVILEGES ON DATABASE mario_db TO mario_user;" postgres

echo "✅ Database created successfully"

echo "📊 Creating database schema..."

# Create database schema
psql -d mario_db -c "
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),
  category VARCHAR(100) NOT NULL,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mario_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mario_user;
"

echo "✅ Database schema created"

echo "🎭 Seeding database with mock data..."

# Create seed script
cat > backend/scripts/seed.js << 'EOF'
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { email: 'designpro@example.com', username: 'designpro', password_hash: hashedPassword, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designpro' },
      { email: 'webmaster@example.com', username: 'webmaster', password_hash: hashedPassword, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=webmaster' },
      { email: 'socialexpert@example.com', username: 'socialexpert', password_hash: hashedPassword, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=socialexpert' },
      { email: 'videoeditor@example.com', username: 'videoeditor', password_hash: hashedPassword, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=videoeditor' },
      { email: 'contentwriter@example.com', username: 'contentwriter', password_hash: hashedPassword, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=contentwriter' }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (email, username, password_hash, avatar) VALUES ($1, $2, $3, $4)',
        [user.email, user.username, user.password_hash, user.avatar]
      );
    }

    console.log('👥 Users created');

    // Create sample services
    const services = [
      {
        title: 'Professional Logo Design',
        description: 'I will create a modern, professional logo for your business that stands out from the competition.',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop&crop=center',
        category: 'Design',
        seller_id: 1,
        rating: 4.9,
        reviews_count: 127
      },
      {
        title: 'WordPress Website Development',
        description: 'Custom WordPress website with responsive design, SEO optimization, and content management.',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center',
        category: 'Development',
        seller_id: 2,
        rating: 4.8,
        reviews_count: 89
      },
      {
        title: 'Social Media Content Creation',
        description: 'Engaging social media posts, stories, and content strategy for your brand growth.',
        price: 35.00,
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop&crop=center',
        category: 'Marketing',
        seller_id: 3,
        rating: 4.7,
        reviews_count: 156
      },
      {
        title: 'Professional Video Editing',
        description: 'High-quality video editing with transitions, effects, and color grading for your content.',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop&crop=center',
        category: 'Video',
        seller_id: 4,
        rating: 4.9,
        reviews_count: 203
      },
      {
        title: 'SEO Article Writing',
        description: 'Well-researched, SEO-optimized articles that rank high and engage your audience.',
        price: 20.00,
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop&crop=center',
        category: 'Writing',
        seller_id: 5,
        rating: 4.6,
        reviews_count: 78
      },
      {
        title: 'Mobile App UI Design',
        description: 'Modern, user-friendly mobile app interface design with prototypes and guidelines.',
        price: 80.00,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&crop=center',
        category: 'Design',
        seller_id: 1,
        rating: 4.8,
        reviews_count: 92
      },
      {
        title: 'Business Plan Writing',
        description: 'Comprehensive business plan with market analysis, financial projections, and strategy.',
        price: 120.00,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&crop=center',
        category: 'Business',
        seller_id: 2,
        rating: 4.9,
        reviews_count: 45
      },
      {
        title: 'Voice Over Recording',
        description: 'Professional voice over for commercials, audiobooks, and educational content.',
        price: 30.00,
        image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop&crop=center',
        category: 'Audio',
        seller_id: 3,
        rating: 4.7,
        reviews_count: 134
      }
    ];

    for (const service of services) {
      await pool.query(
        'INSERT INTO services (title, description, price, image, category, seller_id, rating, reviews_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [service.title, service.description, service.price, service.image, service.category, service.seller_id, service.rating, service.reviews_count]
      );
    }

    console.log('🛍️ Services created');
    console.log('✅ Database seeded successfully!');
    console.log('👤 Test login: designpro@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
};

seedData();
EOF

# Run seed script
cd backend
node scripts/seed.js
cd ..

echo "🎯 Creating development startup script..."

# Create startup script for all services
cat > start-mario.sh << 'EOF'
#!/bin/bash

# Mario Development Startup Script
echo "🚀 Starting Mario Application..."

# Function to kill processes on exit
cleanup() {
  echo "🛑 Stopping all services..."
  kill $(jobs -p) 2>/dev/null
  exit
}

trap cleanup SIGINT SIGTERM

# Start PostgreSQL (if not already running)
if ! pgrep -x "postgres" > /dev/null; then
  echo "🗄️ Starting PostgreSQL..."
  brew services start postgresql 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || echo "⚠️ Please start PostgreSQL manually"
fi

# Start backend
echo "⚙️ Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Mario is running!"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend:  http://localhost:3001"
echo "🗄️ Database: mario_db on localhost:5432"
echo ""
echo "👤 Test login: designpro@example.com / password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x start-mario.sh

echo "📦 Installing frontend dependencies..."
npm install

echo "🎉 Setup complete! Mario is ready to run!"
echo ""
echo "🚀 To start everything:"
echo "   ./start-mario.sh"
echo ""
echo "👤 Test login credentials:"
echo "   Email: designpro@example.com"
echo "   Password: password123"
echo ""
echo "📱 URLs:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3001/api"
echo "   Database: postgresql://mario_user:mario_password@localhost:5432/mario_db"