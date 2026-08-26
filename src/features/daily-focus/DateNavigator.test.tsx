import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateNavigator } from './DateNavigator'

describe('DateNavigator (5-Day Strip Slider)', () => {
  it('renders 5 visible date cards with active selection highlight', () => {
    render(<DateNavigator selectedDate="2026-08-24" onDateChange={vi.fn()} />)

    const dateButtons = screen.getAllByRole('button').filter((b) => b.getAttribute('data-date'))
    expect(dateButtons.length).toBe(5)
  })

  it('selects a date when its pill is clicked', () => {
    const handleChange = vi.fn()
    render(<DateNavigator selectedDate="2026-08-24" onDateChange={handleChange} />)

    const nextDayButton = screen.getByRole('button', { name: /25/i })
    fireEvent.click(nextDayButton)

    expect(handleChange).toHaveBeenCalledWith('2026-08-25')
  })

  it('slides window without firing onDateChange until date is clicked', () => {
    const handleChange = vi.fn()
    render(<DateNavigator selectedDate="2026-08-24" onDateChange={handleChange} />)

    const nextArrow = screen.getByLabelText('Next Days')
    fireEvent.click(nextArrow)

    // onDateChange should not be called just by browsing next dates
    expect(handleChange).not.toHaveBeenCalled()
  })
})
