import type { ComponentProps } from 'react'
import CurrencyInput from 'react-currency-input-field'

import { cn } from '~/lib/utils'

export interface InputProps extends ComponentProps<'input'> {
  error?: boolean
  currency?: boolean
  onValueChange?: (cents: number | null) => void
}

const inputStyles = (error?: boolean, className?: string) =>
  cn(
    'w-full rounded-lg border-2 border-input bg-muted/50 px-5 py-4 font-medium text-foreground transition-all',
    'placeholder:font-normal placeholder:text-muted-foreground',
    'focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/20',
    'disabled:cursor-not-allowed disabled:opacity-50',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    error && 'border-error focus:border-error',
    className,
  )

export function Input({ className, error, currency, onValueChange, ...props }: InputProps) {
  if (currency) {
    const { id, name, placeholder, disabled, required, autoFocus, autoComplete, ref, value, defaultValue } = props

    return (
      <CurrencyInput
        id={id}
        name={name}
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        value={value as string | number | undefined}
        defaultValue={defaultValue as string | number | undefined}
        data-slot="input"
        data-currency
        data-error={error || undefined}
        aria-invalid={error || undefined}
        className={inputStyles(error, className)}
        intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
        onValueChange={(val) => {
          if (onValueChange) {
            const cents = val ? Math.round(Number.parseFloat(val) * 100) : null
            onValueChange(cents)
          }
        }}
      />
    )
  }

  return (
    <input
      data-slot="input"
      data-error={error || undefined}
      aria-invalid={error || undefined}
      className={inputStyles(error, className)}
      {...props}
    />
  )
}
