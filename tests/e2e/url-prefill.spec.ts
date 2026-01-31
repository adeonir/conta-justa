import { expect, test } from '@playwright/test'

const SHARED_URL = '/results?a=Maria&ra=450000&b=Joao&rb=300000&e=200000'
const SHARED_URL_WITH_HOUSEWORK = '/results?a=Maria&ra=450000&b=Joao&rb=300000&e=200000&ha=10&hb=5'

async function fillFormAndSubmit(
  page: import('@playwright/test').Page,
  options: {
    nameA?: string
    nameB?: string
    incomeA?: string
    incomeB?: string
    expenses?: string
    houseworkA?: string
    houseworkB?: string
  } = {},
) {
  const {
    nameA = 'Ana',
    nameB = 'Bob',
    incomeA = '500000',
    incomeB = '300000',
    expenses = '200000',
    houseworkA,
    houseworkB,
  } = options

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.locator('#nameA').fill(nameA)
  await page.locator('#incomeA').click()
  await page.locator('#incomeA').pressSequentially(incomeA)

  await page.locator('#nameB').fill(nameB)
  await page.locator('#incomeB').click()
  await page.locator('#incomeB').pressSequentially(incomeB)

  await page.locator('#expenses').click()
  await page.locator('#expenses').pressSequentially(expenses)

  if (houseworkA || houseworkB) {
    await page.getByText('Considerar trabalho doméstico no cálculo').click()
    if (houseworkA) {
      await page.locator('#houseworkA').fill(houseworkA)
    }
    if (houseworkB) {
      await page.locator('#houseworkB').fill(houseworkB)
    }
  }

  await page.locator('#expenses').blur()

  const button = page.getByRole('button', { name: 'Ver resultados' })
  await expect(button).toBeEnabled()
  await button.click()

  await page.waitForURL('/results')
}

test.describe('URL Pre-fill - Valid Shared Links', () => {
  // AC-001: Fresh session with valid params shows results
  test('displays results from URL params in fresh session', async ({ page }) => {
    await page.goto(SHARED_URL)
    await page.waitForLoadState('networkidle')

    // Should stay on /results (not redirect)
    await expect(page).toHaveURL(/\/results/)

    // Verify names are displayed in the heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Maria')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Joao')

    // Verify the recommended model is shown
    await expect(page.getByText('Modelo recomendado')).toBeVisible()

    // Verify proportional contributions:
    // Maria: 450000/750000 = 60%, pays R$1.200,00
    // Joao: 300000/750000 = 40%, pays R$800,00
    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByText('R$ 1.200,00')).toBeVisible()
    await expect(mainCard.getByText('R$ 800,00')).toBeVisible()
    await expect(mainCard.getByText('60.00%')).toBeVisible()
    await expect(mainCard.getByText('40.00%')).toBeVisible()
  })

  // AC-002: With housework params shows housework enabled
  test('displays housework data when ha/hb params present', async ({ page }) => {
    await page.goto(SHARED_URL_WITH_HOUSEWORK)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/results/)

    // Verify housework section is visible in the summary
    const summary = page.locator('section').filter({ hasText: 'Renda total do casal' })
    await expect(summary.getByText('Trabalho doméstico considerado')).toBeVisible()
    await expect(summary.getByText('15h/semana')).toBeVisible()

    // Verify the housework toggle is enabled and checked
    const mainCard = page.locator('[data-slot="card"]').first()
    const toggle = mainCard.getByRole('switch')
    await expect(toggle).toBeEnabled()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  // AC-010: URL params override existing store data
  test('URL params take precedence over existing store data', async ({ page }) => {
    // First fill form with different data (Ana/Bob)
    await fillFormAndSubmit(page, {
      nameA: 'Ana',
      nameB: 'Bob',
      incomeA: '500000',
      incomeB: '300000',
      expenses: '200000',
    })

    // Verify initial results show Ana and Bob
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ana')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bob')

    // Now navigate to shared link with Maria/Joao (different data)
    await page.goto(SHARED_URL)
    await page.waitForLoadState('networkidle')

    // URL data should override store data
    await expect(page).toHaveURL(/\/results/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Maria')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Joao')

    // Verify calculations use URL data, not store data
    // Maria: 60% of R$2.000 = R$1.200, Joao: 40% of R$2.000 = R$800
    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByText('R$ 1.200,00')).toBeVisible()
    await expect(mainCard.getByText('R$ 800,00')).toBeVisible()
  })
})

test.describe('URL Pre-fill - Invalid Params', () => {
  // AC-003: No params, no store data -> redirect
  test('redirects to home without params and without store data', async ({ page }) => {
    await page.goto('/results')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL('/')
  })

  // AC-004: Negative income -> redirect
  test('redirects to home with negative income param', async ({ page }) => {
    await page.goto('/results?a=Maria&ra=-100&b=Joao&rb=300000&e=200000')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL('/')
  })

  // AC-005: Empty name -> redirect
  test('redirects to home with empty name param', async ({ page }) => {
    await page.goto('/results?a=&ra=450000&b=Joao&rb=300000&e=200000')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL('/')
  })

  // AC-006: Missing required param -> redirect
  test('redirects to home when required param is missing', async ({ page }) => {
    await page.goto('/results?ra=450000&b=Joao&rb=300000&e=200000')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL('/')
  })
})

test.describe('URL Pre-fill - Navigation', () => {
  // AC-007: Ajustar valores pre-fills form
  test('Ajustar valores navigates to form with pre-filled data', async ({ page }) => {
    await page.goto(SHARED_URL)
    await page.waitForLoadState('networkidle')

    // Wait for results to render
    await expect(page.getByText('Modelo recomendado')).toBeVisible()

    // Click "Ajustar valores"
    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Verify form fields are pre-filled with shared data
    await expect(page.locator('#nameA')).toHaveValue('Maria')
    await expect(page.locator('#nameB')).toHaveValue('Joao')

    // Currency fields should contain the correct amounts
    // ra=450000 centavos = R$ 4.500,00
    await expect(page.locator('#incomeA')).toHaveValue(/4[.,]500/)
    // rb=300000 centavos = R$ 3.000,00
    await expect(page.locator('#incomeB')).toHaveValue(/3[.,]000/)
    // e=200000 centavos = R$ 2.000,00
    await expect(page.locator('#expenses')).toHaveValue(/2[.,]000/)
  })

  test('Ajustar valores pre-fills housework fields when present', async ({ page }) => {
    await page.goto(SHARED_URL_WITH_HOUSEWORK)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Modelo recomendado')).toBeVisible()

    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Housework fields should be visible and pre-filled
    await expect(page.locator('#houseworkA')).toBeVisible()
    await expect(page.locator('#houseworkA')).toHaveValue('10')
    await expect(page.locator('#houseworkB')).toHaveValue('5')
  })
})

test.describe('URL Pre-fill - Sharing', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  // AC-008: Sharing buttons work and generate correct URLs from shared data
  test('sharing buttons generate correct URLs from shared data', async ({ page }) => {
    await page.goto(SHARED_URL)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Modelo recomendado')).toBeVisible()

    // Click the copy/share button
    const copyButton = page.getByRole('button', { name: 'Copiar link do resultado' })
    const shareButton = page.getByRole('button', { name: 'Compartilhar resultado' })

    if (await copyButton.isVisible()) {
      await copyButton.click()
    } else {
      await shareButton.click()
    }

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

    expect(clipboardText).toContain('/results?')

    const url = new URL(clipboardText)
    expect(url.pathname).toBe('/results')
    expect(url.searchParams.get('a')).toBe('Maria')
    expect(url.searchParams.get('b')).toBe('Joao')
    expect(url.searchParams.get('ra')).toBe('450000')
    expect(url.searchParams.get('rb')).toBe('300000')
    expect(url.searchParams.get('e')).toBe('200000')
  })
})
