import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import type { ReactNode } from 'react'
import satori from 'satori'

import {
  type CalculationInput,
  type CalculationResult,
  calculateAdjusted,
  calculateProportional,
} from '~/lib/calculations'
import { env } from '~/schemas/env'

const BCB_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1619/dados/ultimos/1?formato=json'

async function getMinimumWageValue(): Promise<number> {
  try {
    const response = await fetch(BCB_API_URL)
    const data = await response.json()
    return Number.parseFloat(data[0].valor)
  } catch {
    return env.MINIMUM_WAGE
  }
}

// Light theme colors extracted from src/styles.css
const colors = {
  background: '#f8f6fa',
  card: '#ffffff',
  foreground: '#1a1a1a',
  muted: '#666666',
  brand: '#e53935',
  border: '#e8e8e8',
  error: '#dc2626',
}

let wasmInitialized = false

async function waitWasmInit() {
  if (wasmInitialized) return
  const esmRequire = createRequire(import.meta.url)
  const wasmPath = join(esmRequire.resolve('@resvg/resvg-wasm'), '..', 'index_bg.wasm')
  await initWasm(await readFile(wasmPath))
  wasmInitialized = true
}

let fontCache: { regular: Buffer; semibold: Buffer; bold: Buffer; black: Buffer } | null = null

async function loadFonts() {
  if (fontCache) return fontCache

  const fontsDir = join(process.cwd(), 'public', 'fonts')
  const [regular, semibold, bold, black] = await Promise.all([
    readFile(join(fontsDir, 'inter-regular.ttf')),
    readFile(join(fontsDir, 'inter-semibold.ttf')),
    readFile(join(fontsDir, 'inter-bold.ttf')),
    readFile(join(fontsDir, 'inter-black.ttf')),
  ])

  fontCache = { regular, semibold, bold, black }
  return fontCache
}

function formatCurrency(valueInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100)
}

interface ParsedParams {
  nameA: string
  nameB: string
  incomeA: number
  incomeB: number
  expenses: number
  houseworkA: number
  houseworkB: number
}

function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function parseShareParams(searchParams: URLSearchParams): ParsedParams | null {
  const nameA = searchParams.get('a')
  const nameB = searchParams.get('b')
  const incomeA = searchParams.get('ra')
  const incomeB = searchParams.get('rb')
  const expenses = searchParams.get('e')

  if (!nameA || !nameB || !incomeA || !incomeB || !expenses) return null

  const parsedIncomeA = Number.parseInt(incomeA, 10)
  const parsedIncomeB = Number.parseInt(incomeB, 10)
  const parsedExpenses = Number.parseInt(expenses, 10)

  if (Number.isNaN(parsedIncomeA) || Number.isNaN(parsedIncomeB) || Number.isNaN(parsedExpenses)) {
    return null
  }

  const houseworkA = Number.parseInt(searchParams.get('ha') ?? '0', 10) || 0
  const houseworkB = Number.parseInt(searchParams.get('hb') ?? '0', 10) || 0

  return {
    nameA: sanitizeString(nameA.slice(0, 50)),
    nameB: sanitizeString(nameB.slice(0, 50)),
    incomeA: parsedIncomeA,
    incomeB: parsedIncomeB,
    expenses: parsedExpenses,
    houseworkA,
    houseworkB,
  }
}

interface PersonColumnProps {
  name: string
  contribution: string
  expensePercentage: string
  incomePercentage: string
  remaining: string
  remainingNegative: boolean
}

function PersonColumn({
  name,
  contribution,
  expensePercentage,
  incomePercentage,
  remaining,
  remainingNegative,
}: PersonColumnProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
      <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: colors.foreground }}>{name}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 900, color: colors.foreground, letterSpacing: -0.5 }}>
          {contribution}
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: colors.muted }}>Valor mensal</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            gap: 6,
            paddingBottom: 10,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 22 }}>{expensePercentage}%</span>
          <span style={{ fontSize: 22, color: colors.muted }}>da despesa total</span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            paddingTop: 10,
            paddingBottom: 10,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 22 }}>{incomePercentage}%</span>
          <span style={{ fontSize: 22, color: colors.muted }}>da renda comprometida</span>
        </div>
        <div style={{ display: 'flex', gap: 6, paddingTop: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 22, color: remainingNegative ? colors.error : colors.foreground }}>
            {remaining}
          </span>
          <span style={{ fontSize: 22, color: colors.muted }}>
            {remainingNegative ? 'de déficit mensal' : 'de sobra mensal'}
          </span>
        </div>
      </div>
    </div>
  )
}

function OgImageLayout({ params, result }: { params: ParsedParams; result: CalculationResult }) {
  const { personA, personB } = result

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1200,
        height: 630,
        backgroundColor: colors.background,
        fontFamily: 'Inter',
      }}
    >
      {/* Brand accent bar */}
      <div style={{ display: 'flex', width: '100%', height: 6, backgroundColor: colors.brand }} />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '40px 60px',
          gap: 32,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: colors.foreground, letterSpacing: -0.5 }}>
              Conta Justa
            </span>
            <div
              style={{
                display: 'flex',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: colors.brand,
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: 4,
              fontSize: 40,
              fontWeight: 900,
              color: colors.foreground,
              letterSpacing: -0.5,
            }}
          >
            <span>Divisão das despesas de </span>
            <span style={{ color: colors.brand, textDecoration: 'underline' }}>{params.nameA}</span>
            <span> e </span>
            <span style={{ color: colors.brand, textDecoration: 'underline' }}>{params.nameB}</span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: '32px 40px',
            flex: 1,
            gap: 24,
          }}
        >
          {/* Two-column person display */}
          <div style={{ display: 'flex', flex: 1, gap: 40 }}>
            <PersonColumn
              name={params.nameA}
              contribution={formatCurrency(personA.contribution)}
              expensePercentage={personA.expensePercentage.toFixed(2)}
              incomePercentage={personA.incomePercentage.toFixed(2)}
              remaining={formatCurrency(personA.remaining)}
              remainingNegative={personA.remaining < 0}
            />

            {/* Divider */}
            <div style={{ display: 'flex', width: 1, backgroundColor: colors.border }} />

            <PersonColumn
              name={params.nameB}
              contribution={formatCurrency(personB.contribution)}
              expensePercentage={personB.expensePercentage.toFixed(2)}
              incomePercentage={personB.incomePercentage.toFixed(2)}
              remaining={formatCurrency(personB.remaining)}
              remainingNegative={personB.remaining < 0}
            />
          </div>

          {/* Footer with total expenses */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderTop: `1px solid ${colors.border}`,
              paddingTop: 16,
              gap: 6,
            }}
          >
            <span style={{ fontSize: 24, color: colors.muted }}>Total de despesas compartilhadas:</span>
            <span style={{ fontSize: 24, fontWeight: 600, color: colors.foreground }}>
              {formatCurrency(params.expenses)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FallbackLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1200,
        height: 630,
        backgroundColor: colors.background,
        fontFamily: 'Inter',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 6,
          backgroundColor: colors.brand,
          position: 'absolute',
          top: 0,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 52, fontWeight: 900, color: colors.foreground, letterSpacing: -0.5 }}>
          Conta Justa
        </span>
        <div
          style={{
            display: 'flex',
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: colors.brand,
            marginTop: 5,
          }}
        />
      </div>
      <div style={{ display: 'flex', fontSize: 24, color: colors.muted }}>Divisão de despesas para casais</div>
    </div>
  )
}

export async function generateOgImage(searchParams: URLSearchParams): Promise<Uint8Array> {
  await waitWasmInit()
  const fonts = await loadFonts()

  const satoriFonts = [
    { name: 'Inter', data: fonts.regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: fonts.semibold, weight: 600 as const, style: 'normal' as const },
    { name: 'Inter', data: fonts.bold, weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: fonts.black, weight: 900 as const, style: 'normal' as const },
  ]

  const parsed = parseShareParams(searchParams)

  let jsx: ReactNode

  if (parsed) {
    const minimumWage = await getMinimumWageValue()
    // minimumWage from server is in reais, convert to centavos
    const minimumWageCents = Math.round(minimumWage * 100)

    const input: CalculationInput = {
      incomeA: parsed.incomeA,
      incomeB: parsed.incomeB,
      expenses: parsed.expenses,
      houseworkA: parsed.houseworkA,
      houseworkB: parsed.houseworkB,
      minimumWage: minimumWageCents,
    }

    const hasHousework = parsed.houseworkA > 0 || parsed.houseworkB > 0
    const result = hasHousework ? calculateAdjusted(input) : calculateProportional(input)

    jsx = <OgImageLayout params={parsed} result={result} />
  } else {
    jsx = <FallbackLayout />
  }

  const svg = await satori(jsx, {
    width: 1200,
    height: 630,
    fonts: satoriFonts,
  })

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const pngBuffer = resvg.render().asPng()

  return pngBuffer
}

// Exported for testing
export { parseShareParams }
