import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentCard } from '../agent-card'
import type { Agent } from '@/types/agent'

const makeAgent = (overrides: Partial<Agent> = {}): Agent => ({
  id: 'agent-1',
  name: 'Scout',
  type: 'openclaw',
  role: 'Research Agent',
  description: 'Researches things',
  systems: ['GitHub'],
  interaction_guide: 'Ask Scout',
  avatar_url: null,
  status: 'active',
  current_task: 'Working on issue #10',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-15T10:00:00Z',
  ...overrides,
})

describe('AgentCard', () => {
  it('renders agent name', () => {
    render(<AgentCard agent={makeAgent()} />)
    expect(screen.getByText('Scout')).toBeInTheDocument()
  })

  it('renders agent role', () => {
    render(<AgentCard agent={makeAgent()} />)
    expect(screen.getByText('Research Agent')).toBeInTheDocument()
  })

  it('renders type badge', () => {
    render(<AgentCard agent={makeAgent()} />)
    expect(screen.getByText('OpenClaw')).toBeInTheDocument()
  })

  it('renders status indicator', () => {
    render(<AgentCard agent={makeAgent()} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders current task when present', () => {
    render(<AgentCard agent={makeAgent()} />)
    expect(screen.getByText(/Working on issue/)).toBeInTheDocument()
  })

  it('renders "No active task" when current_task is null', () => {
    render(<AgentCard agent={makeAgent({ current_task: null })} />)
    expect(screen.getByText(/no active task/i)).toBeInTheDocument()
  })

  it('renders a link to the agent profile page', () => {
    render(<AgentCard agent={makeAgent({ id: 'agent-42' })} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/agents/agent-42')
  })

  it('renders avatar fallback initial when no avatar_url', () => {
    render(<AgentCard agent={makeAgent({ avatar_url: null })} />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('renders avatar image when avatar_url is provided', () => {
    render(<AgentCard agent={makeAgent({ avatar_url: 'https://example.com/img.png' })} />)
    expect(screen.getByRole('img', { name: 'Scout' })).toBeInTheDocument()
  })
})
