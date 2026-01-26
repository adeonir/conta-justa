import { useCalculations } from '~/hooks/use-calculations'
import { useExpenseStore } from '~/stores/expense-store'
import { MethodCard } from './method-card'

export function Comparison() {
  const formData = useExpenseStore((s) => s.formData)
  const calculations = useCalculations()

  if (!formData || !calculations) return null

  const { nameA, nameB } = formData
  const { proportional, adjusted, hybrid, recommendedMethod, activeMethod, setSelectedMethod } = calculations

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
          isRecommended={recommendedMethod === 'proportional'}
          isSelected={activeMethod === 'proportional'}
          onSelect={() => setSelectedMethod('proportional')}
        />

        {adjusted && (
          <MethodCard
            title="Proporcional + trabalho doméstico"
            description="Considera renda e horas de trabalho em casa"
            nameA={nameA}
            nameB={nameB}
            contributionA={adjusted.personA.contribution}
            contributionB={adjusted.personB.contribution}
            isRecommended={recommendedMethod === 'adjusted'}
            isSelected={activeMethod === 'adjusted'}
            onSelect={() => setSelectedMethod('adjusted')}
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
          isSelected={activeMethod === 'hybrid'}
          onSelect={() => setSelectedMethod('hybrid')}
        />
      </div>
    </section>
  )
}
