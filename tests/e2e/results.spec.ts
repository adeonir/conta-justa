import { expect, test } from '@playwright/test'
import { fillFormAndSubmit } from './utils/helpers'

test.describe('Results Page - Complete Flow', () => {
  test('form submission navigates to /results with clean URL', async ({ page }) => {
    await fillFormAndSubmit(page)

    expect(page.url()).toMatch(/\/results$/)
    expect(page.url()).not.toContain('?')
    expect(page.url()).not.toContain('=')
  })

  test('displays summary with correct names', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Maria', nameB: 'Joao' })

    await expect(page.getByRole('heading', { level: 1, name: 'Divisão das despesas' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Maria')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Joao')
  })

  test('displays correct total income', async ({ page }) => {
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000' })

    await expect(page.getByText('Renda total do casal', { exact: true })).toBeVisible()
    await expect(page.getByText('R$ 8.000,00')).toBeVisible()
  })

  test('displays correct total expenses', async ({ page }) => {
    await fillFormAndSubmit(page, { expenses: '2500' })

    const summary = page.locator('section').filter({ hasText: 'Renda total do casal' })
    await expect(summary.getByText('Despesas compartilhadas')).toBeVisible()
    await expect(summary.getByText('R$ 2.500,00')).toBeVisible()
  })

  test('shows housework section when housework hours provided', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    const summary = page.locator('section').filter({ hasText: 'Renda total do casal' })
    await expect(summary.getByText('Trabalho doméstico considerado')).toBeVisible()
    await expect(summary.getByText('20h/semana')).toBeVisible()
  })

  test('hides housework section when no housework hours', async ({ page }) => {
    await fillFormAndSubmit(page)

    const summary = page.locator('section').filter({ hasText: 'Renda total do casal' })
    await expect(summary.getByText('Trabalho doméstico considerado')).not.toBeVisible()
  })
})

test.describe('Results Page - Calculation Values', () => {
  test('displays proportional method as recommended without housework', async ({ page }) => {
    await fillFormAndSubmit(page)

    await expect(page.getByText('Modelo recomendado')).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Proporcional à renda' })).toBeVisible()
  })

  test('displays proportional method as recommended with housework (uses adjusted calculation)', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    await expect(page.getByText('Modelo recomendado')).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Proporcional à renda' })).toBeVisible()
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

  test('shows positive indicator for positive remaining balance', async ({ page }) => {
    // Income A=5000, B=3000, expenses=2000
    // Proportional: A pays 1250 (remaining 3750), B pays 750 (remaining 2250)
    // Both have positive remaining balance
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000', expenses: '2000' })

    const mainCard = page.locator('[data-slot="card"]').first()

    // Find remaining balance values by data-balance attribute
    const positiveBalances = mainCard.locator('[data-balance="positive"]')

    // Both should have positive balance
    await expect(positiveBalances).toHaveCount(2)
  })

  test('shows negative indicator for negative remaining balance', async ({ page }) => {
    // Income A=5000, B=500, expenses=2000
    // Equal split: both pay 1000, but B only earns 500 so remaining is -500
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '500', expenses: '2000' })

    // Click on equal method card to see 50/50 split
    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const equalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Divisão igual' })
    await equalCard.click()

    const mainCard = page.locator('[data-slot="card"]').first()

    // A remaining: 5000 - 1000 = 4000 (positive)
    // B remaining: 500 - 1000 = -500 (negative)
    const positiveBalance = mainCard.locator('[data-balance="positive"]')
    const negativeBalance = mainCard.locator('[data-balance="negative"]')

    await expect(positiveBalance).toHaveCount(1)
    await expect(negativeBalance).toHaveCount(1)
  })
})

test.describe('Results Page - Method Comparison', () => {
  test('shows comparison section with 2 method cards', async ({ page }) => {
    await fillFormAndSubmit(page)

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    await expect(comparisonSection).toBeVisible()

    // Should have exactly 2 cards
    const methodCards = comparisonSection.locator('[data-slot="card"]')
    await expect(methodCards).toHaveCount(2)

    // Check for method cards
    await expect(comparisonSection.locator('h3').filter({ hasText: 'Proporcional' })).toBeVisible()
    await expect(comparisonSection.locator('h3').filter({ hasText: 'Divisão igual' })).toBeVisible()
  })

  test('proportional card shows housework description when housework provided', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '10', houseworkB: '5' })

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const proportionalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Proporcional' })

    await expect(proportionalCard.getByText('Inclui trabalho doméstico')).toBeVisible()
  })

  test('proportional card shows income-only description without housework', async ({ page }) => {
    await fillFormAndSubmit(page)

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const proportionalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Proporcional' })

    await expect(proportionalCard.getByText('Baseado na renda de cada pessoa')).toBeVisible()
  })

  test('clicking equal method card updates main result', async ({ page }) => {
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000', expenses: '2000' })

    // Initially shows proportional as recommended
    await expect(page.locator('h2').filter({ hasText: 'Proporcional à renda' })).toBeVisible()

    // Click equal method card
    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const equalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Divisão igual' })
    await equalCard.click()

    // Should show "Modelo selecionado" and equal method title
    await expect(page.getByText('Modelo selecionado')).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Divisão igual' })).toBeVisible()

    // Main card should show 50/50 split (R$ 1.000,00 each)
    const mainCard = page.locator('[data-slot="card"]').first()
    const contributions = mainCard.locator('text=R$ 1.000,00')
    await expect(contributions).toHaveCount(2)
  })

  test('displays 2 method cards with housework', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '10', houseworkB: '5' })

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const methodCards = comparisonSection.locator('[data-slot="card"]')

    // Should have exactly 2 cards
    await expect(methodCards).toHaveCount(2)

    // Both method titles should be visible
    await expect(comparisonSection.locator('h3').filter({ hasText: 'Proporcional' })).toBeVisible()
    await expect(comparisonSection.locator('h3').filter({ hasText: 'Divisão igual' })).toBeVisible()
  })

  test('displays 2 method cards without housework', async ({ page }) => {
    await fillFormAndSubmit(page)

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const methodCards = comparisonSection.locator('[data-slot="card"]')

    // Should have exactly 2 cards
    await expect(methodCards).toHaveCount(2)
  })
})

test.describe('Results Page - Navigation', () => {
  test('redirects to home when accessing /results directly without data', async ({ page }) => {
    await page.goto('/results')
    await page.waitForLoadState('networkidle')

    // Should redirect to home
    await expect(page).toHaveURL('/')
  })

  test('"Novo cálculo" button navigates to home', async ({ page }) => {
    await fillFormAndSubmit(page)

    const button = page.getByRole('button', { name: 'Novo cálculo' })
    await expect(button).toBeVisible()
    await button.click()

    await expect(page).toHaveURL('/')
  })

  test('"Novo cálculo" clears stored data', async ({ page }) => {
    await fillFormAndSubmit(page)

    await page.getByRole('button', { name: 'Novo cálculo' }).click()
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
    expect(parsed.state.data).toBeDefined()
    expect(parsed.state.data.nameA).toBe('Ana')
  })
})

test.describe('Results Page - Explanation Section', () => {
  test('displays "Entenda os modelos" heading', async ({ page }) => {
    await fillFormAndSubmit(page)

    await expect(page.getByText('Entenda os modelos')).toBeVisible()
  })

  test('explains proportional method', async ({ page }) => {
    await fillFormAndSubmit(page)

    await expect(page.getByText('Modelo proporcional')).toBeVisible()
  })

  test('shows housework explanation only when housework provided', async ({ page }) => {
    await fillFormAndSubmit(page)

    // Without housework, should not show housework explanation in Entenda os modelos section
    const explanationSection = page.locator('[data-slot="card"]').filter({ hasText: 'Entenda os modelos' })
    const houseworkExplanation = explanationSection.getByText('Trabalho doméstico no cálculo')
    await expect(houseworkExplanation).not.toBeVisible()
  })

  test('shows housework explanation when housework provided', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '10', houseworkB: '5' })

    await expect(page.getByText('Trabalho doméstico no cálculo')).toBeVisible()
  })

  test('shows equal method explanation', async ({ page }) => {
    await fillFormAndSubmit(page)

    const explanationSection = page.locator('[data-slot="card"]').filter({ hasText: 'Entenda os modelos' })

    // Check for the equal method explanation title
    await expect(explanationSection.getByText('Divisão igual')).toBeVisible()

    // Check for the explanation text mentioning paying half
    await expect(explanationSection.getByText(/cada pessoa paga metade/)).toBeVisible()
  })
})

test.describe('Results Page - Disclaimer', () => {
  test('displays educational disclaimer', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Ana', nameB: 'Bob' })

    await expect(page.getByText(/visualizar diferentes modelos/)).toBeVisible()
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

    const summary = page.locator('section').filter({ hasText: 'Divisão das despesas' })
    const position = await summary.evaluate((el) => window.getComputedStyle(el).position)

    expect(position).toBe('sticky')
  })

  test('summary is not sticky on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await fillFormAndSubmit(page)

    const summary = page.locator('section').filter({ hasText: 'Divisão das despesas' })
    const position = await summary.evaluate((el) => window.getComputedStyle(el).position)

    expect(position).toBe('static')
  })
})

test.describe('Results Page - Housework Toggle', () => {
  test('switch is always visible', async ({ page }) => {
    await fillFormAndSubmit(page)

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByRole('switch')).toBeVisible()
    await expect(mainCard.getByText('Incluir trabalho doméstico')).toBeVisible()
  })

  test('switch is enabled and checked when housework exists and proportional method active', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    const mainCard = page.locator('[data-slot="card"]').first()
    const toggle = mainCard.getByRole('switch')
    await expect(toggle).toBeEnabled()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  test('switch is disabled when no housework hours', async ({ page }) => {
    await fillFormAndSubmit(page)

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByRole('switch')).toBeDisabled()
  })

  test('switch is disabled when equal method is selected', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const equalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Divisão igual' })
    await equalCard.click()

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByRole('switch')).toBeDisabled()
  })

  test('toggle OFF changes contribution values to baseline (proportional without housework)', async ({ page }) => {
    await fillFormAndSubmit(page, {
      incomeA: '5000',
      incomeB: '3000',
      expenses: '2000',
      houseworkA: '15',
      houseworkB: '5',
    })

    const mainCard = page.locator('[data-slot="card"]').first()

    // With housework ON (default), percentages are adjusted (not 62.50%/37.50%)
    await expect(mainCard.getByText('62.50%')).not.toBeVisible()
    await expect(mainCard.getByText('37.50%')).not.toBeVisible()

    // Toggle OFF
    const toggle = mainCard.getByRole('switch')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    // Without housework, baseline proportional is 62.50%/37.50%
    await expect(mainCard.getByText('62.50%')).toBeVisible()
    await expect(mainCard.getByText('37.50%')).toBeVisible()
  })

  test('toggle ON restores adjusted values', async ({ page }) => {
    await fillFormAndSubmit(page, {
      incomeA: '5000',
      incomeB: '3000',
      expenses: '2000',
      houseworkA: '15',
      houseworkB: '5',
    })

    const mainCard = page.locator('[data-slot="card"]').first()
    const toggle = mainCard.getByRole('switch')

    // Toggle OFF
    await toggle.click()
    await expect(mainCard.getByText('62.50%')).toBeVisible()

    // Toggle back ON
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    // Adjusted percentages should be back (not 62.50%/37.50%)
    await expect(mainCard.getByText('62.50%')).not.toBeVisible()
    await expect(mainCard.getByText('37.50%')).not.toBeVisible()
  })

  test('switch re-enables when switching back to proportional', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    const mainCard = page.locator('[data-slot="card"]').first()
    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })

    // Switch to equal - toggle should be disabled
    const equalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Divisão igual' })
    await equalCard.click()
    await expect(mainCard.getByRole('switch')).toBeDisabled()

    // Switch back to proportional - toggle should be enabled
    const proportionalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Proporcional' })
    await proportionalCard.click()
    await expect(mainCard.getByRole('switch')).toBeEnabled()
  })

  test('housework values match calculation formula (minimumWage / 220 * weeklyHours * 4)', async ({ page }) => {
    await fillFormAndSubmit(page, {
      incomeA: '5000',
      incomeB: '3000',
      expenses: '2000',
      houseworkA: '15',
      houseworkB: '5',
    })

    // Extract minimumWage from sessionStorage to compute expected values
    const minimumWageCents = await page.evaluate(() => {
      const storage = sessionStorage.getItem('expense-storage')
      if (!storage) return 0
      const parsed = JSON.parse(storage)
      return parsed.state.minimumWage as number
    })
    expect(minimumWageCents).toBeGreaterThan(0)

    // Formula: minimumWage / 220 * weeklyHours * 4 (in cents, rounded)
    const hourlyRate = minimumWageCents / 220
    const expectedA = Math.round(15 * 4 * hourlyRate)
    const expectedB = Math.round(5 * 4 * hourlyRate)

    // Verify adjusted percentages with housework ON (default)
    const adjustedIncomeA = 500000 + expectedA
    const adjustedIncomeB = 300000 + expectedB
    const totalAdjusted = adjustedIncomeA + adjustedIncomeB
    const expectedPercentA = Math.round((adjustedIncomeA / totalAdjusted) * 100 * 100) / 100
    const expectedPercentB = Math.round((adjustedIncomeB / totalAdjusted) * 100 * 100) / 100

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByText(`${expectedPercentA.toFixed(2)}%`).first()).toBeVisible()
    await expect(mainCard.getByText(`${expectedPercentB.toFixed(2)}%`).first()).toBeVisible()

    // Toggle OFF and verify baseline percentages (62.50% / 37.50%)
    const toggle = mainCard.getByRole('switch')
    await toggle.click()
    await expect(mainCard.getByText('62.50%')).toBeVisible()
    await expect(mainCard.getByText('37.50%')).toBeVisible()
  })
})

test.describe('Results Page - V2 Features', () => {
  test('main card shows eyebrow and description by default', async ({ page }) => {
    await fillFormAndSubmit(page)

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByText('Modelo recomendado')).toBeVisible()
    await expect(mainCard.getByText('Proporcional à renda')).toBeVisible()
    await expect(mainCard.getByText(/participação de cada pessoa/)).toBeVisible()
  })

  test('clicking equal card updates main card eyebrow and description', async ({ page }) => {
    await fillFormAndSubmit(page)

    // Click equal method card
    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const equalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Divisão igual' })
    await equalCard.click()

    const mainCard = page.locator('[data-slot="card"]').first()
    await expect(mainCard.getByText('Modelo selecionado')).toBeVisible()
    await expect(mainCard.getByText('Divisão igual')).toBeVisible()
    await expect(mainCard.getByText('Cada pessoa paga metade das despesas')).toBeVisible()
  })

  test('comparison cards are side by side on desktop', async ({ page }) => {
    await fillFormAndSubmit(page)
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.waitForTimeout(100)

    const comparisonGrid = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
      .locator('.grid')
    const gridStyle = await comparisonGrid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns)

    // Should have two column tracks (two pixel values separated by space)
    expect(gridStyle).toMatch(/[\d.]+px [\d.]+px/)
  })

  test('housework note visible on proportional card when housework provided', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '10', houseworkB: '5' })

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const proportionalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Proporcional' })

    await expect(proportionalCard.getByText('Inclui trabalho doméstico')).toBeVisible()
  })

  test('housework note not visible when no housework data', async ({ page }) => {
    await fillFormAndSubmit(page)

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const proportionalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Proporcional' })

    await expect(proportionalCard.getByText('Inclui trabalho doméstico')).not.toBeVisible()
  })

  test('imbalance alert visible on equal card when income ratio >= 2:1', async ({ page }) => {
    await fillFormAndSubmit(page, { incomeA: '6000', incomeB: '2000' })

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const equalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Divisão igual' })

    await expect(equalCard.getByText(/diferença de renda/)).toBeVisible()
  })

  test('imbalance alert not visible when incomes are close', async ({ page }) => {
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000' })

    const comparisonSection = page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'Modelos de divisão' }) })
    const equalCard = comparisonSection.locator('[data-slot="card"]').filter({ hasText: 'Divisão igual' })

    await expect(equalCard.getByText(/diferença de renda/)).not.toBeVisible()
  })

  test('"Novo cálculo" navigates to home and clears data', async ({ page }) => {
    await fillFormAndSubmit(page)

    await page.getByRole('button', { name: 'Novo cálculo' }).click()
    await expect(page).toHaveURL('/')

    // Try to go back to results - should redirect to home since data was cleared
    await page.goto('/results')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/')
  })
})
