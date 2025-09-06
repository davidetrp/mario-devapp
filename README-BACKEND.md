# Mario Backend Setup Guide

## 🏗️ PostgreSQL + Node.js Backend Integration

This guide will help you set up the backend infrastructure for Mario after syncing with GitHub.

## 📋 Prerequisites

1. **Sync with GitHub first**: Click the GitHub button in Lovable to sync your code
2. **Clone the repository** to your local machine
3. **Install Node.js** (v18 or higher)
4. **PostgreSQL database** (local or cloud - Railway, AWS RDS, etc.)

## 🚀 Backend Setup

### 1. Create Backend Structure

```bash
# In your project root (after cloning from GitHub)
mkdir backend
cd backend
npm init -y

# Install dependencies
npm install express cors helmet bcryptjs jsonwebtoken pg dotenv
npm install -D @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/pg typescript nodemon
```

### 2. Database Schema

```sql
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
```

### 3. Environment Variables

Create `.env` file in backend folder:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mario_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

### 4. Basic Express Server

Create `backend/src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import serviceRoutes from './routes/services';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mario backend running on port ${PORT}`);
});
```

### 5. Database Connection

Create `backend/src/db/index.ts`:

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

## 🔧 API Endpoints to Implement

The frontend is already configured to work with these endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services (with search/filter)
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Users
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar

## 📱 Frontend Configuration

The frontend will automatically try to connect to your API at:
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-production-api.com/api`

Update the API URL in `src/services/api.ts` to match your backend deployment.

## 🚀 Deployment Options

### Option 1: Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy automatically on git push

### Option 2: Vercel + PlanetScale
1. Deploy frontend to Vercel
2. Use PlanetScale for MySQL database
3. Deploy backend as Vercel functions

### Option 3: AWS/DigitalOcean
1. Deploy backend to EC2/Droplet
2. Use AWS RDS/DigitalOcean Managed Database
3. Deploy frontend to S3/CloudFront or Netlify

## 🔄 Development Workflow

1. **Frontend changes**: Make in Lovable → Auto-syncs to GitHub
2. **Backend changes**: Make locally → Push to GitHub → Auto-syncs to Lovable
3. **Database changes**: Run migrations locally and in production

## 📦 Package.json Scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "node scripts/migrate.js"
  }
}
```

## 🔐 Security Considerations

- Use JWT tokens for authentication
- Hash passwords with bcrypt
- Validate all inputs
- Use HTTPS in production
- Set up proper CORS policies
- Use environment variables for secrets

## 🎯 Next Steps

1. Set up GitHub sync in Lovable
2. Clone repo and add backend folder
3. Set up PostgreSQL database
4. Implement API endpoints
5. Test local development
6. Deploy to production
7. Update frontend API URL

The frontend is ready - it includes fallbacks to mock data when the API isn't available, so you can develop incrementally!