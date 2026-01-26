import { describe, expect, it } from 'vitest'

import {
  buildPersonResult,
  type CalculationInput,
  calculateAdjusted,
  calculateHourlyRate,
  calculateHouseworkValue,
  calculateHybrid,
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
})

describe('calculateAdjusted', () => {
  const baseInput: CalculationInput = {
    incomeA: 500000, // R$5000
    incomeB: 300000, // R$3000
    expenses: 200000, // R$2000
    houseworkA: 5, // 5 hours/week
    houseworkB: 15, // 15 hours/week
    minimumWage: 162100, // R$1621
  }

  it('reduces contribution for person doing more housework', () => {
    // hourlyRate: 162100 / 220 = 736.818...
    // houseworkValueA: 5 * 4 * 736.82 = 14736 (rounded)
    // houseworkValueB: 15 * 4 * 736.82 = 44209 (rounded)
    // adjustedA: 500000 + 14736 = 514736
    // adjustedB: 300000 + 44209 = 344209
    // total: 858945
    // A pays more because higher adjusted income
    const result = calculateAdjusted(baseInput)

    expect(result.method).toBe('adjusted')
    expect(result.personA.contribution).toBeGreaterThan(result.personB.contribution)
    expect(result.personA.contribution + result.personB.contribution).toBe(200000)
  })

  it('equals proportional when housework is zero for both', () => {
    const input = { ...baseInput, houseworkA: 0, houseworkB: 0 }
    const adjustedResult = calculateAdjusted(input)
    const proportionalResult = calculateProportional(input)

    expect(adjustedResult.personA.contribution).toBe(proportionalResult.personA.contribution)
    expect(adjustedResult.personB.contribution).toBe(proportionalResult.personB.contribution)
  })

  it('handles zero income with housework', () => {
    const input = { ...baseInput, incomeA: 0, incomeB: 0 }
    const result = calculateAdjusted(input)

    // Person B does more housework (higher adjusted income), so B pays more
    expect(result.personB.contribution).toBeGreaterThan(result.personA.contribution)
    expect(result.personA.contribution + result.personB.contribution).toBe(200000)
  })

  it('returns 50/50 when both income and housework are zero', () => {
    const input = { ...baseInput, incomeA: 0, incomeB: 0, houseworkA: 0, houseworkB: 0 }
    const result = calculateAdjusted(input)

    expect(result.personA.contribution).toBe(100000)
    expect(result.personB.contribution).toBe(100000)
  })

  it('uses original income for remaining calculation', () => {
    const result = calculateAdjusted(baseInput)

    // remaining is based on actual income, not adjusted
    expect(result.personA.remaining).toBe(baseInput.incomeA - result.personA.contribution)
    expect(result.personB.remaining).toBe(baseInput.incomeB - result.personB.contribution)
  })
})

describe('calculateHybrid', () => {
  const baseInput: CalculationInput = {
    incomeA: 700000, // R$7000
    incomeB: 300000, // R$3000
    expenses: 400000, // R$4000
    houseworkA: 0,
    houseworkB: 0,
    minimumWage: 162100,
  }

  it('applies 30% floor to lower earner', () => {
    // Proportional: A=70%, B=30%
    // Floor: 30% = R$1200 (120000 cents)
    // B hits exactly floor
    const result = calculateHybrid(baseInput)

    expect(result.method).toBe('hybrid')
    expect(result.personB.contribution).toBe(120000) // 30% floor
    expect(result.personA.contribution).toBe(280000)
  })

  it('does not apply floor when proportional exceeds 30%', () => {
    // Both contribute more than 30%
    const input = { ...baseInput, incomeA: 500000, incomeB: 500000 }
    const result = calculateHybrid(input)

    expect(result.personA.contribution).toBe(200000) // 50%
    expect(result.personB.contribution).toBe(200000) // 50%
  })

  it('applies floor when person A is below 30%', () => {
    // When A=20%, B=80%, A would hit floor at 30%
    // A proportional: 20% = 80000, floor: 120000
    // B proportional: 80% = 320000, stays above floor
    const input = { ...baseInput, incomeA: 200000, incomeB: 800000 }
    const result = calculateHybrid(input)

    // A gets boosted to floor (30% = 120000)
    // B adjusts to 280000 to keep total at 400000
    expect(result.personA.contribution).toBe(120000)
    expect(result.personB.contribution).toBe(280000)
  })

  it('applies floor when person B is below 30%', () => {
    // When A=80%, B=20%, B would hit floor at 30%
    // A proportional: 80% = 320000, stays above floor
    // B proportional: 20% = 80000, floor: 120000
    const input = { ...baseInput, incomeA: 800000, incomeB: 200000 }
    const result = calculateHybrid(input)

    // B gets boosted to floor (30% = 120000)
    // A adjusts to 280000 to keep total at 400000
    expect(result.personB.contribution).toBe(120000)
    expect(result.personA.contribution).toBe(280000)
  })

  it('handles equal incomes (no floor needed)', () => {
    const input = { ...baseInput, incomeA: 500000, incomeB: 500000 }
    const result = calculateHybrid(input)

    expect(result.personA.contribution).toBe(200000)
    expect(result.personB.contribution).toBe(200000)
    expect(result.personA.expensePercentage).toBe(50)
  })

  it('returns 50/50 when both incomes are zero', () => {
    const input = { ...baseInput, incomeA: 0, incomeB: 0 }
    const result = calculateHybrid(input)

    expect(result.personA.contribution).toBe(200000)
    expect(result.personB.contribution).toBe(200000)
  })

  it('ensures contributions sum to total expenses', () => {
    const result = calculateHybrid(baseInput)

    expect(result.personA.contribution + result.personB.contribution).toBe(400000)
  })
})
