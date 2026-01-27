import type { ComponentProps } from 'react'

import { Description, Input, Label } from '~/components/ui'

interface ValidationIssue {
  message?: string
}

interface FieldState<T> {
  value: T
  meta: {
    isTouched: boolean
    isDirty: boolean
    isValid: boolean
    errors: Array<{ message?: string } | undefined>
    errorMap: {
      onBlur?: ValidationIssue[]
      onChange?: ValidationIssue[]
    }
  }
}

interface FieldLike<T = string | number> {
  name: string
  state: FieldState<T>
  handleChange: (value: T) => void
  handleBlur: () => void
}

interface FormFieldProps<T = string | number> extends Omit<ComponentProps<'input'>, 'type'> {
  field: FieldLike<T>
  label: string
  description?: string
  type?: 'text' | 'currency' | 'number'
}

export function FormField<T extends string | number>({
  field,
  label,
  description,
  type = 'text',
  ...inputProps
}: FormFieldProps<T>) {
  const { isTouched, isDirty, errorMap } = field.state.meta
  const errors = isDirty ? errorMap.onChange : errorMap.onBlur
  const errorMessage = errors?.[0]?.message
  const hasError = isTouched && !!errorMessage

  if (type === 'currency') {
    return (
      <div>
        <Label htmlFor={field.name}>{label}</Label>
        <Input
          {...inputProps}
          id={field.name}
          name={field.name}
          currency
          value={field.state.value === 0 ? '' : (field.state.value as number) / 100}
          onValueChange={(cents) => field.handleChange((cents ?? 0) as T)}
          onBlur={field.handleBlur}
          error={hasError}
        />
        {(hasError || description) && (
          <Description error={hasError}>{hasError ? errorMessage : description}</Description>
        )}
      </div>
    )
  }

  if (type === 'number') {
    return (
      <div>
        <Label htmlFor={field.name}>{label}</Label>
        <Input
          {...inputProps}
          id={field.name}
          name={field.name}
          type="number"
          value={field.state.value || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? 0 : Number(e.target.value)
            field.handleChange(value as T)
          }}
          onBlur={field.handleBlur}
          error={hasError}
        />
        {(hasError || description) && (
          <Description error={hasError}>{hasError ? errorMessage : description}</Description>
        )}
      </div>
    )
  }

  return (
    <div>
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        {...inputProps}
        id={field.name}
        name={field.name}
        value={field.state.value as string}
        onChange={(e) => field.handleChange(e.target.value as T)}
        onBlur={field.handleBlur}
        error={hasError}
      />
      {(hasError || description) && <Description error={hasError}>{hasError ? errorMessage : description}</Description>}
    </div>
  )
}
