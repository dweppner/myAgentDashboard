import { describe, it, expect } from 'vitest'
import {
  filterGlobalLogs,
  getDateRangeStart,
  type GlobalActivityLog,
} from '../global-activity-utils'

function makeGlobalLog(overrides: Partial<GlobalActivityLog> = {}): GlobalActivityLog {
  return {
    id: 'log-1',
    agent_id: 'agent-1',
    event_type: 'task_completed',
    description: 'Done',
    metadata: null,
    created_at: '2026-03-15T10:00:00Z',
    agents: { id: 'agent-1', name: 'Ted', avatar_url: null },
    ...overrides,
  }
}

describe('filterGlobalLogs', () => {
  it('returns all logs when all filters are "all"', () => {
    const logs = [
      makeGlobalLog({ id: 'a', agent_id: 'agent-1' }),
      makeGlobalLog({ id: 'b', agent_id: 'agent-2' }),
    ]
    const result = filterGlobalLogs(logs, { agentId: 'all', eventType: 'all', dateRange: 'all' })
    expect(result).toHaveLength(2)
  })

  it('filters by agentId', () => {
    const logs = [
      makeGlobalLog({ id: 'a', agent_id: 'agent-1' }),
      makeGlobalLog({ id: 'b', agent_id: 'agent-2' }),
    ]
    const result = filterGlobalLogs(logs, { agentId: 'agent-1', eventType: 'all', dateRange: 'all' })
    expect(result).toHaveLength(1)
    expect(result[0].agent_id).toBe('agent-1')
  })

  it('filters by eventType', () => {
    const logs = [
      makeGlobalLog({ id: 'a', event_type: 'task_completed' }),
      makeGlobalLog({ id: 'b', event_type: 'pr_created' }),
    ]
    const result = filterGlobalLogs(logs, { agentId: 'all', eventType: 'pr_created', dateRange: 'all' })
    expect(result).toHaveLength(1)
    expect(result[0].event_type).toBe('pr_created')
  })

  it('filters out logs before dateRange start for "today"', () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const logs = [
      makeGlobalLog({ id: 'a', created_at: `${todayStr}T10:00:00Z` }),
      makeGlobalLog({ id: 'b', created_at: '2020-01-01T10:00:00Z' }),
    ]
    const result = filterGlobalLogs(logs, { agentId: 'all', eventType: 'all', dateRange: 'today' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('combines agentId and eventType filters', () => {
    const logs = [
      makeGlobalLog({ id: 'a', agent_id: 'agent-1', event_type: 'task_completed' }),
      makeGlobalLog({ id: 'b', agent_id: 'agent-1', event_type: 'pr_created' }),
      makeGlobalLog({ id: 'c', agent_id: 'agent-2', event_type: 'task_completed' }),
    ]
    const result = filterGlobalLogs(logs, { agentId: 'agent-1', eventType: 'task_completed', dateRange: 'all' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('returns empty array when no logs match', () => {
    const result = filterGlobalLogs(
      [makeGlobalLog({ agent_id: 'agent-1' })],
      { agentId: 'agent-999', eventType: 'all', dateRange: 'all' }
    )
    expect(result).toHaveLength(0)
  })

  it('handles empty logs array', () => {
    const result = filterGlobalLogs([], { agentId: 'all', eventType: 'all', dateRange: 'all' })
    expect(result).toHaveLength(0)
  })

  it('does not mutate the original array', () => {
    const logs = [
      makeGlobalLog({ id: 'a', agent_id: 'agent-1' }),
      makeGlobalLog({ id: 'b', agent_id: 'agent-2' }),
    ]
    const original = [...logs]
    filterGlobalLogs(logs, { agentId: 'agent-1', eventType: 'all', dateRange: 'all' })
    expect(logs).toEqual(original)
  })
})

describe('getDateRangeStart', () => {
  it('returns null for "all"', () => {
    expect(getDateRangeStart('all')).toBeNull()
  })

  it('returns start of today for "today"', () => {
    const start = getDateRangeStart('today')!
    const now = new Date()
    expect(start.toDateString()).toBe(now.toDateString())
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
  })

  it('returns 7 days ago for "7d"', () => {
    const start = getDateRangeStart('7d')!
    const expected = new Date()
    expected.setDate(expected.getDate() - 7)
    expect(start.toDateString()).toBe(expected.toDateString())
  })

  it('returns 30 days ago for "30d"', () => {
    const start = getDateRangeStart('30d')!
    const expected = new Date()
    expected.setDate(expected.getDate() - 30)
    expect(start.toDateString()).toBe(expected.toDateString())
  })
})
