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
  await page.getByText('Modelo recomendado').first().waitFor()
}

function getSharingButtons(page: import('@playwright/test').Page) {
  const copyButton = page.getByRole('button', { name: 'Copiar link do resultado' })
  const shareButton = page.getByRole('button', { name: 'Compartilhar resultado' })
  const downloadButton = page.getByRole('button', { name: 'Baixar imagem' })
  return { copyButton, shareButton, downloadButton }
}

async function clickClipboardButton(page: import('@playwright/test').Page) {
  const { copyButton, shareButton } = getSharingButtons(page)

  if (await copyButton.isVisible()) {
    await copyButton.click()
    return copyButton
  }

  await shareButton.click()
  return shareButton
}

test.describe('Sharing - Copy Link', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('clipboard button writes share URL with expected query params', async ({ page }) => {
    await fillFormAndSubmit(page, {
      nameA: 'Ana',
      nameB: 'Bob',
      incomeA: '5000',
      incomeB: '3000',
      expenses: '2000',
    })

    await clickClipboardButton(page)

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

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

  test('clipboard URL includes housework params when housework data exists', async ({ page }) => {
    await fillFormAndSubmit(page, {
      nameA: 'Ana',
      nameB: 'Bob',
      incomeA: '5000',
      incomeB: '3000',
      expenses: '2000',
      houseworkA: '15',
      houseworkB: '5',
    })

    await clickClipboardButton(page)

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    const url = new URL(clipboardText)

    expect(url.searchParams.get('ha')).toBe('15')
    expect(url.searchParams.get('hb')).toBe('5')
  })

  test('clipboard URL omits housework params when no housework data', async ({ page }) => {
    await fillFormAndSubmit(page)

    await clickClipboardButton(page)

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    const url = new URL(clipboardText)

    expect(url.searchParams.has('ha')).toBe(false)
    expect(url.searchParams.has('hb')).toBe(false)
  })
})

test.describe('Sharing - Share Button Fallback', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
    viewport: { width: 375, height: 812 },
  })

  test('share button falls back to clipboard copy when navigator.share is unavailable', async ({ page }) => {
    await fillFormAndSubmit(page)

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

    const { shareButton } = getSharingButtons(page)

    await shareButton.click()
    const shareClipboard = await page.evaluate(() => navigator.clipboard.readText())

    await page.evaluate(() => navigator.clipboard.writeText(''))
    await page.waitForTimeout(2100)

    // Switch to desktop viewport to access copy button
    await page.setViewportSize({ width: 1280, height: 720 })

    const { copyButton } = getSharingButtons(page)
    await copyButton.click()
    const copyClipboard = await page.evaluate(() => navigator.clipboard.readText())

    expect(copyClipboard).toBe(shareClipboard)
  })
})

test.describe('Sharing - Visual Feedback', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('clipboard button shows spinner icon while copied state is active', async ({ page }) => {
    await fillFormAndSubmit(page)

    const clickedButton = await clickClipboardButton(page)

    const spinnerAfter = clickedButton.locator('svg.animate-spin')
    await expect(spinnerAfter).toBeVisible()
  })

  test('clipboard button spinner reverts to original icon after 2 seconds', async ({ page }) => {
    await fillFormAndSubmit(page)

    const clickedButton = await clickClipboardButton(page)

    const spinner = clickedButton.locator('svg.animate-spin')
    await expect(spinner).toBeVisible()

    await page.waitForTimeout(2200)

    await expect(spinner).toHaveCount(0)
    const svgIcon = clickedButton.locator('svg')
    await expect(svgIcon).toBeVisible()
    await expect(svgIcon).not.toHaveClass(/animate-spin/)
  })

  test('shows correct sharing buttons based on viewport', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { copyButton, shareButton, downloadButton } = getSharingButtons(page)
    const viewportWidth = page.viewportSize()?.width ?? 0

    if (viewportWidth >= 640) {
      await expect(copyButton).toBeVisible()
      await expect(shareButton).toBeHidden()
    } else {
      await expect(shareButton).toBeVisible()
      await expect(copyButton).toBeHidden()
    }

    await expect(downloadButton).toBeVisible()
  })
})

test.describe('Sharing - Image Download', () => {
  test('download button triggers a PNG file download', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { downloadButton } = getSharingButtons(page)

    const downloadPromise = page.waitForEvent('download')
    await downloadButton.click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('conta-justa.png')
  })

  test('download button shows spinner while generating image', async ({ page }) => {
    await fillFormAndSubmit(page)

    const { downloadButton } = getSharingButtons(page)

    await downloadButton.click()

    const spinner = downloadButton.locator('svg.animate-spin')
    await expect(spinner).toBeVisible()

    await page.waitForEvent('download')

    await expect(spinner).toHaveCount(0)
  })
})

test.describe('Sharing - OG Image Endpoint', () => {
  test('GET /api/og returns a PNG image with valid params', async ({ request }) => {
    const response = await request.get('/api/og?a=Maria&ra=450000&b=Joao&rb=300000&e=200000')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')

    const body = await response.body()
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    expect(body[0]).toBe(0x89)
    expect(body[1]).toBe(0x50)
    expect(body[2]).toBe(0x4e)
    expect(body[3]).toBe(0x47)
  })

  test('GET /api/og returns a fallback image when params are missing', async ({ request }) => {
    const response = await request.get('/api/og')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
  })

  test('GET /api/og sets immutable cache headers', async ({ request }) => {
    const response = await request.get('/api/og?a=Maria&ra=450000&b=Joao&rb=300000&e=200000')

    expect(response.headers()['cache-control']).toContain('public')
    expect(response.headers()['cache-control']).toContain('immutable')
  })
})
