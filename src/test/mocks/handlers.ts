import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:8080/api'

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT',
            avatar: null,
            approved: true
          }
        }
      })
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid credentials'
      },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      email: string
      password: string
      firstName: string
      lastName: string
      role: string
    }
    
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          message: 'User already exists with email: existing@example.com'
        },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: '2',
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        avatar: null,
        approved: body.role === 'STUDENT'
      }
    }, { status: 201 })
  }),

  // User endpoints
  http.get(`${API_BASE_URL}/users/profile`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
        avatar: null,
        approved: true
      }
    })
  }),

  // Course endpoints
  http.get(`${API_BASE_URL}/courses`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    
    return HttpResponse.json({
      success: true,
      data: {
        content: [
          {
            id: '1',
            title: 'React Development Course',
            description: 'Learn React from basics to advanced',
            thumbnail: 'https://example.com/thumbnail.jpg',
            price: 99.99,
            category: 'Web Development',
            level: 'INTERMEDIATE',
            duration: 3600,
            rating: 4.5,
            totalRatings: 100,
            enrolledCount: 500,
            instructor: {
              id: '2',
              firstName: 'John',
              lastName: 'Instructor',
              email: 'instructor@example.com'
            }
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: size,
        number: page
      }
    })
  }),

  http.get(`${API_BASE_URL}/courses/:id`, ({ params }) => {
    const { id } = params
    
    return HttpResponse.json({
      success: true,
      data: {
        id: id,
        title: 'React Development Course',
        description: 'Learn React from basics to advanced concepts',
        thumbnail: 'https://example.com/thumbnail.jpg',
        price: 99.99,
        category: 'Web Development',
        level: 'INTERMEDIATE',
        duration: 3600,
        rating: 4.5,
        totalRatings: 100,
        enrolledCount: 500,
        instructor: {
          id: '2',
          firstName: 'John',
          lastName: 'Instructor',
          email: 'instructor@example.com'
        },
        lessons: [
          {
            id: '1',
            title: 'Introduction to React',
            description: 'Getting started with React',
            duration: 300,
            order: 1,
            isPreview: true
          }
        ]
      }
    })
  }),

  // Enrollment endpoints
  http.post(`${API_BASE_URL}/enrollments`, async ({ request }) => {
    const body = await request.json() as { courseId: string }
    
    return HttpResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        id: '1',
        courseId: body.courseId,
        userId: '1',
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
        isActive: true
      }
    }, { status: 201 })
  }),

  // Error handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return HttpResponse.json(
      { message: 'Not Found' },
      { status: 404 }
    )
  })
]
