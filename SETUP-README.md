# Mario - Complete Setup & Run Script

🚀 **One-command setup for the entire Mario marketplace application**

## What This Script Does

✅ **Backend Setup**: Creates Node.js/Express server with TypeScript  
✅ **Database Setup**: PostgreSQL with complete schema  
✅ **Mock Data**: Seeds database with users and services  
✅ **Frontend**: Connects to your existing Lovable frontend  
✅ **Development Workflow**: Runs everything together  

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
  - macOS: `brew install postgresql`
  - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

## Quick Start

1. **Sync with GitHub** (if you haven't already):
   - Click GitHub button in Lovable
   - Create repository

2. **Clone and setup**:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   chmod +x setup-mario.sh
   ./setup-mario.sh
   ```

3. **Start everything**:
   ```bash
   ./start-mario.sh
   ```

That's it! Your complete Mario app is running.

## What Gets Created

### 🗄️ Database
- **mario_db** database on PostgreSQL
- **mario_user** with password 'mario_password'
- Complete schema (users, services, reviews, orders)
- Mock data with 5 users and 8 services

### ⚙️ Backend API
- Express.js server on port 3001
- JWT authentication
- Complete REST API for services and users
- Secure password hashing

### 👤 Test Accounts
- **Email**: designpro@example.com
- **Password**: password123
- (Plus 4 more test users)

## URLs After Setup

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/api
- **Database**: postgresql://mario_user:mario_password@localhost:5432/mario_db

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - List all services (with search/filters)
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Users
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar

## Development Workflow

1. **Frontend changes**: Edit in Lovable → Auto-syncs to GitHub
2. **Backend changes**: Edit locally → Push to GitHub → Auto-syncs to Lovable
3. **Database changes**: Run migrations manually

## Troubleshooting

### PostgreSQL Issues
```bash
# Start PostgreSQL manually
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Reset database if needed
psql -c "DROP DATABASE IF EXISTS mario_db;" postgres
./setup-mario.sh
```

### Port Conflicts
- Backend uses port 3001
- Frontend uses port 8080
- Change in `.env` files if needed

### Permission Issues
```bash
chmod +x setup-mario.sh
chmod +x start-mario.sh
```

## Production Deployment

For production, consider:
- **Railway** (recommended) - Auto-deploys from GitHub
- **Vercel** + **PlanetScale** - Serverless setup
- **AWS** / **DigitalOcean** - Full control

## Project Structure After Setup

```
mario/
├── setup-mario.sh          # One-time setup script
├── start-mario.sh          # Development startup script
├── backend/                # Node.js API server
│   ├── src/
│   │   ├── server.js       # Express server
│   │   ├── db/index.js     # Database connection
│   │   └── routes/         # API routes
│   ├── scripts/seed.js     # Database seeding
│   └── .env               # Environment variables
└── src/                   # Frontend (Lovable)
    ├── components/        # React components
    ├── services/api.ts    # API client
    └── ...               # Your existing frontend
```

## Support

The setup script handles everything automatically. If you encounter issues:

1. Check PostgreSQL is running
2. Verify Node.js version (18+)
3. Ensure ports 3001 and 8080 are available
4. Check the logs in terminal

Your Mario marketplace is now ready with full database persistence! 🎉