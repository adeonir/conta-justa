import { useCalculations } from '~/hooks/use-calculations'
import { MethodCard } from './method-card'

export function Comparison() {
  const calculations = useCalculations()

  if (!calculations) return null

  const { hasHousework } = calculations

  return (
    <section>
      <h2 className="mb-6 font-bold text-xl">Compare os métodos</h2>

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
        <MethodCard method="proportional" title="Proporcional simples" description="Baseado apenas na renda" />

        <MethodCard
          method="adjusted"
          title="Proporcional + trabalho doméstico"
          description="Considera renda e horas de trabalho em casa"
          disabled={!hasHousework}
        />

        <MethodCard
          method="hybrid"
          title="Contribuição mínima"
          description="Cada pessoa paga pelo menos 30% da própria renda"
        />

        <MethodCard method="equal" title="Divisão igual" description="Cada pessoa paga metade das despesas" />
      </div>
    </section>
  )
}
