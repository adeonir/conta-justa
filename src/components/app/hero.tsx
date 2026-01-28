export function Hero() {
  return (
    <section className="sticky top-42 self-start max-md:static max-md:text-center">
      <h1 className="mb-5 font-black text-[52px] leading-none tracking-tighter max-md:text-4xl">
        Compare modelos de divisão{' '}
        <em className="relative text-primary not-italic">
          justa
          <span className="absolute right-0 bottom-1 left-0 h-1 rounded-sm bg-primary" />
        </em>{' '}
        das contas do casal
      </h1>
      <div className="my-8 h-0.75 w-15 rounded-sm bg-primary max-md:mx-auto" />
      <p className="max-w-100 text-lg text-muted-foreground leading-relaxed max-md:mx-auto">
        Veja como diferentes formas de dividir despesas impactam cada pessoa — considerando renda e trabalho doméstico
      </p>
    </section>
  )
}
