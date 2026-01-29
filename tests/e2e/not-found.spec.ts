import { expect, test } from '@playwright/test'

test.describe('404 Not Found Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nonexistent-page')
    await page.waitForLoadState('networkidle')
  })

  test('displays v2 copy with headline, subheadline, and helper text', async ({ page }) => {
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Essa conta não fecha' })).toBeVisible()
    await expect(page.getByText('A página que você tentou acessar não existe ou mudou de lugar.')).toBeVisible()
    await expect(page.getByText('Às vezes a gente se perde — com links também acontece.')).toBeVisible()
  })

  test('navigates back to home when clicking button', async ({ page }) => {
    const button = page.getByRole('link', { name: 'Voltar para o início' })
    await expect(button).toBeVisible()

    await button.click()
    await page.waitForURL('/')

    await expect(page).toHaveURL('/')
  })

  test('displays reassurance text for old links', async ({ page }) => {
    await expect(page.getByText('Se você chegou até aqui por um link antigo ou compartilhado')).toBeVisible()
  })

  test('displays header and footer', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('does not contain forbidden error words', async ({ page }) => {
    const mainText = await page.locator('main').innerText()
    const lowerText = mainText.toLowerCase()

    expect(lowerText).not.toContain('erro')
    expect(lowerText).not.toContain('falha')
    expect(lowerText).not.toContain('página inválida')
  })
})
