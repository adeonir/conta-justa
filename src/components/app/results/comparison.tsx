import { MethodCard } from './method-card'

export function Comparison() {
  return (
    <section>
      <h2 className="mb-6 font-bold text-xl">Modelos de divisão</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <MethodCard method="proportional" title="Proporcional" description="Baseado na renda de cada pessoa" />
        <MethodCard method="equal" title="Divisão igual" description="Cada pessoa paga metade das despesas" />
      </div>
    </section>
  )
}
