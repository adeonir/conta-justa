import { Card } from '~/components/ui'
import { useResults } from '~/hooks/use-results'
import { cn, formatCurrency } from '~/lib/utils'
import type { MethodType } from './types'

interface MethodCardProps {
  method: MethodType
  title: string
  description: string
  disabled?: boolean
}

export function MethodCard({ method, title, description, disabled = false }: MethodCardProps) {
  const results = useResults()

  if (!results) return null

  const { names, recommendedMethod, activeMethod, setSelectedMethod } = results
  const result = results[method]

  const isRecommended = !disabled && recommendedMethod === method
  const isSelected = !disabled && activeMethod === method

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
        'flex h-full flex-col p-6 transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
        disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={disabled}
    >
      <div className="mb-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold">{title}</h3>
          {isRecommended && (
            <span className="shrink-0 rounded-sm bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
              Recomendado
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="flex justify-between gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{names.nameA}</p>
          <p className="font-semibold tabular-nums">
            {result ? formatCurrency(result.personA.contribution / 100) : '-'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">{names.nameB}</p>
          <p className="font-semibold tabular-nums">
            {result ? formatCurrency(result.personB.contribution / 100) : '-'}
          </p>
        </div>
      </div>
    </Card>
  )
}
