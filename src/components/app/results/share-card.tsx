import type { ComponentProps } from 'react'
import { useResults } from '~/hooks/use-results'
import type { PersonResult } from '~/lib/calculations'
import { cn, formatCurrency } from '~/lib/utils'
import { useData } from '~/stores/expense-store'

interface PersonSectionProps {
  name: string
  result: PersonResult
}

function PersonSection({ name, result }: PersonSectionProps) {
  const { contribution, expensePercentage, incomePercentage, remaining } = result

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-3xl">{name}</h3>

      <div>
        <p className="font-black text-5xl tracking-tight">{formatCurrency(contribution / 100)}</p>
        <p className="text-muted-foreground text-xl">Valor mensal</p>
      </div>

      <ul className="divide-y divide-border text-2xl">
        <li className="space-x-1.5 pb-2">
          <span className="font-semibold tabular-nums">{expensePercentage.toFixed(2)}%</span>
          <span className="text-muted-foreground">da despesa total</span>
        </li>
        <li className="space-x-1.5 py-2">
          <span className="font-semibold tabular-nums">{incomePercentage.toFixed(2)}%</span>
          <span className="text-muted-foreground">da renda comprometida</span>
        </li>
        <li className="space-x-1.5 pt-2">
          <span className={cn('font-semibold tabular-nums', remaining < 0 && 'text-error')}>
            {formatCurrency(remaining / 100)}
          </span>
          <span className="text-muted-foreground">{remaining < 0 ? 'de deficit mensal' : 'de sobra mensal'}</span>
        </li>
      </ul>
    </div>
  )
}

export function ShareCard({ ref, ...props }: ComponentProps<'div'>) {
  const data = useData()

  const results = useResults()

  if (!data || !results) return null

  const { activeResult } = results
  const nameA = data.nameA || 'Pessoa A'
  const nameB = data.nameB || 'Pessoa B'

  return (
    <div aria-hidden="true" className="fixed -top-2500 -left-2500">
      <div ref={ref} className="flex w-180 flex-col bg-background" {...props}>
        <div className="h-1.5 w-full bg-primary" />

        <div className="flex flex-col gap-7 px-12 py-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight">Conta Justa</span>
              <div className="size-1.5 rounded-full bg-primary" />
            </div>
            <p className="font-black text-3xl tracking-tight">
              <span>Divisao das despesas de </span>
              <span className="text-primary underline">{nameA}</span>
              <span> e </span>
              <span className="text-primary underline">{nameB}</span>
            </p>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card px-8 py-7">
            <PersonSection name={nameA} result={activeResult.personA} />
            <div className="h-px bg-secondary/50" />
            <PersonSection name={nameB} result={activeResult.personB} />

            <div className="flex items-center justify-center gap-1.5 border-secondary/50 border-t pt-4">
              <span className="text-muted-foreground text-xl">Total de despesas compartilhadas:</span>
              <span className="font-semibold text-xl">{formatCurrency(data.expenses / 100)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
