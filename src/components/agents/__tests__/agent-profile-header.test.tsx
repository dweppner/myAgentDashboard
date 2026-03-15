import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentProfileHeader } from '../agent-profile-header'
import type { Agent } from '@/types/agent'

vi.mock('next/navigation', () => ({
  usePathname: () => '/agents/agent-1',
}))

const makeAgent = (overrides: Partial<Agent> = {}): Agent => ({
  id: 'agent-1',
  name: 'Issue Worker',
  type: 'claude-code',
  role: 'GitHub Issue Implementer',
  description: 'Implements GitHub issues using TDD.',
  systems: ['GitHub', 'Slack', 'Supabase'],
  interaction_guide: 'Assign GitHub issues to weppneragents-droid.',
  avatar_url: null,
  status: 'active',
  current_task: 'Working on issue #3',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-15T10:00:00Z',
  ...overrides,
})

describe('AgentProfileHeader', () => {
  it('renders agent name', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.getByRole('heading', { name: 'Issue Worker' })).toBeInTheDocument()
  })

  it('renders role title', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('GitHub Issue Implementer')).toBeInTheDocument()
  })

  it('renders type badge for claude-code', () => {
    render(<AgentProfileHeader agent={makeAgent({ type: 'claude-code' })} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
  })

  it('renders type badge for openclaw', () => {
    render(<AgentProfileHeader agent={makeAgent({ type: 'openclaw' })} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('OpenClaw')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<AgentProfileHeader agent={makeAgent({ status: 'active' })} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders idle status', () => {
    render(<AgentProfileHeader agent={makeAgent({ status: 'idle' })} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('Idle')).toBeInTheDocument()
  })

  it('renders offline status', () => {
    render(<AgentProfileHeader agent={makeAgent({ status: 'offline' })} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('Implements GitHub issues using TDD.')).toBeInTheDocument()
  })

  it('renders systems as badges', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Slack')).toBeInTheDocument()
    expect(screen.getByText('Supabase')).toBeInTheDocument()
  })

  it('renders interaction guide', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('Assign GitHub issues to weppneragents-droid.')).toBeInTheDocument()
  })

  it('renders avatar initials when no avatar_url', () => {
    render(<AgentProfileHeader agent={makeAgent({ avatar_url: null })} prevAgent={null} nextAgent={null} />)
    expect(screen.getByText('I')).toBeInTheDocument() // first letter of "Issue Worker"
  })

  it('renders avatar image when avatar_url is provided', () => {
    render(
      <AgentProfileHeader
        agent={makeAgent({ avatar_url: 'https://example.com/avatar.png' })}
        prevAgent={null}
        nextAgent={null}
      />
    )
    expect(screen.getByRole('img', { name: 'Issue Worker' })).toBeInTheDocument()
  })

  it('renders back to dashboard link', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/')
  })

  it('renders prev agent link when prevAgent is provided', () => {
    const prev = makeAgent({ id: 'agent-0', name: 'Prev Agent' })
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={prev} nextAgent={null} />)
    const link = screen.getByRole('link', { name: /prev agent/i })
    expect(link).toHaveAttribute('href', '/agents/agent-0')
  })

  it('renders next agent link when nextAgent is provided', () => {
    const next = makeAgent({ id: 'agent-2', name: 'Next Agent' })
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={next} />)
    const link = screen.getByRole('link', { name: /next agent/i })
    expect(link).toHaveAttribute('href', '/agents/agent-2')
  })

  it('does not render prev link when prevAgent is null', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.queryByRole('link', { name: /prev agent/i })).not.toBeInTheDocument()
  })

  it('does not render next link when nextAgent is null', () => {
    render(<AgentProfileHeader agent={makeAgent()} prevAgent={null} nextAgent={null} />)
    expect(screen.queryByRole('link', { name: /next agent/i })).not.toBeInTheDocument()
  })
})
