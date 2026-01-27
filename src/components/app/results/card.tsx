import { Card as CardUI } from '~/components/ui'
import { useResults } from '~/hooks/use-results'
import { PersonDisplay } from './person-display'

export function Card() {
  const results = useResults()

  if (!results) return null

  const { names, activeResult, methodTitle, isRecommended } = results

  return (
    <CardUI>
      <p className="mb-2 font-medium text-primary text-sm uppercase tracking-wider">
        {isRecommended ? 'Divisão recomendada' : 'Método selecionado'}
      </p>
      <h2 className="mb-8 font-bold text-2xl">{methodTitle}</h2>

      <div className="flex gap-8 max-sm:flex-col">
        <PersonDisplay name={names.nameA} result={activeResult.personA} />

        <div className="w-px bg-border max-sm:h-px max-sm:w-full" />

        <PersonDisplay name={names.nameB} result={activeResult.personB} />
      </div>
    </CardUI>
  )
}
