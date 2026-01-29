import { expect, test } from '@playwright/test'

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
  })

  test('displays hero section with headline and subheadline', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sobre o Conta Justa' })).toBeVisible()
    await expect(page.getByText('Uma ferramenta para casais dividirem despesas')).toBeVisible()
  })

  test('displays "O que é" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'O que é' })).toBeVisible()
    await expect(page.getByText('calculadora gratuita')).toBeVisible()
  })

  test('displays methodology section with exactly 2 models', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Como calculamos' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Divisão proporcional' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Divisão igual' })).toBeVisible()
    await expect(page.getByText('híbrida', { exact: false })).not.toBeVisible()
  })

  test('displays housework section with ENEM 2023 quote', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Trabalho doméstico também é trabalho' }),
    ).toBeVisible()
    await expect(page.getByText('foi tema da redação do ENEM 2023')).toBeVisible()
  })

  test('displays reference value section with info box formula', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Valor de referência' })).toBeVisible()
    await expect(page.getByText('220 horas mensais')).toBeVisible()
  })

  test('displays sources section with 3 references', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Fontes e referências' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'FGV IBRE' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ENEM 2023' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Banco Central do Brasil' })).toBeVisible()
  })

  test('displays author section with external portfolio link', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sobre o autor' })).toBeVisible()
    const portfolioLink = page.getByRole('link', { name: /portfólio/i })
    await expect(portfolioLink).toBeVisible()
    await expect(portfolioLink).toHaveAttribute('href', 'https://adeonir.dev')
    await expect(portfolioLink).toHaveAttribute('target', '_blank')
  })

  test('displays CTA section with link to calculator', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pronto para calcular?' })).toBeVisible()
    const ctaLink = page.getByRole('link', { name: /calculadora/i })
    await expect(ctaLink).toBeVisible()
    await ctaLink.click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('displays header and footer', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Sobre.*Conta Justa/)
  })
})

test.describe('About Page - Responsive', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Sobre o Conta Justa' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pronto para calcular?' })).toBeVisible()
  })

  test('renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Sobre o Conta Justa' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pronto para calcular?' })).toBeVisible()
  })
})
