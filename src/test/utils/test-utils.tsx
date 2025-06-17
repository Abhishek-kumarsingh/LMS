import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock user data
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'STUDENT' as const,
  avatar: null,
  approved: true
}

export const mockInstructor = {
  id: '2',
  email: 'instructor@example.com',
  firstName: 'John',
  lastName: 'Instructor',
  role: 'INSTRUCTOR' as const,
  avatar: null,
  approved: true
}

export const mockAdmin = {
  id: '3',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN' as const,
  avatar: null,
  approved: true
}

// Mock course data
export const mockCourse = {
  id: '1',
  title: 'React Development Course',
  description: 'Learn React from basics to advanced concepts',
  thumbnail: 'https://example.com/thumbnail.jpg',
  price: 99.99,
  category: 'Web Development',
  level: 'INTERMEDIATE' as const,
  duration: 3600,
  rating: 4.5,
  totalRatings: 100,
  enrolledCount: 500,
  instructor: mockInstructor,
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

// Helper function to create mock store state
export const createMockStoreState = (overrides = {}) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  theme: 'light' as const,
  ...overrides
})

// Helper function to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0))

// Helper function to create authenticated user state
export const createAuthenticatedState = (user = mockUser) => ({
  user,
  token: 'mock-jwt-token',
  isAuthenticated: true,
  isLoading: false
})

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
