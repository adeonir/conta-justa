import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Description } from '~/components/ui/description'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Title } from '~/components/ui/title'

export function Form() {
  return (
    <Card>
      <form>
        <div className="mb-9">
          <Title>Pessoa A</Title>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name_a">Nome</Label>
              <Input id="name_a" name="name_a" placeholder="Ex: Maria" />
            </div>
            <div>
              <Label htmlFor="income_a">Renda mensal</Label>
              <Input id="income_a" name="income_a" currency placeholder="R$ 0,00" />
            </div>
          </div>
        </div>

        <div className="mb-9">
          <Title>Pessoa B</Title>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name_b">Nome</Label>
              <Input id="name_b" name="name_b" placeholder="Ex: João" />
            </div>
            <div>
              <Label htmlFor="income_b">Renda mensal</Label>
              <Input id="income_b" name="income_b" currency placeholder="R$ 0,00" />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <Title>Despesas compartilhadas</Title>
          <div>
            <Label htmlFor="total_expenses">Total mensal</Label>
            <Input id="total_expenses" name="total_expenses" currency placeholder="R$ 0,00" />
            <Description>Aluguel, contas, mercado, etc.</Description>
          </div>
        </div>

        <Button type="button" variant="primary" size="lg" fullWidth>
          Calcular divisão
        </Button>
      </form>
    </Card>
  )
}
