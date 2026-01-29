import { AlertCircle, Info } from 'lucide-react'
import { Card } from '~/components/ui'
import { useResults } from '~/hooks/use-results'
import { cn, formatCurrency } from '~/lib/utils'
import { useData } from '~/stores/expense-store'
import type { MethodType } from './types'

interface MethodCardProps {
  method: MethodType
  title: string
  description: string
  disabled?: boolean
}

export function MethodCard({ method, title, description, disabled = false }: MethodCardProps) {
  const results = useResults()
  const data = useData()

  if (!results) return null

  const { recommendedMethod, activeMethod, hasHousework, setSelectedMethod } = results
  const result = results[method]

  const isRecommended = !disabled && recommendedMethod === method
  const isSelected = !disabled && activeMethod === method

  const nameA = data?.nameA || 'Pessoa A'
  const nameB = data?.nameB || 'Pessoa B'
  const maxIncome = Math.max(data?.incomeA ?? 0, data?.incomeB ?? 0)
  const minIncome = Math.min(data?.incomeA ?? 0, data?.incomeB ?? 0)
  const isImbalanced = method === 'equal' && maxIncome > 0 && (minIncome === 0 || maxIncome / minIncome >= 2)

  function handleClick() {
    if (!disabled) setSelectedMethod(method)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedMethod(method)
    }
  }

  return (
    <Card
      accent={false}
      className={cn(
        'flex h-full cursor-pointer flex-col space-y-2 p-6 transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
        isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-foreground/20',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={disabled}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold">{title}</h3>
          {isRecommended && (
            <span className="shrink-0 rounded-lg bg-primary px-2 py-0.75 font-medium text-primary-foreground text-xs">
              Recomendado
            </span>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">{description}</p>
          {hasHousework && method === 'proportional' && (
            <p className="flex items-center gap-1 text-info text-xs">
              <Info className="size-4 shrink-0" />
              Inclui trabalho doméstico
            </p>
          )}
          {isImbalanced && (
            <p className="flex items-start gap-1 text-error text-xs">
              <AlertCircle className="mt-1 size-4 shrink-0" />A diferença de renda pode gerar desequilíbrio neste modelo
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{nameA}</p>
          <p className="font-semibold tabular-nums">
            {result ? formatCurrency(result.personA.contribution / 100) : '-'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">{nameB}</p>
          <p className="font-semibold tabular-nums">
            {result ? formatCurrency(result.personB.contribution / 100) : '-'}
          </p>
        </div>
      </div>
    </Card>
  )
}
