import { useMemo } from 'react'

import type { MethodType } from '~/components/app/results/types'
import {
  type CalculationInput,
  type CalculationResult,
  calculateAdjusted,
  calculateEqual,
  calculateProportional,
} from '~/lib/calculations'
import { useData, useMinimumWage, useSelectedMethod, useSetSelectedMethod } from '~/stores/expense-store'

interface Results {
  proportional: CalculationResult
  equal: CalculationResult
  recommendedMethod: 'proportional'
  hasHousework: boolean
  activeMethod: MethodType
  activeResult: CalculationResult
  isRecommended: boolean
  setSelectedMethod: (method: MethodType | null) => void
}

export function useResults(): Results | null {
  const data = useData()
  const minimumWage = useMinimumWage()
  const selectedMethod = useSelectedMethod()
  const setSelectedMethod = useSetSelectedMethod()

  return useMemo(() => {
    if (!data || !minimumWage) {
      return null
    }

    const input: CalculationInput = {
      incomeA: data.incomeA,
      incomeB: data.incomeB,
      expenses: data.expenses,
      houseworkA: data.houseworkA,
      houseworkB: data.houseworkB,
      minimumWage,
    }

    const hasHousework = data.houseworkA > 0 || data.houseworkB > 0

    // Proporcional auto-uses adjusted calculation when housework data exists
    const proportionalResult = hasHousework ? calculateAdjusted(input) : calculateProportional(input)
    const proportional: CalculationResult = {
      ...proportionalResult,
      method: 'proportional',
    }

    const equal = calculateEqual(input)

    const recommendedMethod = 'proportional' as const
    const activeMethod = selectedMethod ?? recommendedMethod

    const activeResult = activeMethod === 'equal' ? equal : proportional

    return {
      proportional,
      equal,
      recommendedMethod,
      hasHousework,
      activeMethod,
      activeResult,
      isRecommended: activeMethod === recommendedMethod,
      setSelectedMethod,
    }
  }, [data, minimumWage, selectedMethod, setSelectedMethod])
}
