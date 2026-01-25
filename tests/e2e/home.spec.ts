import { expect, test } from '@playwright/test'

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('currency input formats value as user types', async ({ page }) => {
    const incomeInput = page.locator('#incomeA')

    await incomeInput.click()
    await incomeInput.pressSequentially('4500')

    const value = await incomeInput.inputValue()
    expect(value).toContain('4.500')
  })

  test('all form fields are interactive and accept input', async ({ page }) => {
    await page.locator('#nameA').fill('Ana')
    await page.locator('#nameB').fill('Bob')

    await page.locator('#incomeA').click()
    await page.locator('#incomeA').pressSequentially('5000')

    await page.locator('#incomeB').click()
    await page.locator('#incomeB').pressSequentially('3000')

    await page.locator('#expenses').click()
    await page.locator('#expenses').pressSequentially('2500')

    await expect(page.locator('#nameA')).toHaveValue('Ana')
    await expect(page.locator('#nameB')).toHaveValue('Bob')
    expect(await page.locator('#incomeA').inputValue()).toContain('5.000')
    expect(await page.locator('#incomeB').inputValue()).toContain('3.000')
    expect(await page.locator('#expenses').inputValue()).toContain('2.500')
  })

  test('submit button is disabled when form is invalid', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Calcular divisão' })

    await expect(button).toBeVisible()
    await expect(button).toHaveAttribute('type', 'submit')

    await page.locator('#nameA').focus()
    await page.locator('#nameA').blur()

    await expect(button).toBeDisabled()
  })

  test('shows validation error for empty name field after blur', async ({ page }) => {
    const nameInput = page.locator('#nameA')

    await nameInput.focus()
    await nameInput.blur()

    await expect(page.getByText('Campo obrigatório')).toBeVisible()
  })

  test('shows validation error for zero currency value after blur', async ({ page }) => {
    const incomeInput = page.locator('#incomeA')

    await incomeInput.focus()
    await incomeInput.blur()

    await expect(page.getByText('Valor deve ser maior que zero')).toBeVisible()
  })

  test('form submission navigates to /resultado with correct URL params', async ({ page }) => {
    await page.locator('#nameA').fill('Ana')
    await page.locator('#nameA').blur()

    await page.locator('#incomeA').click()
    await page.locator('#incomeA').pressSequentially('5000')
    await page.locator('#incomeA').blur()

    await page.locator('#nameB').fill('Bob')
    await page.locator('#nameB').blur()

    await page.locator('#incomeB').click()
    await page.locator('#incomeB').pressSequentially('3000')
    await page.locator('#incomeB').blur()

    await page.locator('#expenses').click()
    await page.locator('#expenses').pressSequentially('2000')
    await page.locator('#expenses').blur()

    const button = page.getByRole('button', { name: 'Calcular divisão' })
    await expect(button).toBeEnabled()

    await button.click()

    await page.waitForURL(/\/resultado/)

    const url = page.url()
    expect(url).toContain('a=Ana')
    expect(url).toContain('b=Bob')
    expect(url).toContain('ra=500000')
    expect(url).toContain('rb=300000')
    expect(url).toContain('d=200000')
  })
})

test.describe('Responsive Layout', () => {
  test('2-column layout on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const main = page.locator('main')
    const computedStyle = await main.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return {
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
      }
    })

    expect(computedStyle.display).toBe('grid')
    expect(computedStyle.gridTemplateColumns).toMatch(/\d+px \d+px/)
  })

  test('1-column layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

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

  test('hero is sticky on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const hero = page.locator('section').filter({ hasText: 'Descubra a divisão' })
    const position = await hero.evaluate((el) => window.getComputedStyle(el).position)

    expect(position).toBe('sticky')
  })

  test('hero is not sticky on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const hero = page.locator('section').filter({ hasText: 'Descubra a divisão' })
    const position = await hero.evaluate((el) => window.getComputedStyle(el).position)

    expect(position).not.toBe('sticky')
  })
})
