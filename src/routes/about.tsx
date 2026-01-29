import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Calculator, Equal, ExternalLink, Quote, Scale } from 'lucide-react'

import { Hero } from '~/components/app/hero'
import { Footer, Header, PageLayout } from '~/components/layout'
import { buttonVariants, Card, InfoBox } from '~/components/ui'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'Sobre - Conta Justa' },
      {
        name: 'description',
        content: 'Saiba mais sobre o Conta Justa, uma calculadora de divisão justa de despesas para casais.',
      },
      { property: 'og:title', content: 'Sobre - Conta Justa' },
      {
        property: 'og:description',
        content: 'Saiba mais sobre o Conta Justa, uma calculadora de divisão justa de despesas para casais.',
      },
    ],
  }),
})

function AboutPage() {
  return (
    <>
      <Header />
      <PageLayout>
        <Hero className="max-md:text-center">
          <h1 className="mb-5 font-black text-4xl leading-tight tracking-tighter">Sobre o Conta Justa</h1>
          <div className="my-8 h-0.75 w-15 rounded-sm bg-primary max-md:mx-auto" />
          <p className="max-w-100 text-lg text-muted-foreground leading-relaxed max-md:mx-auto">
            Uma ferramenta para casais dividirem despesas de forma justa, reconhecendo que contribuir vai além do
            dinheiro
          </p>
        </Hero>

        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-6 font-bold text-2xl">O que é</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                O Conta Justa é uma calculadora gratuita que ajuda casais a encontrar uma divisão de despesas que
                respeite a realidade de cada pessoa.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Diferente de outras ferramentas, consideramos não apenas a renda, mas também as horas dedicadas ao
                trabalho doméstico — uma contribuição econômica real que costuma ser invisível nas contas do casal.
              </p>
            </div>
          </section>

          <section>
            <span className="mb-3 block font-medium text-primary text-sm uppercase tracking-wider">Metodologia</span>
            <h2 className="mb-8 font-bold text-2xl">Como calculamos</h2>
            <div className="grid gap-6">
              <Card accent={false} className="p-6">
                <div className="flex items-start gap-4">
                  <span className="mt-1 shrink-0 text-primary">
                    <Scale className="size-5" />
                  </span>
                  <div>
                    <h3 className="mb-2 font-bold text-lg">Divisão proporcional</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Cada pessoa contribui com uma porcentagem das despesas igual à sua participação na renda total do
                      casal. Se você representa 60% da renda, paga 60% das despesas. Quando horas de trabalho doméstico
                      são informadas, elas são convertidas em valor econômico e somadas à renda, representando a
                      contribuição total de cada pessoa. Esse valor ajusta apenas a proporção da divisão — não
                      representa um pagamento entre o casal.
                    </p>
                  </div>
                </div>
              </Card>
              <Card accent={false} className="p-6">
                <div className="flex items-start gap-4">
                  <span className="mt-1 shrink-0 text-primary">
                    <Equal className="size-5" />
                  </span>
                  <div>
                    <h3 className="mb-2 font-bold text-lg">Divisão igual</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      As despesas são divididas igualmente entre as duas pessoas, independentemente da renda ou
                      contribuição doméstica. Cada pessoa paga exatamente 50% do total.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section>
            <span className="mb-3 block font-medium text-primary text-sm uppercase tracking-wider">
              Por que isso importa
            </span>
            <h2 className="mb-6 font-bold text-2xl">Trabalho doméstico também é trabalho</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Cuidar da casa, cozinhar, limpar e cuidar de filhos demanda tempo e energia. É trabalho — embora não
                seja remunerado.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Por não gerar renda direta, esse esforço costuma ser invisível nas contas tradicionais do casal, mesmo
                tendo impacto econômico real.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Incluir essas horas no cálculo é uma forma de reconhecer essa contribuição e tornar a divisão de
                despesas mais equilibrada.
              </p>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <span className="mt-0.5 shrink-0 text-primary">
                <Quote className="size-4.5" />
              </span>
              <p className="text-sm leading-relaxed">
                O trabalho doméstico não remunerado foi tema da redação do ENEM 2023, refletindo a importância crescente
                dessa discussão na sociedade.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-6 font-bold text-2xl">Valor de referência</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Para estimar o valor do trabalho doméstico, utilizamos o salário mínimo por hora como referência.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Esse valor é obtido automaticamente da API do Banco Central, garantindo que os cálculos estejam sempre
                atualizados.
              </p>
            </div>
            <div className="mt-6">
              <InfoBox icon={<Calculator />}>
                <p className="font-medium">Cálculo atual</p>
                <p>Salário mínimo ÷ 220 horas mensais = valor por hora</p>
              </InfoBox>
            </div>
          </section>

          <section>
            <h2 className="mb-6 font-bold text-2xl">Fontes e referências</h2>
            <div className="grid gap-4">
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-1 font-bold">FGV IBRE</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Pesquisa sobre trabalho doméstico não remunerado nas famílias brasileiras (2023)
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-1 font-bold">ENEM 2023</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Tema da redação sobre trabalho doméstico não remunerado
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-1 font-bold">Banco Central do Brasil</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  API SGS para consulta do salário mínimo vigente
                </p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="mb-6 font-bold text-2xl">Sobre o autor</h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Projeto desenvolvido por Adeonir como parte do portfólio de projetos focados no mercado brasileiro.
            </p>
            <a
              href="https://adeonir.dev"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'md' })}
            >
              Ver portfólio
              <ExternalLink className="size-4" />
            </a>
          </section>

          <section className="rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-3 font-bold text-2xl">Pronto para calcular?</h2>
            <p className="mb-8 text-muted-foreground leading-relaxed">Descubra a divisão justa para vocês</p>
            <Link to="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Ir para calculadora
              <ArrowRight className="size-5" />
            </Link>
          </section>
        </div>
      </PageLayout>
      <Footer />
    </>
  )
}
