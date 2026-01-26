import { Card } from '~/components/ui/card'
import { useExpenseStore } from '~/stores/expense-store'
import { ExplanationItem } from './explanation-item'

export function Explanation() {
  const formData = useExpenseStore((s) => s.formData)

  if (!formData) return null

  const hasHousework = formData.houseworkA > 0 || formData.houseworkB > 0

  return (
    <Card accent={false} className="p-6">
      <h2 className="mb-6 font-bold text-xl">Como funciona</h2>

      <div className="flex flex-col gap-6">
        <ExplanationItem
          title="Divisão proporcional"
          text="Quem ganha mais, paga mais em valor absoluto, mas ambos comprometem a mesma porcentagem da renda. É considerada justa porque respeita a capacidade de cada um."
        />

        {hasHousework && (
          <ExplanationItem
            title="Por que incluir trabalho doméstico?"
            text="Cuidar da casa, cozinhar, limpar e cuidar de filhos é trabalho. Incluir essas horas no cálculo reconhece essa contribuição econômica invisível."
          />
        )}

        <ExplanationItem
          title="Contribuição mínima"
          text="Garante que ninguém pague menos de 30% das despesas. Útil quando a diferença de renda é muito grande e se quer manter algum equilíbrio."
        />
      </div>
    </Card>
  )
}
