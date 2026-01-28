import { useResults } from '~/hooks/use-results'
import { MethodCard } from './method-card'

export function Comparison() {
  const results = useResults()

  if (!results) return null

  const { hasHousework } = results

  const proportionalDescription = hasHousework
    ? 'Considera renda e horas de trabalho em casa'
    : 'Baseado apenas na renda'

  return (
    <section>
      <h2 className="mb-6 font-bold text-xl">Compare os métodos</h2>

      <div className="grid gap-4">
        <MethodCard method="proportional" title="Proporcional" description={proportionalDescription} />

        <MethodCard method="equal" title="Divisão igual" description="Cada pessoa paga metade das despesas" />
      </div>
    </section>
  )
}
