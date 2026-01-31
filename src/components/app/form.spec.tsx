import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ExpenseFormData } from '~/schemas/expense-form'

import { Form } from './form'

const mockNavigate = vi.fn()
const mockSetData = vi.fn()
let mockStoreData: ExpenseFormData | null = null

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('~/stores/expense-store', () => ({
  useExpenseStore: (selector: (state: { minimumWage: number }) => unknown) => selector({ minimumWage: 162100 }),
  useData: () => mockStoreData,
  useSetData: () => mockSetData,
  useReset: () => vi.fn(),
}))

async function fillFormWithValidData(user: ReturnType<typeof userEvent.setup>) {
  const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
  const incomeAInput = screen.getByLabelText('Renda mensal', { selector: '#incomeA' })
  const nameBInput = screen.getByLabelText('Nome', { selector: '#nameB' })
  const incomeBInput = screen.getByLabelText('Renda mensal', { selector: '#incomeB' })
  const expensesInput = screen.getByLabelText('Total mensal')

  await user.type(nameAInput, 'Ana')
  fireEvent.blur(nameAInput)

  await user.type(incomeAInput, '5000')
  fireEvent.blur(incomeAInput)

  await user.type(nameBInput, 'Bob')
  fireEvent.blur(nameBInput)

  await user.type(incomeBInput, '3000')
  fireEvent.blur(incomeBInput)

  await user.type(expensesInput, '2000')
  fireEvent.blur(expensesInput)
}

describe('Form', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockSetData.mockClear()
    mockStoreData = null
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders all three form sections', () => {
    render(<Form />)

    expect(screen.getByText('Pessoa A')).toBeInTheDocument()
    expect(screen.getByText('Pessoa B')).toBeInTheDocument()
    expect(screen.getByText('Despesas compartilhadas')).toBeInTheDocument()
  })

  it('renders submit button with type="submit"', () => {
    render(<Form />)

    const button = screen.getByRole('button', { name: 'Ver resultados' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('renders name and income fields for both persons', () => {
    render(<Form />)

    expect(screen.getByLabelText('Nome', { selector: '#nameA' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome', { selector: '#nameB' })).toBeInTheDocument()
    expect(screen.getByLabelText('Renda mensal', { selector: '#incomeA' })).toBeInTheDocument()
    expect(screen.getByLabelText('Renda mensal', { selector: '#incomeB' })).toBeInTheDocument()
  })

  it('renders expenses section with helper text', () => {
    render(<Form />)

    expect(screen.getByLabelText('Total mensal')).toBeInTheDocument()
    expect(screen.getByText('Aluguel, contas, mercado e outros gastos em comum')).toBeInTheDocument()
  })

  describe('validation errors', () => {
    it('shows "Campo obrigatório" error after blur on empty name field', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
      await user.click(nameAInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
      })
    })

    it('shows "Valor deve ser maior que zero" error for zero currency value after blur', async () => {
      render(<Form />)

      const incomeAInput = screen.getByLabelText('Renda mensal', { selector: '#incomeA' })

      fireEvent.focus(incomeAInput)
      fireEvent.blur(incomeAInput)

      await waitFor(() => {
        expect(screen.getByText('Valor deve ser maior que zero')).toBeInTheDocument()
      })
    })

    it('shows errors for nameB after blur on empty field', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const nameBInput = screen.getByLabelText('Nome', { selector: '#nameB' })
      await user.click(nameBInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
      })
    })

    it('shows errors for expenses field after blur with zero value', async () => {
      render(<Form />)

      const expensesInput = screen.getByLabelText('Total mensal')

      fireEvent.focus(expensesInput)
      fireEvent.blur(expensesInput)

      await waitFor(() => {
        expect(screen.getByText('Valor deve ser maior que zero')).toBeInTheDocument()
      })
      expect(screen.queryByText('Aluguel, contas, mercado e outros gastos em comum')).not.toBeInTheDocument()
    })

    it('clears error when user corrects name field', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
      await user.click(nameAInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
      })

      await user.type(nameAInput, 'Ana')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByText('Campo obrigatório')).not.toBeInTheDocument()
      })
    })

    it('clears error when user corrects currency field', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const incomeAInput = screen.getByLabelText('Renda mensal', { selector: '#incomeA' })

      fireEvent.focus(incomeAInput)
      fireEvent.blur(incomeAInput)

      await waitFor(() => {
        expect(screen.getByText('Valor deve ser maior que zero')).toBeInTheDocument()
      })

      await user.type(incomeAInput, '5000')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByText('Valor deve ser maior que zero')).not.toBeInTheDocument()
      })
    })
  })

  describe('submit button state', () => {
    it('submit button becomes disabled after touching invalid field', async () => {
      render(<Form />)

      const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })

      fireEvent.focus(nameAInput)
      fireEvent.blur(nameAInput)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Ver resultados' })
        expect(button).toBeDisabled()
      })
    })

    it('submit button is enabled when all fields are valid', async () => {
      const user = userEvent.setup()
      render(<Form />)

      await fillFormWithValidData(user)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Ver resultados' })
        expect(button).not.toBeDisabled()
      })
    })

    it('submit button becomes disabled when field becomes invalid', async () => {
      const user = userEvent.setup()
      render(<Form />)

      await fillFormWithValidData(user)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ver resultados' })).not.toBeDisabled()
      })

      const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
      await user.clear(nameAInput)
      fireEvent.blur(nameAInput)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ver resultados' })).toBeDisabled()
      })
    })
  })

  describe('housework section', () => {
    it('renders collapsible trigger for housework section', () => {
      render(<Form />)

      expect(screen.getByText('Considerar trabalho doméstico no cálculo')).toBeInTheDocument()
    })

    it('expands housework section when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const trigger = screen.getByText('Considerar trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText(/Cuidar da casa também é trabalho/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Horas semanais de Pessoa A/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Horas semanais de Pessoa B/)).toBeInTheDocument()
      })
    })

    it('shows dynamic labels with person names when filled', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
      const nameBInput = screen.getByLabelText('Nome', { selector: '#nameB' })

      await user.type(nameAInput, 'Ana')
      await user.type(nameBInput, 'Bob')

      const trigger = screen.getByText('Considerar trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByLabelText('Horas semanais de Ana')).toBeInTheDocument()
        expect(screen.getByLabelText('Horas semanais de Bob')).toBeInTheDocument()
      })
    })

    it('displays InfoBox with minimum wage reference text', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const trigger = screen.getByText('Considerar trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText(/salário mínimo\/hora apenas como referência/)).toBeInTheDocument()
      })
    })

    it('allows entering housework hours', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const trigger = screen.getByText('Considerar trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByLabelText(/Horas semanais de Pessoa A/)).toBeInTheDocument()
      })

      const houseworkAInput = screen.getByLabelText(/Horas semanais de Pessoa A/)
      await user.type(houseworkAInput, '15')

      expect(houseworkAInput).toHaveValue(15)
    })

    it('includes housework values in form submission', async () => {
      const user = userEvent.setup()
      render(<Form />)

      await fillFormWithValidData(user)

      const trigger = screen.getByText('Considerar trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByLabelText(/Horas semanais de Ana/)).toBeInTheDocument()
      })

      const houseworkAInput = screen.getByLabelText(/Horas semanais de Ana/)
      const houseworkBInput = screen.getByLabelText(/Horas semanais de Bob/)

      await user.type(houseworkAInput, '15')
      await user.type(houseworkBInput, '5')

      await user.click(screen.getByRole('button', { name: 'Ver resultados' }))

      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalledWith(
          expect.objectContaining({
            houseworkA: 15,
            houseworkB: 5,
          }),
        )
      })
    })
  })

  describe('form submission', () => {
    it('saves form data to store and navigates to /results on valid submit', async () => {
      const user = userEvent.setup()
      render(<Form />)

      await fillFormWithValidData(user)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ver resultados' })).not.toBeDisabled()
      })

      await user.click(screen.getByRole('button', { name: 'Ver resultados' }))

      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/results' })
      })
    })

    it('sends income and expense values as cents to store', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
      const incomeAInput = screen.getByLabelText('Renda mensal', { selector: '#incomeA' })
      const nameBInput = screen.getByLabelText('Nome', { selector: '#nameB' })
      const incomeBInput = screen.getByLabelText('Renda mensal', { selector: '#incomeB' })
      const expensesInput = screen.getByLabelText('Total mensal')

      await user.type(nameAInput, 'Ana')
      fireEvent.blur(nameAInput)

      await user.type(incomeAInput, '5000')
      fireEvent.blur(incomeAInput)

      await user.type(nameBInput, 'Bob')
      fireEvent.blur(nameBInput)

      await user.type(incomeBInput, '3000')
      fireEvent.blur(incomeBInput)

      await user.type(expensesInput, '2000')
      fireEvent.blur(expensesInput)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ver resultados' })).not.toBeDisabled()
      })

      await user.click(screen.getByRole('button', { name: 'Ver resultados' }))

      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalledWith({
          nameA: 'Ana',
          nameB: 'Bob',
          incomeA: 500000,
          incomeB: 300000,
          expenses: 200000,
          houseworkA: 0,
          houseworkB: 0,
        })
      })
    })
  })

  describe('pre-fill behavior', () => {
    describe('when store has existing data', () => {
      const storeData: ExpenseFormData = {
        nameA: 'Maria',
        incomeA: 500000,
        nameB: 'Joao',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      }

      beforeEach(() => {
        mockStoreData = storeData
      })

      it('pre-fills name fields with stored values', () => {
        render(<Form />)

        const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
        const nameBInput = screen.getByLabelText('Nome', { selector: '#nameB' })

        expect(nameAInput).toHaveValue('Maria')
        expect(nameBInput).toHaveValue('Joao')
      })

      it('pre-fills currency fields with stored values', () => {
        render(<Form />)

        const incomeAInput = screen.getByLabelText('Renda mensal', { selector: '#incomeA' }) as HTMLInputElement
        const incomeBInput = screen.getByLabelText('Renda mensal', { selector: '#incomeB' }) as HTMLInputElement
        const expensesInput = screen.getByLabelText('Total mensal') as HTMLInputElement

        expect(incomeAInput.value).toMatch(/R\$\s*5[.,]000/)
        expect(incomeBInput.value).toMatch(/R\$\s*3[.,]000/)
        expect(expensesInput.value).toMatch(/R\$\s*2[.,]000/)
      })

      it('keeps collapsible closed when no housework data', () => {
        render(<Form />)

        const houseworkInput = screen.getByLabelText(/Horas semanais de Maria/)
        expect(houseworkInput.closest('[data-state]')).toHaveAttribute('data-state', 'closed')
      })
    })

    describe('when store has housework data', () => {
      const storeDataWithHousework: ExpenseFormData = {
        nameA: 'Ana',
        incomeA: 400000,
        nameB: 'Carlos',
        incomeB: 350000,
        expenses: 180000,
        houseworkA: 15,
        houseworkB: 5,
      }

      beforeEach(() => {
        mockStoreData = storeDataWithHousework
      })

      it('auto-opens collapsible when housework hours exist', async () => {
        render(<Form />)

        await waitFor(() => {
          expect(screen.getByLabelText(/Horas semanais de Ana/)).toBeInTheDocument()
          expect(screen.getByLabelText(/Horas semanais de Carlos/)).toBeInTheDocument()
        })
      })

      it('pre-fills housework hours with stored values', async () => {
        render(<Form />)

        await waitFor(() => {
          const houseworkAInput = screen.getByLabelText(/Horas semanais de Ana/)
          const houseworkBInput = screen.getByLabelText(/Horas semanais de Carlos/)

          expect(houseworkAInput).toHaveValue(15)
          expect(houseworkBInput).toHaveValue(5)
        })
      })
    })

    describe('form remains functional after pre-fill', () => {
      const storeData: ExpenseFormData = {
        nameA: 'Maria',
        incomeA: 500000,
        nameB: 'Joao',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      }

      beforeEach(() => {
        mockStoreData = storeData
      })

      it('allows editing pre-filled fields', async () => {
        const user = userEvent.setup()
        render(<Form />)

        const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
        expect(nameAInput).toHaveValue('Maria')

        await user.clear(nameAInput)
        await user.type(nameAInput, 'Ana')

        expect(nameAInput).toHaveValue('Ana')
      })

      it('submit button is enabled with valid pre-filled data', async () => {
        render(<Form />)

        await waitFor(() => {
          const button = screen.getByRole('button', { name: 'Ver resultados' })
          expect(button).not.toBeDisabled()
        })
      })

      it('submits updated values after editing', async () => {
        const user = userEvent.setup()
        render(<Form />)

        const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
        await user.clear(nameAInput)
        await user.type(nameAInput, 'Ana')

        await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Ver resultados' })).not.toBeDisabled()
        })

        await user.click(screen.getByRole('button', { name: 'Ver resultados' }))

        await waitFor(() => {
          expect(mockSetData).toHaveBeenCalledWith(
            expect.objectContaining({
              nameA: 'Ana',
              incomeA: 500000,
            }),
          )
        })
      })
    })
  })
})
