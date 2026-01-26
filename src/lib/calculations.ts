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
}

export interface CalculationResult {
  personA: PersonResult
  personB: PersonResult
  method: 'proportional' | 'adjusted' | 'hybrid'
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

export function buildPersonResult(contribution: number, income: number, expenses: number): PersonResult {
  return {
    contribution,
    expensePercentage: roundToTwoDecimals(expenses > 0 ? (contribution / expenses) * 100 : 0),
    incomePercentage: roundToTwoDecimals(income > 0 ? (contribution / income) * 100 : 0),
    remaining: income - contribution,
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
      personA: buildPersonResult(halfExpenses, incomeA, expenses),
      personB: buildPersonResult(expenses - halfExpenses, incomeB, expenses),
      method: 'adjusted',
    }
  }

  const contributionA = Math.round(expenses * (adjustedIncomeA / totalAdjustedIncome))
  const contributionB = expenses - contributionA

  return {
    personA: buildPersonResult(contributionA, incomeA, expenses),
    personB: buildPersonResult(contributionB, incomeB, expenses),
    method: 'adjusted',
  }
}

const HYBRID_FLOOR_PERCENTAGE = 0.3 // 30% minimum contribution

/**
 * Method 3: Hybrid Division (proportional with 30% floor)
 * Ensures minimum 30% contribution from lower earner
 */
export function calculateHybrid(input: CalculationInput): CalculationResult {
  const { incomeA, incomeB, expenses } = input
  const totalIncome = incomeA + incomeB

  // Edge case: zero total income - split 50/50
  if (totalIncome === 0) {
    const halfExpenses = Math.round(expenses / 2)
    return {
      personA: buildPersonResult(halfExpenses, incomeA, expenses),
      personB: buildPersonResult(expenses - halfExpenses, incomeB, expenses),
      method: 'hybrid',
    }
  }

  const floor = Math.round(expenses * HYBRID_FLOOR_PERCENTAGE)

  // Calculate proportional contributions
  const proportionalA = Math.round(expenses * (incomeA / totalIncome))
  const proportionalB = expenses - proportionalA

  let contributionA = proportionalA
  let contributionB = proportionalB

  // Apply floor - boost lower contributor to 30% minimum
  if (proportionalA < floor && proportionalB >= floor) {
    contributionA = floor
    contributionB = expenses - floor
  } else if (proportionalB < floor && proportionalA >= floor) {
    contributionB = floor
    contributionA = expenses - floor
  }
  // If both would hit floor (similar incomes), keep proportional

  return {
    personA: buildPersonResult(contributionA, incomeA, expenses),
    personB: buildPersonResult(contributionB, incomeB, expenses),
    method: 'hybrid',
  }
}
