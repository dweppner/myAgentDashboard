import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlobalActivityFeed } from '../global-activity-feed'
import type { GlobalActivityLog } from '@/lib/global-activity-utils'
import type { Agent } from '@/types/agent'

function makeLog(overrides: Partial<GlobalActivityLog> = {}): GlobalActivityLog {
  return {
    id: 'log-1',
    agent_id: 'agent-1',
    event_type: 'task_completed',
    description: 'Finished a task',
    metadata: null,
    created_at: '2026-03-15T10:00:00Z',
    agents: { id: 'agent-1', name: 'Ted Openclaw', avatar_url: null },
    ...overrides,
  }
}

const AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Ted Openclaw',
    type: 'openclaw',
    role: 'dispatcher',
    description: 'Test agent',
    systems: [],
    interaction_guide: '',
    avatar_url: null,
    status: 'active',
    current_task: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

function makeLogs(count: number, eventType = 'task_completed'): GlobalActivityLog[] {
  return Array.from({ length: count }, (_, i) =>
    makeLog({ id: `log-${i}`, description: `Task ${i + 1}`, event_type: eventType })
  )
}

describe('GlobalActivityFeed', () => {
  it('renders "No activity found" when logs is empty', () => {
    render(<GlobalActivityFeed initialLogs={[]} agents={[]} />)
    expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
  })

  it('renders a log entry with description', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog({ description: 'Deployed to Vercel' })]} agents={AGENTS} />)
    expect(screen.getByText('Deployed to Vercel')).toBeInTheDocument()
  })

  it('renders event type badge', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog({ event_type: 'task_completed' })]} agents={AGENTS} />)
    expect(screen.getByText('Task Completed')).toBeInTheDocument()
  })

  it('renders agent name linked to profile', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog()]} agents={AGENTS} />)
    const link = screen.getByRole('link', { name: 'Ted Openclaw' })
    expect(link).toHaveAttribute('href', '/agents/agent-1')
  })

  it('renders timestamp', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog({ created_at: '2026-03-15T10:00:00Z' })]} agents={AGENTS} />)
    const timeEl = screen.getByRole('time')
    expect(timeEl).toHaveAttribute('dateTime', '2026-03-15T10:00:00Z')
  })

  it('shows agent dropdown with all agents option', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog()]} agents={AGENTS} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'All agents' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ted Openclaw' })).toBeInTheDocument()
  })

  it('filters by agent', () => {
    const logs = [
      makeLog({ id: 'a', agent_id: 'agent-1', description: 'Ted task', agents: { id: 'agent-1', name: 'Ted Openclaw', avatar_url: null } }),
      makeLog({ id: 'b', agent_id: 'agent-2', description: 'Other task', agents: { id: 'agent-2', name: 'Other Agent', avatar_url: null } }),
    ]
    render(<GlobalActivityFeed initialLogs={logs} agents={AGENTS} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'agent-1' } })
    expect(screen.getByText('Ted task')).toBeInTheDocument()
    expect(screen.queryByText('Other task')).not.toBeInTheDocument()
  })

  it('shows all event type filter buttons', () => {
    render(<GlobalActivityFeed initialLogs={[]} agents={[]} />)
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /task started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /task completed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pr created/i })).toBeInTheDocument()
  })

  it('shows date range filter buttons', () => {
    render(<GlobalActivityFeed initialLogs={[]} agents={[]} />)
    expect(screen.getByRole('button', { name: /all time/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /7 days/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /30 days/i })).toBeInTheDocument()
  })

  it('filters by event type', () => {
    const logs = [
      makeLog({ id: 'a', event_type: 'task_completed', description: 'Task done' }),
      makeLog({ id: 'b', event_type: 'pr_created', description: 'PR opened' }),
    ]
    render(<GlobalActivityFeed initialLogs={logs} agents={AGENTS} />)
    fireEvent.click(screen.getByRole('button', { name: /pr created/i }))
    expect(screen.getByText('PR opened')).toBeInTheDocument()
    expect(screen.queryByText('Task done')).not.toBeInTheDocument()
  })

  it('shows only 20 items when more than 20 logs exist', () => {
    render(<GlobalActivityFeed initialLogs={makeLogs(25)} agents={AGENTS} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(20)
  })

  it('shows "Load more" button when more than 20 logs', () => {
    render(<GlobalActivityFeed initialLogs={makeLogs(25)} agents={AGENTS} />)
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
  })

  it('does not show "Load more" when 20 or fewer logs', () => {
    render(<GlobalActivityFeed initialLogs={makeLogs(20)} agents={AGENTS} />)
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })

  it('clicking "Load more" reveals additional items', () => {
    render(<GlobalActivityFeed initialLogs={makeLogs(25)} agents={AGENTS} />)
    fireEvent.click(screen.getByRole('button', { name: /load more/i }))
    expect(screen.getAllByRole('listitem')).toHaveLength(25)
  })

  it('does not show agent link when agents is null', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog({ agents: null })]} agents={AGENTS} />)
    expect(screen.queryByRole('link', { name: /ted openclaw/i })).not.toBeInTheDocument()
  })

  it('shows event count', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog({ id: 'a' }), makeLog({ id: 'b' })]} agents={AGENTS} />)
    expect(screen.getByText('2 events')).toBeInTheDocument()
  })

  it('shows singular "event" when count is 1', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog()]} agents={AGENTS} />)
    expect(screen.getByText('1 event')).toBeInTheDocument()
  })

  it('resets page when event type filter changes', () => {
    const logs = [
      ...makeLogs(21, 'task_completed'),
      makeLog({ id: 'pr-1', event_type: 'pr_created', description: 'A PR was created' }),
    ]
    render(<GlobalActivityFeed initialLogs={logs} agents={AGENTS} />)
    fireEvent.click(screen.getByRole('button', { name: /load more/i }))
    fireEvent.click(screen.getByRole('button', { name: /pr created/i }))
    expect(screen.getByText('A PR was created')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })

  it('shows "No activity found" when filter has no matches', () => {
    render(<GlobalActivityFeed initialLogs={[makeLog({ event_type: 'task_completed' })]} agents={AGENTS} />)
    fireEvent.click(screen.getByRole('button', { name: /pr created/i }))
    expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
  })
})
