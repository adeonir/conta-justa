import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/results')({
  component: ResultsPage,
})

function ResultsPage() {
  return null
}
