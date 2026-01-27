import type { ComponentProps } from 'react'

import { Description } from '~/components/ui/description'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { getErrorMessage } from '~/lib/utils'

interface FieldState<T> {
  value: T
  meta: {
    isTouched: boolean
    isValid: boolean
    errors: Array<{ message?: string } | undefined>
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
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid

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
          <Description error={hasError}>
            {hasError ? getErrorMessage(field.state.meta.errors) : description}
          </Description>
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
          <Description error={hasError}>
            {hasError ? getErrorMessage(field.state.meta.errors) : description}
          </Description>
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
      {(hasError || description) && (
        <Description error={hasError}>{hasError ? getErrorMessage(field.state.meta.errors) : description}</Description>
      )}
    </div>
  )
}
