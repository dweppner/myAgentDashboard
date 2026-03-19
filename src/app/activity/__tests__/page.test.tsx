import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/headers (used by supabase server client)
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: () => {},
  }),
}))

// Mock the supabase server client
const mockSelect = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn((table: string) => {
      if (table === 'agent_activity_logs') {
        return {
          select: mockSelect,
        }
      }
      if (table === 'agents') {
        return {
          select: mockSelect,
        }
      }
      return { select: mockSelect }
    }),
  }),
}))

import ActivityPage from '../page'

const SAMPLE_LOGS = [
  {
    id: 'log-1',
    agent_id: 'agent-1',
    event_type: 'task_completed',
    description: 'Finished a task',
    metadata: null,
    created_at: '2026-03-15T10:00:00Z',
    agents: { id: 'agent-1', name: 'Scout', avatar_url: null },
  },
]

const SAMPLE_AGENTS = [
  {
    id: 'agent-1',
    name: 'Scout',
    type: 'scout',
    role: 'worker',
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ActivityPage', () => {
  it('renders the page heading', async () => {
    // Setup mocks to return data
    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: (table: string) => {
        if (table === 'agent_activity_logs') {
          return {
            select: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: SAMPLE_LOGS, error: null }),
              }),
            }),
          }
        }
        // agents table
        return {
          select: () => ({
            order: () => Promise.resolve({ data: SAMPLE_AGENTS, error: null }),
          }),
        }
      },
    })

    const Page = await ActivityPage()
    render(Page)

    expect(screen.getByRole('heading', { name: /activity/i })).toBeInTheDocument()
  })

  it('renders GlobalActivityFeed with logs', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: (table: string) => {
        if (table === 'agent_activity_logs') {
          return {
            select: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: SAMPLE_LOGS, error: null }),
              }),
            }),
          }
        }
        return {
          select: () => ({
            order: () => Promise.resolve({ data: SAMPLE_AGENTS, error: null }),
          }),
        }
      },
    })

    const Page = await ActivityPage()
    render(Page)

    expect(screen.getByText('Finished a task')).toBeInTheDocument()
  })

  it('renders with empty logs on Supabase error', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      }),
    })

    const Page = await ActivityPage()
    render(Page)

    expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
  })
})
