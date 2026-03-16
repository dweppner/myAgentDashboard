import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from "@testing-library/react"
import { ActivityFeed } from '../activity-feed'
import type { ActivityLog } from '@/lib/activity-utils'

function makeLog(overrides: Partial<ActivityLog> & { id?: string } = {}): ActivityLog {
  return {
    id: 'log-1',
    agent_id: 'agent-1',
    event_type: 'task_completed',
    description: 'Finished a task',
    metadata: null,
    created_at: '2026-03-15T10:00:00Z',
    ...overrides,
  }
}

function makeLogs(count: number, eventType = 'task_completed'): ActivityLog[] {
  return Array.from({ length: count }, (_, i) =>
    makeLog({ id: `log-${i}`, description: `Task ${i + 1}`, event_type: eventType })
  )
}

describe('ActivityFeed', () => {
  it('renders "No activity found" when logs is empty', () => {
    render(<ActivityFeed logs={[]} />)
    expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
  })

  it('renders a log entry with description', () => {
    render(<ActivityFeed logs={[makeLog({ description: 'Deployed app to Vercel' })]} />)
    expect(screen.getByText('Deployed app to Vercel')).toBeInTheDocument()
  })

  it('renders event type badge', () => {
    render(<ActivityFeed logs={[makeLog({ event_type: 'task_completed' })]} />)
    const listItem = screen.getByRole('listitem')
    expect(within(listItem).getByText('Task Completed')).toBeInTheDocument()
  })

  it('renders multiple log entries', () => {
    const logs = [
      makeLog({ id: 'a', description: 'First task' }),
      makeLog({ id: 'b', description: 'Second task' }),
    ]
    render(<ActivityFeed logs={logs} />)
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })

  it('renders timestamp for each log entry', () => {
    render(<ActivityFeed logs={[makeLog({ created_at: '2026-03-15T10:00:00Z' })]} />)
    const timeEl = screen.getByRole('time')
    expect(timeEl).toHaveAttribute('dateTime', '2026-03-15T10:00:00Z')
  })

  it('renders all event type filter buttons', () => {
    render(<ActivityFeed logs={[]} />)
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /task started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /task completed/i })).toBeInTheDocument()
  })

  it('defaults to "all" filter active', () => {
    render(<ActivityFeed logs={[]} />)
    const allBtn = screen.getByRole('button', { name: /^all$/i })
    expect(allBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows only 20 items when more than 20 logs exist', () => {
    const logs = makeLogs(25)
    render(<ActivityFeed logs={logs} />)
    // 20 entries visible
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(20)
  })

  it('shows "Load more" button when more than 20 logs exist', () => {
    render(<ActivityFeed logs={makeLogs(25)} />)
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
  })

  it('does not show "Load more" when 20 or fewer logs', () => {
    render(<ActivityFeed logs={makeLogs(20)} />)
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })

  it('clicking "Load more" reveals additional items', () => {
    const logs = makeLogs(25)
    render(<ActivityFeed logs={logs} />)
    fireEvent.click(screen.getByRole('button', { name: /load more/i }))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(25)
  })

  it('filtering by event type shows only matching entries', () => {
    const logs = [
      makeLog({ id: 'a', event_type: 'task_completed', description: 'Task done' }),
      makeLog({ id: 'b', event_type: 'pr_created', description: 'PR opened' }),
    ]
    render(<ActivityFeed logs={logs} />)
    fireEvent.click(screen.getByRole('button', { name: /pr created/i }))
    expect(screen.getByText('PR opened')).toBeInTheDocument()
    expect(screen.queryByText('Task done')).not.toBeInTheDocument()
  })

  it('switching filter resets pagination to page 1', () => {
    const logs = [
      ...makeLogs(21, 'task_completed'),
      makeLog({ id: 'pr-1', event_type: 'pr_created', description: 'A PR was created' }),
    ]
    render(<ActivityFeed logs={logs} />)
    // Load more first page of task_completed
    fireEvent.click(screen.getByRole('button', { name: /load more/i }))
    // Switch to pr_created filter
    fireEvent.click(screen.getByRole('button', { name: /pr created/i }))
    // Should only show the one pr_created entry
    expect(screen.getByText('A PR was created')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })

  it('switching back to "all" shows all entries', () => {
    const logs = [
      makeLog({ id: 'a', event_type: 'task_completed', description: 'Task done' }),
      makeLog({ id: 'b', event_type: 'pr_created', description: 'PR opened' }),
    ]
    render(<ActivityFeed logs={logs} />)
    fireEvent.click(screen.getByRole('button', { name: /pr created/i }))
    fireEvent.click(screen.getByRole('button', { name: /^all$/i }))
    expect(screen.getByText('Task done')).toBeInTheDocument()
    expect(screen.getByText('PR opened')).toBeInTheDocument()
  })

  it('shows "No activity found" when filter has no matches', () => {
    const logs = [makeLog({ event_type: 'task_completed' })]
    render(<ActivityFeed logs={logs} />)
    fireEvent.click(screen.getByRole('button', { name: /pr created/i }))
    expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
  })
})
