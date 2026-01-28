import { Card as CardUI } from '~/components/ui'
import { useResults } from '~/hooks/use-results'
import { PersonDisplay } from './person-display'

export function Card() {
  const results = useResults()

  if (!results) return null

  const { names, activeResult, isRecommended } = results

  return (
    <CardUI>
      <p className="mb-2 font-medium text-primary text-sm uppercase tracking-wider">
        {isRecommended ? 'Modelo em destaque' : 'Modelo selecionado'}
      </p>
      <h2 className="mb-2 font-bold text-2xl">{isRecommended ? 'Proporcional à renda' : 'Divisão igual'}</h2>
      <p className="mb-4 min-h-10 text-muted-foreground text-sm">
        {isRecommended
          ? 'A divisão é feita com base na participação de cada pessoa na renda total do casal'
          : 'Cada pessoa paga metade das despesas'}
      </p>

      <div className="flex gap-8 max-sm:flex-col">
        <PersonDisplay name={names.nameA} result={activeResult.personA} />

        <div className="w-px bg-border max-sm:h-px max-sm:w-full" />

        <PersonDisplay name={names.nameB} result={activeResult.personB} />
      </div>
    </CardUI>
  )
}
