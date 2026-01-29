import { expect, test } from '@playwright/test'

test.describe('SEO Meta Tags', () => {
  test('homepage has correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Conta Justa/)
  })

  test('about page has its own title', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveTitle(/Sobre.*Conta Justa/)
  })

  test('404 page has its own title', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page).toHaveTitle(/não encontrada.*Conta Justa/i)
  })

  test('homepage has og:image meta tag', async ({ page }) => {
    await page.goto('/')
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute('content', /og-image\.png/)
  })

  test('homepage has twitter card meta tags', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /Conta Justa/)
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /og-image\.png/)
  })

  test('each route has unique meta description', async ({ page }) => {
    await page.goto('/')
    const homeDesc = await page.locator('meta[name="description"]').getAttribute('content')

    await page.goto('/about')
    const aboutDesc = await page.locator('meta[name="description"]').getAttribute('content')

    expect(homeDesc).not.toBe(aboutDesc)
  })
})
