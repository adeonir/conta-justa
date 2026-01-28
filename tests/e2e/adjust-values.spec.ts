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

test.describe('Adjust Values Flow', () => {
  test('"Ajustar valores" button is visible on results page', async ({ page }) => {
    await fillFormAndSubmit(page)

    const adjustButton = page.getByRole('button', { name: 'Ajustar valores' })
    await expect(adjustButton).toBeVisible()
  })

  test('"Ajustar valores" button appears beside "Fazer novo cálculo"', async ({ page }) => {
    await fillFormAndSubmit(page)

    const adjustButton = page.getByRole('button', { name: 'Ajustar valores' })
    const newCalcButton = page.getByRole('button', { name: 'Fazer novo cálculo' })

    await expect(adjustButton).toBeVisible()
    await expect(newCalcButton).toBeVisible()

    // Both should be in the same container (flex row)
    const adjustParent = await adjustButton.evaluate((el) => el.parentElement?.className)
    const newCalcParent = await newCalcButton.evaluate((el) => el.parentElement?.className)
    expect(adjustParent).toBe(newCalcParent)
  })

  test('clicking "Ajustar valores" navigates to home with pre-filled form', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Maria', nameB: 'Joao', incomeA: '6000', incomeB: '4000', expenses: '3000' })

    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Form should be pre-filled
    await expect(page.locator('#nameA')).toHaveValue('Maria')
    await expect(page.locator('#nameB')).toHaveValue('Joao')
  })

  test('currency fields are pre-filled with correct values', async ({ page }) => {
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000', expenses: '2000' })

    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    const incomeAInput = page.locator('#incomeA')
    const incomeBInput = page.locator('#incomeB')
    const expensesInput = page.locator('#expenses')

    // Check values contain the expected amounts (format may vary)
    await expect(incomeAInput).toHaveValue(/5[.,]000/)
    await expect(incomeBInput).toHaveValue(/3[.,]000/)
    await expect(expensesInput).toHaveValue(/2[.,]000/)
  })

  test('housework section opens automatically when adjusting with housework data', async ({ page }) => {
    await fillFormAndSubmit(page, { houseworkA: '15', houseworkB: '5' })

    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Housework fields should be visible (collapsible is open)
    await expect(page.locator('#houseworkA')).toBeVisible()
    await expect(page.locator('#houseworkA')).toHaveValue('15')
    await expect(page.locator('#houseworkB')).toHaveValue('5')
  })

  test('housework section stays closed when adjusting without housework data', async ({ page }) => {
    await fillFormAndSubmit(page)

    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Collapsible content should be closed - target the content section specifically
    const collapsibleContent = page.locator('[data-slot="collapsible-content"]')
    await expect(collapsibleContent).toHaveAttribute('data-state', 'closed')
  })

  test('can modify pre-filled values and recalculate', async ({ page }) => {
    await fillFormAndSubmit(page, { incomeA: '5000', incomeB: '3000', expenses: '2000' })

    // Go back to adjust
    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Modify income A from 5000 to 6000
    const incomeAInput = page.locator('#incomeA')
    await incomeAInput.click()
    await incomeAInput.clear()
    await incomeAInput.pressSequentially('6000')
    await incomeAInput.blur()

    // Submit again
    const button = page.getByRole('button', { name: 'Calcular divisão' })
    await expect(button).toBeEnabled()
    await button.click()

    await page.waitForURL('/results')

    // Should show updated total income (6000 + 3000 = 9000)
    await expect(page.getByText('R$ 9.000,00')).toBeVisible()
  })

  test('"Fazer novo cálculo" still clears store and shows empty form', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Maria', nameB: 'Joao' })

    await page.getByRole('button', { name: 'Fazer novo cálculo' }).click()
    await expect(page).toHaveURL('/')

    // Form should be empty
    await expect(page.locator('#nameA')).toHaveValue('')
    await expect(page.locator('#nameB')).toHaveValue('')
  })

  test('form remains functional after pre-fill - validation works', async ({ page }) => {
    await fillFormAndSubmit(page, { nameA: 'Maria', nameB: 'Joao', incomeA: '5000', incomeB: '3000', expenses: '2000' })

    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Clear a required field
    const nameAInput = page.locator('#nameA')
    await nameAInput.clear()
    await nameAInput.blur()

    // Submit button should be disabled
    const submitButton = page.getByRole('button', { name: 'Calcular divisão' })
    await expect(submitButton).toBeDisabled()

    // Error should appear
    await expect(page.getByText('Campo obrigatório')).toBeVisible()
  })

  test('complete adjust flow: calculate, adjust, modify, recalculate', async ({ page }) => {
    // Step 1: Initial calculation
    await fillFormAndSubmit(page, { nameA: 'Ana', nameB: 'Bob', incomeA: '5000', incomeB: '3000', expenses: '2000' })

    // Verify initial result
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ana')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bob')

    // Step 2: Click adjust
    await page.getByRole('button', { name: 'Ajustar valores' }).click()
    await expect(page).toHaveURL('/')

    // Step 3: Verify pre-fill and modify
    await expect(page.locator('#nameA')).toHaveValue('Ana')
    const nameAInput = page.locator('#nameA')
    await nameAInput.clear()
    await nameAInput.fill('Carlos')

    // Step 4: Recalculate
    const button = page.getByRole('button', { name: 'Calcular divisão' })
    await expect(button).toBeEnabled()
    await button.click()

    await page.waitForURL('/results')

    // Step 5: Verify updated result
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Carlos')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bob')
  })
})
