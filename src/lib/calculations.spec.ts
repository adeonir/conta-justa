import { describe, expect, it } from 'vitest'

import {
  applyHouseworkAdjustment,
  buildPersonResult,
  type CalculationInput,
  calculateEqual,
  calculateHourlyRate,
  calculateHouseworkValue,
  calculateProportional,
  roundToTwoDecimals,
} from './calculations'

describe('helper functions', () => {
  describe('calculateHourlyRate', () => {
    it('calculates hourly rate from minimum wage', () => {
      // R$1621.00 = 162100 cents / 220 hours = 736.818... cents/hour
      const result = calculateHourlyRate(162100)
      expect(result).toBeCloseTo(736.82, 1)
    })

    it('returns 0 when minimum wage is 0', () => {
      expect(calculateHourlyRate(0)).toBe(0)
    })

    it('handles large values', () => {
      // R$10000.00 = 1000000 cents / 220 = 4545.45... cents/hour
      const result = calculateHourlyRate(1000000)
      expect(result).toBeCloseTo(4545.45, 1)
    })
  })

  describe('calculateHouseworkValue', () => {
    it('calculates monthly housework value', () => {
      // 10 hours/week * 4 weeks * 737 cents/hour = 29480 cents
      const result = calculateHouseworkValue(10, 737)
      expect(result).toBe(29480)
    })

    it('returns 0 when weekly hours is 0', () => {
      expect(calculateHouseworkValue(0, 737)).toBe(0)
    })

    it('returns 0 when hourly rate is 0', () => {
      expect(calculateHouseworkValue(10, 0)).toBe(0)
    })

    it('rounds to nearest integer (cents)', () => {
      // 5 hours/week * 4 weeks * 737.27 cents/hour = 14745.4 -> 14745
      const result = calculateHouseworkValue(5, 737.27)
      expect(result).toBe(14745)
    })

    it('handles fractional hourly rates correctly', () => {
      // 15 hours/week * 4 weeks * 737.27 cents/hour = 44236.2 -> 44236
      const result = calculateHouseworkValue(15, 737.27)
      expect(result).toBe(44236)
    })
  })

  describe('roundToTwoDecimals', () => {
    it('rounds to 2 decimal places', () => {
      expect(roundToTwoDecimals(33.333)).toBe(33.33)
      expect(roundToTwoDecimals(66.666)).toBe(66.67)
    })

    it('handles exact values', () => {
      expect(roundToTwoDecimals(50)).toBe(50)
      expect(roundToTwoDecimals(25.5)).toBe(25.5)
    })

    it('handles 0', () => {
      expect(roundToTwoDecimals(0)).toBe(0)
    })

    it('handles 100', () => {
      expect(roundToTwoDecimals(100)).toBe(100)
    })

    it('rounds .005 up correctly', () => {
      expect(roundToTwoDecimals(33.335)).toBe(33.34)
    })
  })

  describe('buildPersonResult', () => {
    it('calculates all fields correctly', () => {
      // contribution: 125000 cents (R$1250)
      // income: 500000 cents (R$5000)
      // expenses: 200000 cents (R$2000)
      const result = buildPersonResult(125000, 500000, 200000)

      expect(result.contribution).toBe(125000)
      expect(result.expensePercentage).toBe(62.5) // 125000/200000 * 100
      expect(result.incomePercentage).toBe(25) // 125000/500000 * 100
      expect(result.remaining).toBe(375000) // 500000 - 125000
    })

    it('handles zero income', () => {
      const result = buildPersonResult(0, 0, 200000)

      expect(result.contribution).toBe(0)
      expect(result.expensePercentage).toBe(0)
      expect(result.incomePercentage).toBe(0) // Should not divide by zero
      expect(result.remaining).toBe(0)
    })

    it('handles zero expenses', () => {
      const result = buildPersonResult(0, 500000, 0)

      expect(result.contribution).toBe(0)
      expect(result.expensePercentage).toBe(0) // Should not divide by zero
      expect(result.incomePercentage).toBe(0)
      expect(result.remaining).toBe(500000)
    })

    it('rounds percentages to 2 decimal places', () => {
      // 100000/300000 = 33.333...%
      const result = buildPersonResult(100000, 300000, 300000)

      expect(result.expensePercentage).toBe(33.33)
      expect(result.incomePercentage).toBe(33.33)
    })

    it('calculates negative remaining when contribution exceeds income', () => {
      const result = buildPersonResult(150000, 100000, 200000)

      expect(result.remaining).toBe(-50000)
    })

    it('defaults houseworkValue to 0 when not provided', () => {
      const result = buildPersonResult(125000, 500000, 200000)

      expect(result.houseworkValue).toBe(0)
    })

    it('includes houseworkValue when provided', () => {
      const result = buildPersonResult(125000, 500000, 200000, 14736)

      expect(result.houseworkValue).toBe(14736)
    })
  })
})

describe('calculateProportional', () => {
  const baseInput: CalculationInput = {
    incomeA: 500000, // R$5000
    incomeB: 300000, // R$3000
    expenses: 200000, // R$2000
    houseworkA: 0,
    houseworkB: 0,
    minimumWage: 162100,
  }

  it('divides expenses proportionally to income', () => {
    // A: 5000/8000 = 62.5% = R$1250
    // B: 3000/8000 = 37.5% = R$750
    const result = calculateProportional(baseInput)

    expect(result.method).toBe('proportional')
    expect(result.personA.contribution).toBe(125000)
    expect(result.personB.contribution).toBe(75000)
    expect(result.personA.contribution + result.personB.contribution).toBe(200000)
  })

  it('returns 50/50 when incomes are equal', () => {
    const input = { ...baseInput, incomeA: 400000, incomeB: 400000 }
    const result = calculateProportional(input)

    expect(result.personA.contribution).toBe(100000)
    expect(result.personB.contribution).toBe(100000)
    expect(result.personA.expensePercentage).toBe(50)
    expect(result.personB.expensePercentage).toBe(50)
  })

  it('returns 100/0 when one income is zero', () => {
    const input = { ...baseInput, incomeB: 0 }
    const result = calculateProportional(input)

    expect(result.personA.contribution).toBe(200000)
    expect(result.personB.contribution).toBe(0)
    expect(result.personB.expensePercentage).toBe(0)
  })

  it('returns 50/50 when both incomes are zero', () => {
    const input = { ...baseInput, incomeA: 0, incomeB: 0 }
    const result = calculateProportional(input)

    expect(result.personA.contribution).toBe(100000)
    expect(result.personB.contribution).toBe(100000)
  })

  it('calculates remaining income correctly', () => {
    const result = calculateProportional(baseInput)

    expect(result.personA.remaining).toBe(375000) // 500000 - 125000
    expect(result.personB.remaining).toBe(225000) // 300000 - 75000
  })

  it('calculates income percentage correctly', () => {
    const result = calculateProportional(baseInput)

    expect(result.personA.incomePercentage).toBe(25) // 125000/500000 * 100
    expect(result.personB.incomePercentage).toBe(25) // 75000/300000 * 100
  })

  it('returns houseworkValue of 0 for both persons', () => {
    const result = calculateProportional(baseInput)

    expect(result.personA.houseworkValue).toBe(0)
    expect(result.personB.houseworkValue).toBe(0)
  })
})

describe('applyHouseworkAdjustment', () => {
  const baseInput: CalculationInput = {
    incomeA: 500000, // R$5000
    incomeB: 300000, // R$3000
    expenses: 200000, // R$2000
    houseworkA: 5, // 5 hours/week
    houseworkB: 15, // 15 hours/week
    minimumWage: 162100, // R$1621
  }

  it('transforms base proportional result with housework adjustment', () => {
    // First calculate base proportional result
    const baseResult = calculateProportional(baseInput)

    // Then apply housework adjustment (transform pattern)
    const hourlyRate = calculateHourlyRate(baseInput.minimumWage)
    const result = applyHouseworkAdjustment(
      baseResult,
      {
        houseworkHoursA: baseInput.houseworkA,
        houseworkHoursB: baseInput.houseworkB,
        hourlyRate,
      },
      baseInput.expenses,
    )

    // hourlyRate: 162100 / 220 = 736.818...
    // houseworkValueA: 5 * 4 * 736.82 = 14736 (rounded)
    // houseworkValueB: 15 * 4 * 736.82 = 44209 (rounded)
    // adjustedA: 500000 + 14736 = 514736
    // adjustedB: 300000 + 44209 = 344209
    // total: 858945
    // A pays more because higher adjusted income
    expect(result.method).toBe('proportional')
    expect(result.personA.contribution).toBeGreaterThan(result.personB.contribution)
    expect(result.personA.contribution + result.personB.contribution).toBe(200000)
  })

  it('returns same as base when housework is zero for both', () => {
    const input = { ...baseInput, houseworkA: 0, houseworkB: 0 }
    const baseResult = calculateProportional(input)

    const hourlyRate = calculateHourlyRate(input.minimumWage)
    const adjustedResult = applyHouseworkAdjustment(
      baseResult,
      {
        houseworkHoursA: 0,
        houseworkHoursB: 0,
        hourlyRate,
      },
      input.expenses,
    )

    expect(adjustedResult.personA.contribution).toBe(baseResult.personA.contribution)
    expect(adjustedResult.personB.contribution).toBe(baseResult.personB.contribution)
  })

  it('handles zero income with housework', () => {
    const input = { ...baseInput, incomeA: 0, incomeB: 0 }
    const baseResult = calculateProportional(input)

    const hourlyRate = calculateHourlyRate(input.minimumWage)
    const result = applyHouseworkAdjustment(
      baseResult,
      {
        houseworkHoursA: input.houseworkA,
        houseworkHoursB: input.houseworkB,
        hourlyRate,
      },
      input.expenses,
    )

    // Person B does more housework (higher adjusted income), so B pays more
    expect(result.personB.contribution).toBeGreaterThan(result.personA.contribution)
    expect(result.personA.contribution + result.personB.contribution).toBe(200000)
  })

  it('returns 50/50 when both income and housework are zero', () => {
    const input = { ...baseInput, incomeA: 0, incomeB: 0, houseworkA: 0, houseworkB: 0 }
    const baseResult = calculateProportional(input)

    const hourlyRate = calculateHourlyRate(input.minimumWage)
    const result = applyHouseworkAdjustment(
      baseResult,
      {
        houseworkHoursA: 0,
        houseworkHoursB: 0,
        hourlyRate,
      },
      input.expenses,
    )

    expect(result.personA.contribution).toBe(100000)
    expect(result.personB.contribution).toBe(100000)
  })

  it('uses original income for remaining calculation', () => {
    const baseResult = calculateProportional(baseInput)

    const hourlyRate = calculateHourlyRate(baseInput.minimumWage)
    const result = applyHouseworkAdjustment(
      baseResult,
      {
        houseworkHoursA: baseInput.houseworkA,
        houseworkHoursB: baseInput.houseworkB,
        hourlyRate,
      },
      baseInput.expenses,
    )

    // remaining is based on actual income, not adjusted
    expect(result.personA.remaining).toBe(baseInput.incomeA - result.personA.contribution)
    expect(result.personB.remaining).toBe(baseInput.incomeB - result.personB.contribution)
  })

  it('includes houseworkValue in person results', () => {
    const baseResult = calculateProportional(baseInput)

    // hourlyRate: 162100 / 220 = 736.818...
    // houseworkValueA: round(5 * 4 * 736.818...) = 14736
    // houseworkValueB: round(15 * 4 * 736.818...) = 44209
    const hourlyRate = 162100 / 220
    const expectedA = Math.round(5 * 4 * hourlyRate)
    const expectedB = Math.round(15 * 4 * hourlyRate)

    const result = applyHouseworkAdjustment(
      baseResult,
      {
        houseworkHoursA: baseInput.houseworkA,
        houseworkHoursB: baseInput.houseworkB,
        hourlyRate,
      },
      baseInput.expenses,
    )

    expect(result.personA.houseworkValue).toBe(expectedA)
    expect(result.personB.houseworkValue).toBe(expectedB)
  })

  it('returns houseworkValue of 0 when person has no housework hours', () => {
    const input = { ...baseInput, houseworkA: 0 }
    const baseResult = calculateProportional(input)

    const hourlyRate = calculateHourlyRate(input.minimumWage)
    const result = applyHouseworkAdjustment(
      baseResult,
      {
        houseworkHoursA: 0,
        houseworkHoursB: input.houseworkB,
        hourlyRate,
      },
      input.expenses,
    )

    expect(result.personA.houseworkValue).toBe(0)
    expect(result.personB.houseworkValue).toBeGreaterThan(0)
  })
})

describe('calculateEqual', () => {
  const baseInput: CalculationInput = {
    incomeA: 500000, // R$5000
    incomeB: 300000, // R$3000
    expenses: 200000, // R$2000
    houseworkA: 0,
    houseworkB: 0,
    minimumWage: 162100,
  }

  it('splits expenses exactly 50/50', () => {
    const result = calculateEqual(baseInput)

    expect(result.method).toBe('equal')
    expect(result.personA.contribution).toBe(100000)
    expect(result.personB.contribution).toBe(100000)
    expect(result.personA.expensePercentage).toBe(50)
    expect(result.personB.expensePercentage).toBe(50)
  })

  it('ensures contributions sum to total expenses', () => {
    const result = calculateEqual(baseInput)
    expect(result.personA.contribution + result.personB.contribution).toBe(200000)
  })

  it('handles odd expense amounts', () => {
    // 200001 cents / 2 = 100000.5, rounds to 100001 for A
    // B gets remainder: 200001 - 100001 = 100000
    const input = { ...baseInput, expenses: 200001 }
    const result = calculateEqual(input)

    expect(result.personA.contribution + result.personB.contribution).toBe(200001)
  })

  it('calculates remaining balance correctly', () => {
    const result = calculateEqual(baseInput)

    expect(result.personA.remaining).toBe(400000) // 5000 - 1000
    expect(result.personB.remaining).toBe(200000) // 3000 - 1000
  })

  it('shows negative remaining when contribution exceeds income', () => {
    // Person B earns R$500 but must pay R$1000 (half of R$2000)
    const input = { ...baseInput, incomeB: 50000 }
    const result = calculateEqual(input)

    expect(result.personB.contribution).toBe(100000)
    expect(result.personB.remaining).toBe(-50000)
  })

  it('ignores income for calculation', () => {
    // Even with very different incomes, split is 50/50
    const input = { ...baseInput, incomeA: 1000000, incomeB: 100000 }
    const result = calculateEqual(input)

    expect(result.personA.contribution).toBe(100000)
    expect(result.personB.contribution).toBe(100000)
  })

  it('handles zero income', () => {
    const input = { ...baseInput, incomeA: 0, incomeB: 0 }
    const result = calculateEqual(input)

    expect(result.personA.contribution).toBe(100000)
    expect(result.personB.contribution).toBe(100000)
    expect(result.personA.remaining).toBe(-100000)
    expect(result.personB.remaining).toBe(-100000)
  })

  it('returns houseworkValue of 0 for both persons', () => {
    const result = calculateEqual(baseInput)

    expect(result.personA.houseworkValue).toBe(0)
    expect(result.personB.houseworkValue).toBe(0)
  })
})

describe('proportional baseline comparison', () => {
  const baseInput: CalculationInput = {
    incomeA: 500000,
    incomeB: 300000,
    expenses: 200000,
    houseworkA: 5,
    houseworkB: 15,
    minimumWage: 162100,
  }

  it('produces different contributions when housework differs between persons', () => {
    const proportional = calculateProportional(baseInput)

    const hourlyRate = calculateHourlyRate(baseInput.minimumWage)
    const adjusted = applyHouseworkAdjustment(
      proportional,
      {
        houseworkHoursA: baseInput.houseworkA,
        houseworkHoursB: baseInput.houseworkB,
        hourlyRate,
      },
      baseInput.expenses,
    )

    expect(adjusted.personA.contribution).not.toBe(proportional.personA.contribution)
    expect(adjusted.personB.contribution).not.toBe(proportional.personB.contribution)
  })

  it('produces different expense percentages between baseline and adjusted', () => {
    const proportional = calculateProportional(baseInput)

    const hourlyRate = calculateHourlyRate(baseInput.minimumWage)
    const adjusted = applyHouseworkAdjustment(
      proportional,
      {
        houseworkHoursA: baseInput.houseworkA,
        houseworkHoursB: baseInput.houseworkB,
        hourlyRate,
      },
      baseInput.expenses,
    )

    expect(adjusted.personA.expensePercentage).not.toBe(proportional.personA.expensePercentage)
    expect(adjusted.personB.expensePercentage).not.toBe(proportional.personB.expensePercentage)
  })
})
