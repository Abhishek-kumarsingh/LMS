# API Documentation

## 🌐 Overview

The LMS API is a RESTful API built with Express.js and TypeScript. It provides comprehensive endpoints for managing all aspects of the learning management system.

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All API responses follow a consistent format:

#### Success Response
```json
{
  "data": {...},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Error Response
```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "emailVerified": false
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password123"
}
```

## 👥 User Endpoints

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "avatar": "avatar_url",
    "bio": "User bio",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "phone": "+1234567890",
  "timezone": "America/New_York"
}
```

### Upload Avatar
```http
POST /api/users/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
avatar: <file>
```

## 📚 Course Endpoints

### Get Courses
```http
GET /api/courses
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `category` (string): Course category
- `level` (string): Course level
- `status` (string): Course status

**Response:**
```json
{
  "courses": [
    {
      "id": "course_id",
      "title": "Introduction to Programming",
      "description": "Learn the basics of programming",
      "code": "CS101",
      "category": "Computer Science",
      "level": "Beginner",
      "duration": 40,
      "price": 99.99,
      "thumbnail": "thumbnail_url",
      "instructor": {
        "id": "instructor_id",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "isEnrolled": false,
      "studentCount": 150,
      "lessonCount": 12,
      "assignmentCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Course Details
```http
GET /api/courses/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "course_id",
    "title": "Introduction to Programming",
    "description": "Learn the basics of programming",
    "code": "CS101",
    "category": "Computer Science",
    "level": "Beginner",
    "duration": 40,
    "price": 99.99,
    "instructor": {
      "id": "instructor_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "bio": "Experienced developer"
    },
    "lessons": [
      {
        "id": "lesson_id",
        "title": "Getting Started",
        "description": "Introduction to programming concepts",
        "order": 1,
        "duration": 30,
        "isPublished": true,
        "progress": {
          "completed": false,
          "timeSpent": 0
        }
      }
    ],
    "assignments": [
      {
        "id": "assignment_id",
        "title": "First Assignment",
        "dueDate": "2024-02-01T23:59:59Z",
        "maxPoints": 100,
        "submissions": []
      }
    ],
    "isEnrolled": false,
    "enrollment": null
  }
}
```

### Create Course
```http
POST /api/courses
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "code": "CS102",
  "category": "Computer Science",
  "level": "Intermediate",
  "duration": 60,
  "price": 149.99,
  "thumbnail": "thumbnail_url",
  "maxStudents": 100,
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2024-05-01T00:00:00Z"
}
```

### Update Course
```http
PUT /api/courses/:id
Authorization: Bearer <token>
```

### Enroll in Course
```http
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "enrollment_id",
    "enrolledAt": "2024-01-01T00:00:00Z",
    "progress": 0,
    "status": "ACTIVE",
    "course": {
      "title": "Introduction to Programming"
    }
  }
}
```

### Publish Course
```http
PATCH /api/courses/:id/publish
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isPublished": true
}
```

## 📖 Lesson Endpoints

### Get Lessons
```http
GET /api/lessons?courseId=<course_id>
Authorization: Bearer <token>
```

### Get Lesson Details
```http
GET /api/lessons/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "lesson_id",
    "title": "Getting Started",
    "description": "Introduction to programming concepts",
    "content": {
      "blocks": [
        {
          "type": "text",
          "data": {
            "text": "Welcome to the course!"
          }
        },
        {
          "type": "video",
          "data": {
            "url": "video_url",
            "duration": 600
          }
        }
      ]
    },
    "order": 1,
    "duration": 30,
    "videoUrl": "video_url",
    "attachments": [],
    "progress": {
      "completed": false,
      "timeSpent": 0,
      "lastAccessed": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Create Lesson
```http
POST /api/lessons
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Lesson",
  "description": "Lesson description",
  "courseId": "course_id",
  "content": {
    "blocks": []
  },
  "order": 1,
  "duration": 30,
  "videoUrl": "video_url"
}
```

### Mark Lesson Complete
```http
POST /api/lessons/:id/complete
Authorization: Bearer <token>
```

## 📝 Assignment Endpoints

### Get Assignments
```http
GET /api/assignments?courseId=<course_id>
Authorization: Bearer <token>
```

### Get Assignment Details
```http
GET /api/assignments/:id
Authorization: Bearer <token>
```

### Create Assignment
```http
POST /api/assignments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Programming Assignment",
  "description": "Create a simple calculator",
  "instructions": "Detailed instructions here",
  "courseId": "course_id",
  "dueDate": "2024-02-01T23:59:59Z",
  "maxPoints": 100,
  "submissionType": "FILE",
  "allowLateSubmissions": true,
  "latePenalty": 10
}
```

### Submit Assignment
```http
POST /api/assignments/:id/submit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Assignment submission text",
  "attachments": ["file_url_1", "file_url_2"]
}
```

## 📊 Grade Endpoints

### Get Grades
```http
GET /api/grades?courseId=<course_id>
Authorization: Bearer <token>
```

### Grade Submission
```http
POST /api/grades/submission/:submissionId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "points": 85,
  "maxPoints": 100,
  "feedback": "Good work! Consider improving..."
}
```

## 💬 Discussion Endpoints

### Get Discussions
```http
GET /api/discussions?courseId=<course_id>
Authorization: Bearer <token>
```

### Create Discussion
```http
POST /api/discussions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Discussion Topic",
  "description": "Let's discuss this topic",
  "courseId": "course_id"
}
```

### Create Post
```http
POST /api/discussions/:id/posts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "This is my post content"
}
```

## 📅 Calendar Endpoints

### Get Events
```http
GET /api/calendar/events?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Create Event
```http
POST /api/calendar/events
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Class Session",
  "description": "Weekly class meeting",
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-15T11:00:00Z",
  "type": "CLASS",
  "courseId": "course_id"
}
```

## 📈 Analytics Endpoints

### Get Dashboard Data
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

### Get Course Analytics
```http
GET /api/analytics/course/:courseId
Authorization: Bearer <token>
```

## 📁 Upload Endpoints

### Upload File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <file>
type: "avatar" | "course_thumbnail" | "lesson_video" | "assignment_attachment"
```

**Response:**
```json
{
  "data": {
    "url": "https://cloudinary.com/uploaded-file-url",
    "publicId": "file_public_id",
    "format": "jpg",
    "size": 1024000
  }
}
```

## 🎥 Streaming Endpoints

### Get Streams
```http
GET /api/streams
Authorization: Bearer <token>
```

### Create Stream
```http
POST /api/streams
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Live Lecture",
  "description": "Today's programming lesson",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "maxViewers": 100,
  "chatEnabled": true
}
```

### Join Stream
```http
POST /api/streams/:id/join
Authorization: Bearer <token>
```

## 🔔 Notification Endpoints

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

### Mark Notification Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

## 🔍 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## 📝 Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Upload endpoints**: 10 requests per 15 minutes per user

## 🔒 Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 15 minutes (configurable)
- Refresh tokens expire after 7 days (configurable)
- CORS is configured for allowed origins
- Input validation on all endpoints
- SQL injection protection via Prisma ORM
