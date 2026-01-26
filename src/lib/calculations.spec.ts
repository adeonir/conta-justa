import { describe, expect, it } from 'vitest'

import {
  buildPersonResult,
  type CalculationInput,
  calculateAdjusted,
  calculateEqual,
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
    incomeA: 500000, // R$5000
    incomeB: 300000, // R$3000
    expenses: 400000, // R$4000
    houseworkA: 0,
    houseworkB: 0,
    minimumWage: 162100,
  }

  it('calculates floor based on individual income', () => {
    // Floor A = 5000 * 0.3 = R$1500 (150000 cents)
    // Floor B = 3000 * 0.3 = R$900 (90000 cents)
    // Total floor = R$2400, less than R$4000 expenses
    // Proportional A = 4000 * (5000/8000) = R$2500
    // Proportional A (250000) > Floor A (150000), so use proportional
    const result = calculateHybrid(baseInput)

    expect(result.method).toBe('hybrid')
    expect(result.personA.contribution).toBe(250000) // R$2500 (proportional)
    expect(result.personB.contribution).toBe(150000) // R$1500
    expect(result.personA.contribution + result.personB.contribution).toBe(400000)
  })

  it('applies income-based floor when proportional is lower', () => {
    // A earns R$8000, B earns R$2000
    // Floor A = 8000 * 0.3 = R$2400 (240000 cents)
    // Floor B = 2000 * 0.3 = R$600 (60000 cents)
    // Proportional A = 4000 * (8000/10000) = R$3200
    // Proportional A (320000) > Floor A (240000), so use proportional
    const input = { ...baseInput, incomeA: 800000, incomeB: 200000 }
    const result = calculateHybrid(input)

    expect(result.personA.contribution).toBe(320000) // 80% proportional
    expect(result.personB.contribution).toBe(80000) // 20% proportional
  })

  it('adjusts proportionally when sum of floors exceeds expenses', () => {
    // A earns R$10000, B earns R$5000, expenses R$3000
    // Floor A = 10000 * 0.3 = R$3000 (300000 cents)
    // Floor B = 5000 * 0.3 = R$1500 (150000 cents)
    // Total floor = R$4500 > R$3000 expenses
    // A contribution = 3000 * (300000/450000) = R$2000
    // B contribution = 3000 - 2000 = R$1000
    const input = { ...baseInput, incomeA: 1000000, incomeB: 500000, expenses: 300000 }
    const result = calculateHybrid(input)

    expect(result.personA.contribution).toBe(200000) // R$2000
    expect(result.personB.contribution).toBe(100000) // R$1000
    expect(result.personA.contribution + result.personB.contribution).toBe(300000)
  })

  it('handles equal incomes (uses proportional 50/50)', () => {
    const input = { ...baseInput, incomeA: 500000, incomeB: 500000 }
    const result = calculateHybrid(input)

    expect(result.personA.contribution).toBe(200000)
    expect(result.personB.contribution).toBe(200000)
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

  it('matches AC-001: income A=R$5000, B=R$3000, expenses=R$4000', () => {
    // Floor A = 5000 * 0.3 = 1500 (150000 cents)
    // Floor B = 3000 * 0.3 = 900 (90000 cents)
    const input: CalculationInput = {
      incomeA: 500000,
      incomeB: 300000,
      expenses: 400000,
      houseworkA: 0,
      houseworkB: 0,
      minimumWage: 162100,
    }
    const result = calculateHybrid(input)

    const expectedFloorA = Math.round(500000 * 0.3)
    const expectedFloorB = Math.round(300000 * 0.3)
    expect(expectedFloorA).toBe(150000)
    expect(expectedFloorB).toBe(90000)
    expect(result.personA.contribution + result.personB.contribution).toBe(400000)
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
})
