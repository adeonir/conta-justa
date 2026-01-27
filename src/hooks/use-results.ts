import { useMemo } from 'react'

import type { MethodType } from '~/components/app/results/types'
import {
  type CalculationInput,
  type CalculationResult,
  calculateAdjusted,
  calculateEqual,
  calculateHybrid,
  calculateProportional,
} from '~/lib/calculations'
import { useData, useMinimumWage, useSelectedMethod, useSetSelectedMethod } from '~/stores/expense-store'

const methodTitles: Record<MethodType, string> = {
  proportional: 'Proporcional simples',
  adjusted: 'Proporcional + trabalho doméstico',
  hybrid: 'Contribuição mínima',
  equal: 'Divisão igual',
}

interface Names {
  nameA: string
  nameB: string
}

interface Results {
  names: Names
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

    const proportional = calculateProportional(input)
    const hasHousework = data.houseworkA > 0 || data.houseworkB > 0
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
      names: {
        nameA: data.nameA || 'Pessoa A',
        nameB: data.nameB || 'Pessoa B',
      },
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
  }, [data, minimumWage, selectedMethod, setSelectedMethod])
}
