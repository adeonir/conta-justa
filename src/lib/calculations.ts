import type { MethodType } from '~/components/app/results/types'

export interface CalculationInput {
  incomeA: number // Person A monthly income in cents
  incomeB: number // Person B monthly income in cents
  expenses: number // Total shared expenses in cents
  houseworkA: number // Person A weekly housework hours
  houseworkB: number // Person B weekly housework hours
  minimumWage: number // Current minimum wage in cents
}

export interface PersonResult {
  contribution: number // Amount to pay in cents
  expensePercentage: number // Percentage of total expenses (0-100, 2 decimals)
  incomePercentage: number // Percentage of income committed (0-100, 2 decimals)
  remaining: number // Monthly remaining after contribution in cents
  houseworkValue: number // Monthly housework monetary value in cents
}

export interface CalculationResult {
  personA: PersonResult
  personB: PersonResult
  method: MethodType
}

const MONTHLY_WORK_HOURS = 220 // Standard monthly hours for hourly rate
const WEEKS_PER_MONTH = 4 // For housework value calculation

export function calculateHourlyRate(minimumWage: number) {
  return minimumWage / MONTHLY_WORK_HOURS
}

export function calculateHouseworkValue(weeklyHours: number, hourlyRate: number) {
  return Math.round(weeklyHours * WEEKS_PER_MONTH * hourlyRate)
}

export function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100
}

export function buildPersonResult(
  contribution: number,
  income: number,
  expenses: number,
  houseworkValue = 0,
): PersonResult {
  return {
    contribution,
    expensePercentage: roundToTwoDecimals(expenses > 0 ? (contribution / expenses) * 100 : 0),
    incomePercentage: roundToTwoDecimals(income > 0 ? (contribution / income) * 100 : 0),
    remaining: income - contribution,
    houseworkValue,
  }
}

/**
 * Method 1: Proportional Division
 * Divides expenses based on income ratio
 */
export function calculateProportional(input: CalculationInput): CalculationResult {
  const { incomeA, incomeB, expenses } = input
  const totalIncome = incomeA + incomeB

  // Edge case: zero total income - split 50/50
  if (totalIncome === 0) {
    const halfExpenses = Math.round(expenses / 2)
    return {
      personA: buildPersonResult(halfExpenses, incomeA, expenses),
      personB: buildPersonResult(expenses - halfExpenses, incomeB, expenses),
      method: 'proportional',
    }
  }

  // Calculate person A's contribution, then derive B's to ensure A + B = expenses exactly
  // This prevents 1-cent rounding bias where one person always pays the extra cent
  const contributionA = Math.round(expenses * (incomeA / totalIncome))
  const contributionB = expenses - contributionA

  return {
    personA: buildPersonResult(contributionA, incomeA, expenses),
    personB: buildPersonResult(contributionB, incomeB, expenses),
    method: 'proportional',
  }
}

/**
 * Method 2: Adjusted Division (with housework)
 * Adds housework value to income before calculating ratio
 */
export function calculateAdjusted(input: CalculationInput): CalculationResult {
  const { incomeA, incomeB, expenses, houseworkA, houseworkB, minimumWage } = input
  const hourlyRate = calculateHourlyRate(minimumWage)

  const houseworkValueA = calculateHouseworkValue(houseworkA, hourlyRate)
  const houseworkValueB = calculateHouseworkValue(houseworkB, hourlyRate)

  const adjustedIncomeA = incomeA + houseworkValueA
  const adjustedIncomeB = incomeB + houseworkValueB
  const totalAdjustedIncome = adjustedIncomeA + adjustedIncomeB

  // Edge case: zero adjusted income - split 50/50
  if (totalAdjustedIncome === 0) {
    const halfExpenses = Math.round(expenses / 2)
    return {
      personA: buildPersonResult(halfExpenses, incomeA, expenses, houseworkValueA),
      personB: buildPersonResult(expenses - halfExpenses, incomeB, expenses, houseworkValueB),
      method: 'proportional',
    }
  }

  // Calculate person A's contribution, then derive B's to ensure A + B = expenses exactly
  // This prevents 1-cent rounding bias where one person always pays the extra cent
  const contributionA = Math.round(expenses * (adjustedIncomeA / totalAdjustedIncome))
  const contributionB = expenses - contributionA

  return {
    personA: buildPersonResult(contributionA, incomeA, expenses, houseworkValueA),
    personB: buildPersonResult(contributionB, incomeB, expenses, houseworkValueB),
    method: 'proportional',
  }
}

/**
 * Method 3: Equal Division
 * Splits expenses equally (50/50) regardless of income
 */
export function calculateEqual(input: CalculationInput): CalculationResult {
  const { incomeA, incomeB, expenses } = input

  // Calculate person A's contribution, then derive B's to ensure A + B = expenses exactly
  // This prevents 1-cent rounding bias where person A always pays the extra cent in odd values
  const halfExpenses = Math.round(expenses / 2)
  const contributionA = halfExpenses
  const contributionB = expenses - contributionA

  return {
    personA: buildPersonResult(contributionA, incomeA, expenses),
    personB: buildPersonResult(contributionB, incomeB, expenses),
    method: 'equal',
  }
}
