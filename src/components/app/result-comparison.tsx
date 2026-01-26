import { Card } from '~/components/ui/card'
import type { CalculationResult } from '~/lib/calculations'
import { cn, formatCurrency } from '~/lib/utils'

interface ResultComparisonProps {
  nameA: string
  nameB: string
  proportional: CalculationResult
  adjusted: CalculationResult | null
  hybrid: CalculationResult
  recommended: 'proportional' | 'adjusted'
}

interface MethodCardProps {
  title: string
  description: string
  nameA: string
  nameB: string
  contributionA: number
  contributionB: number
  isRecommended: boolean
}

function MethodCard({
  title,
  description,
  nameA,
  nameB,
  contributionA,
  contributionB,
  isRecommended,
}: MethodCardProps) {
  return (
    <Card accent={false} className={cn('p-6', isRecommended && 'ring-2 ring-primary')}>
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

export function ResultComparison({ nameA, nameB, proportional, adjusted, hybrid, recommended }: ResultComparisonProps) {
  return (
    <section>
      <h2 className="mb-6 font-bold text-xl">Compare os métodos</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <MethodCard
          title="Proporcional simples"
          description="Baseado apenas na renda"
          nameA={nameA}
          nameB={nameB}
          contributionA={proportional.personA.contribution}
          contributionB={proportional.personB.contribution}
          isRecommended={recommended === 'proportional'}
        />

        {adjusted && (
          <MethodCard
            title="Proporcional + trabalho doméstico"
            description="Considera renda e horas de trabalho em casa"
            nameA={nameA}
            nameB={nameB}
            contributionA={adjusted.personA.contribution}
            contributionB={adjusted.personB.contribution}
            isRecommended={recommended === 'adjusted'}
          />
        )}

        <MethodCard
          title="Híbrido (com piso)"
          description="Mínimo de 30% para cada pessoa"
          nameA={nameA}
          nameB={nameB}
          contributionA={hybrid.personA.contribution}
          contributionB={hybrid.personB.contribution}
          isRecommended={false}
        />
      </div>
    </section>
  )
}
