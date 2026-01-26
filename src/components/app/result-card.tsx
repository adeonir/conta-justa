import { Card } from '~/components/ui/card'
import type { CalculationResult } from '~/lib/calculations'
import { formatCurrency } from '~/lib/utils'

interface ResultCardProps {
  nameA: string
  nameB: string
  result: CalculationResult
  methodTitle: string
  isRecommended?: boolean
}

interface PersonResultDisplayProps {
  name: string
  contribution: number
  expensePercentage: number
  incomePercentage: number
  remaining: number
}

function PersonResultDisplay({
  name,
  contribution,
  expensePercentage,
  incomePercentage,
  remaining,
}: PersonResultDisplayProps) {
  return (
    <div className="flex-1 space-y-4">
      <h3 className="font-bold text-lg">{name}</h3>

      <div>
        <p className="font-black text-3xl tracking-tight">{formatCurrency(contribution / 100)}</p>
        <p className="text-muted-foreground text-sm">Valor a pagar</p>
      </div>

      <ul className="divide-y divide-border text-sm">
        <li className="space-x-1 pb-2">
          <span className="font-semibold tabular-nums">{expensePercentage.toFixed(2)}%</span>
          <span className="text-muted-foreground">da despesa total</span>
        </li>
        <li className="space-x-1 py-2">
          <span className="font-semibold tabular-nums">{incomePercentage.toFixed(2)}%</span>
          <span className="text-muted-foreground">da renda comprometida</span>
        </li>
        <li className="space-x-1 pt-2">
          <span className="font-semibold tabular-nums">{formatCurrency(remaining / 100)}</span>
          <span className="text-muted-foreground">sobra mensal</span>
        </li>
      </ul>
    </div>
  )
}

export function ResultCard({ nameA, nameB, result, methodTitle, isRecommended = true }: ResultCardProps) {
  return (
    <Card>
      <p className="mb-2 font-medium text-primary text-sm uppercase tracking-wider">
        {isRecommended ? 'Divisão recomendada' : 'Método selecionado'}
      </p>
      <h2 className="mb-8 font-bold text-2xl">{methodTitle}</h2>

      <div className="flex gap-8 max-sm:flex-col">
        <PersonResultDisplay
          name={nameA}
          contribution={result.personA.contribution}
          expensePercentage={result.personA.expensePercentage}
          incomePercentage={result.personA.incomePercentage}
          remaining={result.personA.remaining}
        />

        <div className="w-px bg-primary/30 max-sm:h-px max-sm:w-full" />

        <PersonResultDisplay
          name={nameB}
          contribution={result.personB.contribution}
          expensePercentage={result.personB.expensePercentage}
          incomePercentage={result.personB.incomePercentage}
          remaining={result.personB.remaining}
        />
      </div>
    </Card>
  )
}
