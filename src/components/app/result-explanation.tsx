import { Card } from '~/components/ui/card'

interface ResultExplanationProps {
  hasHousework: boolean
}

interface ExplanationItemProps {
  title: string
  text: string
}

function ExplanationItem({ title, text }: ExplanationItemProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
    </div>
  )
}

export function ResultExplanation({ hasHousework }: ResultExplanationProps) {
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
