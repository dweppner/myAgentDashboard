import { describe, it, expect } from 'vitest'
import {
  formatEventType,
  getEventTypeBadgeColor,
  calculateAgentStats,
  getAdjacentAgents,
  extractTokensFromMetadata,
} from '../activity-utils'
import type { Agent } from '@/types/agent'
import type { Database } from '@/lib/database.types'

type ActivityLog = Database['public']['Tables']['agent_activity_logs']['Row']

const makeAgent = (overrides: Partial<Agent> = {}): Agent => ({
  id: 'agent-1',
  name: 'Test Agent',
  type: 'openclaw',
  role: 'Tester',
  description: 'A test agent',
  systems: ['GitHub', 'Slack'],
  interaction_guide: 'Just ask',
  avatar_url: null,
  status: 'active',
  current_task: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

const makeLog = (
  overrides: Partial<ActivityLog> & { created_at?: string } = {}
): ActivityLog => ({
  id: 'log-1',
  agent_id: 'agent-1',
  event_type: 'task_completed',
  description: 'Finished a task',
  metadata: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

// --- formatEventType ---

describe('formatEventType', () => {
  it('formats task_started as Task Started', () => {
    expect(formatEventType('task_started')).toBe('Task Started')
  })

  it('formats task_completed as Task Completed', () => {
    expect(formatEventType('task_completed')).toBe('Task Completed')
  })

  it('formats pr_created as PR Created', () => {
    expect(formatEventType('pr_created')).toBe('PR Created')
  })

  it('formats issue_opened as Issue Opened', () => {
    expect(formatEventType('issue_opened')).toBe('Issue Opened')
  })

  it('formats deployment as Deployment', () => {
    expect(formatEventType('deployment')).toBe('Deployment')
  })

  it('handles unknown event type by capitalizing each word', () => {
    expect(formatEventType('some_custom_event')).toBe('Some Custom Event')
  })
})

// --- getEventTypeBadgeColor ---

describe('getEventTypeBadgeColor', () => {
  it('returns green for task_completed', () => {
    expect(getEventTypeBadgeColor('task_completed')).toContain('green')
  })

  it('returns blue for task_started', () => {
    expect(getEventTypeBadgeColor('task_started')).toContain('blue')
  })

  it('returns purple for pr_created', () => {
    expect(getEventTypeBadgeColor('pr_created')).toContain('purple')
  })

  it('returns orange for deployment', () => {
    expect(getEventTypeBadgeColor('deployment')).toContain('orange')
  })

  it('returns a default color for unknown types', () => {
    const color = getEventTypeBadgeColor('unknown_event')
    expect(color).toBeTruthy()
    expect(typeof color).toBe('string')
  })
})

// --- extractTokensFromMetadata ---

describe('extractTokensFromMetadata', () => {
  it('returns 0 for null metadata', () => {
    expect(extractTokensFromMetadata(null)).toBe(0)
  })

  it('returns sum of tokens_input and tokens_output', () => {
    const metadata = { tokens_input: 100, tokens_output: 50 }
    expect(extractTokensFromMetadata(metadata)).toBe(150)
  })

  it('returns tokens_input only when tokens_output missing', () => {
    const metadata = { tokens_input: 200 }
    expect(extractTokensFromMetadata(metadata)).toBe(200)
  })

  it('returns tokens_output only when tokens_input missing', () => {
    const metadata = { tokens_output: 75 }
    expect(extractTokensFromMetadata(metadata)).toBe(75)
  })

  it('returns 0 when metadata has no token fields', () => {
    const metadata = { some_other_field: 'value' }
    expect(extractTokensFromMetadata(metadata)).toBe(0)
  })
})

// --- calculateAgentStats ---

describe('calculateAgentStats', () => {
  const now = new Date()

  const daysAgo = (n: number): string => {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    return d.toISOString()
  }

  it('counts tasks_completed in last 7 days', () => {
    const logs: ActivityLog[] = [
      makeLog({ event_type: 'task_completed', created_at: daysAgo(1) }),
      makeLog({ event_type: 'task_completed', created_at: daysAgo(3) }),
      makeLog({ event_type: 'task_completed', created_at: daysAgo(6) }),
      makeLog({ event_type: 'task_completed', created_at: daysAgo(8) }), // outside 7d
    ]
    const stats = calculateAgentStats(logs)
    expect(stats.tasks_completed_7d).toBe(3)
  })

  it('counts tasks_completed in last 30 days', () => {
    const logs: ActivityLog[] = [
      makeLog({ event_type: 'task_completed', created_at: daysAgo(5) }),
      makeLog({ event_type: 'task_completed', created_at: daysAgo(15) }),
      makeLog({ event_type: 'task_completed', created_at: daysAgo(29) }),
      makeLog({ event_type: 'task_completed', created_at: daysAgo(31) }), // outside 30d
    ]
    const stats = calculateAgentStats(logs)
    expect(stats.tasks_completed_30d).toBe(3)
  })

  it('calculates total tokens from all logs with metadata', () => {
    const logs: ActivityLog[] = [
      makeLog({ metadata: { tokens_input: 100, tokens_output: 50 } }),
      makeLog({ metadata: { tokens_input: 200, tokens_output: 100 } }),
      makeLog({ metadata: null }),
    ]
    const stats = calculateAgentStats(logs)
    expect(stats.total_tokens).toBe(450)
  })

  it('returns zero stats for empty logs array', () => {
    const stats = calculateAgentStats([])
    expect(stats.tasks_completed_7d).toBe(0)
    expect(stats.tasks_completed_30d).toBe(0)
    expect(stats.total_tokens).toBe(0)
    expect(stats.current_streak).toBe(0)
  })

  it('only counts task_completed events (not other types)', () => {
    const logs: ActivityLog[] = [
      makeLog({ event_type: 'task_started', created_at: daysAgo(1) }),
      makeLog({ event_type: 'task_completed', created_at: daysAgo(2) }),
      makeLog({ event_type: 'pr_created', created_at: daysAgo(3) }),
    ]
    const stats = calculateAgentStats(logs)
    expect(stats.tasks_completed_7d).toBe(1)
  })

  it('computes current_streak as consecutive days with any activity', () => {
    // Today + yesterday + day before = streak of 3
    const logs: ActivityLog[] = [
      makeLog({ created_at: daysAgo(0) }),
      makeLog({ created_at: daysAgo(1) }),
      makeLog({ created_at: daysAgo(2) }),
      // gap — day 4 missing
      makeLog({ created_at: daysAgo(4) }),
    ]
    const stats = calculateAgentStats(logs)
    expect(stats.current_streak).toBe(3)
  })

  it('streak is 0 when there is no activity today or yesterday', () => {
    const logs: ActivityLog[] = [
      makeLog({ created_at: daysAgo(3) }),
      makeLog({ created_at: daysAgo(4) }),
    ]
    const stats = calculateAgentStats(logs)
    expect(stats.current_streak).toBe(0)
  })
})

// --- getAdjacentAgents ---

describe('getAdjacentAgents', () => {
  const agents: Agent[] = [
    makeAgent({ id: 'a1', name: 'Agent A' }),
    makeAgent({ id: 'a2', name: 'Agent B' }),
    makeAgent({ id: 'a3', name: 'Agent C' }),
  ]

  it('returns prev and next agents for a middle agent', () => {
    const { prev, next } = getAdjacentAgents(agents, 'a2')
    expect(prev?.id).toBe('a1')
    expect(next?.id).toBe('a3')
  })

  it('returns null for prev when agent is first', () => {
    const { prev, next } = getAdjacentAgents(agents, 'a1')
    expect(prev).toBeNull()
    expect(next?.id).toBe('a2')
  })

  it('returns null for next when agent is last', () => {
    const { prev, next } = getAdjacentAgents(agents, 'a3')
    expect(prev?.id).toBe('a2')
    expect(next).toBeNull()
  })

  it('returns null for both when agent id not found', () => {
    const { prev, next } = getAdjacentAgents(agents, 'unknown')
    expect(prev).toBeNull()
    expect(next).toBeNull()
  })

  it('handles single agent list', () => {
    const single = [makeAgent({ id: 'solo' })]
    const { prev, next } = getAdjacentAgents(single, 'solo')
    expect(prev).toBeNull()
    expect(next).toBeNull()
  })
})
