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
    <Card accent={false} className="p-6 max-md:p-4">
      <div className="flex gap-4 max-md:flex-col">
        <Button onClick={() => handleNavigation(false)} variant="secondary" className="w-full">
          Ajustar valores
        </Button>
        <Button onClick={() => handleNavigation(true)} className="w-full">
          Novo cálculo
        </Button>
      </div>
    </Card>
  )
}
