import { test, expect } from '@playwright/test'

test.describe('Course Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should display course catalog', async ({ page }) => {
    await page.click('text=Courses')
    
    await expect(page.locator('h1')).toContainText('Course Catalog')
    await expect(page.locator('[data-testid="course-card"]')).toHaveCount.greaterThan(0)
  })

  test('should filter courses by category', async ({ page }) => {
    await page.click('text=Courses')
    
    await page.selectOption('select[name="category"]', 'Web Development')
    await page.waitForTimeout(1000) // Wait for filter to apply
    
    const courseCards = page.locator('[data-testid="course-card"]')
    await expect(courseCards.first()).toContainText('Web Development')
  })

  test('should search for courses', async ({ page }) => {
    await page.click('text=Courses')
    
    await page.fill('input[placeholder="Search courses..."]', 'React')
    await page.waitForTimeout(1000) // Wait for search to apply
    
    const courseCards = page.locator('[data-testid="course-card"]')
    await expect(courseCards.first()).toContainText('React')
  })

  test('should view course details', async ({ page }) => {
    await page.click('text=Courses')
    await page.click('[data-testid="course-card"]').first()
    
    await expect(page.locator('h1')).toContainText('React Development Course')
    await expect(page.locator('text=Course Overview')).toBeVisible()
    await expect(page.locator('text=Lessons')).toBeVisible()
    await expect(page.locator('text=Reviews')).toBeVisible()
  })

  test('should enroll in a course', async ({ page }) => {
    await page.click('text=Courses')
    await page.click('[data-testid="course-card"]').first()
    
    await page.click('button:has-text("Enroll Now")')
    
    await expect(page.locator('text=Successfully enrolled')).toBeVisible()
    await expect(page.locator('button:has-text("Continue Learning")')).toBeVisible()
  })

  test('should access enrolled course', async ({ page }) => {
    // First enroll in a course
    await page.click('text=Courses')
    await page.click('[data-testid="course-card"]').first()
    await page.click('button:has-text("Enroll Now")')
    
    // Go to My Learning
    await page.click('text=My Learning')
    
    await expect(page.locator('h1')).toContainText('My Learning')
    await expect(page.locator('[data-testid="enrolled-course"]')).toHaveCount.greaterThan(0)
    
    // Access the course
    await page.click('[data-testid="enrolled-course"]').first()
    await expect(page.locator('text=Course Progress')).toBeVisible()
  })

  test('should play course video', async ({ page }) => {
    // Enroll and access course
    await page.click('text=Courses')
    await page.click('[data-testid="course-card"]').first()
    await page.click('button:has-text("Enroll Now")')
    await page.click('button:has-text("Continue Learning")')
    
    // Click on first lesson
    await page.click('[data-testid="lesson-item"]').first()
    
    await expect(page.locator('video')).toBeVisible()
    await expect(page.locator('[data-testid="lesson-title"]')).toBeVisible()
  })

  test('should mark lesson as complete', async ({ page }) => {
    // Navigate to lesson
    await page.click('text=Courses')
    await page.click('[data-testid="course-card"]').first()
    await page.click('button:has-text("Enroll Now")')
    await page.click('button:has-text("Continue Learning")')
    await page.click('[data-testid="lesson-item"]').first()
    
    // Mark as complete
    await page.click('button:has-text("Mark as Complete")')
    
    await expect(page.locator('text=Lesson completed')).toBeVisible()
    await expect(page.locator('[data-testid="lesson-item"].completed')).toHaveCount(1)
  })

  test('should leave course review', async ({ page }) => {
    // Navigate to course details
    await page.click('text=Courses')
    await page.click('[data-testid="course-card"]').first()
    
    // Scroll to reviews section
    await page.locator('text=Reviews').scrollIntoViewIfNeeded()
    await page.click('button:has-text("Write a Review")')
    
    // Fill review form
    await page.click('[data-testid="star-rating"] >> nth=4') // 5 stars
    await page.fill('textarea[placeholder="Write your review..."]', 'Great course! Highly recommended.')
    await page.click('button:has-text("Submit Review")')
    
    await expect(page.locator('text=Review submitted successfully')).toBeVisible()
  })

  test('should add course to wishlist', async ({ page }) => {
    await page.click('text=Courses')
    
    // Click wishlist button on course card
    await page.click('[data-testid="wishlist-button"]').first()
    
    await expect(page.locator('text=Added to wishlist')).toBeVisible()
    
    // Check wishlist
    await page.click('text=Wishlist')
    await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount.greaterThan(0)
  })

  test('should sort courses by price', async ({ page }) => {
    await page.click('text=Courses')
    
    await page.selectOption('select[name="sortBy"]', 'price-low-high')
    await page.waitForTimeout(1000)
    
    const prices = await page.locator('[data-testid="course-price"]').allTextContents()
    const numericPrices = prices.map(price => parseFloat(price.replace('$', '')))
    
    // Check if prices are sorted in ascending order
    for (let i = 1; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1])
    }
  })

  test('should filter courses by level', async ({ page }) => {
    await page.click('text=Courses')
    
    await page.click('input[value="BEGINNER"]')
    await page.waitForTimeout(1000)
    
    const courseCards = page.locator('[data-testid="course-card"]')
    const count = await courseCards.count()
    
    for (let i = 0; i < count; i++) {
      await expect(courseCards.nth(i)).toContainText('Beginner')
    }
  })

  test('should display course progress', async ({ page }) => {
    // Enroll in course and complete a lesson
    await page.click('text=Courses')
    await page.click('[data-testid="course-card"]').first()
    await page.click('button:has-text("Enroll Now")')
    await page.click('button:has-text("Continue Learning")')
    await page.click('[data-testid="lesson-item"]').first()
    await page.click('button:has-text("Mark as Complete")')
    
    // Go back to course overview
    await page.click('text=Course Overview')
    
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible()
    await expect(page.locator('text=Progress:')).toBeVisible()
  })
})
