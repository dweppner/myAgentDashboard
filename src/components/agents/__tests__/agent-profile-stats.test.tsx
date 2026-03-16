import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentProfileStats } from '../agent-profile-stats'
import type { AgentStats } from '@/lib/activity-utils'

const makeStats = (overrides: Partial<AgentStats> = {}): AgentStats => ({
  tasks_completed_7d: 5,
  tasks_completed_30d: 18,
  total_tokens: 123456,
  current_streak: 3,
  ...overrides,
})

describe('AgentProfileStats', () => {
  it('renders tasks completed in 7 days', () => {
    render(<AgentProfileStats stats={makeStats({ tasks_completed_7d: 7 })} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders tasks completed in 30 days', () => {
    render(<AgentProfileStats stats={makeStats({ tasks_completed_30d: 20 })} />)
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('renders current streak', () => {
    render(<AgentProfileStats stats={makeStats({ current_streak: 4 })} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renders total tokens', () => {
    render(<AgentProfileStats stats={makeStats({ total_tokens: 100000 })} />)
    // Should render formatted token count
    expect(screen.getByText(/100[,.]?000|100k/i)).toBeInTheDocument()
  })

  it('renders streak label', () => {
    render(<AgentProfileStats stats={makeStats()} />)
    expect(screen.getByText(/streak/i)).toBeInTheDocument()
  })

  it('renders zero state gracefully', () => {
    render(
      <AgentProfileStats
        stats={makeStats({ tasks_completed_7d: 0, tasks_completed_30d: 0, current_streak: 0, total_tokens: 0 })}
      />
    )
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)
  })
})
