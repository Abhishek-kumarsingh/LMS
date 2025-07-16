# Troubleshooting Guide

## 🔍 Overview

This comprehensive troubleshooting guide helps you diagnose and resolve common issues with the LMS application.

## 🚨 Quick Diagnostics

### Connection Test Page
First, use the built-in connection test to identify issues:
1. Go to `http://localhost:3000/debug/connection-test`
2. Review all test results
3. Focus on failed tests for troubleshooting

### Health Check Endpoints
```bash
# Backend health check
curl http://localhost:5000/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## 🔧 Installation Issues

### Node.js Version Problems

#### Symptoms
- `npm install` fails with version errors
- Application won't start
- Build process fails

#### Solutions
```bash
# Check Node.js version
node --version

# Should be v18.0.0 or higher
# If not, install correct version:

# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### Database Connection Issues

#### Symptoms
- "Database connection failed" errors
- Prisma migration errors
- Backend won't start

#### Solutions

1. **Check PostgreSQL Status**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Start if not running
   sudo systemctl start postgresql
   ```

2. **Verify Database Exists**
   ```bash
   sudo -u postgres psql
   \l
   # Look for your database in the list
   ```

3. **Test Connection**
   ```bash
   # Test connection with psql
   psql -h localhost -U your_username -d your_database
   ```

4. **Check Environment Variables**
   ```bash
   # In backend/.env, verify:
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

### Port Already in Use

#### Symptoms
- "EADDRINUSE" errors
- "Port 3000/5000 already in use"

#### Solutions
```bash
# Find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Kill process
taskkill /PID <process_id> /F  # Windows
kill -9 <process_id>           # macOS/Linux

# Or use different ports
# Frontend: PORT=3001 npm start
# Backend: PORT=5001 npm run dev
```

## 🌐 Frontend Issues

### Application Won't Load

#### Symptoms
- Blank white screen
- "Cannot GET /" error
- Build errors

#### Solutions

1. **Check Console Errors**
   - Open browser DevTools (F12)
   - Look for JavaScript errors in Console tab
   - Check Network tab for failed requests

2. **Clear Browser Cache**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (macOS)
   
   # Or clear cache manually
   # Chrome: Settings > Privacy > Clear browsing data
   ```

3. **Verify Environment Variables**
   ```bash
   # Check .env.local file
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Rebuild Application**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

### API Connection Errors

#### Symptoms
- "Network Error" messages
- Failed API requests
- CORS errors

#### Solutions

1. **Check Backend Status**
   ```bash
   # Ensure backend is running
   curl http://localhost:5000/health
   ```

2. **Verify API URL**
   ```javascript
   // Check in browser console
   console.log(process.env.REACT_APP_API_URL);
   ```

3. **CORS Issues**
   ```javascript
   // In backend/src/server.ts, verify CORS configuration:
   app.use(cors({
     origin: process.env.FRONTEND_URL || "http://localhost:3000",
     credentials: true
   }));
   ```

### Authentication Issues

#### Symptoms
- Can't login/register
- "Unauthorized" errors
- Token expired messages

#### Solutions

1. **Check JWT Configuration**
   ```bash
   # In backend/.env, ensure JWT secrets are set:
   JWT_SECRET="your-secret-key-min-32-chars"
   JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
   ```

2. **Clear Local Storage**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Check Token Expiration**
   ```javascript
   // In browser console:
   const token = localStorage.getItem('accessToken');
   if (token) {
     const payload = JSON.parse(atob(token.split('.')[1]));
     console.log('Token expires:', new Date(payload.exp * 1000));
   }
   ```

## 🔙 Backend Issues

### Server Won't Start

#### Symptoms
- "Cannot start server" errors
- Port binding errors
- Module not found errors

#### Solutions

1. **Check Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Verify Environment File**
   ```bash
   # Ensure backend/.env exists and has required variables
   cp .env.example .env
   nano .env
   ```

3. **Check TypeScript Compilation**
   ```bash
   # Build TypeScript
   npm run build
   
   # Check for compilation errors
   npx tsc --noEmit
   ```

4. **Database Migration Issues**
   ```bash
   # Reset and regenerate Prisma client
   npx prisma generate
   npx prisma migrate reset
   npx prisma migrate dev
   ```

### Database Migration Errors

#### Symptoms
- "Migration failed" errors
- Schema sync issues
- Prisma client errors

#### Solutions

1. **Reset Database**
   ```bash
   cd backend
   npx prisma migrate reset
   npx prisma migrate dev
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Check Database Permissions**
   ```sql
   -- Connect to PostgreSQL as superuser
   sudo -u postgres psql
   
   -- Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;
   ALTER USER your_user CREATEDB;
   ```

### API Endpoint Errors

#### Symptoms
- 404 "Route not found" errors
- 500 "Internal server error"
- Validation errors

#### Solutions

1. **Check Route Registration**
   ```typescript
   // In backend/src/server.ts, ensure routes are registered:
   app.use('/api/auth', authRoutes);
   app.use('/api/courses', courseRoutes);
   ```

2. **Verify Middleware Order**
   ```typescript
   // Middleware should be in correct order:
   app.use(cors());
   app.use(express.json());
   app.use('/api/auth', authRoutes);
   app.use('/api/courses', authMiddleware, courseRoutes);
   ```

3. **Check Server Logs**
   ```bash
   # In development
   npm run dev
   
   # Check console output for errors
   ```

## 🗄️ Database Issues

### Connection Timeouts

#### Symptoms
- "Connection timeout" errors
- Slow query performance
- Database locks

#### Solutions

1. **Check Connection Pool**
   ```typescript
   // In DATABASE_URL, add connection pool settings:
   DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=20&pool_timeout=20"
   ```

2. **Optimize Queries**
   ```typescript
   // Use select to limit returned fields:
   const users = await prisma.user.findMany({
     select: {
       id: true,
       email: true,
       firstName: true,
       lastName: true
     }
   });
   ```

3. **Check Database Performance**
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

### Data Integrity Issues

#### Symptoms
- Foreign key constraint errors
- Unique constraint violations
- Data corruption

#### Solutions

1. **Check Database Constraints**
   ```sql
   -- List all constraints
   SELECT conname, contype, conrelid::regclass 
   FROM pg_constraint;
   ```

2. **Validate Data Integrity**
   ```sql
   -- Check for orphaned records
   SELECT * FROM course_enrollments 
   WHERE user_id NOT IN (SELECT id FROM users);
   ```

3. **Backup Before Fixes**
   ```bash
   pg_dump -h localhost -U username database_name > backup.sql
   ```

## 📱 Mobile App Issues

### Build Failures

#### Symptoms
- Metro bundler errors
- Native module compilation errors
- Gradle/Xcode build failures

#### Solutions

1. **Clear Metro Cache**
   ```bash
   cd mobile
   npx react-native start --reset-cache
   ```

2. **Clean Build**
   ```bash
   # Android
   cd android
   ./gradlew clean
   cd ..
   
   # iOS
   cd ios
   rm -rf build
   pod install
   cd ..
   ```

3. **Check Dependencies**
   ```bash
   npm install
   
   # iOS only
   cd ios && pod install && cd ..
   ```

### Runtime Errors

#### Symptoms
- App crashes on startup
- Network request failures
- Navigation errors

#### Solutions

1. **Check Metro Logs**
   ```bash
   npx react-native start
   # Check console output for errors
   ```

2. **Debug Network Issues**
   ```typescript
   // Check API URL configuration
   const API_URL = __DEV__ 
     ? 'http://localhost:5000/api'
     : 'https://your-api.com/api';
   ```

3. **Check Device Logs**
   ```bash
   # Android
   adb logcat
   
   # iOS
   # Use Xcode console or device logs
   ```

## 🎥 Video Streaming Issues

### Video Won't Play

#### Symptoms
- Black video player
- "Video unavailable" errors
- Buffering issues

#### Solutions

1. **Check Video Format**
   ```javascript
   // Supported formats: MP4, WebM, OGV
   // Ensure video is properly encoded
   ```

2. **Verify Video URL**
   ```javascript
   // Check if video URL is accessible
   fetch(videoUrl)
     .then(response => console.log('Video accessible:', response.ok))
     .catch(error => console.error('Video error:', error));
   ```

3. **Check Browser Compatibility**
   ```javascript
   // Test video support
   const video = document.createElement('video');
   console.log('MP4 support:', video.canPlayType('video/mp4'));
   console.log('WebM support:', video.canPlayType('video/webm'));
   ```

### Live Streaming Issues

#### Symptoms
- Stream won't start
- Connection drops
- Audio/video sync issues

#### Solutions

1. **Check WebRTC Support**
   ```javascript
   // Test WebRTC support
   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
     console.log('WebRTC supported');
   } else {
     console.log('WebRTC not supported');
   }
   ```

2. **Verify Socket.IO Connection**
   ```javascript
   // Check Socket.IO connection
   socket.on('connect', () => {
     console.log('Socket connected:', socket.id);
   });
   
   socket.on('disconnect', () => {
     console.log('Socket disconnected');
   });
   ```

## 🔐 Security Issues

### Authentication Failures

#### Symptoms
- Login attempts fail
- Token validation errors
- Session timeouts

#### Solutions

1. **Check Password Hashing**
   ```typescript
   // Verify bcrypt configuration
   const saltRounds = 12;
   const hashedPassword = await bcrypt.hash(password, saltRounds);
   ```

2. **Validate JWT Configuration**
   ```typescript
   // Check JWT secret length (minimum 32 characters)
   if (process.env.JWT_SECRET.length < 32) {
     throw new Error('JWT secret too short');
   }
   ```

3. **Check Token Expiration**
   ```typescript
   // Adjust token expiration times
   const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
   const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
   ```

## 📊 Performance Issues

### Slow Loading Times

#### Symptoms
- Long page load times
- Slow API responses
- High memory usage

#### Solutions

1. **Optimize Database Queries**
   ```typescript
   // Use indexes and limit results
   const courses = await prisma.course.findMany({
     take: 10,
     skip: (page - 1) * 10,
     include: {
       instructor: {
         select: { firstName: true, lastName: true }
       }
     }
   });
   ```

2. **Implement Caching**
   ```typescript
   // Redis caching example
   const cacheKey = `courses:page:${page}`;
   const cached = await redis.get(cacheKey);
   
   if (cached) {
     return JSON.parse(cached);
   }
   
   const courses = await fetchCourses(page);
   await redis.setex(cacheKey, 300, JSON.stringify(courses));
   ```

3. **Optimize Frontend Bundle**
   ```bash
   # Analyze bundle size
   npm run build
   npx webpack-bundle-analyzer build/static/js/*.js
   ```

## 🔧 Development Tools

### Debugging Commands

```bash
# Check all services status
curl http://localhost:5000/health
curl http://localhost:3000

# Database debugging
cd backend
npx prisma studio

# View logs
tail -f backend/logs/combined.log

# Check processes
ps aux | grep node
netstat -tulpn | grep :3000
```

### Useful Browser Console Commands

```javascript
// Check environment
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.REACT_APP_API_URL);

// Check authentication
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));

// Test API connection
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 📞 Getting Additional Help

### Before Seeking Help

1. **Check this troubleshooting guide**
2. **Use the connection test page**
3. **Review browser console errors**
4. **Check server logs**
5. **Verify environment configuration**

### Information to Provide

When reporting issues, include:
- Operating system and version
- Node.js version
- Browser version (for frontend issues)
- Error messages (full stack traces)
- Steps to reproduce the issue
- Environment configuration (without sensitive data)

### Support Channels

- **Documentation**: Check all relevant documentation
- **Connection Test**: Use `/debug/connection-test` for diagnostics
- **Logs**: Review application and system logs
- **Community**: Search existing issues and discussions

Remember: Most issues are configuration-related. Double-check environment variables, database connections, and service status before diving into complex debugging.
