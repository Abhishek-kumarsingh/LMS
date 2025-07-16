# LMS System - Complete Setup Guide

## 🎯 System Overview

This is a complete Learning Management System (LMS) with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Mobile**: React Native (in `/mobile` folder)
- **Real-time**: Socket.IO for live features

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup
```bash
# Run the automated startup script
start-lms.bat
```

### Option 2: Manual Setup
Follow the detailed instructions below.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (v13 or higher)
   - Download from: https://www.postgresql.org/download/
   - Create a database named `lms_db`

3. **Git** (for version control)
   - Download from: https://git-scm.com/

## 🔧 Installation Steps

### 1. Clone and Setup Frontend

```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your settings
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database settings
DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

### 4. Start the System

```bash
# Terminal 1: Start backend (from backend folder)
cd backend
npm run dev

# Terminal 2: Start frontend (from root folder)
npm start
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database Studio**: `npx prisma studio` (from backend folder)
- **Connection Test**: http://localhost:3000/debug/connection-test

## 🔍 Testing the Connection

### Automated Test
1. Go to http://localhost:3000/debug/connection-test
2. The system will automatically test all connections
3. Green checkmarks = working, Red X = needs fixing

### Manual Test
```bash
# Test backend health
curl http://localhost:5000/health

# Test API endpoint
curl http://localhost:5000/api/courses
```

## 📱 Mobile App Setup

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..
npx react-native run-ios

# For Android
npx react-native run-android
```

## 🔐 Authentication Flow

### Registration
```javascript
// Frontend registration
const response = await apiService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'STUDENT'
});
```

### Login
```javascript
// Frontend login
const response = await apiService.login('user@example.com', 'password123');
// Tokens are automatically stored and managed
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `POST /api/courses/:id/enroll` - Enroll in course

### Lessons
- `GET /api/lessons` - List lessons
- `POST /api/lessons` - Create lesson
- `GET /api/lessons/:id` - Get lesson
- `POST /api/lessons/:id/complete` - Mark complete

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/:id/submit` - Submit assignment

## 🎨 Frontend Features

### Components Available
- **Dashboard**: Analytics and overview
- **Courses**: Course management and viewing
- **Calendar**: Event scheduling and management
- **Content Authoring**: Rich content creation tools
- **Video Streaming**: Live streaming platform
- **Analytics**: Comprehensive reporting
- **Mobile App**: Full React Native application

### Key Features
- ✅ User authentication and authorization
- ✅ Course creation and management
- ✅ Interactive lessons with rich content
- ✅ Assignment submission and grading
- ✅ Real-time discussions and chat
- ✅ Calendar integration
- ✅ Analytics and reporting
- ✅ Video streaming and recording
- ✅ Mobile application
- ✅ Offline content support
- ✅ Push notifications

## 🗄️ Database Schema

### Main Tables
- **users** - User accounts and profiles
- **courses** - Course information
- **course_enrollments** - Student enrollments
- **lessons** - Course lessons and content
- **assignments** - Assignments and submissions
- **grades** - Grading and feedback
- **discussions** - Forum discussions
- **calendar_events** - Calendar and scheduling
- **notifications** - User notifications
- **stream_sessions** - Live streaming sessions

## 🔧 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

#### Database connection failed
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in backend/.env
3. Verify database exists: `createdb lms_db`

#### Frontend can't connect to backend
1. Check backend is running on port 5000
2. Verify REACT_APP_API_URL in .env.local
3. Check CORS settings in backend

#### Prisma issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Environment Variables

#### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## 📈 Development Workflow

### Adding New Features
1. Create API endpoint in backend
2. Add types to `src/types/index.ts`
3. Create service method in `src/services/api.ts`
4. Build frontend components
5. Add to navigation if needed

### Database Changes
1. Modify `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update TypeScript types
4. Update API endpoints

## 🚀 Production Deployment

### Backend
```bash
# Build
npm run build

# Start production server
npm start
```

### Frontend
```bash
# Build for production
npm run build

# Serve static files
npx serve -s build
```

### Environment Setup
- Set NODE_ENV=production
- Use production database
- Configure proper CORS origins
- Set secure JWT secrets
- Enable HTTPS

## 📞 Support

If you encounter issues:
1. Check the connection test page
2. Review console logs (F12 in browser)
3. Check backend logs
4. Verify environment variables
5. Ensure all services are running

## 🎉 Success Indicators

✅ **Frontend loads** at http://localhost:3000
✅ **Backend responds** at http://localhost:5000/health
✅ **Database connected** (no Prisma errors)
✅ **Authentication works** (can register/login)
✅ **API calls succeed** (check Network tab)
✅ **Real-time features work** (Socket.IO connected)

The system is fully functional when all these indicators are green!
