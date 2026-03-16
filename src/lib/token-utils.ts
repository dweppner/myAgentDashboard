import type { Database } from '@/lib/database.types'

type ActivityLog = Database['public']['Tables']['agent_activity_logs']['Row']

export interface DailyTokens {
  date: string // YYYY-MM-DD
  tokens_input: number
  tokens_output: number
  total: number
}

export interface TodayTokenSummary {
  totalTokens: number
  topConsumerName: string | null
  topConsumerTokens: number
}

export function aggregateTokensByDay(logs: ActivityLog[], days: number): DailyTokens[] {
  const now = new Date()
  const result: DailyTokens[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result.push({
      date: d.toISOString().split('T')[0],
      tokens_input: 0,
      tokens_output: 0,
      total: 0,
    })
  }

  const dateSet = new Set(result.map((r) => r.date))

  for (const log of logs) {
    const dateStr = log.created_at.split('T')[0]
    if (!dateSet.has(dateStr)) continue

    const entry = result.find((r) => r.date === dateStr)
    if (!entry) continue

    const meta = log.metadata
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) continue

    const m = meta as Record<string, unknown>
    const input = typeof m.tokens_input === 'number' ? m.tokens_input : 0
    const output = typeof m.tokens_output === 'number' ? m.tokens_output : 0
    entry.tokens_input += input
    entry.tokens_output += output
    entry.total += input + output
  }

  return result
}

export function estimateTokenCost(tokens: number, costPerMillion = 3.0): number {
  return (tokens / 1_000_000) * costPerMillion
}

export function formatCost(cost: number): string {
  if (cost < 0.01) return '$0.00'
  return `$${cost.toFixed(2)}`
}

export function computeTodayTokenSummary(
  agentTokens: { name: string; tokens: number }[]
): TodayTokenSummary {
  const totalTokens = agentTokens.reduce((sum, a) => sum + a.tokens, 0)
  const top = agentTokens.reduce<{ name: string; tokens: number } | null>((best, a) => {
    if (!best || a.tokens > best.tokens) return a
    return best
  }, null)
  return {
    totalTokens,
    topConsumerName: top?.name ?? null,
    topConsumerTokens: top?.tokens ?? 0,
  }
}
