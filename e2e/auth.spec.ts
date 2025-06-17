import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form', async ({ page }) => {
    await page.click('text=Login')
    
    await expect(page.locator('h1')).toContainText('Welcome Back')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.click('text=Login')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.click('text=Login')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should register new user', async ({ page }) => {
    await page.click('text=Sign Up')
    
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[type="email"]', 'newuser@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.selectOption('select[name="role"]', 'STUDENT')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Registration successful')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('text=Login')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should navigate between login and register forms', async ({ page }) => {
    await page.click('text=Login')
    await expect(page.locator('h1')).toContainText('Welcome Back')
    
    await page.click('text=Sign up here')
    await expect(page.locator('h1')).toContainText('Create Account')
    
    await page.click('text=Sign in here')
    await expect(page.locator('h1')).toContainText('Welcome Back')
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.click('text=Login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/)
    
    // Then logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Logout')
    
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Login')).toBeVisible()
  })

  test('should remember user session on page refresh', async ({ page }) => {
    // Login
    await page.click('text=Login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/)
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('h1')).toContainText('Welcome Back')
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.click('text=Login')
    await page.click('text=Forgot password?')
    
    await expect(page.locator('h1')).toContainText('Reset Password')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Password reset email sent')).toBeVisible()
  })
})
