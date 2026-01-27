import { useNavigate } from '@tanstack/react-router'

import { Button, Card } from '~/components/ui'
import { useExpenseStore } from '~/stores/expense-store'

export function Actions() {
  const navigate = useNavigate()
  const reset = useExpenseStore((s) => s.reset)

  function handleNewCalculation() {
    reset()
    navigate({ to: '/' })
  }

  return (
    <Card accent={false} className="p-6">
      <div className="flex flex-col gap-6">
        <Button onClick={handleNewCalculation} className="w-full">
          Fazer novo cálculo
        </Button>

        <p className="text-center text-muted-foreground text-xs leading-relaxed">
          Esta calculadora é uma ferramenta educativa para facilitar conversas sobre finanças do casal. Use os números
          como ponto de partida para um acordo que funcione para vocês.
        </p>
      </div>
    </Card>
  )
}
