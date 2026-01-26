import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Actions, Card, Comparison, Explanation, type MethodType, Summary } from '~/components/app/results'
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

const methodTitles: Record<MethodType, string> = {
  proportional: 'Proporcional simples',
  adjusted: 'Proporcional + trabalho doméstico',
  hybrid: 'Com contribuição mínima (30%)',
}

function ResultsPage() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<MethodType | null>(null)
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

  const activeMethod = selectedMethod ?? calculations.recommendedMethod
  const activeResult =
    activeMethod === 'adjusted'
      ? (calculations.adjusted ?? calculations.proportional)
      : activeMethod === 'hybrid'
        ? calculations.hybrid
        : calculations.proportional

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-275 flex-1 grid-cols-[1fr_1.2fr] items-start gap-20 px-6 py-20 max-md:max-w-140 max-md:grid-cols-1 max-md:gap-12 max-md:py-12">
        <Summary />

        <div className="flex flex-col gap-8">
          <Card
            result={activeResult}
            methodTitle={methodTitles[activeMethod]}
            isRecommended={activeMethod === calculations.recommendedMethod}
          />

          <Comparison
            proportional={calculations.proportional}
            adjusted={calculations.adjusted}
            hybrid={calculations.hybrid}
            recommended={calculations.recommendedMethod === 'adjusted' ? 'adjusted' : 'proportional'}
            selected={activeMethod}
            onSelect={setSelectedMethod}
          />

          <Explanation />

          <Actions />
        </div>
      </main>
      <Footer />
    </>
  )
}
