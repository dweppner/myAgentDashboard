import { describe, it, expect } from 'vitest'
import {
  aggregateTokensByDay,
  estimateTokenCost,
  formatCost,
  computeTodayTokenSummary,
} from '../token-utils'
import type { Database } from '@/lib/database.types'

type ActivityLog = Database['public']['Tables']['agent_activity_logs']['Row']

const makeLog = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
  id: 'log-1',
  agent_id: 'agent-1',
  event_type: 'task_completed',
  description: 'Finished a task',
  metadata: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

const daysAgo = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const todayDate = (): string => new Date().toISOString().split('T')[0]

// --- aggregateTokensByDay ---

describe('aggregateTokensByDay', () => {
  it('returns an array with N entries for N days', () => {
    const result = aggregateTokensByDay([], 7)
    expect(result).toHaveLength(7)
  })

  it('returns entries in ascending date order', () => {
    const result = aggregateTokensByDay([], 7)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true)
    }
  })

  it('fills in zeros for days with no logs', () => {
    const result = aggregateTokensByDay([], 7)
    for (const entry of result) {
      expect(entry.tokens_input).toBe(0)
      expect(entry.tokens_output).toBe(0)
      expect(entry.total).toBe(0)
    }
  })

  it('aggregates tokens for today correctly', () => {
    const logs: ActivityLog[] = [
      makeLog({ created_at: daysAgo(0), metadata: { tokens_input: 100, tokens_output: 50 } }),
      makeLog({ created_at: daysAgo(0), metadata: { tokens_input: 200, tokens_output: 100 } }),
    ]
    const result = aggregateTokensByDay(logs, 7)
    const today = result.find((d) => d.date === todayDate())
    expect(today?.tokens_input).toBe(300)
    expect(today?.tokens_output).toBe(150)
    expect(today?.total).toBe(450)
  })

  it('excludes logs outside the window', () => {
    const logs: ActivityLog[] = [
      makeLog({ created_at: daysAgo(10), metadata: { tokens_input: 999, tokens_output: 999 } }),
    ]
    const result = aggregateTokensByDay(logs, 7)
    const totalTokens = result.reduce((sum, d) => sum + d.total, 0)
    expect(totalTokens).toBe(0)
  })

  it('handles logs with null metadata gracefully', () => {
    const logs: ActivityLog[] = [makeLog({ created_at: daysAgo(0), metadata: null })]
    const result = aggregateTokensByDay(logs, 7)
    const today = result.find((d) => d.date === todayDate())
    expect(today?.total).toBe(0)
  })

  it('handles logs with partial metadata (input only)', () => {
    const logs: ActivityLog[] = [
      makeLog({ created_at: daysAgo(0), metadata: { tokens_input: 500 } }),
    ]
    const result = aggregateTokensByDay(logs, 7)
    const today = result.find((d) => d.date === todayDate())
    expect(today?.tokens_input).toBe(500)
    expect(today?.tokens_output).toBe(0)
    expect(today?.total).toBe(500)
  })

  it('supports 30-day window', () => {
    const result = aggregateTokensByDay([], 30)
    expect(result).toHaveLength(30)
  })

  it('distributes logs across correct days', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0]

    const logs: ActivityLog[] = [
      makeLog({ created_at: daysAgo(1), metadata: { tokens_input: 100, tokens_output: 50 } }),
      makeLog({ created_at: daysAgo(3), metadata: { tokens_input: 200, tokens_output: 100 } }),
    ]
    const result = aggregateTokensByDay(logs, 7)
    const d1 = result.find((d) => d.date === yesterdayStr)
    const d3 = result.find((d) => d.date === threeDaysAgoStr)
    expect(d1?.total).toBe(150)
    expect(d3?.total).toBe(300)
  })
})

// --- estimateTokenCost ---

describe('estimateTokenCost', () => {
  it('calculates cost at default rate ($3/million)', () => {
    expect(estimateTokenCost(1_000_000)).toBeCloseTo(3.0)
  })

  it('calculates cost at custom rate', () => {
    expect(estimateTokenCost(500_000, 10.0)).toBeCloseTo(5.0)
  })

  it('returns 0 for 0 tokens', () => {
    expect(estimateTokenCost(0)).toBe(0)
  })

  it('handles fractional results', () => {
    expect(estimateTokenCost(100, 3.0)).toBeCloseTo(0.0003)
  })
})

// --- formatCost ---

describe('formatCost', () => {
  it('formats zero as $0.00', () => {
    expect(formatCost(0)).toBe('$0.00')
  })

  it('formats small amounts as $0.00', () => {
    expect(formatCost(0.001)).toBe('$0.00')
  })

  it('formats typical amounts with 2 decimal places', () => {
    expect(formatCost(1.5)).toBe('$1.50')
  })

  it('formats larger amounts correctly', () => {
    expect(formatCost(12.345)).toBe('$12.35')
  })
})

// --- computeTodayTokenSummary ---

describe('computeTodayTokenSummary', () => {
  it('sums all agent tokens', () => {
    const input = [
      { name: 'Forge', tokens: 1000 },
      { name: 'Scout', tokens: 2000 },
    ]
    const result = computeTodayTokenSummary(input)
    expect(result.totalTokens).toBe(3000)
  })

  it('identifies top consumer', () => {
    const input = [
      { name: 'Forge', tokens: 1000 },
      { name: 'Scout', tokens: 5000 },
      { name: 'Ranger', tokens: 3000 },
    ]
    const result = computeTodayTokenSummary(input)
    expect(result.topConsumerName).toBe('Scout')
    expect(result.topConsumerTokens).toBe(5000)
  })

  it('returns null top consumer for empty input', () => {
    const result = computeTodayTokenSummary([])
    expect(result.topConsumerName).toBeNull()
    expect(result.topConsumerTokens).toBe(0)
    expect(result.totalTokens).toBe(0)
  })

  it('handles single agent', () => {
    const input = [{ name: 'Solo', tokens: 500 }]
    const result = computeTodayTokenSummary(input)
    expect(result.topConsumerName).toBe('Solo')
    expect(result.totalTokens).toBe(500)
  })
})
