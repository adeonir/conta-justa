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
