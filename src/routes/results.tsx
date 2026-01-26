import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { ResultSummary } from '~/components/app/result-summary'
import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import {
  type CalculationInput,
  type CalculationResult,
  calculateAdjusted,
  calculateHybrid,
  calculateProportional,
} from '~/lib/calculations'
import type { ExpenseFormData } from '~/schemas/expense-form'
import { useExpenseStore } from '~/stores/expense-store'

export const Route = createFileRoute('/results')({
  component: ResultsPage,
})

interface CalculationResults {
  proportional: CalculationResult
  adjusted: CalculationResult | null
  hybrid: CalculationResult
  recommended: CalculationResult
  recommendedMethod: 'proportional' | 'adjusted' | 'hybrid'
  hasHousework: boolean
}

function calculateResults(formData: ExpenseFormData, minimumWage: number): CalculationResults {
  const input: CalculationInput = {
    incomeA: formData.incomeA,
    incomeB: formData.incomeB,
    expenses: formData.expenses,
    houseworkA: formData.houseworkA,
    houseworkB: formData.houseworkB,
    minimumWage,
  }

  const proportional = calculateProportional(input)
  const hasHousework = formData.houseworkA > 0 || formData.houseworkB > 0
  const adjusted = hasHousework ? calculateAdjusted(input) : null
  const hybrid = calculateHybrid(input)

  const recommendedMethod = hasHousework ? 'adjusted' : 'proportional'
  const recommended = adjusted ?? proportional

  return {
    proportional,
    adjusted,
    hybrid,
    recommended,
    recommendedMethod,
    hasHousework,
  }
}

function ResultsPage() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const { formData, minimumWage } = useExpenseStore(
    useShallow((s) => ({
      formData: s.formData,
      minimumWage: s.minimumWage,
    })),
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !formData) {
      navigate({ to: '/' })
    }
  }, [mounted, formData, navigate])

  if (!mounted || !formData || !minimumWage) {
    return null
  }

  const calculations = calculateResults(formData, minimumWage)

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-275 flex-1 grid-cols-[1fr_1.2fr] items-start gap-20 px-6 py-20 max-md:max-w-140 max-md:grid-cols-1 max-md:gap-12 max-md:py-12">
        <ResultSummary
          nameA={formData.nameA}
          nameB={formData.nameB}
          totalIncome={formData.incomeA + formData.incomeB}
          totalExpenses={formData.expenses}
          houseworkA={formData.houseworkA}
          houseworkB={formData.houseworkB}
        />

        <div className="flex flex-col gap-8">
          <div className="rounded-sm border border-border bg-card p-6">
            <p className="text-muted-foreground">
              ResultCard placeholder - Método recomendado: {calculations.recommendedMethod}
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <p className="text-muted-foreground">
              ResultComparison placeholder - Mostrando {calculations.hasHousework ? '3' : '2'} métodos
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <p className="text-muted-foreground">
              ResultExplanation placeholder - Como funciona{' '}
              {calculations.hasHousework ? '(com trabalho doméstico)' : ''}
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <p className="text-muted-foreground">ResultActions placeholder - Fazer novo cálculo</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
