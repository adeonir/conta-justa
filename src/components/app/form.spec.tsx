import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Form } from './form'

const mockNavigate = vi.fn()
const mockSetFormData = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('~/stores/expense-store', () => ({
  useExpenseStore: (selector: (state: { minimumWage: number; setFormData: typeof mockSetFormData }) => unknown) =>
    selector({ minimumWage: 162100, setFormData: mockSetFormData }),
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
    mockSetFormData.mockClear()
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

    const button = screen.getByRole('button', { name: 'Calcular divisão' })
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
    expect(screen.getByText('Aluguel, contas, mercado, etc.')).toBeInTheDocument()
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
      expect(screen.queryByText('Aluguel, contas, mercado, etc.')).not.toBeInTheDocument()
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
        const button = screen.getByRole('button', { name: 'Calcular divisão' })
        expect(button).toBeDisabled()
      })
    })

    it('submit button is enabled when all fields are valid', async () => {
      const user = userEvent.setup()
      render(<Form />)

      await fillFormWithValidData(user)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Calcular divisão' })
        expect(button).not.toBeDisabled()
      })
    })

    it('submit button becomes disabled when field becomes invalid', async () => {
      const user = userEvent.setup()
      render(<Form />)

      await fillFormWithValidData(user)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Calcular divisão' })).not.toBeDisabled()
      })

      const nameAInput = screen.getByLabelText('Nome', { selector: '#nameA' })
      await user.clear(nameAInput)
      fireEvent.blur(nameAInput)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Calcular divisão' })).toBeDisabled()
      })
    })
  })

  describe('housework section', () => {
    it('renders collapsible trigger for housework section', () => {
      render(<Form />)

      expect(screen.getByText('Incluir trabalho doméstico no cálculo')).toBeInTheDocument()
    })

    it('expands housework section when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const trigger = screen.getByText('Incluir trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText(/Cuidar da casa é trabalho/)).toBeInTheDocument()
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

      const trigger = screen.getByText('Incluir trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByLabelText('Horas semanais de Ana')).toBeInTheDocument()
        expect(screen.getByLabelText('Horas semanais de Bob')).toBeInTheDocument()
      })
    })

    it('displays minimum wage hourly rate in InfoBox', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const trigger = screen.getByText('Incluir trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText(/R\$ 7,37/)).toBeInTheDocument()
      })
    })

    it('allows entering housework hours', async () => {
      const user = userEvent.setup()
      render(<Form />)

      const trigger = screen.getByText('Incluir trabalho doméstico no cálculo')
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

      const trigger = screen.getByText('Incluir trabalho doméstico no cálculo')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByLabelText(/Horas semanais de Ana/)).toBeInTheDocument()
      })

      const houseworkAInput = screen.getByLabelText(/Horas semanais de Ana/)
      const houseworkBInput = screen.getByLabelText(/Horas semanais de Bob/)

      await user.type(houseworkAInput, '15')
      await user.type(houseworkBInput, '5')

      await user.click(screen.getByRole('button', { name: 'Calcular divisão' }))

      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalledWith(
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
        expect(screen.getByRole('button', { name: 'Calcular divisão' })).not.toBeDisabled()
      })

      await user.click(screen.getByRole('button', { name: 'Calcular divisão' }))

      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalledTimes(1)
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
        expect(screen.getByRole('button', { name: 'Calcular divisão' })).not.toBeDisabled()
      })

      await user.click(screen.getByRole('button', { name: 'Calcular divisão' }))

      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalledWith({
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
})
