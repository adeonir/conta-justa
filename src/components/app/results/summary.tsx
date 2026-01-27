import { Info } from 'lucide-react'

import { Tooltip } from '~/components/ui'
import { formatCurrency } from '~/lib/utils'
import { useData } from '~/stores/expense-store'

export function Summary() {
  const data = useData()

  if (!data) return null

  const { nameA, nameB, incomeA, incomeB, expenses, houseworkA, houseworkB } = data
  const totalIncome = incomeA + incomeB
  const hasHousework = houseworkA > 0 || houseworkB > 0
  const totalHousework = houseworkA + houseworkB

  return (
    <section className="sticky top-42 self-start max-md:static">
      <h1 className="mb-8 font-black text-4xl leading-tight tracking-tighter">
        Divisão para{' '}
        <span className="relative text-primary">
          {nameA}
          <span className="absolute right-0 bottom-0.5 left-0 h-0.75 rounded-sm bg-primary" />
        </span>{' '}
        e{' '}
        <span className="relative text-primary">
          {nameB}
          <span className="absolute right-0 bottom-0.5 left-0 h-0.75 rounded-sm bg-primary" />
        </span>
      </h1>

      <dl className="space-y-4">
        <div className="flex items-center justify-between border-border border-b pb-4">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            Renda total do casal
            <Tooltip
              content={`${nameA}: ${formatCurrency(incomeA / 100)} | ${nameB}: ${formatCurrency(incomeB / 100)}`}
              side="top"
            >
              <Info className="size-4 cursor-pointer text-info" />
            </Tooltip>
          </dt>
          <dd className="font-semibold">{formatCurrency(totalIncome / 100)}</dd>
        </div>

        <div className="flex items-center justify-between border-border border-b pb-4">
          <dt className="text-muted-foreground">Despesas compartilhadas</dt>
          <dd className="font-semibold">{formatCurrency(expenses / 100)}</dd>
        </div>

        {hasHousework && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Trabalho doméstico</dt>
            <dd className="font-semibold">{totalHousework}h/semana</dd>
          </div>
        )}
      </dl>

      <div className="mt-8 h-0.75 w-15 rounded-sm bg-primary" />
    </section>
  )
}
