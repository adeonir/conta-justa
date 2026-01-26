import { useShallow } from 'zustand/react/shallow'

import type { MethodType } from '~/components/app/results/types'
import {
  type CalculationInput,
  type CalculationResult,
  calculateAdjusted,
  calculateEqual,
  calculateHybrid,
  calculateProportional,
} from '~/lib/calculations'
import { useExpenseStore } from '~/stores/expense-store'

const methodTitles: Record<MethodType, string> = {
  proportional: 'Proporcional simples',
  adjusted: 'Proporcional + trabalho doméstico',
  hybrid: 'Contribuição mínima',
  equal: 'Divisão igual',
}

interface CalculationResults {
  proportional: CalculationResult
  adjusted: CalculationResult | null
  hybrid: CalculationResult
  equal: CalculationResult
  recommendedMethod: 'proportional' | 'adjusted'
  hasHousework: boolean
  activeMethod: MethodType
  activeResult: CalculationResult
  methodTitle: string
  isRecommended: boolean
  setSelectedMethod: (method: MethodType | null) => void
}

export function useCalculations(): CalculationResults | null {
  const { formData, minimumWage, selectedMethod, setSelectedMethod } = useExpenseStore(
    useShallow((s) => ({
      formData: s.formData,
      minimumWage: s.minimumWage,
      selectedMethod: s.selectedMethod,
      setSelectedMethod: s.setSelectedMethod,
    })),
  )

  if (!formData || !minimumWage) {
    return null
  }

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
  const equal = calculateEqual(input)

  const recommendedMethod = hasHousework ? 'adjusted' : 'proportional'
  const activeMethod = selectedMethod ?? recommendedMethod

  const activeResult =
    activeMethod === 'adjusted'
      ? (adjusted ?? proportional)
      : activeMethod === 'hybrid'
        ? hybrid
        : activeMethod === 'equal'
          ? equal
          : proportional

  return {
    proportional,
    adjusted,
    hybrid,
    equal,
    recommendedMethod,
    hasHousework,
    activeMethod,
    activeResult,
    methodTitle: methodTitles[activeMethod],
    isRecommended: activeMethod === recommendedMethod,
    setSelectedMethod,
  }
}
