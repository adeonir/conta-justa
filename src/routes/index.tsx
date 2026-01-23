import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <h1 className="font-bold text-4xl">Conta Justa</h1>
    </main>
  )
}
