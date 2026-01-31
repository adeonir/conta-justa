import { useForm } from '@tanstack/react-form'

import { Info } from 'lucide-react'
import { Collapsible } from '~/components/app/collapsible'
import { Button, Card, Description, InfoBox, Title } from '~/components/ui'
import { useExpenseFormSubmit } from '~/hooks/use-expense-form-submit'
import { trackEvent } from '~/hooks/use-track-event'
import { type ExpenseFormData, expenseFormSchema } from '~/schemas/expense-form'
import { useData, useReset } from '~/stores/expense-store'
import { FormField } from './form-field'

const emptyDefaults: ExpenseFormData = {
  nameA: '',
  incomeA: 0,
  nameB: '',
  incomeB: 0,
  expenses: 0,
  houseworkA: 0,
  houseworkB: 0,
}

export function Form() {
  const storeData = useData()
  const resetStore = useReset()

  const handleSubmit = useExpenseFormSubmit()

  const defaultValues = storeData ?? emptyDefaults
  const hasHouseworkData = (storeData?.houseworkA ?? 0) > 0 || (storeData?.houseworkB ?? 0) > 0

  const form = useForm({
    defaultValues,
    validators: {
      onBlur: expenseFormSchema,
      onChange: expenseFormSchema,
    },
    onSubmit: ({ value }) => handleSubmit(value),
  })

  const handleHouseworkToggle = (open: boolean) => {
    trackEvent('housework_section_toggled', { action: open ? 'open' : 'close' })

    if (!open) {
      form.setFieldValue('houseworkA', 0)
      form.setFieldValue('houseworkB', 0)
    }
  }

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
                description="Aluguel, contas, mercado e outros gastos em comum"
              />
            )}
          </form.Field>
        </div>

        <div className="mb-10">
          <Collapsible
            trigger="Considerar trabalho doméstico no cálculo"
            description="Cuidar da casa também é trabalho. Informe as horas semanais dedicadas a tarefas domésticas — muitas vezes invisíveis e não remuneradas."
            defaultOpen={hasHouseworkData}
            onOpenChange={handleHouseworkToggle}
          >
            <form.Subscribe selector={(state) => [state.values.nameA, state.values.nameB]}>
              {([nameA, nameB]) => (
                <div className="">
                  <div className="flex gap-4">
                    <form.Field name="houseworkA">
                      {(field) => (
                        <FormField
                          field={field}
                          label={`Horas semanais de ${nameA || 'Pessoa A'}`}
                          type="number"
                          placeholder="0"
                          min={0}
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
                  <Description>Limpeza, cozinha, cuidado com filhos, organização da casa</Description>
                </div>
              )}
            </form.Subscribe>
            <InfoBox className="mt-6" icon={<Info />}>
              Usamos o salário mínimo/hora apenas como referência para estimar o valor do trabalho doméstico
            </InfoBox>
          </Collapsible>
        </div>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <div className="flex flex-col gap-3">
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Calculando...' : 'Ver resultados'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  resetStore()
                  form.reset(emptyDefaults)
                }}
                className="cursor-pointer text-muted-foreground text-sm transition-colors hover:text-foreground"
              >
                Limpar formulário
              </button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </Card>
  )
}
