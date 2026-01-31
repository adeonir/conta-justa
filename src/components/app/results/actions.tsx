import { useNavigate } from '@tanstack/react-router'
import { Copy, Download, Loader2, Share2 } from 'lucide-react'

import { Button, Card, Tooltip } from '~/components/ui'
import { useShare } from '~/hooks/use-share'
import { trackEvent } from '~/hooks/use-track-event'
import { useReset } from '~/stores/expense-store'

export function Actions() {
  const navigate = useNavigate()
  const reset = useReset()
  const { copyLink, shareResult, downloadImage, isCopied, isDownloading } = useShare()

  const handleNavigation = (shouldReset: boolean) => {
    if (shouldReset) {
      trackEvent('new_calculation_clicked')
      reset()
    }

    navigate({ to: '/' })
  }

  return (
    <Card accent={false} className="flex flex-col gap-4 p-6 max-md:p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 max-sm:flex-col">
          <Button onClick={() => handleNavigation(false)} variant="secondary" className="w-full">
            Ajustar valores
          </Button>
          <Button onClick={() => handleNavigation(true)} className="w-full">
            Novo cálculo
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Tooltip content="Copiar link do resultado">
            <Button onClick={copyLink} variant="outline" className="w-full bg-muted">
              {isCopied ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
            </Button>
          </Tooltip>
          <Tooltip content="Compartilhar resultado">
            <Button onClick={shareResult} variant="outline" className="w-full bg-muted">
              <Share2 size={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Baixar imagem">
            <Button onClick={downloadImage} variant="outline" className="w-full bg-muted" disabled={isDownloading}>
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  )
}
