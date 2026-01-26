import { Card } from '~/components/ui/card'
import { cn, formatCurrency } from '~/lib/utils'

interface MethodCardProps {
  title: string
  description: string
  nameA: string
  nameB: string
  contributionA: number
  contributionB: number
  isRecommended: boolean
  isSelected: boolean
  onSelect: () => void
}

export function MethodCard({
  title,
  description,
  nameA,
  nameB,
  contributionA,
  contributionB,
  isRecommended,
  isSelected,
  onSelect,
}: MethodCardProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <Card
      accent={false}
      className={cn(
        'cursor-pointer p-6 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
        isSelected && 'ring-2 ring-primary',
      )}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      <div className="mb-4">
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
          <p className="text-muted-foreground">{nameA}</p>
          <p className="font-semibold tabular-nums">{formatCurrency(contributionA / 100)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">{nameB}</p>
          <p className="font-semibold tabular-nums">{formatCurrency(contributionB / 100)}</p>
        </div>
      </div>
    </Card>
  )
}
