import { expect, test } from '@playwright/test'

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('currency input formats value as user types', async ({ page }) => {
    const incomeInput = page.locator('#income_a')

    await incomeInput.click()
    await incomeInput.pressSequentially('4500')

    const value = await incomeInput.inputValue()
    expect(value).toContain('4.500')
  })

  test('all form fields are interactive and accept input', async ({ page }) => {
    await page.locator('#name_a').fill('Alice')
    await page.locator('#name_b').fill('Bob')

    await page.locator('#income_a').click()
    await page.locator('#income_a').pressSequentially('5000')

    await page.locator('#income_b').click()
    await page.locator('#income_b').pressSequentially('3000')

    await page.locator('#total_expenses').click()
    await page.locator('#total_expenses').pressSequentially('2500')

    await expect(page.locator('#name_a')).toHaveValue('Alice')
    await expect(page.locator('#name_b')).toHaveValue('Bob')
    expect(await page.locator('#income_a').inputValue()).toContain('5.000')
    expect(await page.locator('#income_b').inputValue()).toContain('3.000')
    expect(await page.locator('#total_expenses').inputValue()).toContain('2.500')
  })

  test('submit button is visible but non-functional', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Calcular divisão' })

    await expect(button).toBeVisible()
    await expect(button).toHaveAttribute('type', 'button')
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
