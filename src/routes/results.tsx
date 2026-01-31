import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Hero } from '~/components/app/hero'
import { Actions, Card, Comparison, Explanation, Summary } from '~/components/app/results'
import { ShareCard } from '~/components/app/results/share-card'
import { Footer, Header, PageLayout } from '~/components/layout'
import { useShare } from '~/hooks/use-share'
import { useTrackEvent } from '~/hooks/use-track-event'
import { useData, useMinimumWage } from '~/stores/expense-store'

const siteUrl = import.meta.env.VITE_SITE_URL

export const Route = createFileRoute('/results')({
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ deps: { search } }) => ({
    shareParams: search as Record<string, string>,
  }),
  head: ({ loaderData }) => {
    const params = new URLSearchParams(loaderData?.shareParams)
    const hasShareParams = params.has('a') && params.has('ra') && params.has('e')

    const baseMeta = [
      { title: 'Resultados - Conta Justa' },
      {
        name: 'description',
        content:
          'Veja como dividir as despesas de forma justa entre o casal, com base na renda e no trabalho doméstico.',
      },
    ]

    if (hasShareParams) {
      const nameA = params.get('a')
      const nameB = params.get('b')
      const ogImageUrl = `${siteUrl}/api/og?${params.toString()}`

      return {
        meta: [
          ...baseMeta,
          {
            property: 'og:title',
            content: `Divisao de despesas de ${nameA} e ${nameB} - Conta Justa`,
          },
          {
            property: 'og:description',
            content: 'Veja como dividir as despesas de forma justa entre o casal.',
          },
          { property: 'og:image', content: ogImageUrl },
          { name: 'twitter:image', content: ogImageUrl },
        ],
      }
    }

    return {
      meta: [
        ...baseMeta,
        { property: 'og:title', content: 'Resultados - Conta Justa' },
        {
          property: 'og:description',
          content:
            'Veja como dividir as despesas de forma justa entre o casal, com base na renda e no trabalho doméstico.',
        },
      ],
    }
  },
  component: ResultsPage,
})

function ResultsPage() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const data = useData()
  const minimumWage = useMinimumWage()
  const { shareCardRef } = useShare()

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
        <Hero>
          <Summary />
        </Hero>

        <div className="flex flex-col gap-8">
          <Card />
          <Comparison />
          <Actions />
          <Explanation />
        </div>
      </PageLayout>
      <Footer />

      <ShareCard ref={shareCardRef} />
    </>
  )
}
