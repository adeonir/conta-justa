import { useNavigate } from '@tanstack/react-router'

import { Button, Card } from '~/components/ui'
import { trackEvent } from '~/hooks/use-track-event'
import { useReset } from '~/stores/expense-store'

export function Actions() {
  const navigate = useNavigate()
  const reset = useReset()

  const handleNavigation = (shouldReset: boolean) => {
    if (shouldReset) {
      trackEvent('new_calculation_clicked')
      reset()
    }

    navigate({ to: '/' })
  }

  return (
    <Card accent={false} className="p-6">
      <div className="flex gap-4">
        <Button onClick={() => handleNavigation(false)} variant="secondary" className="flex-1">
          Ajustar valores
        </Button>
        <Button onClick={() => handleNavigation(true)} className="flex-1">
          Novo cálculo
        </Button>
      </div>
    </Card>
  )
}
