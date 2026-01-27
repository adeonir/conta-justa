import { Card as CardUI } from '~/components/ui'
import { useCalculations } from '~/hooks/use-calculations'
import { useExpenseStore } from '~/stores/expense-store'
import { PersonDisplay } from './person-display'

export function Card() {
  const formData = useExpenseStore((s) => s.formData)
  const calculations = useCalculations()

  if (!formData || !calculations) return null

  const { nameA, nameB } = formData
  const { activeResult, methodTitle, isRecommended } = calculations

  return (
    <CardUI>
      <p className="mb-2 font-medium text-primary text-sm uppercase tracking-wider">
        {isRecommended ? 'Divisão recomendada' : 'Método selecionado'}
      </p>
      <h2 className="mb-8 font-bold text-2xl">{methodTitle}</h2>

      <div className="flex gap-8 max-sm:flex-col">
        <PersonDisplay
          name={nameA}
          contribution={activeResult.personA.contribution}
          expensePercentage={activeResult.personA.expensePercentage}
          incomePercentage={activeResult.personA.incomePercentage}
          remaining={activeResult.personA.remaining}
        />

        <div className="w-px bg-primary/30 max-sm:h-px max-sm:w-full" />

        <PersonDisplay
          name={nameB}
          contribution={activeResult.personB.contribution}
          expensePercentage={activeResult.personB.expensePercentage}
          incomePercentage={activeResult.personB.incomePercentage}
          remaining={activeResult.personB.remaining}
        />
      </div>
    </CardUI>
  )
}
