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

function getSharingButtons(page: import('@playwright/test').Page) {
  // The actions card has two groups: navigation buttons (top) and sharing icon buttons (bottom).
  // The sharing group is identified by having 3 outline buttons with bg-muted class.
  const actionsCard = page.locator('[data-slot="card"]').filter({ hasText: 'Ajustar valores' })
  const sharingGroup = actionsCard.locator('div.flex.gap-4').last()
  const copyButton = sharingGroup.locator('[data-slot="button"]').nth(0)
  const shareButton = sharingGroup.locator('[data-slot="button"]').nth(1)
  const downloadButton = sharingGroup.locator('[data-slot="button"]').nth(2)
  return { actionsCard, sharingGroup, copyButton, shareButton, downloadButton }
}

test.describe('Sharing - Copy Link', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('copy link button writes share URL to clipboard with expected query params', async ({ page }) => {
    await fillFormAndSubmit(page, {
      nameA: 'Ana',
      nameB: 'Bob',
      incomeA: '5000',
      incomeB: '3000',
      expenses: '2000',
    })

    const { copyButton } = getSharingButtons(page)
    await copyButton.click()

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

    // URL should contain /results with query params
    expect(clipboardText).toContain('/results?')

    const url = new URL(clipboardText)
    expect(url.pathname).toBe('/results')
    expect(url.searchParams.get('a')).toBe('Ana')
    expect(url.searchParams.get('b')).toBe('Bob')
    // Values are stored in centavos: R$5000 = 500000 cents
    expect(url.searchParams.get('ra')).toBe('500000')
    expect(url.searchParams.get('rb')).toBe('300000')
    expect(url.searchParams.get('e')).toBe('200000')
  })

  test('copy link includes housework params when housework data exists', async ({ page }) => {
    await fillFormAndSubmit(page, {
      nameA: 'Ana',
      nameB: 'Bob',
      incomeA: '5000',
      incomeB: '3000',
      expenses: '2000',
      houseworkA: '15',
      houseworkB: '5',
    })

    const { copyButton } = getSharingButtons(page)
    await copyButton.click()

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    const url = new URL(clipboardText)

    expect(url.searchParams.get('ha')).toBe('15')
    expect(url.searchParams.get('hb')).toBe('5')
  })

  test('copy link omits housework params when no housework data', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { copyButton } = getSharingButtons(page)
    await copyButton.click()

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    const url = new URL(clipboardText)

    expect(url.searchParams.has('ha')).toBe(false)
    expect(url.searchParams.has('hb')).toBe(false)
  })
})

test.describe('Sharing - Share Button Fallback', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('share button falls back to clipboard copy when navigator.share is unavailable', async ({ page }) => {
    await fillFormAndSubmit(page)

    // Playwright Chromium does not support navigator.share, so it will fall back to clipboard
    const { shareButton } = getSharingButtons(page)
    await shareButton.click()

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

    expect(clipboardText).toContain('/results?')
    const url = new URL(clipboardText)
    expect(url.searchParams.get('a')).toBe('Ana')
    expect(url.searchParams.get('b')).toBe('Bob')
  })

  test('share button produces the same URL as copy link button', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { copyButton, shareButton } = getSharingButtons(page)

    // Copy via copy button
    await copyButton.click()
    const copyClipboard = await page.evaluate(() => navigator.clipboard.readText())

    // Reset clipboard
    await page.evaluate(() => navigator.clipboard.writeText(''))

    // Wait for isCopied state to reset (2s timeout)
    await page.waitForTimeout(2100)

    // Copy via share button
    await shareButton.click()
    const shareClipboard = await page.evaluate(() => navigator.clipboard.readText())

    expect(copyClipboard).toBe(shareClipboard)
  })
})

test.describe('Sharing - Visual Feedback', () => {
  test('copy button shows spinner icon while copied state is active', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { copyButton } = getSharingButtons(page)

    // Before clicking: should show Copy icon (no spinning animation)
    const spinnerBefore = copyButton.locator('svg.animate-spin')
    await expect(spinnerBefore).toHaveCount(0)

    await copyButton.click()

    // After clicking: should show Loader2 icon with animate-spin class
    const spinnerAfter = copyButton.locator('svg.animate-spin')
    await expect(spinnerAfter).toBeVisible()
  })

  test('copy button spinner reverts to copy icon after 2 seconds', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { copyButton } = getSharingButtons(page)

    await copyButton.click()

    // Spinner should be visible immediately after click
    const spinner = copyButton.locator('svg.animate-spin')
    await expect(spinner).toBeVisible()

    // Wait for the 2s timeout to expire plus buffer
    await page.waitForTimeout(2200)

    // Spinner should be gone, copy icon should be back
    await expect(spinner).toHaveCount(0)
    const svgIcon = copyButton.locator('svg')
    await expect(svgIcon).toBeVisible()
    await expect(svgIcon).not.toHaveClass(/animate-spin/)
  })

  test('three sharing icon buttons are visible on results page', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { sharingGroup } = getSharingButtons(page)
    const buttons = sharingGroup.locator('[data-slot="button"]')

    await expect(buttons).toHaveCount(3)
    for (const button of await buttons.all()) {
      await expect(button).toBeVisible()
    }
  })
})
