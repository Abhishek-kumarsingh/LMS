import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'
import { mockUser, mockLocalStorage } from '../test/utils/test-utils'

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('sets loading state', () => {
    const { setLoading } = useAuthStore.getState()
    
    setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    
    setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('logs in user successfully', () => {
    const { login } = useAuthStore.getState()
    const token = 'mock-jwt-token'
    
    login(mockUser, token)
    
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(token)
    expect(state.isAuthenticated).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', token)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
  })

  it('logs out user successfully', () => {
    const { login, logout } = useAuthStore.getState()
    
    // First login
    login(mockUser, 'mock-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    
    // Then logout
    logout()
    
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
  })

  it('updates user profile', () => {
    const { login, updateUser } = useAuthStore.getState()
    
    // First login
    login(mockUser, 'mock-token')
    
    // Update user
    const updatedUser = { ...mockUser, firstName: 'Updated', lastName: 'Name' }
    updateUser(updatedUser)
    
    const state = useAuthStore.getState()
    expect(state.user).toEqual(updatedUser)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser))
  })

  it('initializes from localStorage on store creation', () => {
    const storedToken = 'stored-token'
    const storedUser = JSON.stringify(mockUser)
    
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'token') return storedToken
      if (key === 'user') return storedUser
      return null
    })
    
    // Create a new store instance to test initialization
    const { initializeAuth } = useAuthStore.getState()
    initializeAuth()
    
    const state = useAuthStore.getState()
    expect(state.token).toBe(storedToken)
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('handles invalid JSON in localStorage gracefully', () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'token') return 'valid-token'
      if (key === 'user') return 'invalid-json'
      return null
    })
    
    const { initializeAuth } = useAuthStore.getState()
    initializeAuth()
    
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('checks if user is admin', () => {
    const { login, isAdmin } = useAuthStore.getState()
    
    // Test with non-admin user
    login(mockUser, 'token')
    expect(isAdmin()).toBe(false)
    
    // Test with admin user
    const adminUser = { ...mockUser, role: 'ADMIN' as const }
    login(adminUser, 'token')
    expect(isAdmin()).toBe(true)
  })

  it('checks if user is instructor', () => {
    const { login, isInstructor } = useAuthStore.getState()
    
    // Test with non-instructor user
    login(mockUser, 'token')
    expect(isInstructor()).toBe(false)
    
    // Test with instructor user
    const instructorUser = { ...mockUser, role: 'INSTRUCTOR' as const }
    login(instructorUser, 'token')
    expect(isInstructor()).toBe(true)
  })

  it('checks if user is student', () => {
    const { login, isStudent } = useAuthStore.getState()
    
    // Test with student user
    login(mockUser, 'token')
    expect(isStudent()).toBe(true)
    
    // Test with non-student user
    const adminUser = { ...mockUser, role: 'ADMIN' as const }
    login(adminUser, 'token')
    expect(isStudent()).toBe(false)
  })

  it('gets user full name', () => {
    const { login, getUserFullName } = useAuthStore.getState()
    
    // Test without user
    expect(getUserFullName()).toBe('')
    
    // Test with user
    login(mockUser, 'token')
    expect(getUserFullName()).toBe(`${mockUser.firstName} ${mockUser.lastName}`)
  })

  it('checks if user has permission', () => {
    const { login, hasPermission } = useAuthStore.getState()
    
    // Test without user
    expect(hasPermission('admin')).toBe(false)
    
    // Test with student
    login(mockUser, 'token')
    expect(hasPermission('student')).toBe(true)
    expect(hasPermission('instructor')).toBe(false)
    expect(hasPermission('admin')).toBe(false)
    
    // Test with instructor
    const instructorUser = { ...mockUser, role: 'INSTRUCTOR' as const }
    login(instructorUser, 'token')
    expect(hasPermission('student')).toBe(true)
    expect(hasPermission('instructor')).toBe(true)
    expect(hasPermission('admin')).toBe(false)
    
    // Test with admin
    const adminUser = { ...mockUser, role: 'ADMIN' as const }
    login(adminUser, 'token')
    expect(hasPermission('student')).toBe(true)
    expect(hasPermission('instructor')).toBe(true)
    expect(hasPermission('admin')).toBe(true)
  })
})
