import { useMemo } from 'react'

import type { MethodType } from '~/components/app/results/types'
import {
  applyHouseworkAdjustment,
  type CalculationInput,
  type CalculationResult,
  calculateEqual,
  calculateHourlyRate,
  calculateProportional,
} from '~/lib/calculations'
import {
  useData,
  useIncludeHousework,
  useMinimumWage,
  useSelectedMethod,
  useSetSelectedMethod,
} from '~/stores/expense-store'

interface Results {
  proportional: CalculationResult
  proportionalBaseline: CalculationResult | null
  equal: CalculationResult
  recommendedMethod: 'proportional'
  hasHousework: boolean
  activeMethod: MethodType
  activeResult: CalculationResult
  isRecommended: boolean
  showHousework: boolean
  setSelectedMethod: (method: MethodType | null) => void
}

export function useResults(): Results | null {
  const data = useData()
  const minimumWage = useMinimumWage()
  const selectedMethod = useSelectedMethod()
  const setSelectedMethod = useSetSelectedMethod()
  const includeHousework = useIncludeHousework()

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

    const proportionalBase = calculateProportional(input)
    const proportionalBaseline = hasHousework ? proportionalBase : null

    let proportional: CalculationResult
    if (hasHousework) {
      const hourlyRate = calculateHourlyRate(minimumWage)
      proportional = applyHouseworkAdjustment(
        proportionalBase,
        {
          houseworkHoursA: data.houseworkA,
          houseworkHoursB: data.houseworkB,
          hourlyRate,
        },
        data.expenses,
      )
    } else {
      proportional = proportionalBase
    }

    const equal = calculateEqual(input)

    const recommendedMethod = 'proportional' as const
    const activeMethod = selectedMethod ?? recommendedMethod
    const isRecommended = activeMethod === recommendedMethod
    const showHousework = hasHousework && isRecommended

    const activeResult =
      activeMethod === 'equal'
        ? equal
        : showHousework && !includeHousework
          ? (proportionalBaseline ?? proportional)
          : proportional

    return {
      proportional,
      proportionalBaseline,
      equal,
      recommendedMethod,
      hasHousework,
      activeMethod,
      activeResult,
      isRecommended,
      showHousework,
      setSelectedMethod,
    }
  }, [data, minimumWage, selectedMethod, setSelectedMethod, includeHousework])
}
