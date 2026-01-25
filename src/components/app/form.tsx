import { useForm } from '@tanstack/react-form'

import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Description } from '~/components/ui/description'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Title } from '~/components/ui/title'
import { getErrorMessage } from '~/lib/utils'
import { type ExpenseFormData, expenseFormSchema } from '~/schemas/expense-form'

function handleFormSubmit(value: ExpenseFormData) {
  console.log('Form submitted:', value)
}

export function Form() {
  const form = useForm({
    defaultValues: {
      nameA: '',
      incomeA: 0,
      nameB: '',
      incomeB: 0,
      expenses: 0,
    } satisfies ExpenseFormData,
    validators: {
      onBlur: expenseFormSchema,
      onSubmit: expenseFormSchema,
    },
    onSubmit: ({ value }) => handleFormSubmit(value),
  })

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <div className="mb-9">
          <Title>Pessoa A</Title>
          <div className="space-y-4">
            <form.Field name="nameA">
              {(field) => {
                const hasError = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <div>
                    <Label htmlFor={field.name}>Nome</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Ex: Maria"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      error={hasError}
                    />
                    {hasError && <Description error>{getErrorMessage(field.state.meta.errors)}</Description>}
                  </div>
                )
              }}
            </form.Field>
            <form.Field name="incomeA">
              {(field) => {
                const hasError = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <div>
                    <Label htmlFor={field.name}>Renda mensal</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      currency
                      placeholder="R$ 0,00"
                      value={field.state.value / 100}
                      onValueChange={(cents) => field.handleChange(cents ?? 0)}
                      onBlur={field.handleBlur}
                      error={hasError}
                    />
                    {hasError && <Description error>{getErrorMessage(field.state.meta.errors)}</Description>}
                  </div>
                )
              }}
            </form.Field>
          </div>
        </div>

        <div className="mb-9">
          <Title>Pessoa B</Title>
          <div className="space-y-4">
            <form.Field name="nameB">
              {(field) => {
                const hasError = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <div>
                    <Label htmlFor={field.name}>Nome</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Ex: João"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      error={hasError}
                    />
                    {hasError && <Description error>{getErrorMessage(field.state.meta.errors)}</Description>}
                  </div>
                )
              }}
            </form.Field>
            <form.Field name="incomeB">
              {(field) => {
                const hasError = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <div>
                    <Label htmlFor={field.name}>Renda mensal</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      currency
                      placeholder="R$ 0,00"
                      value={field.state.value / 100}
                      onValueChange={(cents) => field.handleChange(cents ?? 0)}
                      onBlur={field.handleBlur}
                      error={hasError}
                    />
                    {hasError && <Description error>{getErrorMessage(field.state.meta.errors)}</Description>}
                  </div>
                )
              }}
            </form.Field>
          </div>
        </div>

        <div className="mb-10">
          <Title>Despesas compartilhadas</Title>
          <form.Field name="expenses">
            {(field) => {
              const hasError = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <div>
                  <Label htmlFor={field.name}>Total mensal</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    currency
                    placeholder="R$ 0,00"
                    value={field.state.value / 100}
                    onValueChange={(cents) => field.handleChange(cents ?? 0)}
                    onBlur={field.handleBlur}
                    error={hasError}
                  />
                  {hasError ? (
                    <Description error>{getErrorMessage(field.state.meta.errors)}</Description>
                  ) : (
                    <Description>Aluguel, contas, mercado, etc.</Description>
                  )}
                </div>
              )
            }}
          </form.Field>
        </div>

        <Button type="button" variant="primary" size="lg" fullWidth>
          Calcular divisão
        </Button>
      </form>
    </Card>
  )
}
