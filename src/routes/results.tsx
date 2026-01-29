import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Actions, Card, Comparison, Explanation, Summary } from '~/components/app/results'
import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import { useTrackEvent } from '~/hooks/use-track-event'
import { useData, useMinimumWage } from '~/stores/expense-store'

export const Route = createFileRoute('/results')({
  component: ResultsPage,
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
      <main className="mx-auto grid max-w-275 flex-1 grid-cols-[1fr_1.6fr] items-start gap-20 px-6 py-20 max-md:max-w-140 max-md:grid-cols-1 max-md:gap-12 max-md:py-12">
        <Summary />

        <div className="flex flex-col gap-8">
          <Card />
          <Comparison />
          <Actions />
          <Explanation />
        </div>
      </main>
      <Footer />
    </>
  )
}
