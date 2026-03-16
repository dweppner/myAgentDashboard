import type { ActivityLog } from './activity-utils'

export type GlobalActivityLog = ActivityLog & {
  agents: { id: string; name: string; avatar_url: string | null } | null
}

export type DateRangeFilter = 'today' | '7d' | '30d' | 'all'

export function getDateRangeStart(range: DateRangeFilter): Date | null {
  if (range === 'all') return null

  const now = new Date()

  if (range === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start
  }

  const days = range === '7d' ? 7 : 30
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return start
}

export function filterGlobalLogs(
  logs: GlobalActivityLog[],
  opts: { agentId: string; eventType: string; dateRange: DateRangeFilter }
): GlobalActivityLog[] {
  const start = getDateRangeStart(opts.dateRange)

  return logs.filter((log) => {
    if (opts.agentId !== 'all' && log.agent_id !== opts.agentId) return false
    if (opts.eventType !== 'all' && log.event_type !== opts.eventType) return false
    if (start && new Date(log.created_at) < start) return false
    return true
  })
}
