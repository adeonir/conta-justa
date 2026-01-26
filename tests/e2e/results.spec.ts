import { expect, test } from '@playwright/test'

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
    incomeA = '5000',
    incomeB = '3000',
    expenses = '2000',
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
    await page.getByText('Incluir trabalho doméstico no cálculo').click()
    if (houseworkA) {
      await page.locator('#houseworkA').fill(houseworkA)
    }
    if (houseworkB) {
      await page.locator('#houseworkB').fill(houseworkB)
    }
  }

  await page.locator('#expenses').blur()

  const button = page.getByRole('button', { name: 'Calcular divisão' })
  await expect(button).toBeEnabled()
  await button.click()

  await page.waitForURL('/results')
}

test.describe('Results Page - Complete Flow', () => {
  test('form submission navigates to /results with clean URL', async ({ page }) => {
    await fillFormAndSubmit(page)

    expect(page.url()).toMatch(/\/results$/)
    expect(page.url()).not.toContain('?')
    expect(page.url()).not.toContain('=')
  })

  test('displays summary with correct names', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Maria', nameB: 'Joao' })

    await expect(page.getByText('Divisão para')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Maria')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Joao')
  })

  test('displays correct total income', async ({ page }) => {
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000' })

    await expect(page.getByText('Renda total do casal')).toBeVisible()
    await expect(page.getByText('R$ 8.000,00')).toBeVisible()
  })

  test('displays correct total expenses', async ({ page }) => {
    await fillFormAndSubmit(page, { expenses: '2500' })

    await expect(page.getByText('Despesas compartilhadas')).toBeVisible()
    await expect(page.getByText('R$ 2.500,00')).toBeVisible()
  })

  test('shows housework section when housework hours provided', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    const summary = page.locator('section').filter({ hasText: 'Renda total do casal' })
    await expect(summary.getByText('Trabalho doméstico')).toBeVisible()
    await expect(summary.getByText('20h/semana')).toBeVisible()
  })

  test('hides housework section when no housework hours', async ({ page }) => {
    await fillFormAndSubmit(page)

    const summary = page.locator('section').filter({ hasText: 'Renda total do casal' })
    await expect(summary.getByText('Trabalho doméstico')).not.toBeVisible()
  })
})

test.describe('Results Page - Calculation Values', () => {
  test('displays proportional method as recommended without housework', async ({ page }) => {
    await fillFormAndSubmit(page)

    await expect(page.getByText('Divisão recomendada')).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Proporcional simples' })).toBeVisible()
  })

  test('displays adjusted method as recommended with housework', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    await expect(page.getByText('Divisão recomendada')).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Proporcional + trabalho doméstico' })).toBeVisible()
  })

  test('displays correct proportional contributions', async ({ page }) => {
    // Ana: 5000 (62.5%), Bob: 3000 (37.5%)
    // Expenses: 2000
    // Ana pays: 1250, Bob pays: 750
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000', expenses: '2000' })

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByText('R$ 1.250,00')).toBeVisible()
    await expect(mainCard.getByText('R$ 750,00')).toBeVisible()
  })

  test('displays person names in result card', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Carlos', nameB: 'Diana' })

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByText('Carlos')).toBeVisible()
    await expect(mainCard.getByText('Diana')).toBeVisible()
  })

  test('displays percentage values', async ({ page }) => {
    await fillFormAndSubmit(page)

    const mainCard = page.locator('[data-slot="card"]').first()
    // Percentages are formatted with toFixed(2) - 62.50% and 37.50%
    await expect(mainCard.getByText('62.50%')).toBeVisible()
    await expect(mainCard.getByText('37.50%')).toBeVisible()
  })
})

test.describe('Results Page - Method Comparison', () => {
  test('shows comparison section with method cards', async ({ page }) => {
    await fillFormAndSubmit(page)

    const comparisonSection = page.locator('section').filter({ hasText: 'Compare os métodos' })
    await expect(comparisonSection).toBeVisible()

    // Check for method cards - look for h3 within the comparison section
    await expect(comparisonSection.locator('h3').filter({ hasText: 'Proporcional simples' })).toBeVisible()
    await expect(comparisonSection.locator('h3').filter({ hasText: 'Contribuição mínima' })).toBeVisible()
  })

  test('shows adjusted method card with housework', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '10', houseworkB: '5' })

    const comparisonSection = page.locator('section').filter({ hasText: 'Compare os métodos' })
    await expect(comparisonSection.locator('h3').filter({ hasText: /trabalho doméstico/ })).toBeVisible()
  })

  test('clicking method card updates main result', async ({ page }) => {
    await fillFormAndSubmit(page)

    // Initially shows proportional as recommended
    await expect(page.locator('h2').filter({ hasText: 'Proporcional simples' })).toBeVisible()

    // Click hybrid method card (it's a div with onClick, not a button)
    const comparisonSection = page.locator('section').filter({ hasText: 'Compare os métodos' })
    const hybridCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Contribuição mínima' })
    await hybridCard.click()

    // Should show "Método selecionado" instead of "Divisão recomendada"
    await expect(page.getByText('Método selecionado')).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Contribuição mínima' })).toBeVisible()
  })
})

test.describe('Results Page - Navigation', () => {
  test('redirects to home when accessing /results directly without data', async ({ page }) => {
    await page.goto('/results')
    await page.waitForLoadState('networkidle')

    // Should redirect to home
    await expect(page).toHaveURL('/')
  })

  test('"Fazer novo cálculo" button navigates to home', async ({ page }) => {
    await fillFormAndSubmit(page)

    const button = page.getByRole('button', { name: 'Fazer novo cálculo' })
    await expect(button).toBeVisible()
    await button.click()

    await expect(page).toHaveURL('/')
  })

  test('"Fazer novo cálculo" clears stored data', async ({ page }) => {
    await fillFormAndSubmit(page)

    await page.getByRole('button', { name: 'Fazer novo cálculo' }).click()
    await expect(page).toHaveURL('/')

    // Try to go back to results - should redirect to home
    await page.goto('/results')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL('/')
  })
})

test.describe('Results Page - Data Persistence', () => {
  test('page refresh maintains data via sessionStorage', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Alice', nameB: 'Bruno' })

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Alice')

    // Refresh the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Data should persist
    await expect(page).toHaveURL('/results')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Alice')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bruno')
  })

  test('data persists in sessionStorage', async ({ page }) => {
    await fillFormAndSubmit(page)

    const storage = await page.evaluate(() => sessionStorage.getItem('expense-storage'))
    expect(storage).not.toBeNull()

    const parsed = JSON.parse(storage as string)
    expect(parsed.state.formData).toBeDefined()
    expect(parsed.state.formData.nameA).toBe('Ana')
  })
})

test.describe('Results Page - Explanation Section', () => {
  test('displays "Como funciona" heading', async ({ page }) => {
    await fillFormAndSubmit(page)

    await expect(page.getByText('Como funciona')).toBeVisible()
  })

  test('explains proportional method', async ({ page }) => {
    await fillFormAndSubmit(page)

    await expect(page.getByText('Divisão proporcional')).toBeVisible()
  })

  test('shows housework explanation only when housework provided', async ({ page }) => {
    await fillFormAndSubmit(page)

    // Without housework, should not show housework explanation in Como funciona section
    const explanationSection = page.locator('section').filter({ hasText: 'Como funciona' })
    const houseworkExplanation = explanationSection.getByText(/incluir trabalho doméstico/i)
    await expect(houseworkExplanation).not.toBeVisible()
  })

  test('shows housework explanation when housework provided', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '10', houseworkB: '5' })

    await expect(page.getByText(/incluir trabalho doméstico/i)).toBeVisible()
  })
})

test.describe('Results Page - Disclaimer', () => {
  test('displays educational disclaimer', async ({ page }) => {
    await fillFormAndSubmit(page)

    await expect(page.getByText(/ferramenta educativa/)).toBeVisible()
  })
})

test.describe('Results Page - Responsive Layout', () => {
  test('2-column layout on desktop viewport', async ({ page }) => {
    // Fill form first at default size, then resize before checking layout
    await fillFormAndSubmit(page)
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.waitForTimeout(100) // Wait for layout to adjust

    const main = page.locator('main')
    const computedStyle = await main.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return {
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
      }
    })

    expect(computedStyle.display).toBe('grid')
    expect(computedStyle.gridTemplateColumns).toMatch(/[\d.]+px [\d.]+px/)
  })

  test('1-column layout on mobile viewport', async ({ page }) => {
    // Fill form first, then resize to mobile
    await fillFormAndSubmit(page)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(100) // Wait for layout to adjust

    const main = page.locator('main')
    const computedStyle = await main.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return {
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
      }
    })

    expect(computedStyle.display).toBe('grid')
    expect(computedStyle.gridTemplateColumns).toMatch(/^\d+(\.\d+)?px$/)
  })

  test('summary is sticky on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await fillFormAndSubmit(page)

    const summary = page.locator('section').filter({ hasText: 'Divisão para' })
    const position = await summary.evaluate((el) => window.getComputedStyle(el).position)

    expect(position).toBe('sticky')
  })

  test('summary is not sticky on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await fillFormAndSubmit(page)

    const summary = page.locator('section').filter({ hasText: 'Divisão para' })
    const position = await summary.evaluate((el) => window.getComputedStyle(el).position)

    expect(position).toBe('static')
  })
})
