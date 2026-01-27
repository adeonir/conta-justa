import { useNavigate } from '@tanstack/react-router'

import { Button, Card } from '~/components/ui'
import { useReset } from '~/stores/expense-store'

export function Actions() {
  const navigate = useNavigate()
  const reset = useReset()

  function handleNavigation(shouldReset: boolean) {
    if (shouldReset) reset()
    navigate({ to: '/' })
  }

  return (
    <Card accent={false} className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <Button onClick={() => handleNavigation(false)} variant="secondary" className="flex-1">
            Ajustar valores
          </Button>
          <Button onClick={() => handleNavigation(true)} className="flex-1">
            Fazer novo cálculo
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-xs leading-relaxed">
          Esta calculadora é uma ferramenta educativa para facilitar conversas sobre finanças do casal. Use os números
          como ponto de partida para um acordo que funcione para vocês.
        </p>
      </div>
    </Card>
  )
}
