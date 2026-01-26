import type { CalculationResult } from '~/lib/calculations'
import { MethodCard } from './method-card'
import type { MethodType } from './types'

interface ComparisonProps {
  nameA: string
  nameB: string
  proportional: CalculationResult
  adjusted: CalculationResult | null
  hybrid: CalculationResult
  recommended: 'proportional' | 'adjusted'
  selected: MethodType
  onSelect: (method: MethodType) => void
}

export function Comparison({
  nameA,
  nameB,
  proportional,
  adjusted,
  hybrid,
  recommended,
  selected,
  onSelect,
}: ComparisonProps) {
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
          isSelected={selected === 'proportional'}
          onSelect={() => onSelect('proportional')}
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
            isSelected={selected === 'adjusted'}
            onSelect={() => onSelect('adjusted')}
          />
        )}

        <MethodCard
          title="Contribuição mínima"
          description="Cada pessoa paga pelo menos 30% das despesas"
          nameA={nameA}
          nameB={nameB}
          contributionA={hybrid.personA.contribution}
          contributionB={hybrid.personB.contribution}
          isRecommended={false}
          isSelected={selected === 'hybrid'}
          onSelect={() => onSelect('hybrid')}
        />
      </div>
    </section>
  )
}
