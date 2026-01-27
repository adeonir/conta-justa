import { expect, test } from '@playwright/test'

test.describe('404 Not Found Page', () => {
  test('displays 404 page for non-existent route', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
    await expect(page.getByText('A página que você está procurando não existe ou foi movida.')).toBeVisible()
  })

  test('navigates back to home when clicking button', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await page.waitForLoadState('networkidle')

    const button = page.getByRole('link', { name: 'Voltar para início' })
    await expect(button).toBeVisible()

    await button.click()
    await page.waitForURL('/')

    await expect(page).toHaveURL('/')
  })

  test('displays header and footer', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })
})
