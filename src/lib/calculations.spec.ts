import { describe, expect, it } from 'vitest'

import { buildPersonResult, calculateHourlyRate, calculateHouseworkValue, roundToTwoDecimals } from './calculations'

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
