import { Card as CardUI } from '~/components/ui/card'
import type { CalculationResult } from '~/lib/calculations'
import { useExpenseStore } from '~/stores/expense-store'
import { PersonDisplay } from './person-display'

interface CardProps {
  result: CalculationResult
  methodTitle: string
  isRecommended?: boolean
}

export function Card({ result, methodTitle, isRecommended = true }: CardProps) {
  const formData = useExpenseStore((s) => s.formData)

  if (!formData) return null

  const { nameA, nameB } = formData

  return (
    <CardUI>
      <p className="mb-2 font-medium text-primary text-sm uppercase tracking-wider">
        {isRecommended ? 'Divisão recomendada' : 'Método selecionado'}
      </p>
      <h2 className="mb-8 font-bold text-2xl">{methodTitle}</h2>

      <div className="flex gap-8 max-sm:flex-col">
        <PersonDisplay
          name={nameA}
          contribution={result.personA.contribution}
          expensePercentage={result.personA.expensePercentage}
          incomePercentage={result.personA.incomePercentage}
          remaining={result.personA.remaining}
        />

        <div className="w-px bg-primary/30 max-sm:h-px max-sm:w-full" />

        <PersonDisplay
          name={nameB}
          contribution={result.personB.contribution}
          expensePercentage={result.personB.expensePercentage}
          incomePercentage={result.personB.incomePercentage}
          remaining={result.personB.remaining}
        />
      </div>
    </CardUI>
  )
}
