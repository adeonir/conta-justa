import { useForm } from '@tanstack/react-form'
import { Info } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Collapsible } from '~/components/ui/collapsible'
import { Description } from '~/components/ui/description'
import { InfoBox } from '~/components/ui/info-box'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Title } from '~/components/ui/title'
import { useExpenseFormSubmit } from '~/hooks/use-expense-form-submit'
import { formatCurrency, getErrorMessage } from '~/lib/utils'
import { type ExpenseFormData, expenseFormSchema } from '~/schemas/expense-form'

interface FormProps {
  minimumWage: number
}

export function Form({ minimumWage }: FormProps) {
  const handleSubmit = useExpenseFormSubmit()

  const form = useForm({
    defaultValues: {
      nameA: '',
      incomeA: 0,
      nameB: '',
      incomeB: 0,
      expenses: 0,
      houseworkA: 0,
      houseworkB: 0,
    } satisfies ExpenseFormData,
    validators: {
      onBlur: expenseFormSchema,
      onSubmit: expenseFormSchema,
    },
    onSubmit: ({ value }) => handleSubmit(value),
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
                      value={field.state.value === 0 ? '' : field.state.value / 100}
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
                      value={field.state.value === 0 ? '' : field.state.value / 100}
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
                    value={field.state.value === 0 ? '' : field.state.value / 100}
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

        <div className="mb-10">
          <Collapsible.Root defaultOpen={false}>
            <Collapsible.Trigger>Incluir trabalho doméstico no cálculo</Collapsible.Trigger>
            <Collapsible.Content>
              <Collapsible.Description>
                Cuidar da casa é trabalho. Informe as horas semanais dedicadas a tarefas domésticas.
              </Collapsible.Description>
              <InfoBox icon={<Info />}>
                Usamos o salário mínimo/hora ({formatCurrency(minimumWage / 220)}) como referência para valorar o
                trabalho doméstico.
              </InfoBox>
              <form.Subscribe selector={(state) => [state.values.nameA, state.values.nameB]}>
                {([nameA, nameB]) => (
                  <div className="mt-6 space-y-4">
                    <form.Field name="houseworkA">
                      {(field) => {
                        const hasError = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <div>
                            <Label htmlFor={field.name}>Horas semanais de {nameA || 'Pessoa A'}</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="number"
                              placeholder="0"
                              min={0}
                              value={field.state.value || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Number(e.target.value)
                                field.handleChange(value)
                              }}
                              onBlur={field.handleBlur}
                              error={hasError}
                            />
                            {hasError ? (
                              <Description error>{getErrorMessage(field.state.meta.errors)}</Description>
                            ) : (
                              <Description>Limpeza, cozinha, cuidado com filhos, etc.</Description>
                            )}
                          </div>
                        )
                      }}
                    </form.Field>
                    <form.Field name="houseworkB">
                      {(field) => {
                        const hasError = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <div>
                            <Label htmlFor={field.name}>Horas semanais de {nameB || 'Pessoa B'}</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="number"
                              placeholder="0"
                              min={0}
                              value={field.state.value || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Number(e.target.value)
                                field.handleChange(value)
                              }}
                              onBlur={field.handleBlur}
                              error={hasError}
                            />
                            {hasError && <Description error>{getErrorMessage(field.state.meta.errors)}</Description>}
                          </div>
                        )
                      }}
                    </form.Field>
                  </div>
                )}
              </form.Subscribe>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Calculando...' : 'Calcular divisão'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Card>
  )
}
