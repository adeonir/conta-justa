import type { PersonResult } from '~/lib/calculations'
import { cn, formatCurrency } from '~/lib/utils'

interface PersonDisplayProps {
  name: string
  result: PersonResult
}

export function PersonDisplay({ name, result }: PersonDisplayProps) {
  const { contribution, expensePercentage, incomePercentage, remaining } = result

  return (
    <div className="flex min-h-64 flex-1 flex-col space-y-4">
      <h3 className="font-bold text-lg">{name}</h3>

      <div>
        <p className="font-black text-3xl tracking-tight">{formatCurrency(contribution / 100)}</p>
        <p className="text-muted-foreground text-sm">Valor mensal</p>
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
          <span
            className={cn('font-semibold tabular-nums', remaining < 0 && 'text-error')}
            data-balance={remaining < 0 ? 'negative' : 'positive'}
          >
            {formatCurrency(remaining / 100)}
          </span>
          <span className="text-muted-foreground">{remaining < 0 ? 'de déficit mensal' : 'de sobra mensal'}</span>
        </li>
      </ul>
    </div>
  )
}
