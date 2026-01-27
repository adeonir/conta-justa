import { useForm } from '@tanstack/react-form'
import { Info } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Collapsible } from '~/components/ui/collapsible'
import { InfoBox } from '~/components/ui/info-box'
import { Title } from '~/components/ui/title'
import { useExpenseFormSubmit } from '~/hooks/use-expense-form-submit'
import { formatCurrency } from '~/lib/utils'
import { type ExpenseFormData, expenseFormSchema } from '~/schemas/expense-form'
import { useExpenseStore } from '~/stores/expense-store'
import { FormField } from './form-field'

export function Form() {
  const minimumWage = useExpenseStore((state) => state.minimumWage) ?? 0
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
      onChange: expenseFormSchema,
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
              {(field) => <FormField field={field} label="Nome" placeholder="Ex: Maria" />}
            </form.Field>
            <form.Field name="incomeA">
              {(field) => <FormField field={field} label="Renda mensal" type="currency" placeholder="R$ 0,00" />}
            </form.Field>
          </div>
        </div>

        <div className="mb-9">
          <Title>Pessoa B</Title>
          <div className="space-y-4">
            <form.Field name="nameB">
              {(field) => <FormField field={field} label="Nome" placeholder="Ex: João" />}
            </form.Field>
            <form.Field name="incomeB">
              {(field) => <FormField field={field} label="Renda mensal" type="currency" placeholder="R$ 0,00" />}
            </form.Field>
          </div>
        </div>

        <div className="mb-10">
          <Title>Despesas compartilhadas</Title>
          <form.Field name="expenses">
            {(field) => (
              <FormField
                field={field}
                label="Total mensal"
                type="currency"
                placeholder="R$ 0,00"
                description="Aluguel, contas, mercado, etc."
              />
            )}
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
                Usamos o salário mínimo/hora ({formatCurrency(minimumWage / 100 / 220)}) como referência para valorar o
                trabalho doméstico.
              </InfoBox>
              <form.Subscribe selector={(state) => [state.values.nameA, state.values.nameB]}>
                {([nameA, nameB]) => (
                  <div className="mt-6 space-y-4">
                    <form.Field name="houseworkA">
                      {(field) => (
                        <FormField
                          field={field}
                          label={`Horas semanais de ${nameA || 'Pessoa A'}`}
                          type="number"
                          placeholder="0"
                          min={0}
                          description="Limpeza, cozinha, cuidado com filhos, etc."
                        />
                      )}
                    </form.Field>
                    <form.Field name="houseworkB">
                      {(field) => (
                        <FormField
                          field={field}
                          label={`Horas semanais de ${nameB || 'Pessoa B'}`}
                          type="number"
                          placeholder="0"
                          min={0}
                        />
                      )}
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
