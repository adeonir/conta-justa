import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(errors: Array<{ message?: string } | undefined>): string {
  return errors
    .filter((e): e is { message: string } => e !== undefined && typeof e.message === 'string')
    .map((e) => e.message)
    .join(', ')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
