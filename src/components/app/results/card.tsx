import { Copy, Download, Loader2, Share2 } from 'lucide-react'

import { Button, Card as CardUI, Label, Switch, Tooltip } from '~/components/ui'
import { useResults } from '~/hooks/use-results'
import { useShare } from '~/hooks/use-share'
import { trackEvent } from '~/hooks/use-track-event'
import { useData, useIncludeHousework, useSetIncludeHousework } from '~/stores/expense-store'
import { PersonDisplay } from './person-display'
import { ShareCard } from './share-card'

export function Card() {
  const data = useData()
  const includeHousework = useIncludeHousework()
  const setIncludeHousework = useSetIncludeHousework()

  const results = useResults()
  const { copyLink, shareResult, downloadImage, isCopied, isDownloading, shareCardRef } = useShare()

  if (!results || !data) return null

  const { activeResult, isRecommended, showHousework } = results
  const nameA = data.nameA || 'Pessoa A'
  const nameB = data.nameB || 'Pessoa B'

  const handleHouseworkToggle = (checked: boolean) => {
    setIncludeHousework(checked)
    trackEvent('housework_toggle_changed', { include: checked })
  }

  return (
    <>
      <CardUI>
        <p className="mb-2 font-medium text-primary text-sm uppercase tracking-wider">
          {isRecommended ? 'Modelo recomendado' : 'Modelo selecionado'}
        </p>
        <h2 className="mb-2 font-bold text-2xl">{isRecommended ? 'Proporcional à renda' : 'Divisão igual'}</h2>
        <p className="mb-4 min-h-10 text-muted-foreground text-sm">
          {isRecommended
            ? 'A divisão é feita com base na participação de cada pessoa na renda total do casal'
            : 'Cada pessoa paga metade das despesas'}
        </p>

        <div className="grid grid-cols-[1fr_1px_1fr] gap-8 max-md:grid-cols-1 max-md:gap-6">
          <PersonDisplay name={nameA} result={activeResult.personA} />
          <div className="w-px bg-secondary/50 max-md:h-px max-md:w-full" />
          <PersonDisplay name={nameB} result={activeResult.personB} />
        </div>

        <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Switch
              id="include-housework"
              checked={includeHousework}
              onCheckedChange={handleHouseworkToggle}
              disabled={!showHousework}
            />
            <Label htmlFor="include-housework" className="mb-0 cursor-pointer font-normal text-sm">
              Incluir trabalho doméstico
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Copiar link do resultado">
              <Button
                aria-label="Copiar link do resultado"
                onClick={copyLink}
                variant="outline"
                size="sm"
                className="bg-muted max-sm:hidden"
              >
                {isCopied ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
              </Button>
            </Tooltip>
            <Tooltip content="Compartilhar resultado">
              <Button
                aria-label="Compartilhar resultado"
                onClick={shareResult}
                variant="outline"
                size="sm"
                className="bg-muted sm:hidden"
              >
                {isCopied ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
              </Button>
            </Tooltip>
            <Tooltip content="Baixar imagem">
              <Button
                aria-label="Baixar imagem"
                onClick={downloadImage}
                variant="outline"
                size="sm"
                className="bg-muted"
                disabled={isDownloading}
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardUI>

      <ShareCard ref={shareCardRef} />
    </>
  )
}
