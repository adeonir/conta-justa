import { Card as CardUI } from '~/components/ui'
import { useResults } from '~/hooks/use-results'
import { useData } from '~/stores/expense-store'
import { PersonDisplay } from './person-display'

export function Card() {
  const results = useResults()
  const data = useData()

  if (!results || !data) return null

  const { activeResult, isRecommended } = results
  const nameA = data.nameA || 'Pessoa A'
  const nameB = data.nameB || 'Pessoa B'

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

      <div className='grid grid-cols-[1fr_1px_1fr] gap-8'>
        <PersonDisplay name={nameA} result={activeResult.personA} />
        <div className="w-px bg-border" />
        <PersonDisplay name={nameB} result={activeResult.personB} />
      </div>
    </CardUI>
  )
}
