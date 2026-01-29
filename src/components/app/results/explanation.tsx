import { Card } from '~/components/ui'
import { useData } from '~/stores/expense-store'
import { ExplanationItem } from './explanation-item'

export function Explanation() {
  const data = useData()

  if (!data) return null

  const hasHousework = data.houseworkA > 0 || data.houseworkB > 0

  return (
    <Card accent={false} className="p-6">
      <h2 className="mb-6 font-bold text-xl">Entenda os modelos</h2>

      <div className="flex flex-col gap-6">
        <ExplanationItem
          title="Modelo proporcional"
          text="Cada pessoa contribui de forma proporcional à própria renda. Quem ganha mais paga mais em valor absoluto, mantendo uma relação direta com a capacidade financeira."
        />

        {hasHousework && (
          <ExplanationItem
            title="Trabalho doméstico no cálculo"
            text="Tarefas domésticas e cuidados com a casa exigem tempo e energia. Ao incluir essas horas, o modelo proporcional reconhece uma contribuição que normalmente não aparece na renda. O valor estimado ajusta apenas a proporção da divisão — não representa um pagamento entre o casal."
          />
        )}

        <ExplanationItem
          title="Divisão igual"
          text="Simples e direto: cada pessoa paga metade. Pode ser desequilibrado quando há diferença grande de renda, comprometendo mais o orçamento de quem ganha menos."
        />
      </div>
    </Card>
  )
}
