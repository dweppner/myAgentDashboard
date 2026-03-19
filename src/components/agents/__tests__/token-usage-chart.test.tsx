import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TokenUsageChart } from '../token-usage-chart'
import type { DailyTokens } from '@/lib/token-utils'

const makeDailyTokens = (date: string, total = 0): DailyTokens => ({
  date,
  tokens_input: Math.floor(total * 0.7),
  tokens_output: Math.floor(total * 0.3),
  total,
})

const mockData7d: DailyTokens[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return makeDailyTokens(d.toISOString().split('T')[0], i * 1000)
})

const mockData30d: DailyTokens[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  return makeDailyTokens(d.toISOString().split('T')[0], i * 500)
})

describe('TokenUsageChart', () => {
  it('renders without crashing', () => {
    render(<TokenUsageChart data7d={mockData7d} data30d={mockData30d} />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('shows period toggle buttons', () => {
    render(<TokenUsageChart data7d={mockData7d} data30d={mockData30d} />)
    expect(screen.getByRole('button', { name: /7d/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /30d/i })).toBeInTheDocument()
  })

  it('defaults to 7d period', () => {
    render(<TokenUsageChart data7d={mockData7d} data30d={mockData30d} />)
    const btn7d = screen.getByRole('button', { name: /7d/i })
    expect(btn7d).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches to 30d when clicking the 30d button', () => {
    render(<TokenUsageChart data7d={mockData7d} data30d={mockData30d} />)
    const btn30d = screen.getByRole('button', { name: /30d/i })
    fireEvent.click(btn30d)
    expect(btn30d).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /7d/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('displays total tokens and cost estimate', () => {
    render(<TokenUsageChart data7d={mockData7d} data30d={mockData30d} costPerMillion={3} />)
    expect(screen.getByText(/total/i)).toBeInTheDocument()
    expect(screen.getByText(/\$/)).toBeInTheDocument()
  })

  it('renders an SVG chart', () => {
    const { container } = render(
      <TokenUsageChart data7d={mockData7d} data30d={mockData30d} />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders with all-zero data without crashing', () => {
    const zeroData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return makeDailyTokens(d.toISOString().split('T')[0], 0)
    })
    render(<TokenUsageChart data7d={zeroData} data30d={zeroData} />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('accepts custom costPerMillion prop', () => {
    render(<TokenUsageChart data7d={mockData7d} data30d={mockData30d} costPerMillion={15} />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })
})
