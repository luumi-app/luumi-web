import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AiDecomposeModal } from './AiDecomposeModal'

describe('AiDecomposeModal', () => {
  it('renders goal input modal', () => {
    render(<AiDecomposeModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Decompose Goal' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g. Launch product marketing campaign/i)).toBeInTheDocument()
  })

  it('submits goal prompt for decomposition', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    render(<AiDecomposeModal isOpen={true} onClose={vi.fn()} onSubmit={handleSubmit} />)

    const textarea = screen.getByPlaceholderText(/e.g. Launch product marketing campaign/i)
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Develop architecture plan' } })
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Decompose Goal/i }))
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        goal: 'Develop architecture plan',
      })
    )
  })
})
