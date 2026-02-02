import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const SHARED_URL = '/results?a=Maria&ra=450000&b=Joao&rb=300000&e=200000'
export const SHARED_URL_WITH_HOUSEWORK = '/results?a=Maria&ra=450000&b=Joao&rb=300000&e=200000&ha=10&hb=5'

export async function fillFormAndSubmit(
  page: Page,
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
  await page.getByText('Modelo recomendado').first().waitFor()
}

export function getSharingButtons(page: Page) {
  const copyButton = page.getByRole('button', { name: 'Copiar link do resultado' })
  const shareButton = page.getByRole('button', { name: 'Compartilhar resultado' })
  const downloadButton = page.getByRole('button', { name: 'Baixar imagem' })
  return { copyButton, shareButton, downloadButton }
}

export async function clickClipboardButton(page: Page) {
  const { copyButton, shareButton } = getSharingButtons(page)

  if (await copyButton.isVisible()) {
    await copyButton.click()
    return copyButton
  }

  await shareButton.click()
  return shareButton
}
