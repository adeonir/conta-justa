import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Actions, Card, Comparison, Explanation, Summary } from '~/components/app/results'
import { Footer, Header, PageLayout } from '~/components/layout'
import { useTrackEvent } from '~/hooks/use-track-event'
import { useData, useMinimumWage } from '~/stores/expense-store'

export const Route = createFileRoute('/results')({
  component: ResultsPage,
  head: () => ({
    meta: [
      { title: 'Resultados - Conta Justa' },
      {
        name: 'description',
        content:
          'Veja como dividir as despesas de forma justa entre o casal, com base na renda e no trabalho doméstico.',
      },
      { property: 'og:title', content: 'Resultados - Conta Justa' },
      {
        property: 'og:description',
        content:
          'Veja como dividir as despesas de forma justa entre o casal, com base na renda e no trabalho doméstico.',
      },
    ],
  }),
})

function ResultsPage() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const data = useData()
  const minimumWage = useMinimumWage()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !data) {
      navigate({ to: '/' })
    }
  }, [mounted, data, navigate])

  const hasHousework = data ? data.houseworkA > 0 || data.houseworkB > 0 : false
  useTrackEvent(
    'calculation_completed',
    data ? { method: hasHousework ? 'adjusted' : 'proportional', has_housework: hasHousework } : null,
    mounted,
  )

  if (!mounted || !data || !minimumWage) {
    return null
  }

  return (
    <>
      <Header />
      <PageLayout>
        <Summary />

        <div className="flex flex-col gap-8">
          <Card />
          <Comparison />
          <Actions />
          <Explanation />
        </div>
      </PageLayout>
      <Footer />
    </>
  )
}
