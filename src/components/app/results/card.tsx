import { Card as CardUI } from '~/components/ui/card'
import type { CalculationResult } from '~/lib/calculations'
import { PersonDisplay } from './person-display'

interface CardProps {
  nameA: string
  nameB: string
  result: CalculationResult
  methodTitle: string
  isRecommended?: boolean
}

export function Card({ nameA, nameB, result, methodTitle, isRecommended = true }: CardProps) {
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
